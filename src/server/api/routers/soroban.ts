import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addressToScVal,
  callWithSignedXDR,
  getContractXDR,
  nativize,
  numberToi128,
  numberToU64,
  stringToSymbol,
} from "~/lib/soroban";
import { Horizon } from "@stellar/stellar-sdk";
import {
  getAssetBalanceFromAccount,
  getXLMBalanceFromAccount,
  handleHorizonServerError,
} from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { Fees, MAX_UNITS_PER_PURCHASE } from "~/constants";

interface TicketAuction {
  asset_address: string;
  end_time: bigint;
  event_start_time: bigint;
  highest_bid: bigint;
  highest_bidder: string | null;
  max_resell_price: bigint;
  owner: string;
  starting_price: bigint;
}

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const ticketAuctionContractAddress =
  "CDPSSARABJIJHPXSYP5RYAFXE6H4K2ZBWDW57BPO3LW3CML6VSAVIVWG";

// Stellar's Native Asset (XLM) Stellar Asset Contract Address
const xlmSAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Contract for Ticket Sales
const ticketSaleContractAddress =
  "CCRBPF3KS4D2VQQKOJ4YGCRHUVNAMWYXQHGALMLAHBVOG63MLHUZG2KW";

export const sorobanRouter = createTRPCRouter({
  contractPurchase: publicProcedure
    .input(
      z.object({
        userPublicKey: z.string().min(1),
        assetId: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findFirstOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const { address: sacAddress } =
        await ctx.db.stellaAssetContract.findFirstOrThrow({
          where: {
            code: asset.code,
            issuer: asset.issuer,
          },
          select: {
            address: true,
          },
        });

      const contractParams = [
        addressToScVal(sacAddress),
        numberToi128(input.quantity),
        addressToScVal(input.userPublicKey),
      ];

      console.log("contractParams", contractParams.length);

      /**
       * This contract call will send the Assets to the Ticket Sale Contract
       */
      return await getContractXDR(
        ticketSaleContractAddress,
        "purchase",
        input.userPublicKey,
        contractParams,
      );
    }),
  publish: publicProcedure
    .input(
      z.object({
        ownerPublicKey: z.string(),
        assetId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.asset.findFirstOrThrow({
        where: {
          id: input.assetId,
        },
      });
      if (asset.distributor !== input.ownerPublicKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only the asset distributor can start a sale",
        });
      }
      const { address: sacAddress } =
        await ctx.db.stellaAssetContract.findFirstOrThrow({
          where: {
            code: asset.code,
            issuer: asset.issuer,
          },
          select: {
            address: true,
          },
        });

      const contractParams = [
        addressToScVal(asset.issuer),
        addressToScVal(asset.distributor),
        stringToSymbol(asset.code),
        addressToScVal(sacAddress),
        addressToScVal(xlmSAC),
        numberToi128(Number(asset.pricePerUnit)),
        numberToi128(asset.totalUnits),
        numberToi128(Fees.SERVICE_FEE),
        numberToi128(Fees.SELLER_UNITARY_COMMISSION_PERCENTAGE),
        numberToi128(MAX_UNITS_PER_PURCHASE),
      ];

      console.log("contractParams", contractParams.length);

      /**
       * This contract call will send the Assets to the Ticket Sale Contract
       */
      return await getContractXDR(
        ticketSaleContractAddress,
        "initialize_sale",
        asset.distributor,
        contractParams,
      );
    }),
  startAuction: publicProcedure
    .input(
      z.object({
        ownerPublicKey: z.string(),
        assetId: z.string(),
        quantity: z.number(),
        startPrice: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findFirstOrThrow({
        where: {
          id: input.assetId,
        },
        include: {
          event: true,
        },
      });
      const unitAskPrice = Number(input.startPrice) / Number(input.quantity);

      if (unitAskPrice > Number(asset.pricePerUnit)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Starting price must be lower or equal than the asset's price per unit",
        });
      }
      const ownerAccount = await server.loadAccount(input.ownerPublicKey);
      const balance = getAssetBalanceFromAccount(ownerAccount.balances, asset);
      if (!balance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Asset not found in account",
        });
      }
      if (input.quantity > Number(balance.balance)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const auction = await ctx.db.assetAuction.create({
        data: {
          assetId: input.assetId,
          assetUnits: input.quantity,
          startsAt: dayjs().toDate(),
          endsAt: dayjs(asset.event.date).subtract(1, "day").toDate(),
          owner: input.ownerPublicKey,
          contractAddress: ticketAuctionContractAddress,
          contractMethodStartAuction: "start_auction",
          contractMethodViewBids: "view_auction",
          contractMethodEndAuction: "close_auction",
          contractMethodBid: "place_bid",
          contractMethodWithdraw: "not_defined",
          contractMethodClaim: "not_defined",
          contractMethodCancel: "cancel_auction",
          highestBid: Number(input.startPrice),
        },
      });

      const { address: sacAddress } =
        await ctx.db.stellaAssetContract.findFirstOrThrow({
          where: {
            code: asset.code,
            issuer: asset.issuer,
          },
          select: {
            address: true,
          },
        });

      const contractParams = [
        addressToScVal(asset.issuer),
        addressToScVal(input.ownerPublicKey),
        stringToSymbol(`AU${auction.id}`),
        addressToScVal(sacAddress),
        addressToScVal(xlmSAC), // Native Asset
        numberToi128(input.quantity),
        numberToi128(input.startPrice),
        numberToU64(dayjs(asset.event.date).unix()),
        numberToi128(Fees.RESELLER_PUBLISHING_FEE),
        numberToi128(Fees.RESELLER_UNITARY_COMMISSION_PERCENTAGE),
      ];

      return await getContractXDR(
        auction.contractAddress,
        auction.contractMethodStartAuction,
        input.ownerPublicKey,
        contractParams,
      );
    }),
  closeAuction: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
        auctionId: z.string().or(z.number()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const auction = await ctx.db.assetAuction.findFirstOrThrow({
        where: {
          id: Number(input.auctionId),
        },
      });

      if (input.publicKey !== auction.owner) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only the auction owner can close the auction",
        });
      }
      console.log("auction.owner:", auction.owner);
      const contractParams = [
        stringToSymbol(`AU${auction.id}`),
        addressToScVal(auction.owner),
      ];

      console.log("contractParams", contractParams);

      return await getContractXDR(
        auction.contractAddress,
        auction.contractMethodEndAuction,
        input.publicKey,
        contractParams,
      );
    }),
  cancelAuction: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
        auctionId: z.string().or(z.number()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const auction = await ctx.db.assetAuction.findFirstOrThrow({
        where: {
          id: Number(input.auctionId),
        },
      });

      if (input.publicKey !== auction.owner) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only the auction owner can close the auction",
        });
      }

      if (!auction.contractMethodCancel) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This auction does not support canceling",
        });
      }
      const contractParams = [
        stringToSymbol(`AU${auction.id}`),
        addressToScVal(auction.owner),
      ];

      return await getContractXDR(
        auction.contractAddress,
        auction.contractMethodCancel,
        input.publicKey,
        contractParams,
      );
    }),
  bid: publicProcedure
    .input(
      z.object({
        bidderKey: z.string(),
        auctionId: z.string().or(z.number()),
        bid: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const auction = await ctx.db.assetAuction.findFirstOrThrow({
        where: {
          id: Number(input.auctionId),
        },
      });

      if (input.bid <= Number(auction.highestBid)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please bid higher than the current highest bid",
        });
      }
      const ownerAccount = await server.loadAccount(input.bidderKey);
      const balance = getXLMBalanceFromAccount(ownerAccount.balances);
      if (balance < input.bid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const contractParams = [
        stringToSymbol(`AU${auction.id}`), // Auction ID
        addressToScVal(input.bidderKey), // Bidder
        numberToi128(input.bid), // Bid
      ];

      console.log("contractParams", contractParams);

      return await getContractXDR(
        auction.contractAddress,
        auction.contractMethodBid,
        input.bidderKey,
        contractParams,
      );
    }),
  viewAuction: publicProcedure
    .input(
      z.object({
        ownerPublicKey: z.string(),
        auctionId: z.string().or(z.number()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const auction = await ctx.db.assetAuction.findFirstOrThrow({
          where: {
            id: Number(input.auctionId),
          },
        });

        // Query the contract's state
        const contractParams = [stringToSymbol(`AU${Number(input.auctionId)}`)];

        return await getContractXDR(
          auction.contractAddress,
          "view_auction",
          input.ownerPublicKey,
          contractParams,
        );
      } catch (e) {
        handleHorizonServerError(e);
      }
    }),
  updateAuction: publicProcedure
    .input(
      z.object({
        bidder: z.string(),
        auctionId: z.string().or(z.number()),
        highestBid: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.bid.create({
          data: {
            bidder: input.bidder,
            assetAuction: Number(input.auctionId),
            amount: input.highestBid,
          },
        });
        await ctx.db.assetAuction.update({
          where: {
            id: Number(input.auctionId),
          },
          data: {
            highestBid: input.highestBid,
            highestBidder: input.bidder,
            bidCount: {
              increment: 1,
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }),
  closeAuctionOffChain: publicProcedure
    .input(
      z.object({
        auctionId: z.string().or(z.number()),
        ownerPublicKey: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.assetAuction.update({
          where: {
            id: Number(input.auctionId),
            owner: input.ownerPublicKey,
          },
          data: {
            closedAt: dayjs().toDate(),
          },
        });
      } catch (e) {
        console.log(e);
      }
    }),
  submitContractCall: publicProcedure
    .input(
      z.object({
        xdr: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await callWithSignedXDR(input.xdr);

        console.log("result", result);
        if (result) {
          console.log("nativize", nativize(result));
          console.log("result", result);
          return nativize<TicketAuction>(result) ?? "No result";
        }
      } catch (e) {
        console.error("Error on soroban:", e);
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
});
