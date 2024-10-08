import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import EventFindManyArgs = Prisma.EventFindManyArgs;

export const organizerRouter = createTRPCRouter({
  myEvents: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
        orderBy: z.string().optional(),
        minDate: z.string().optional(),
        maxDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build WHERE object
      const findManyArgs: EventFindManyArgs = {
        where: {
          distributorKey: input.publicKey,
          deletedAt: null,
        },
        orderBy: { date: "desc" },
      };
      if (input.minDate) {
        findManyArgs.where = {
          ...findManyArgs.where,
          date: { gte: new Date(input.minDate) },
        };
      }
      if (input.maxDate) {
        findManyArgs.where = {
          ...findManyArgs.where,
          date: { lte: new Date(input.maxDate) },
        };
      }

      return await ctx.db.event.findMany(findManyArgs);
    }),

  event: publicProcedure
    .input(z.object({ publicKey: z.string(), eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: {
          id: input.eventId,
          distributorKey: input.publicKey,
          deletedAt: null,
        },
      });
      return event ?? undefined;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1), publicKey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id, distributorKey: input.publicKey },
        data: {
          deletedAt: new Date(),
        },
      });
    }),
});
