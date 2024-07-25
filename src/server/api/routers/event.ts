import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const eventsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        venue: z.string().min(1),
        description: z.string().min(1),
        date: z.string().min(1).or(z.date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          name: input.name,
          venue: input.venue,
          description: input.description,
          date: input.date,
          organizerId: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const event = await ctx.db.user.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return event ?? null;
  }),
});
