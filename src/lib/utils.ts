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

// Convert string to ArrayBuffer
export function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Convert Uint8Array to number[]
function uint8ArrayToNumberArray(uint8Array: Uint8Array): number[] {
  return Array.from(uint8Array);
}

// Convert ArrayBuffer back to string
function ab2str(buf: ArrayBuffer): string {
  return String.fromCharCode.apply(
    null,
    uint8ArrayToNumberArray(new Uint8Array(buf)),
  );
}

// AES encryption using WebCrypto API
async function encryptWithPasskey(
  passkey: number[],
  data: string,
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(passkey), // Convert back to Uint8Array
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    derivedKey,
    encoder.encode(data),
  );

  return { encryptedData, iv };
}

// AES decryption using WebCrypto API
async function decryptWithPasskey(
  passkey: number[],
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(passkey), // Convert back to Uint8Array
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    derivedKey,
    encryptedData,
  );

  return new TextDecoder().decode(decryptedData);
}

async function encryptStellarSecretKey(secretKey: string): Promise<void> {
  // Request passkey authentication (WebAuthn)
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: new Uint8Array(32), // Random challenge
      allowCredentials: [], // Empty array for first-time registration
      userVerification: "preferred",
    },
  })) as PublicKeyCredential;

  const passkey = new Uint8Array(credential.response.clientDataJSON); // Passkey based on WebAuthn response

  // Store the credential ID for future use
  const credentialId = credential.rawId;
  localStorage.setItem("credentialId", ab2str(credentialId));

  // Encrypt the Stellar secret key using the passkey
  const passkeyAsNumberArray = uint8ArrayToNumberArray(passkey);
  const { encryptedData, iv } = await encryptWithPasskey(
    passkeyAsNumberArray,
    secretKey,
  );

  // Store encrypted key and IV in local storage
  localStorage.setItem("encryptedStellarSecretKey", ab2str(encryptedData));
  localStorage.setItem("encryptionIv", ab2str(iv));
  setEncrypted(true);
}

async function decryptStellarSecretKey(): Promise<string> {
  // Retrieve encrypted secret key and IV from storage
  const encryptedData = str2ab(
    localStorage.getItem("encryptedStellarSecretKey") || "",
  );
  const iv = new Uint8Array(str2ab(localStorage.getItem("encryptionIv") || ""));

  // Request passkey authentication to decrypt
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: new Uint8Array(32), // Uint8Array is fine here
      allowCredentials: [{ type: "public-key" }],
      userVerification: "preferred",
    },
  })) as PublicKeyCredential;

  // Convert Uint8Array to number[] where necessary
  const passkey = new Uint8Array(credential.response.clientDataJSON);
  const passkeyAsNumberArray = uint8ArrayToNumberArray(passkey);

  // Decrypt the secret key using the passkey
  const secretKey = await decryptWithPasskey(
    passkeyAsNumberArray,
    encryptedData,
    iv,
  );

  return secretKey;
}
