import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { type Asset as AssetDB } from "@prisma/client";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import {
  COMMISSION_PER_PURCHASED_ITEM,
  RESELLER_COMMISSION,
  SERVICE_FEE,
} from "~/constants";
import { getAssetBalanceFromAccount, isInTrustline } from "~/lib/utils";

const horizonUrl = "https://horizon-testnet.stellar.org";
const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server(horizonUrl);

export const stellarOfferRouter = createTRPCRouter({
  offers: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const event = await ctx.db.event.findUniqueOrThrow({
          where: {
            id: input.eventId,
          },
          include: {
            Asset: true,
          },
        });

        return await Promise.all(
          event.Asset.map(async (asset) => {
            const offers = await server
              .assets()
              .forCode(asset.code)
              .forIssuer(asset.issuer)
              .call();
            return { asset, offers };
          }),
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching offers",
        });
      }
    }),
  buy: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
        unitsToBuy: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const ledgerAsset = new Asset(asset.code, asset.issuer);
      // User account
      const userAccount = await server.loadAccount(input.userPublicKey);

      // Ensure the user has a trustline set up for the asset before attempting to buy it
      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageBuyOffer({
            selling: Asset.native(),
            buying: ledgerAsset,
            buyAmount: input.unitsToBuy.toString(),
            price: "0.01",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
  purchase: publicProcedure
    .input(
      z.object({
        userPublicKey: z.string().min(1),
        items: z.array(
          z.object({
            assetId: z.string().min(1),
            unitsToBuy: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const cart = new Map<string, number>(
        input.items.map((p) => [p.assetId, p.unitsToBuy]),
      );
      console.log("cart", cart);
      // Fetch the assets to be purchased
      const assets = await ctx.db.asset.findMany({
        where: {
          id: {
            in: Array.from(cart.keys()),
          },
        },
      });

      if (assets.length !== cart.size) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid items in cart",
        });
      }

      // User's Stellar account
      const userAccount = await server.loadAccount(input.userPublicKey);

      const trustline = new Map<string, AssetDB>();

      assets.forEach((dbAsset) => {
        if (userAccount.balances.find((b) => isInTrustline(b, dbAsset))) {
          trustline.set(dbAsset.id, dbAsset);
        }
      });

      const emptyTransaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      });

      let totalTickets = 0;
      const transaction = assets.reduce((txBuilder, asset) => {
        totalTickets += cart.get(asset.id)!;
        // Add missing items to the trustline
        if (!trustline.has(asset.id)) {
          const ledgerAsset = new Asset(asset.code, asset.issuer);
          txBuilder.addOperation(
            Operation.changeTrust({
              asset: ledgerAsset,
              source: input.userPublicKey,
            }),
          );
        }
        const buyAmount = cart.get(asset.id)!;
        // Add the purchase operation
        return txBuilder.addOperation(
          Operation.manageBuyOffer({
            selling: Asset.native(),
            buying: new Asset(asset.code, asset.issuer),
            buyAmount: buyAmount.toString(),
            price: asset.pricePerUnit.toString(),
          }),
        );
      }, emptyTransaction);
      console.log("Here");

      const extraCharges =
        SERVICE_FEE + COMMISSION_PER_PURCHASED_ITEM * totalTickets;

      // Add FIXED_UNITARY_COMMISSION operations
      // Add SERVICE_FEE operations
      transaction.addOperation(
        Operation.payment({
          source: input.userPublicKey,
          asset: Asset.native(),
          destination: env.ISSUER_PUBLIC_KEY,
          amount: extraCharges.toFixed(7),
        }),
      );

      return transaction.setTimeout(standardTimebounds).build().toXDR();
    }),
  sell: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
        unitsToSell: z.number().int().positive(),
        desiredPrice: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // User account
      const userAccount = await server.loadAccount(input.userPublicKey);

      const asset = await ctx.db.asset.findUniqueOrThrow({
        where: {
          id: input.assetId,
        },
      });

      const availableBalance = getAssetBalanceFromAccount(
        userAccount.balances,
        asset,
      );

      if (!availableBalance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Asset not found in user account",
        });
      }
      const offerableUnits =
        Number(availableBalance.balance) -
        Number(availableBalance.selling_liabilities);

      if (offerableUnits < input.unitsToSell) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const ledgerAsset = new Asset(asset.code, asset.issuer);

      // Build the transaction
      const transaction = new TransactionBuilder(userAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageSellOffer({
            buying: Asset.native(),
            selling: ledgerAsset,
            amount: input.unitsToSell.toString(),
            price: input.desiredPrice
              ? input.desiredPrice.toString()
              : asset.pricePerUnit.toString(),
          }),
        )
        // Add FIXED_UNITARY_COMMISSION operations
        // Add SERVICE_FEE operations
        .addOperation(
          Operation.payment({
            source: input.userPublicKey,
            asset: Asset.native(),
            destination: env.ISSUER_PUBLIC_KEY,
            amount: (RESELLER_COMMISSION * input.unitsToSell).toString(),
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
});
