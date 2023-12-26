import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

export interface TinySplRow {
  collectionId: string;
  collectionName: string | undefined;
  description: string | undefined;
  symbol: string | undefined;
  logo: string | undefined;
  amount: string;
  assets: ReadApiAsset[];
}
