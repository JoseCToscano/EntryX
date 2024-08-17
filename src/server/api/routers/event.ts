import { z } from "zod";
import { Asset, Horizon } from "@stellar/stellar-sdk";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import EventFindManyArgs = Prisma.EventFindManyArgs;

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

/**
 * Issuer Accounts are limited to 4096 unique Events (HEXADECIMAL 3 bytes),
 * each with 65,536 unique Tickets (HEXADECIMAL 4 bytes)
 * @param eventSequence
 * @param ticketSequence
 * @param size
 * MEDIUM: 3 event-bytes + 4 bytes (4096 unique tickets)
 * LARGE: 3 event-bytes + 5 bytes (65,536 unique tickets)
 * X-LARGE: 3 bytes + 6 bytes (16,777,216 unique tickets)
 */
function createUniqueAssetCode(
  eventSequence: number,
  ticketSequence: number,
  size: "medium" | "large" | "x-large",
): string {
  // All assets start with ENTRY
  let code = "ENTRY";
  let uniqueTciketsSize = 4;
  if (size === "large") {
    code = "ENTR";
    uniqueTciketsSize = 5;
  } else if (size === "x-large") {
    code = "TIX";
    uniqueTciketsSize = 6;
  }

  // Add event sequence number in HEX
  code += eventSequence.toString(16).toUpperCase().padStart(3, "X");
  // Add sequence number in HEX
  code += ticketSequence
    .toString(16)
    .toUpperCase()
    .padStart(uniqueTciketsSize, "0");

  return code;
}
export const eventsRouter = createTRPCRouter({
  myEvents: publicProcedure
    .input(
      z.object({
        publicKey: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.event.findMany({
        where: {
          distributorKey: input.publicKey,
          deletedAt: null,
        },
        orderBy: {
          date: "desc",
        },
      });
    }),
  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.event.findUniqueOrThrow({
        where: { id: input.id, deletedAt: null },
      });
    }),
  myTickets: publicProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
        userPublicKey: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await server.loadAccount(input.userPublicKey);
      const myTicketCodes = account.balances.filter((b) => {
        return (
          b.asset_type === "credit_alphanum12" &&
          b.asset_issuer === env.ISSUER_PUBLIC_KEY &&
          Number(b.balance) > 0
        );
      }) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[];
      console.log("myTicketCodes:", myTicketCodes);
      const assets = await ctx.db.asset.findMany({
        where: {
          eventId: input.eventId,
          code: { in: myTicketCodes.map((b) => b.asset_code) },
        },
      });

      // { "ENTRY0010001": Asset, "ENTRY0010002": Asset }
      const thisEventsTickets = new Map(assets.map((a) => [a.code, a]));

      const assetsInWallet = account.balances.filter(
        (balance) =>
          balance.asset_type === "credit_alphanum12" &&
          thisEventsTickets.has(balance.asset_code),
      ) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[];

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
      const account = await server.loadAccount(input.userPublicKey);
      // Get my ticket valid ticket codes for this event (event's issuer is the only issuer from env)
      const assetsInWalletFromEventIssuer = account.balances.filter((b) => {
        return (
          b.asset_type === "credit_alphanum12" &&
          b.asset_issuer === env.ISSUER_PUBLIC_KEY &&
          Number(b.balance) > 0
        );
      }) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[];

      // Assset's code is unique for this event
      const asset = await ctx.db.asset.findFirst({
        where: {
          id: input.assetId,
          eventId: input.eventId,
          code: { in: assetsInWalletFromEventIssuer.map((b) => b.asset_code) },
        },
      });

      if (!asset) {
        return null;
      }

      const walletAsset = assetsInWalletFromEventIssuer.find(
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
          event: {
            deletedAt: null,
          },
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
      const auctions = await ctx.db.assetAuction.aggregate({
        where: {
          asset: {
            eventId: input.id,
          },
          endsAt: {
            gt: new Date(),
          },
          closedAt: {
            equals: null,
          },
        },
        _count: {
          assetUnits: true,
        },
      });

      return auctions._count.assetUnits;
    }),
  search: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          fromUserKey: z.string().optional(),
          orderBy: z.string().optional(),
          minDate: z.string().optional(),
          maxDate: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Build WHERE object
      const findManyArgs: EventFindManyArgs = {
        where: {
          deletedAt: null,
          name: {
            contains: input?.search,
            mode: "insensitive",
          },
        },
        orderBy: { date: "asc" },
      };
      if (input?.minDate) {
        findManyArgs.where = {
          ...findManyArgs.where,
          date: { gte: new Date(input.minDate) },
        };
      }
      if (input?.maxDate) {
        findManyArgs.where = {
          ...findManyArgs.where,
          date: { lte: new Date(input.maxDate) },
        };
      }

      if (input?.fromUserKey) {
        const assetsInWallet = await server.loadAccount(input.fromUserKey);
        const myTicketCodes = assetsInWallet.balances.filter((b) => {
          return (
            b.asset_type === "credit_alphanum12" &&
            b.asset_issuer === env.ISSUER_PUBLIC_KEY &&
            Number(b.balance) > 0
          );
        }) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">[];
        return ctx.db.event.findMany({
          where: {
            deletedAt: null,
            ...findManyArgs.where,
            Asset: {
              some: {
                code: {
                  in: myTicketCodes.map((b) => b.asset_code),
                },
              },
            },
          },
        });
      }
      console.log("findManyArgs:", findManyArgs);
      return await ctx.db.event.findMany(findManyArgs);
    }),
  addTicketCategory: publicProcedure
    .input(
      z.object({
        distributorPublicKey: z.string().min(1),
        eventId: z.string().min(1),
        label: z.string().min(1),
        totalUnits: z.number().min(1),
        pricePerUnit: z.number().min(1),
        size: z.enum(["medium", "large", "x-large"]).default("medium"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findFirstOrThrow({
        where: {
          id: input.eventId,
          distributorKey: input.distributorPublicKey,
          deletedAt: null,
        },
      });

      const asset = await ctx.db.asset.findFirst({
        where: {
          eventId: input.eventId,
        },
        orderBy: {
          sequence: "desc",
        },
      });

      if (!event.sequence) {
        throw new TRPCError({
          message: "Invalid event configuration. Please contact support",
          code: "UNAUTHORIZED",
        });
      }

      console.log("creating cat for event:", event);
      const newasset = await ctx.db.asset.create({
        data: {
          label: input.label,
          code: createUniqueAssetCode(
            event.sequence,
            (asset?.sequence ?? 0) + 1,
            input.size,
          ),
          type: "ticket",
          pricePerUnit: Number(input.pricePerUnit.toFixed(2)),
          totalUnits: input.totalUnits,
          eventId: input.eventId,
          issuer: env.ISSUER_PUBLIC_KEY,
          distributor: input.distributorPublicKey,
          sequence: (asset?.sequence ?? 0) + 1,
        },
      });
      console.log("newasset:", newasset);
      return newasset;
    }),
  updateTicketCategory: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
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
          label: input.label,
          totalUnits: input.totalUnits,
          pricePerUnit: Number(input.pricePerUnit.toFixed(2)),
        },
      });
    }),
  removeTicketCategory: publicProcedure
    .input(
      z.object({
        publicKey: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (asset.distributor !== input.publicKey) {
        throw new TRPCError({
          message: "Only the distributor can remove a ticket category",
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
        publicKey: z.string().min(1),
        name: z.string().min(1),
        venue: z.string().min(1),
        location: z.string().min(1),
        description: z.string().min(1),
        date: z.string().min(1).or(z.date()),
        imageUrl: z.string().optional(),
        coverUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizersEvents = await ctx.db.event.findFirst({
        where: {
          distributorKey: input.publicKey,
          deletedAt: null,
        },
        orderBy: {
          sequence: "desc",
        },
      });
      return ctx.db.event.create({
        data: {
          name: input.name,
          venue: input.venue,
          description: input.description,
          date: input.date,
          distributorKey: input.publicKey,
          location: input.location,
          imageUrl: input.imageUrl,
          coverUrl: input.coverUrl,
          sequence: (organizersEvents?.sequence ?? 0) + 1,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        publicKey: z.string().min(1),
        name: z.string().min(1),
        venue: z.string().min(1),
        location: z.string().min(1),
        description: z.string().min(1),
        date: z.string().min(1).or(z.date()),
        imageUrl: z.string().optional(),
        coverUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id, distributorKey: input.publicKey },
        data: {
          name: input.name,
          venue: input.venue,
          description: input.description,
          date: input.date,
          location: input.location,
          imageUrl: input.imageUrl,
          coverUrl: input.coverUrl,
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    return null;
  }),
});
