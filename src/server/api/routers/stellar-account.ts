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

import { TRPCError } from "@trpc/server";
import {
  getAssetBalanceFromAccount,
  handleHorizonServerError,
  shortStellarAddress,
} from "~/lib/utils";
import { env } from "~/env";
import { Fees } from "~/constants";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit

export const stellarAccountRouter = createTRPCRouter({
  validateChallenge: publicProcedure
    .input(z.object({ publicKey: z.string(), xdr: z.string() }))
    .mutation(async ({ input }) => {
      const transaction = TransactionBuilder.fromXDR(
        input.xdr,
        Networks.TESTNET,
      );

      // Verify that the transaction is signed by the user's public key
      const keypair = Keypair.fromPublicKey(input.publicKey);
      const isValid = transaction.signatures.some((signature) =>
        keypair.verify(transaction.hash(), signature.signature()),
      );

      return isValid;
    }),
  isAllowedPartner: publicProcedure
    .input(z.object({ publicKey: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log("publicKey", input.publicKey);
      const partner = await ctx.db.authorizedPartners.findFirst({
        where: {
          publicKey: input.publicKey,
        },
        select: {
          publicKey: true,
        },
      });
      console.log("partner:", partner);
      return !!partner?.publicKey;
    }),
  getChallenge: publicProcedure
    .input(z.object({ publicKey: z.string() }))
    .mutation(async ({ input }) => {
      const account = await server.loadAccount(input.publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageData({
            name: "Challenge",
            value: "Access validation",
          }),
        )
        .setTimeout(standardTimebounds)
        .build();
      return transaction.toXDR();
    }),
  details: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // the JS SDK uses promises for most actions, such as retrieving an account
      const account = await server.loadAccount(input.id);
      return {
        id: account.account_id,
        balances: account.balances,
        subentryCount: account.subentry_count,
        xlm: account.balances.find(
          (balance) => balance.asset_type === "native",
        ),
      };
    }),
  hasTrustline: publicProcedure
    .input(
      z.object({
        id: z.string(),
        items: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const account = await server.loadAccount(input.id);
      const assets = await ctx.db.asset.findMany({
        where: {
          id: {
            in: input.items,
          },
        },
      });
      if (assets.length !== input.items.length) {
        return false;
      }
      return assets.every(
        (asset) => !!getAssetBalanceFromAccount(account.balances, asset),
      );
    }),
  addTrustline: publicProcedure
    .input(
      z.object({
        publicKey: z.string(),
        assetId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asset = await ctx.db.asset.findFirstOrThrow({
        where: {
          id: input.assetId,
        },
      });
      const account = await server.loadAccount(input.publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: new Asset(asset.code, asset.issuer),
            source: input.publicKey,
          }),
        )
        .setTimeout(standardTimebounds)
        .build();

      return transaction.toXDR();
    }),
  operations: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().default(5).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const ops = await server
        .operations()
        .forAccount(input.id)
        .order("desc")
        .limit(input.limit ?? 15)
        .call();
      return ops.records.map((op) => {
        const operation = {
          id: op.id,
          created_at: op.created_at,
          type: op.type,
          label: `${op.type}`,
          source: op.source_account,
          desc: "",
          asset_code: "",
        };
        switch (op.type) {
          case Horizon.HorizonApi.OperationResponseType.invokeHostFunction:
            if (op.asset_balance_changes.length) {
              console.log(op);
              operation.desc = op.asset_balance_changes.reduce(
                (acc, change) => {
                  if (change.asset_code) {
                    operation.asset_code = change.asset_code;
                  }
                  if (change.to === env.ISSUER_PUBLIC_KEY) {
                    return `${acc ? `${acc},` : ""}${change.type} ${Number(change.amount)} ${change.asset_type === "native" ? "XLM" : change.asset_code}: Fees & Commissions`;
                  }
                  return `${acc ? `${acc},` : ""}${change.type} ${Number(change.amount)} ${change.asset_type === "native" ? "XLM" : change.asset_code} ${change.to ? `to ${shortStellarAddress(change.to)}` : ""}`;
                },
                "",
              );
            } else {
              operation.desc = "No asset balance changes";
            }
            if (op.function?.toLowerCase().includes("invokecontract")) {
              operation.label = "Soroban contract function call";
            } else {
              operation.label = "Invoke host function";
            }
            break;
          case Horizon.HorizonApi.OperationResponseType.createAccount:
            operation.label = "Create account";
            operation.desc = `create account ${shortStellarAddress(op.account)}`;
            break;
          case Horizon.HorizonApi.OperationResponseType.payment:
            operation.label = "Payment";
            operation.desc = `payment ${Number(op.amount)} ${op.asset_code ?? ""} to ${shortStellarAddress(op.to)}`;

            if (
              Number(op.amount) === Fees.SELLER_PUBLISHING_FEE &&
              op.asset_type === "native" &&
              op.to === env.ISSUER_PUBLIC_KEY
            ) {
              operation.desc = `publishing fee payment of ${Number(op.amount)} XLM`;
            }

            operation.asset_code = op.asset_code ?? "";
            break;
          case Horizon.HorizonApi.OperationResponseType.pathPayment:
            operation.label = "Path payment";
            operation.desc = `path payment ${Number(op.amount)} ${op.asset_code} to ${op.to}`;
            operation.asset_code = op.asset_code ?? "";
            break;
          case Horizon.HorizonApi.OperationResponseType.manageOffer:
            operation.label = "Manage offer";
            operation.desc = `${op.buying_asset_code ?? ""} for ${Number(op.amount)} ${op.selling_asset_code}`;
            operation.asset_code =
              op.buying_asset_code && op.selling_asset_code
                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                : (op.buying_asset_code ?? "");
            break;
          case Horizon.HorizonApi.OperationResponseType.createPassiveOffer:
            operation.label = "Create passive offer";
            operation.desc = `create passive offer ${op.offer_id} ${op.buying_asset_code} for ${op.amount} ${op.selling_asset_code}`;
            operation.asset_code =
              op.buying_asset_code && op.selling_asset_code
                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                : (op.buying_asset_code ?? "");
            break;
          case Horizon.HorizonApi.OperationResponseType.setOptions:
            operation.label = "Set options";
            operation.desc = `set options for ${shortStellarAddress(op.source_account)} ${op.home_domain}`;
            break;
          case Horizon.HorizonApi.OperationResponseType.changeTrust:
            operation.label = "Change trust";
            operation.desc = `change trust for ${op.asset_code}`;
            operation.asset_code = op.asset_code ?? "";
            break;
          case Horizon.HorizonApi.OperationResponseType.allowTrust:
            operation.label = "Allow trust";
            operation.desc = `allow trust for ${op.asset_code}`;
            operation.asset_code = op.asset_code ?? "";
            break;
          case Horizon.HorizonApi.OperationResponseType.accountMerge:
            operation.label = "Account merge";
            operation.desc = `merge account ${op.into}`;
            break;
          case Horizon.HorizonApi.OperationResponseType.inflation:
            operation.label = "Inflation";
            operation.desc = `inflation`;
            break;
          case Horizon.HorizonApi.OperationResponseType.manageData:
            operation.label = "Manage data";
            operation.desc = `manage data for ${op.name}`;
            break;
          case Horizon.HorizonApi.OperationResponseType.bumpSequence:
            operation.label = "Bump sequence";
            operation.desc = `bump sequence to ${op.bump_to}`;
            break;
          case Horizon.HorizonApi.OperationResponseType.createClaimableBalance:
            operation.label = "Create claimable balance";
            operation.desc = `create claimable balance`;
            break;
          case Horizon.HorizonApi.OperationResponseType.claimClaimableBalance:
            operation.label = "Claim claimable balance";
            operation.desc = `claim claimable balance`;
            break;
          case Horizon.HorizonApi.OperationResponseType
            .beginSponsoringFutureReserves:
            operation.label = "Begin sponsoring future reserves";
            operation.desc = `begin sponsoring future reserves`;
            break;
          case Horizon.HorizonApi.OperationResponseType
            .endSponsoringFutureReserves:
            operation.label = "End sponsoring future reserves";
            operation.desc = `end sponsoring future reserves`;
            break;
          case Horizon.HorizonApi.OperationResponseType.revokeSponsorship:
            operation.label = "Revoke sponsorship";
            operation.desc = `revoke sponsorship`;
            break;
          case Horizon.HorizonApi.OperationResponseType.clawback:
          case Horizon.HorizonApi.OperationResponseType
            .clawbackClaimableBalance:
            operation.label = "Clawback";
            operation.desc = `clawback`;
            break;
          case Horizon.HorizonApi.OperationResponseType.setTrustLineFlags:
            operation.label = "Set trust line flags";
            operation.desc = `set trust line flags`;
            break;
          case Horizon.HorizonApi.OperationResponseType
            .manageBuyOffer as Horizon.HorizonApi.OperationResponseType.manageOffer: // Horizon API is not correctly mapping manageBuyOffer
            operation.label = "Manage buy offer";
            operation.desc = `${Number(op.amount ?? "0")} ${op.buying_asset_code} for ${op.price}`;
            operation.asset_code =
              op.buying_asset_code && op.selling_asset_code
                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                : (op.buying_asset_code ?? "");
            break;
          default:
            console.log("unkown operation", op);
            operation.desc = `unknown operation`;
        }
        return operation;
      });
    }),
  validateSignature: publicProcedure
    .input(z.object({ xdr: z.string().min(1), publicKey: z.string() }))
    .mutation(async ({ input }) => {
      function isValidSignature(signedXDR: string, publicKey: string) {
        try {
          // Parse the transaction from the XDR
          const transaction = TransactionBuilder.fromXDR(
            signedXDR,
            Networks.TESTNET,
          );

          // Retrieve all the signatures
          const signatures = transaction.signatures;

          // Iterate over each signature and verify
          for (const sig of signatures) {
            const keyPair = Keypair.fromPublicKey(publicKey);

            // Verify the signature
            if (keyPair.verify(transaction.hash(), sig.signature())) {
              return true; // Signature is valid for the given public key
            }
          }

          return false; // No valid signature found for the given public key
        } catch (error) {
          console.error("Error while verifying signature:", error);
          return false;
        }
      }

      return isValidSignature(input.xdr, input.publicKey);
    }),

  submitTransaction: publicProcedure
    .input(z.object({ xdr: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const transaction = TransactionBuilder.fromXDR(
          input.xdr,
          Networks.TESTNET,
        );
        return await server.submitTransaction(transaction);
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
  createTrustlineTransaction: publicProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        userPublicKey: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const asset = await ctx.db.asset.findUniqueOrThrow({
          where: {
            id: input.assetId,
          },
        });
        const ledgerAsset = new Asset(asset.code, asset.issuer);
        // User account
        const userAccount = await server.loadAccount(input.userPublicKey);
        // Build the transaction
        const transaction = new TransactionBuilder(userAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          // Ensure the user has a trustline set up for the asset before attempting to buy it
          .addOperation(
            Operation.changeTrust({
              asset: ledgerAsset,
              source: input.userPublicKey,
            }),
          )
          .setTimeout(standardTimebounds)
          .build();
        return transaction.toXDR();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error establishing trustline",
        });
      }
    }),
});
