import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const organizerRouter = createTRPCRouter({
  myEvents: publicProcedure
    .input(z.object({ publicKey: z.string(), orderBy: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.event.findMany({
        where: { distributorKey: input.publicKey },
        orderBy: { createdAt: "desc" },
      });
    }),
  event: publicProcedure
    .input(z.object({ publicKey: z.string(), eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId, distributorKey: input.publicKey },
      });
      return event ?? undefined;
    }),
});
