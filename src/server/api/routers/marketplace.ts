import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const marketplaceRouter = createTRPCRouter({
  searchAuctions: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        eventId: z.string().optional(),
        fromUserKey: z.string().optional(),
        bidder: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let eventIdFilter = {};
      if (input.eventId) {
        eventIdFilter = {
          eventId: input.eventId,
        };
      }

      let fromUserKeyFilter = {};
      if (input.fromUserKey) {
        fromUserKeyFilter = {
          owner: input.fromUserKey,
        };
      }

      let bidderFilter = {};
      if (input.bidder) {
        bidderFilter = {
          Bid: {
            some: {
              bidder: input.bidder,
            },
          },
        };
      }

      const auctions = await ctx.db.assetAuction.findMany({
        where: {
          ...bidderFilter,
          ...fromUserKeyFilter,
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
