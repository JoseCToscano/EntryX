import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const stellarAccountRouter = createTRPCRouter({
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
});
