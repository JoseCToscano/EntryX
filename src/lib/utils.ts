import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Asset, Horizon, BASE_FEE } from "@stellar/stellar-sdk";
import { type Asset as AssetDB } from "@prisma/client";
import toast from "react-hot-toast";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type AxiosError } from "axios";
import { TRPCError } from "@trpc/server";
import { type AnyClientTypes } from "@trpc/server/unstable-core-do-not-import";

type AccountBalance =
  | Horizon.HorizonApi.BalanceLineNative
  | Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum4">
  | Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">
  | Horizon.HorizonApi.BalanceLineLiquidityPool;
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Plurify a string based on a quantity.
 * @param singularText
 * @param quantity
 * @param customPlural
 */
export function plurify(
  singularText: string,
  quantity: number,
  customPlural?: string,
): string {
  if (quantity === 1) return singularText;
  if (customPlural) return customPlural;
  return `${singularText}s`;
}

export const noop = () => {
  return;
};

export function fromXLMToUSD(xlm: number) {
  return xlm * 0.09;
}

export function fromStroopsToXLM(stroops: number) {
  return stroops / 10000000;
}

export function fromXLMToStroops(xlm: number) {
  return xlm * 10000000;
}

export function computeTransactionFees(
  assets: Set<Asset>,
  accountBalances: AccountBalance[],
): string {
  let numOperations = 1; // The first operation is the service Fee to Issuer
  for (const asset of assets) {
    numOperations++;
    const assetCode = asset.getCode();
    const assetIssuer = asset.getIssuer();
    if (
      !accountBalances.some(
        (balance) =>
          balance.asset_type === "credit_alphanum12" &&
          balance.asset_code === assetCode &&
          balance.asset_issuer === assetIssuer,
      )
    ) {
      numOperations++;
    }
  }
  return (fromStroopsToXLM(Number(BASE_FEE)) * numOperations).toFixed(5);
}

export function isInTrustline(
  accountBalance: AccountBalance,
  dbAsset: AssetDB,
): boolean {
  return (
    accountBalance.asset_type === "credit_alphanum12" &&
    dbAsset.code === accountBalance.asset_code &&
    dbAsset.issuer === accountBalance.asset_issuer
  );
}

export function getAssetBalanceFromAccount(
  accountBalances: AccountBalance[],
  dbAsset: AssetDB,
): Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12"> | undefined {
  return accountBalances.find((balance) =>
    isInTrustline(balance, dbAsset),
  ) as Horizon.HorizonApi.BalanceLineAsset<"credit_alphanum12">;
}

export function getXLMBalanceFromAccount(
  accountBalances: AccountBalance[],
): number {
  const xlmBalance = accountBalances.find(
    (balance) => balance.asset_type === "native",
  );
  return xlmBalance?.balance ? Number(xlmBalance.balance) : 0;
}

export function ClientTRPCErrorHandler<T extends AnyClientTypes>(
  x?: TRPCClientErrorLike<T>,
) {
  if (x?.message) {
    toast.error(x?.message);
  } else if ((x?.data as { code: string })?.code === "INTERNAL_SERVER_ERROR") {
    toast.error("We are facing some issues. Please try again later");
  } else if ((x?.data as { code: string })?.code === "BAD_REQUEST") {
    toast.error("Invalid request. Please try again later");
  } else if ((x?.data as { code: string })?.code === "UNAUTHORIZED") {
    toast.error("Unauthorized request. Please try again later");
  } else if (x?.message) {
    toast.error(x?.message);
  } else {
    toast.error("We are facing some issues! Please try again later");
  }
}

