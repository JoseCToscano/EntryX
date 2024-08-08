import { z } from "zod";
import { type AxiosError } from "axios";
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

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const analyticsRouter = createTRPCRouter({
  sales: publicProcedure
    .input(z.object({ publicKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.event.findMany({
        where: {
          distributorKey: input.publicKey,
        },
        include: {
          Asset: true,
        },
      });

      const assetCodes = new Map<
        string,
        {
          total: number | string;
          inWallet: number | string;
          pricePerUnit: number | string;
        }
      >(
        events.flatMap((event) =>
          event.Asset.map((asset) => [
            asset.code,
            {
              total: asset.totalUnits,
              inWallet: 0,
              pricePerUnit: asset.pricePerUnit,
            },
          ]),
        ),
      );

      const ledgerAccount = await server.loadAccount(input.publicKey);

      ledgerAccount.balances.forEach((b) => {
        const { asset_code, balance } = b;
        if (assetCodes.has(asset_code)) {
          const current = assetCodes.get(asset_code);
          if (current) {
            current.inWallet = Number(balance);
            assetCodes.set(asset_code, current);
          }
        }
      });

      let sales = 0;
      let earnings = 0;

      Array.from(assetCodes.values()).forEach((asset) => {
        const sold = Number(asset.total) - Number(asset.inWallet);
        sales += sold;
        earnings += sold * Number(asset.pricePerUnit);
      }, 0);

      return { sales, earnings };
    }),
});
