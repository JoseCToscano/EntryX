import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Horizon } from "@stellar/stellar-sdk";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

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
});
