import { z } from "zod";
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
import { type AxiosError } from "axios";

const maxFeePerOperation = "100000";
const horizonUrl = "https://horizon-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server(horizonUrl);

export const stellarOfferRouter = createTRPCRouter({
  offers: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const event = await ctx.db.event.findUniqueOrThrow({
          where: {
            id: input.eventId,
          },
          include: {
            Asset: true,
          },
        });

        const ledgerAssets = await Promise.all(
          event.Asset.map(async (asset) => {
            const offers = await server
              .assets()
              .forCode(asset.code)
              .forIssuer(asset.issuer)
              .call();
            return { asset, offers };
          }),
        );

        console.log(
          "Current offers for the distributor account:",
          ledgerAssets,
        );

        return ledgerAssets;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching offers",
        });
        console.error("Error fetching offers:", error);
      }
    }),
  buy: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
        unitsToBuy: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const ledgerAsset = new Asset(asset.code, asset.issuer);
      // User account
      const userAccount = await server.loadAccount(input.userPublicKey);

      // Ensure the user has a trustline set up for the asset before attempting to buy it
      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageBuyOffer({
            selling: Asset.native(),
            buying: ledgerAsset,
            buyAmount: input.unitsToBuy.toString(),
            price: "0.01",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
  sell: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const ledgerAsset = new Asset(asset.code, asset.issuer);
      // User account
      const userAccount = await server.loadAccount(env.DISTRIBUTOR_PUBLIC_KEY);
      console.log("same keys?: ", env.DISTRIBUTOR_PUBLIC_KEY === asset.issuer);
      // Ensure the user has a trustline set up for the asset before attempting to buy it
      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: ledgerAsset,
            source: env.DISTRIBUTOR_PUBLIC_KEY,
          }),
        )
        .addOperation(
          Operation.manageSellOffer({
            buying: Asset.native(),
            selling: ledgerAsset,
            amount: asset.totalUnits.toString(),
            price: "0.01",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();

      // TODO: sign on client-side: Distributor account
      const distributorKeypair = Keypair.fromSecret(
        env.DISTRIBUTOR_PRIVATE_KEY,
      );

      transaction.sign(distributorKeypair);
      const txresult = await server
        .submitTransaction(transaction)
        .catch((e) => {
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
              "tx_bad_auth",
            )
          ) {
            message = "You are not authorized to create the offer";
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message,
          });
        });
      console.log("transactionResult:", txresult);
    }),
  purchase: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
        unitsToBuy: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const ledgerAsset = new Asset(asset.code, asset.issuer);
      // User account
      const userAccount = await server.loadAccount(input.userPublicKey);

      // Ensure the user has a trustline set up for the asset before attempting to buy it
      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: ledgerAsset,
            source: input.userPublicKey,
          }),
        )
        .addOperation(
          Operation.manageBuyOffer({
            selling: Asset.native(),
            buying: ledgerAsset,
            buyAmount: input.unitsToBuy.toString(),
            price: "0.01",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
});
