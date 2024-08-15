import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addressToScVal,
  callWithSignedXDR,
  getContractXDR,
  nativize,
  numberToi128,
  numberToU64,
  stringToSymbol,
} from "~/lib/soroban";
import { Horizon, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  getAssetBalanceFromAccount,
  handleHorizonServerError,
} from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { env } from "~/env";

interface TicketAuction {
  asset_address: string;
  end_time: bigint;
  event_start_time: bigint;
  highest_bid: bigint;
  highest_bidder: string | null;
  max_resell_price: bigint;
  owner: string;
  starting_price: bigint;
}

export const marketplaceRouter = createTRPCRouter({
  searchAuctions: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        eventId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let eventIdFilter = {};
      if (input.eventId) {
        eventIdFilter = {
          eventId: input.eventId,
        };
      }
      const auctions = await ctx.db.assetAuction.findMany({
        where: {
          endsAt: {
            gt: new Date(),
          },
          closedAt: {
            equals: null,
          },
          asset: {
            ...eventIdFilter,
            event: {
              name: {
                contains: input.search,
                mode: "insensitive",
              },
            },
          },
        },
        orderBy: { endsAt: "asc" },
        include: {
          asset: {
            include: {
              event: true,
            },
          },
        },
      });
      console.log("auctions", auctions);
      return auctions;
    }),
  getAuction: publicProcedure
    .input(z.object({ id: z.string().or(z.number()) }))
    .query(async ({ input, ctx }) => {
      const auctions = await ctx.db.assetAuction.findFirstOrThrow({
        where: {
          id: Number(input.id),
        },
        include: {
          asset: {
            include: {
              event: true,
            },
          },
        },
      });
      return auctions;
    }),
});
