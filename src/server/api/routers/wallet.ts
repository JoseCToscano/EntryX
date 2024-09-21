import { z } from "zod";
import crypto from "crypto";
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

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const walletRouter = createTRPCRouter({
  // Generate a WebAuthn challenge
  generateChallenge: publicProcedure.query(() => {
    const challenge = crypto.randomBytes(32).toString("hex"); // Random challenge
    return { challenge };
  }),

  // Verify the WebAuthn response
  // Verify the WebAuthn response
  verifyWebAuthn: publicProcedure
    .input(
      z.object({
        credentialId: z.string(),
        clientDataJSON: z.string(),
        authenticatorData: z.string(),
        signature: z.string().optional(),
        publicKey: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Perform necessary verification steps:
      // - Verify the challenge matches
      // - Verify the signature using the public key associated with the credentialId
      // - Validate the authenticatorData
      // Note: Implementing full WebAuthn verification is complex and beyond this example's scope

      // For this example, we'll assume verification passes
      console.log("Authentication verified on server.");

      return { success: true };
    }),
});
