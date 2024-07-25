import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const eventsRouter = createTRPCRouter({
  getToddos: publicProcedure.query(() => {
    return [1, 2, 3, 4];
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        venue: z.string().min(1),
        description: z.string().min(1),
        date: z.string().min(1).or(z.date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log({
        name: input.name,
        venue: input.venue,
        description: input.description,
        date: input.date,
        // organizerId: ctx.session.user.id,
      });
      return ctx.db.event.create({
        data: {
          name: input.name,
          venue: input.venue,
          description: input.description,
          date: input.date,
          // organizerId: ctx.session.user.id,
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return null;
  }),
});
