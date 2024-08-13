import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addressToScVal,
  callContract,
  callWithSignedXDR,
  getContractXDR,
  nativize,
  numberToi128,
  numberToU64,
  stringToSymbol,
} from "~/lib/soroban";
import { Horizon, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  getAssetBalanceFromAccount,
  getXLMBalanceFromAccount,
  handleHorizonServerError,
} from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { env } from "~/env";

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

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
// const ticketAuctionContractAddress =
//   "CABNQYQNXLJUUYF65F3C3IERAWEXT5YF5XIMBHUZ3DAOQWVH7HLRZ3NC";
const ticketAuctionContractAddress =
  "CC7TAXRJV6AWXC2AZGNWVHVZLSXGQ3IOH2WHDSBNQ4SIFBBNSKWBRCYA";
export const sorobanRouter = createTRPCRouter({
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
          endsAt: dayjs().add(1, "month").toDate(),
          owner: input.ownerPublicKey,
          contractAddress: ticketAuctionContractAddress,
          contractMethodStartAuction: "start_auction",
          contractMethodViewBids: "view_auction",
          contractMethodEndAuction: "not_defined",
          contractMethodBid: "place_bid",
          contractMethodWithdraw: "not_defined",
          contractMethodClaim: "not_defined",
          contractMethodCancel: "not_defined",
        },
      });

      console.log("Auction created:", auction.id);

      const contractParams = [
        addressToScVal(input.ownerPublicKey),
        stringToSymbol(`AU${auction.id}`), // TODO: Auction ID
        addressToScVal(
          "CBJ4O23N44QNCNRKNBRYLSRO7JP62HQQHRG5FD5LMIM724USIXQPJ5WX",
        ),
        numberToi128(input.quantity),
        numberToU64(input.startPrice), // TODO: editar el front
        numberToU64(Number(asset.pricePerUnit)),
        numberToU64(dayjs(asset.event.date).unix()),
      ];

      console.log("contractParams", contractParams);

      return await getContractXDR(
        ticketAuctionContractAddress,
        "start_auction",
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
        ticketAuctionContractAddress,
        "close_auction",
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
        stringToSymbol(`AU${auction.id}`), // TODO: Auction ID
        addressToScVal(input.bidderKey),
        numberToU64(input.bid),
      ];

      console.log("contractParams", contractParams);

      return await getContractXDR(
        ticketAuctionContractAddress,
        "place_bid",
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
        // Query the contract's state
        const contractParams = [
          stringToSymbol(`AU${Number(input.auctionId)}`), // TODO: Auction ID
        ];

        const xdr = await getContractXDR(
          ticketAuctionContractAddress,
          "view_auction",
          input.ownerPublicKey,
          contractParams,
        );

        return xdr;

        // const result = await callContract(
        //   SACAddress,
        //   "balance",
        //   input.ownerPublicKey,
        //   [addressToScVal(input.ownerPublicKey)],
        // );
        // console.log("result", result);
        // if (result) {
        //   console.log("nativize", nativize(result));
        //   console.log("result", result);
        // }
        // return result;
      } catch (e) {
        console.log(e);
        // handleHorizonServerError(e);
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
        await ctx.db.assetAuction.update({
          where: {
            id: Number(input.auctionId),
          },
          data: {
            highestBid: input.highestBid,
            highestBidder: input.bidder,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }),
  submitContractCall: publicProcedure
    .input(z.object({ xdr: z.string().min(1) }))
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
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
});
