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

  const swr = useSWR(
    !getAssetsByOwnerRpcInput
      ? null
      : ["getAssetsByOwner", getAssetsByOwnerRpcInput],
    ([_, getAssetsByOwnerRpcInput]) =>
      wrapperConnection.getAssetsByOwner(getAssetsByOwnerRpcInput)
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

  const { data: assetsByOwner, mutate: mutateAssetsByOwner } = useAssetsByOwner(
    getAssetsByOwnerRpcInput
  );

  const { connection } = useConnection();

  const { mutate: mutateTinySpls, ...rest } = useSWR(
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

          return acc.add(new Decimal(currentAmount.replaceAll(",", "")));
        }, new Decimal(0));

        return {
          collectionId,
          collectionName,
          symbol,
          logo,
          amount: amount.toFixed(),
        };
      });

      tinySplRows.sort((a, b) =>
        new Decimal(b.amount).cmp(new Decimal(a.amount))
      );

      return tinySplRows;
    }
  );

  const mutate = useCallback(async () => {
    await mutateAssetsByOwner();
    await mutateTinySpls();
  }, [mutateAssetsByOwner, mutateTinySpls]);

  return Object.assign(rest, { mutate });
};
