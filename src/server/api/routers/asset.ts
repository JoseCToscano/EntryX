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

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const assetsRouter = createTRPCRouter({
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
      // Create asset
      // Load Issuer Account from Horizon
      const issuerKeypair = Keypair.fromSecret(env.ISSUER_PRIVATE_KEY);
      const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
      // Load Distributor Account from Horizon
      const distributorKeypair = Keypair.fromSecret(
        env.DISTRIBUTOR_PRIVATE_KEY,
      );

      const tokenizedAsset = new Asset(asset.code, issuerKeypair.publicKey());
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
            amount: input.totalUnits.toString(),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(issuerKeypair, distributorKeypair);
      const res = await server.submitTransaction(transaction);
      console.log(res);
      if (!res.successful) {
        throw new TRPCError({
          message: "Failed to create ticket category",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      return ctx.db.asset.update({
        where: { id: input.assetId },
        data: {
          address: res.hash,
        },
      });
    }),
});
