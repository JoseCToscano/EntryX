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
import { AxiosError } from "axios";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const assetsRouter = createTRPCRouter({
  getAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.asset.findUniqueOrThrow({ where: { id: input.id } });
    }),
  list: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.asset.findMany({
        where: { eventId: input.eventId },
        orderBy: { createdAt: "asc" },
      });
    }),
  addToLedger: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.assetId },
      });
      console.log(asset);
      // Create asset
      // Load Issuer Account from Horizon
      const issuerKeypair = Keypair.fromSecret(env.ISSUER_PRIVATE_KEY);
      const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
      // Load Distributor Account from Horizon
      const distributorKeypair = Keypair.fromSecret(
        env.DISTRIBUTOR_PRIVATE_KEY,
      );

      const tokenizedAsset = new Asset(asset.code, issuerKeypair.publicKey());
      console.log(tokenizedAsset);
      const transaction = new TransactionBuilder(issuerAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        // Establish trustline between distributor and asset
        .addOperation(
          Operation.changeTrust({
            asset: tokenizedAsset,
            source: distributorKeypair.publicKey(),
          }),
        )
        .addOperation(
          Operation.payment({
            destination: distributorKeypair.publicKey(),
            asset: tokenizedAsset,
            amount: "1", // asset.totalUnits.toString(),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(issuerKeypair, distributorKeypair);
      console.log("transaction 1", transaction);
      try {
        const res = await server.submitTransaction(transaction);
        console.log("transaction 2", transaction);
        console.log("res", res);
        console.log("res.successful", res.successful);
        if (!res.successful) {
          throw new TRPCError({
            message: "Failed to create ticket category",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
        console.log("res.hash", res.hash);
        return ctx.db.asset.update({
          where: { id: input.assetId },
          data: {
            address: res.hash,
          },
        });
      } catch (e) {
        console.log("error : .----");
        console.error((e as AxiosError).message);
        console.error((e as AxiosError)?.response?.data);
        console.error((e as AxiosError)?.response?.data?.detail);
        console.error((e as AxiosError)?.response?.data?.title);
        console.error((e as AxiosError)?.response?.data?.extras?.result_codes);
        throw new TRPCError({
          message: "Failed to create ticket category",
          code: "INTERNAL_SERVER_ERROR",
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
        const transactionResult = await server
          .submitTransaction(transaction)
          .then((res) => {
            if (!res.successful) {
              throw new TRPCError({
                message: "Failed to create sell offer",
                code: "INTERNAL_SERVER_ERROR",
              });
            }
            return res;
          })
          .catch(console.error);
        console.log("Sell offer created successfully:", transactionResult);
      }

      await createSellOffer();
    }),
});