export function handleHorizonServerError(error: unknown) {
  console.log("hi:)");
  let message = "Failed to send transaction to blockchain";
  const axiosError = error as AxiosError<Horizon.HorizonApi.ErrorResponseData>;
  if (
    typeof (axiosError?.response as { detail?: string })?.detail === "string"
  ) {
    message = (axiosError?.response as { detail?: string })?.detail ?? message;
  } else if (axiosError?.response?.data) {
    switch (axiosError.response.data.title) {
      case "Rate Limit Exceeded":
        message = "Rate limit exceeded. Please try again in a few seconds";
        break;
      case "Internal Server Error":
        message = "We are facing some issues. Please try again later";
        break;
      case "Transaction Failed":
        message = "Transaction failed";
        const txError = parsedTransactionFailedError(axiosError.response.data);
        if (txError) {
          message = `Transaction failed: ${txError}`;
        }
        break;
      default:
        message = "Failed to send transaction to blockchain";
        break;
    }
  }
  console.log(message);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
  });
}
function parsedTransactionFailedError(
  failedTXError?: Horizon.HorizonApi.ErrorResponseData.TransactionFailed,
) {
  console.log("failedTXError", failedTXError);
  if (!failedTXError) return;
  const { extras } = failedTXError;
  let message = "Unknown error";
  if (!extras) {
    return message;
  }
  console.log(extras.result_codes.operations);
  if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH
  ) {
    message = "Invalid transaction signature";
  } else if (
    extras.result_codes.transaction ===
    Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE
  ) {
    message = "Transaction expired. Please try again";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_FAILED,
    )
  ) {
    message = "One of the operations failed (none were applied)";
  } else if (extras.result_codes.operations?.includes("op_no_issuer")) {
    message = "The issuer account does not exist. ¿Has network been restored?";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_EARLY,
    )
  ) {
    message = "The ledger closeTime was before the minTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_TOO_LATE,
    )
  ) {
    message = "The ledger closeTime was after the maxTime";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_MISSING_OPERATION,
    )
  ) {
    message = "No operation was specified";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_SEQ,
    )
  ) {
    message = "The sequence number does not match source account";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH,
    )
  ) {
    message =
      "Check if you have the required permissions and signatures for this Network";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_BALANCE,
    )
  ) {
    message = "You don't have enough balance to perform this operation";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NO_SOURCE_ACCOUNT,
    )
  ) {
    message = "The source account does not exist";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_BAD_AUTH_EXTRA,
    )
  ) {
    message = "There are unused signatures attached to the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INSUFFICIENT_FEE,
    )
  ) {
    message = "The fee is insufficient for the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_INTERNAL_ERROR,
    )
  ) {
    message = "An unknown error occurred while processing the transaction";
  } else if (
    extras.result_codes.operations?.includes(
      Horizon.HorizonApi.TransactionFailedResultCodes.TX_NOT_SUPPORTED,
    )
  ) {
    message = "The operation is not supported by the network";
  } else if (extras.result_codes.operations?.includes("op_buy_no_trust")) {
    message = "You need to establish trustline first";
  } else if (extras.result_codes.operations?.includes("op_low_reserve")) {
    message = "You don't have enough XLM to create the offer";
  } else if (extras.result_codes.operations?.includes("op_bad_auth")) {
    message =
      "There are missing valid signatures, or the transaction was submitted to the wrong network";
  } else if (extras.result_codes.operations?.includes("op_no_source_account")) {
    message = "There is no source account";
  } else if (extras.result_codes.operations?.includes("op_not_supported")) {
    message = "The operation is not supported by the network";
  } else if (
    extras.result_codes.operations?.includes("op_too_many_subentries")
  ) {
    message = "Max number of subentries (1000) already reached";
  }
  return message;
}

export function shortStellarAddress(
  longAddress: string,
  charsToShow = 4,
): string {
  return (
    longAddress.slice(0, charsToShow) + "..." + longAddress.slice(-charsToShow)
  );
}

export function copyToClipboard(text: string, silence = false) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch(() => {
      if (!silence) {
        toast.error("Failed to copy to clipboard");
      }
    });
}

export function generateQrCode(data: string): string {
  const size = "100x100";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
}

// Open or create the IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("crypto-store", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("keys");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store the CryptoKey in IndexedDB
export async function storeKey(keyId: string, key: CryptoKey): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");
  store.put(key, keyId);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getKey(keyId: string): Promise<CryptoKey> {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readonly");
  const store = transaction.objectStore("keys");
  const request = store.get(keyId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as CryptoKey);
    request.onerror = () => reject(request.error);
  });
}
