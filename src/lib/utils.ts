import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Asset, type AssetType, BASE_FEE } from "@stellar/stellar-sdk";
import { BalanceLineAsset } from "~/a";

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

export function computeTransactionFees(
  assets: Set<Asset>,
  accountBalances: BalanceLineAsset<AssetType.credit12>[],
): string {
  let numOperations = 1; // The first operation is the service Fee to Issuer
  for (const asset of assets) {
    numOperations++;
    const assetCode = asset.getCode();
    const assetIssuer = asset.getIssuer();
    if (
      !accountBalances.some(
        (balance) =>
          balance.asset_code === assetCode &&
          balance.asset_issuer === assetIssuer,
      )
    ) {
      numOperations++;
    }
  }
  return (fromStroopsToXLM(Number(BASE_FEE)) * numOperations).toFixed(5);
}
