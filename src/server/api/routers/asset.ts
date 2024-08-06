import { z } from "zod";
import { type AxiosError } from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const assetsRouter = createTRPCRouter({
  getAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.asset.findUniqueOrThrow({ where: { id: input.id } });
    }),
  list: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findFirstOrThrow({
        where: { id: input.eventId },
        include: {
          Asset: true,
        },
      });

      const { distributorKey } = event;
      console.log("distributorKey:", distributorKey, event);
      if (!distributorKey) return [];

      return event.Asset;
    }),
  availability: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.assetId },
      });
      let availability = 0;
      const sellOffers = await server
        .orderbook(new Asset(asset.code, asset.issuer), Asset.native())
        .call();
      if (sellOffers) {
        availability = sellOffers.asks.reduce((acc, { amount }) => {
          return acc + Number(amount);
        }, 0);
      }
      return availability;
    }),
  addTrustline: publicProcedure
    .input(z.object({ assetId: z.string(), distributorKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.assetId },
      });

      if (asset.distributor !== input.distributorKey) {
        throw new TRPCError({
          message: "Access denied",
          code: "UNAUTHORIZED",
        });
      }

      const distributorAccount = await server.loadAccount(asset.distributor);
      const tokenizedAsset = new Asset(asset.code, asset.issuer);

      const transaction = new TransactionBuilder(distributorAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        // Establish trustline between distributor and asset
        .addOperation(
          Operation.changeTrust({
            asset: tokenizedAsset,
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
  addToLedger: publicProcedure
    .input(z.object({ assetId: z.string(), distributorKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.assetId },
      });

      if (asset.distributor !== input.distributorKey) {
        throw new TRPCError({
          message: "Access denied",
          code: "UNAUTHORIZED",
        });
      }

      // Load Issuer Account from Horizon
      const issuerAccount = await server.loadAccount(asset.issuer);

      const tokenizedAsset = new Asset(asset.code, asset.issuer);
      const transaction = new TransactionBuilder(issuerAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: tokenizedAsset,
            source: asset.distributor,
          }),
        )
        .addOperation(
          Operation.payment({
            source: asset.issuer,
            destination: asset.distributor,
            amount: asset.totalUnits.toString(),
            asset: tokenizedAsset,
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      transaction.sign(Keypair.fromSecret(env.ISSUER_PRIVATE_KEY));

      return transaction.toXDR();
    }),
  tokenize: publicProcedure
    .input(z.object({ id: z.string(), xdr: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const transaction = TransactionBuilder.fromXDR(
          input.xdr,
          Networks.TESTNET,
        );

        const transactionResult = await server.submitTransaction(transaction);

        console.log("Transaction submitted successfully:", transactionResult);
        if (transactionResult.successful) {
          await ctx.db.asset.update({
            where: { id: input.id },
            data: {
              address: transactionResult.hash,
            },
          });
        }
        return transactionResult;
      } catch (e) {
        console.log("error : .----");
        console.error((e as AxiosError).message);
        console.error((e as AxiosError)?.response?.data);
        console.error((e as AxiosError)?.response?.data?.detail);
        console.error((e as AxiosError)?.response?.data?.title);
        console.error(
          (e as AxiosError)?.response?.data?.extras?.result_codes?.transaction,
        );
        console.error(
          (e as AxiosError)?.response?.data?.extras?.result_codes?.operations,
        );
        let message = "Failed to tokenize asset";
        if (
          (
            e as AxiosError
          )?.response?.data?.extras?.result_codes?.operations?.includes(
            "op_buy_no_trust",
          )
        ) {
          message = "You need to establish trustline first";
        } else if (
          (
            e as AxiosError
          )?.response?.data?.extras?.result_codes?.operations?.includes(
            "op_low_reserve",
          )
        ) {
          message = "You don't have enough XLM to create the tokenized asset";
        } else if (
          (
            e as AxiosError
          )?.response?.data?.extras?.result_codes?.operations?.includes(
            "op_bad_auth",
          )
        ) {
          message =
            "You are not authorized to perform transactions on this asset";
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
  createSellOffer: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.assetId },
      });
      // Load Distributor Account from Horizon
      // Distributor account
      const distributorKeypair = Keypair.fromSecret(
        env.DISTRIBUTOR_PRIVATE_KEY,
      );

      async function createSellOffer() {
        // Load distributor account
        const distributorAccount = await server.loadAccount(
          distributorKeypair.publicKey(),
        );

        // Build the transaction
        const transaction = new TransactionBuilder(distributorAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.manageSellOffer({
              selling: new Asset(asset.code, distributorKeypair.publicKey()),
              buying: Asset.native(), // XLM
              amount: asset.totalUnits.toString(),
              price: "0.01", // asset.pricePerUnit.toString(),
            }),
          )
          .setTimeout(180)
          .build();

        // Sign the transaction
        transaction.sign(distributorKeypair);

        // Submit the transaction
        try {
          const transactionResult = await server.submitTransaction(transaction);
          console.log("transactionResult:", transactionResult);
        } catch (e) {
          console.log("error : .----");
          console.error((e as AxiosError).message);
          console.error((e as AxiosError)?.response?.data);
          console.error((e as AxiosError)?.response?.data?.detail);
          console.error((e as AxiosError)?.response?.data?.title);
          console.error(
            (e as AxiosError)?.response?.data?.extras?.result_codes
              ?.transaction,
          );
          console.error(
            (e as AxiosError)?.response?.data?.extras?.result_codes?.operations,
          );
          let message = "Failed to create buy offer";
          if (
            (
              e as AxiosError
            )?.response?.data?.extras?.result_codes?.operations?.includes(
              "op_buy_no_trust",
            )
          ) {
            message = "You need to establish trustline first";
          } else if (
            (
              e as AxiosError
            )?.response?.data?.extras?.result_codes?.operations?.includes(
              "op_low_reserve",
            )
          ) {
            message = "You don't have enough XLM to create the offer";
          } else if (
            (
              e as AxiosError
            )?.response?.data?.extras?.result_codes?.operations?.includes(
              "op_underfunded",
            )
          ) {
            message = "You don't have enough asset to create the offer";
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message,
          });
        }
      }

      await createSellOffer();
    }),
});
