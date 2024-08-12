import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  addressToScVal,
  contractInt,
  getContractXDR,
  nativize,
  numberToi128,
  numberToU64,
  stringToSymbol,
} from "~/lib/soroban";
import { Horizon } from "@stellar/stellar-sdk";
import { getAssetBalanceFromAccount } from "~/lib/utils";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";

const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

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

      const contractParams = [
        addressToScVal(input.ownerPublicKey),
        numberToU64(1), // TODO: Auction ID
        addressToScVal(
          "CBJ4O23N44QNCNRKNBRYLSRO7JP62HQQHRG5FD5LMIM724USIXQPJ5WX",
        ),
        numberToi128(input.quantity),
        numberToU64(input.startPrice),
        numberToU64(Number(asset.pricePerUnit)),
        numberToU64(dayjs().add(1, "month").unix() / 100),
      ];

      console.log("contractParams", contractParams);

      const result = await getContractXDR(
        "CDMEDBDG5YEIZHWJS2XP5OMNZL63THGIZWSNJ3WRXDOBLLN4QEYZGPMC",
        "start_auction",
        input.ownerPublicKey,
        contractParams,
      );
      // console.log("result", result);
      // if (result) {
      //   console.log("nativize", nativize(result));
      //   console.log("result", result);
      // }
      return result;
    }),
});
