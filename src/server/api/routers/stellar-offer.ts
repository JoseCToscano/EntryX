import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { Asset as AssetDB } from "@prisma/client";
import { env } from "~/env";
import { TRPCError } from "@trpc/server";
import { type AxiosError } from "axios";
import { FIXED_UNITARY_COMMISSION, SERVICE_FEE } from "~/constants";

const maxFeePerOperation = "100000";
const horizonUrl = "https://horizon-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
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

        const ledgerAssets = await Promise.all(
          event.Asset.map(async (asset) => {
            const offers = await server
              .assets()
              .forCode(asset.code)
              .forIssuer(asset.issuer)
              .call();
            return { asset, offers };
          }),
        );

        console.log(
          "Current offers for the distributor account:",
          ledgerAssets,
        );

        return ledgerAssets;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching offers",
        });
        console.error("Error fetching offers:", error);
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
        if (
          userAccount.balances.find(
            (b) =>
              dbAsset.code === b.asset_code &&
              dbAsset.issuer === b.asset_issuer,
          )
        ) {
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
        // Add the purchase operation
        return txBuilder.addOperation(
          Operation.manageBuyOffer({
            selling: Asset.native(),
            buying: new Asset(asset.code, asset.issuer),
            buyAmount: cart.get(asset.id)!.toString(),
            price: asset.pricePerUnit.toString(),
          }),
        );
      }, emptyTransaction);

      // Add FIXED_UNITARY_COMMISSION operations
      // Add SERVICE_FEE operations
      transaction.addOperation(
        Operation.payment({
          source: input.userPublicKey,
          asset: Asset.native(),
          destination: env.ISSUER_PUBLIC_KEY,
          amount: (
            SERVICE_FEE +
            totalTickets * FIXED_UNITARY_COMMISSION
          ).toString(),
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

      const availableBalance = userAccount.balances.find(
        (b) => b.asset_code === asset.code && b.asset_issuer === asset.issuer,
      );
      console.log(
        "availableBalance:",
        availableBalance,
        "input.unitsToSell:",
        input.unitsToSell,
      );
      if (!availableBalance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Asset not found in user account",
        });
      }
      const availableToSell =
        Number(availableBalance.balance) -
        Number(availableBalance.selling_liabilities);
      if (availableToSell < input.unitsToSell) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const ledgerAsset = new Asset(asset.code, asset.issuer);

      // Ensure the user has a trustline set up for the asset before attempting to buy it
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
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
});
