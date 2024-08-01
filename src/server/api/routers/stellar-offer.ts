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

export const stellarOfferRouter = createTRPCRouter({
  offers: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const offers = await server
          .offers()
          .forAccount(env.DISTRIBUTOR_PUBLIC_KEY)
          .call();
        console.log(
          "Current offers for the distributor account:",
          offers.records,
        );
        console.log(offers);
        return offers;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching offers",
        });
        console.error("Error fetching offers:", error);
      }
    }),
  buy: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const asset = await ctx.db.asset.findUniqueOrThrow({
          where: {
            id: input.assetId,
          },
        });
        const tokenizedAsset = new Asset(asset.code, asset.issuer);
        // User account
        const userAccount = await server.loadAccount(env.USER_PUBLIC_KEY);
        const userKeypair = Keypair.fromSecret(env.USER_PRIVATE_KEY);

        // Ensure the user has a trustline set up for the asset before attempting to buy it
        // Build the transaction
        const transaction = new TransactionBuilder(userAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.manageBuyOffer({
              selling: Asset.native(),
              buying: tokenizedAsset,
              buyAmount: "1",
              price: "0.01",
            }),
          )
          .setTimeout(180)
          .build();
        console.log("transaction built");

        // Sign the transaction
        transaction.sign(userKeypair);
        console.log("transaction signed");
        // Submit the transaction
        const transactionResult = await server.submitTransaction(transaction);
        console.log("Buy offer created successfully:", transactionResult);
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
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
