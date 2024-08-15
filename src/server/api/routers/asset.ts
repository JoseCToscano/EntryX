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
import { handleHorizonServerError } from "~/lib/utils";
import { Fees } from "~/constants";

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const assetsRouter = createTRPCRouter({
  getAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.asset.findUniqueOrThrow({ where: { id: input.id } });
    }),
  listForOwner: publicProcedure
    .input(z.object({ eventId: z.string(), publicKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.asset.findMany({
        where: { eventId: input.eventId, distributor: input.publicKey },
      });
      return categories;
    }),
  list: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findFirstOrThrow({
        where: { id: input.eventId },
        include: {
          Asset: true,
          // Asset: {
          //   where: { address: { not: null } },
          // },
        },
      });

      const { distributorKey } = event;
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
        .addOperation(
          Operation.payment({
            source: asset.distributor,
            destination: asset.issuer,
            amount: Fees.SELLER_PUBLISHING_FEE.toString(),
            asset: Asset.native(),
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
        console.log("Error", e);
        handleHorizonServerError(e);
      }
    }),
});
