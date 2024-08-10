import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

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

import { TRPCError } from "@trpc/server";
import {
  getAssetBalanceFromAccount,
  handleHorizonServerError,
} from "~/lib/utils";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit

export const stellarAccountRouter = createTRPCRouter({
  validateChallenge: publicProcedure
    .input(
      z.object({ clerkId: z.string(), publicKey: z.string(), xdr: z.string() }),
    )
    .mutation(async ({ input }) => {
      const transaction = TransactionBuilder.fromXDR(
        input.xdr,
        Networks.TESTNET,
      );

      // Verify that the transaction is signed by the user's public key
      const keypair = Keypair.fromPublicKey(input.publicKey);
      const isValid = transaction.signatures.some((signature) =>
        keypair.verify(transaction.hash(), signature.signature()),
      );

      if (isValid) {
        await clerkClient.users.updateUserMetadata(input.clerkId, {
          publicMetadata: {
            stellarPublicKey: keypair.publicKey(),
          },
        });
      }

      return isValid;
    }),
  getChallenge: publicProcedure
    .input(z.object({ publicKey: z.string() }))
    .mutation(async ({ input }) => {
      const account = await server.loadAccount(input.publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageData({
            name: "Challenge",
            value: "Access validation",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
  details: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // the JS SDK uses promises for most actions, such as retrieving an account
      const account = await server.loadAccount(input.id);
      return {
        id: account.account_id,
        balances: account.balances,
        subentryCount: account.subentry_count,
        xlm: account.balances.find(
          (balance) => balance.asset_type === "native",
        ),
      };
    }),
  hasTrustline: publicProcedure
    .input(
      z.object({
        id: z.string(),
        items: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await server.loadAccount(input.id);
      const assets = await ctx.db.asset.findMany({
        where: {
          id: {
            in: input.items,
          },
        },
      });
      if (assets.length !== input.items.length) {
        return false;
      }
      return assets.every(
        (asset) => !!getAssetBalanceFromAccount(account.balances, asset),
      );
    }),
  validateSignature: publicProcedure
    .input(z.object({ xdr: z.string().min(1), publicKey: z.string() }))
    .mutation(async ({ input }) => {
      function isValidSignature(signedXDR: string, publicKey: string) {
        try {
          // Parse the transaction from the XDR
          const transaction = TransactionBuilder.fromXDR(
            signedXDR,
            Networks.TESTNET,
          );

          // Retrieve all the signatures
          const signatures = transaction.signatures;

          // Iterate over each signature and verify
          for (const sig of signatures) {
            const keyPair = Keypair.fromPublicKey(publicKey);

            // Verify the signature
            if (keyPair.verify(transaction.hash(), sig.signature())) {
              return true; // Signature is valid for the given public key
            }
          }

          return false; // No valid signature found for the given public key
        } catch (error) {
          console.error("Error while verifying signature:", error);
          return false;
        }
      }

      return isValidSignature(input.xdr, input.publicKey);
    }),

  submitTransaction: publicProcedure
    .input(z.object({ xdr: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const transaction = TransactionBuilder.fromXDR(
          input.xdr,
          Networks.TESTNET,
        );
        return await server.submitTransaction(transaction);
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
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
          .setTimeout(standardTimebounds)
          .build();
        return transaction.toXDR();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error establishing trustline",
        });
      }
    }),
});
