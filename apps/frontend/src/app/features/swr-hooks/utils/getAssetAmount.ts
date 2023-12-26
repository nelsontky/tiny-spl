import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

export const getAssetAmount = (asset: ReadApiAsset): string => {
  const amount =
    asset.content.metadata?.attributes?.find(
      (attribute) => attribute.trait_type === "Amount"
    )?.value ?? "0";

  return amount.replaceAll(",", "");
};
