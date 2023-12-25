import { useSWRWithAxiosProgress } from "@/app/common/hooks/useSWRWithAxiosProgress";
import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import {
  GetAssetsByOwnerRpcInput,
  ReadApiAsset,
} from "@/app/common/utils/WrapperConnection";
import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { filterTinySpls } from "../utils/filterTinySpls";
import { TinySplRow } from "../types/TinySplRow";
import Decimal from "decimal.js";

const useAssetsByOwner = (
  getAssetsByOwnerRpcInput: GetAssetsByOwnerRpcInput | undefined
) => {
  const wrapperConnection = useWrapperConnection();

  const swr = useSWRWithAxiosProgress(
    !getAssetsByOwnerRpcInput
      ? null
      : ["getAssetsByOwner", getAssetsByOwnerRpcInput],
    (onUploadProgress, onDownloadProgress) =>
      ([_, getAssetsByOwnerRpcInput]) =>
        wrapperConnection.getAssetsByOwner(getAssetsByOwnerRpcInput, {
          onDownloadProgress,
          onUploadProgress,
        })
  );

  return swr;
};

export const useTinySplsByOwner = (walletAddress: string | undefined) => {
  const getAssetsByOwnerRpcInput = useMemo(
    () =>
      !walletAddress
        ? undefined
        : {
            ownerAddress: walletAddress,
          },
    [walletAddress]
  );

  const {
    data: assetsByOwner,
    progress: assetsByOwnerProgress,
    mutate: mutateAssetsByOwner,
  } = useAssetsByOwner(getAssetsByOwnerRpcInput);

  const { connection } = useConnection();

  const { data, mutate: mutateTinySpls } = useSWR(
    !assetsByOwner ? null : ["getTinySplsByOwner", assetsByOwner],
    async ([_, assetsByOwner]) => {
      const tinySpls = await filterTinySpls(assetsByOwner.items, connection);

      const groupedByCollectionId: Record<string, ReadApiAsset[]> = {};
      for (const tinySpl of tinySpls) {
        const collectionId = tinySpl.grouping.find(
          (grouping) => grouping.group_key === "collection"
        )?.group_value;

        if (!collectionId) {
          continue;
        }

        if (!groupedByCollectionId[collectionId]) {
          groupedByCollectionId[collectionId] = [];
        }

        groupedByCollectionId[collectionId]?.push(tinySpl);
      }

      const tinySplRows: TinySplRow[] = Object.entries(
        groupedByCollectionId
      ).map(([collectionId, items]) => {
        const collectionName = items?.[0]?.content.metadata?.attributes?.find(
          (attribute) => attribute.trait_type === "Token name"
        )?.value;
        const symbol = items?.[0]?.content.metadata?.symbol;
        const logo = items?.[0]?.content?.links?.image;
        const amount = items.reduce((acc, item) => {
          const currentAmount = item.content.metadata?.attributes?.find(
            (attribute) => attribute.trait_type === "Amount"
          )?.value;

          if (!currentAmount) {
            return acc;
          }

          return acc.add(new Decimal(currentAmount));
        }, new Decimal(0));

        return {
          collectionId,
          collectionName,
          symbol,
          logo,
          amount: amount.toFixed(),
        };
      });

      return tinySplRows;
    }
  );

  const mutate = useCallback(async () => {
    await mutateAssetsByOwner();
    await mutateTinySpls();
  }, [mutateAssetsByOwner, mutateTinySpls]);

  const progress = !data ? assetsByOwnerProgress * 0.75 : 100;

  return {
    data,
    progress,
    mutate,
  };
};
