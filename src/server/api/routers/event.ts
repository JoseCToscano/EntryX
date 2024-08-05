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

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

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
  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findUniqueOrThrow({ where: { id: input.id } });
    }),
  myTickets: publicProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
        userPublicKey: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const event = await ctx.db.event.findUniqueOrThrow({
      //   where: { id: input.eventId },
      // });
      const account = await server.loadAccount(input.userPublicKey);
      const myTicketCodes = account.balances
        .filter((b) => {
          // TODO
          return (
            b.asset_issuer === env.ISSUER_PUBLIC_KEY && Number(b.balance) > 0
          );
        })
        .map((b) => b.asset_code);
      console.log("myTicketCodes:", myTicketCodes);
      const assets = await ctx.db.asset.findMany({
        where: {
          eventId: input.eventId,
          code: { in: myTicketCodes },
        },
      });
      console.log(assets);

      const thisEventsTickets = new Map(assets.map((a) => [a.code, a]));

      const assetsInWallet = account.balances.filter((balance) =>
        thisEventsTickets.has(balance.asset_code),
      );

      return assetsInWallet.map((balance) => {
        const asset = thisEventsTickets.get(balance.asset_code);
        return {
          ...asset,
          balance,
          sellingLiabilities: balance.selling_liabilities,
        };
      });
    }),
  ticket: publicProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const event = await ctx.db.event.findUniqueOrThrow({
      //   where: { id: input.eventId },
      // });
      const account = await server.loadAccount(input.userPublicKey);
      const myTicketCodes = account.balances
        .filter((b) => {
          // TODO
          return (
            b.asset_issuer === env.ISSUER_PUBLIC_KEY && Number(b.balance) > 0
          );
        })
        .map((b) => b.asset_code);
      const asset = await ctx.db.asset.findFirst({
        where: {
          id: input.assetId,
          eventId: input.eventId,
          code: { in: myTicketCodes },
        },
      });

      if (!asset) {
        return null;
      }

      const walletAsset = account.balances.find(
        (b) => b.asset_code === asset.code,
      );

      if (!walletAsset) {
        return null;
      }

      return {
        asset,
        balance: walletAsset.balance,
        sellingLiabilities: walletAsset.selling_liabilities ?? 0,
      };
    }),
  marketplace: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const assets = await ctx.db.asset.findMany({
        where: {
          eventId: input.id,
        },
        include: { event: true },
      });

      const marketplaceItems = await Promise.all(
        assets.map(async (a) => {
          const offers = await server
            .offers()
            .selling(new Asset(a.code, a.issuer))
            .call();
          return offers.records
            .filter((o) => o.seller !== a.distributor)
            .map((o) => ({
              ...a,
              offer: o,
            }));
        }),
      );
      const items = marketplaceItems.flat();
      console.log("items:", items);
      return items;
    }),
  marketplaceCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const assets = await ctx.db.asset.findMany({
        where: {
          eventId: input.id,
        },
        include: { event: true },
      });

      const marketplaceItems = await Promise.all(
        assets.map(async (a) => {
          const offers = await server
            .offers()
            .selling(new Asset(a.code, a.issuer))
            .call();
          return offers.records
            .filter((o) => o.seller !== a.distributor)
            .map((o) => ({
              ...a,
              offer: o,
            }));
        }),
      );
      return marketplaceItems.flat().reduce((acc, item) => {
        return acc + parseInt(item.offer.amount);
      }, 0);
    }),
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
