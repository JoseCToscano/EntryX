import { z } from "zod";
import {
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
  Keypair,
  BASE_FEE,
  Asset,
} from "@stellar/stellar-sdk";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";

function toPascalCase(str: string): string {
  // Split the string into words
  const words = str.split(" ");

  // Capitalize the first letter of each word and join them together
  const result = words
    .map((word) => {
      // Capitalize the first letter and concatenate with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
  return "TIX" + result.slice(0, 9);
}
export const eventsRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ orderBy: z.string().optional() }).optional())
    .query(({ ctx, input }) => {
      return ctx.db.event.findMany({
        orderBy: { createdAt: "desc" },
      });
    }),
  addTicketCategory: publicProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
        code: z.string().min(1),
        totalUnits: z.number().min(1),
        pricePerUnit: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.asset.create({
        data: {
          label: input.code,
          code: toPascalCase(input.code),
          type: "ticket",
          pricePerUnit: Number(input.pricePerUnit.toFixed(2)),
          totalUnits: input.totalUnits,
          eventId: input.eventId,
          issuer: env.ISSUER_PUBLIC_KEY,
          distributor: env.DISTRIBUTOR_PUBLIC_KEY,
        },
      });
    }),
  updateTicketCategory: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        code: z.string().min(1),
        totalUnits: z.number().min(1),
        pricePerUnit: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (asset.address) {
        throw new TRPCError({
          message: "Asset already tokenized",
          code: "UNAUTHORIZED",
        });
      }
      return ctx.db.asset.update({
        where: { id: input.id },
        data: {
          label: input.code,
          code: toPascalCase(input.code),
          type: "ticket",
          pricePerUnit: Number(input.pricePerUnit.toFixed(2)),
          totalUnits: input.totalUnits,
          issuer: env.ISSUER_PUBLIC_KEY,
          distributor: env.DISTRIBUTOR_PUBLIC_KEY,
        },
      });
    }),
  removeTicketCategory: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (asset.address) {
        throw new TRPCError({
          message: "Asset already tokenized",
          code: "UNAUTHORIZED",
        });
      }
      return ctx.db.asset.delete({
        where: { id: input.id },
      });
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
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        venue: z.string().min(1),
        description: z.string().min(1),
        date: z.string().min(1).or(z.date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
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
