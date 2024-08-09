import { type AssetType } from "@stellar/stellar-sdk";

export type BalanceLineAsset<T extends AssetType> = {
  asset_type: T;
  asset_code: string;
  asset_issuer: string;
};
