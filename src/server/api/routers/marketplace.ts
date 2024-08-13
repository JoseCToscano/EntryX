import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addressToScVal,
  callContract,
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

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const ticketAuctionContractAddress =
  "CABNQYQNXLJUUYF65F3C3IERAWEXT5YF5XIMBHUZ3DAOQWVH7HLRZ3NC";
export const marketplaceRouter = createTRPCRouter({
  searchAuctions: publicProcedure
    .input(z.object({}))
    .query(async ({ input, ctx }) => {
      const auctions = await ctx.db.assetAuction.findMany({
        where: {
          endsAt: {
            gt: new Date(),
          },
        },
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
      console.log("auctions", auctions);
      return auctions;
    }),
});
