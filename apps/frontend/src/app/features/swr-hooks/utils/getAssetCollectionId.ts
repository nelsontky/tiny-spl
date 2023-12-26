import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

export const getAssetCollectionId = (asset: ReadApiAsset) => {
  const collectionId = asset.grouping.find(
    (group) => group.group_key === "collection"
  )?.group_value;

  return collectionId;
}