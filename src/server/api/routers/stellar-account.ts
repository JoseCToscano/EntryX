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

export const stellarAccountRouter = createTRPCRouter({
  details: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // the JS SDK uses promises for most actions, such as retrieving an account
      const account = await server.loadAccount(input.id);
      console.log(account);
      return {
        id: account.account_id,
        balances: account.balances,
        subentryCount: account.subentry_count,
        xlm: account.balances.find(
          (balance) => balance.asset_type === "native",
        ),
      };
    }),
  trustline: publicProcedure
    .input(z.object({ assetId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const asset = await ctx.db.asset.findUniqueOrThrow({
          where: {
            id: input.assetId,
          },
        });
        const ledgerAsset = new Asset(asset.code, asset.issuer);
        // User account
        const userAccount = await server.loadAccount(env.USER_PUBLIC_KEY);
        const userKeypair = Keypair.fromSecret(env.USER_PRIVATE_KEY);
        // Build the transaction
        const transaction = new TransactionBuilder(userAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          // Ensure the user has a trustline set up for the asset before attempting to buy it
          .addOperation(
            Operation.changeTrust({
              asset: ledgerAsset,
              source: userKeypair.publicKey(),
            }),
          )
          .setTimeout(180)
          .build();
        // Sign the transaction
        transaction.sign(userKeypair);
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Trustline established successfully:", transactionResult);
      } catch (error) {
        console.error("Error creating buy offer:", JSON.stringify(error));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error establishing trustline",
        });
      }
    }),
  submitTransaction: publicProcedure
    .input(z.object({ xdr: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const transaction = TransactionBuilder.fromXDR(
          input.xdr,
          Networks.TESTNET,
        );
        console.log("Transaction loaded from XDR:", transaction);
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Transaction submitted successfully:", transactionResult);
      } catch (e) {
        console.error("Error submitting transaction:", JSON.stringify(e));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error submitting transaction",
        });
      }
    }),
  createTrustlineTransaction: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const asset = await ctx.db.asset.findUniqueOrThrow({
          where: {
            id: input.assetId,
          },
        });
        const ledgerAsset = new Asset(asset.code, asset.issuer);
        // User account
        const userAccount = await server.loadAccount(input.userPublicKey);
        // Build the transaction
        const transaction = new TransactionBuilder(userAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          // Ensure the user has a trustline set up for the asset before attempting to buy it
          .addOperation(
            Operation.changeTrust({
              asset: ledgerAsset,
              source: input.userPublicKey,
            }),
          )
          .setTimeout(180)
          .build();
        return transaction.toXDR();
      } catch (error) {
        console.error("Error creating buy offer:", JSON.stringify(error));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error establishing trustline",
        });
      }
    }),
});
