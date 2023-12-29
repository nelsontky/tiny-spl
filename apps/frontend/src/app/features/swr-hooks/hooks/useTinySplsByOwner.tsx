import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import {
  GetAssetsByOwnerRpcInput,
  ReadApiAsset,
} from "@/app/common/utils/WrapperConnection";

import { TinySplRow } from "../types/TinySplRow";
import { filterTinySpls } from "../utils/filterTinySpls";
import { getAssetAmount } from "../utils/getAssetAmount";
import { getAssetCollectionId } from "../utils/getAssetCollectionId";

const PAGE_SIZE = 45;

const useTinySplListByOwner = (owner: string | undefined) => {
  const wrapperConnection = useWrapperConnection();

  const swr = useSWR(
    !owner ? null : ["getAssetsByOwner", owner],
    async ([_, owner]) => {
      let result: ReadApiAsset[] = [];
      let currentPage = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const assetsByOwnerRpcInput: GetAssetsByOwnerRpcInput = {
          ownerAddress: owner,
          limit: PAGE_SIZE,
          page: currentPage,
          displayOptions: {
            showCollectionMetadata: false,
          },
        };

        const assetsByOwner = await wrapperConnection.getAssetsByOwner(
          assetsByOwnerRpcInput
        );

        if (!assetsByOwner.items.length) {
          break;
        }

        const tinySpls = await filterTinySpls(
          assetsByOwner.items,
          wrapperConnection
        );

        result.push(...tinySpls);

        currentPage += 1;
      }

      return result;
    }
  );

  return swr;
};

export const useTinySplsByOwner = (walletAddress: string | undefined) => {
  const { data: tinySpls, mutate: mutateAssetsByOwner } =
    useTinySplListByOwner(walletAddress);

  const {
    mutate: mutateTinySpls,
    data,
    ...rest
  } = useSWRImmutable(
    !tinySpls ? null : ["getTinySplsByOwner", tinySpls],
    async ([_, tinySpls]) => {
      const groupedByCollectionId: Record<string, ReadApiAsset[]> = {};
      for (const tinySpl of tinySpls) {
        const collectionId = getAssetCollectionId(tinySpl);

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
        const description = items?.[0]?.content.metadata?.description;
        const amount = items.reduce((acc, item) => {
          const currentAmount = getAssetAmount(item);
          return acc.add(new Decimal(currentAmount));
        }, new Decimal(0));

        return {
          collectionId,
          collectionName,
          symbol,
          logo,
          description,
          amount: amount.toFixed(),
          assets: items,
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

  const mostRecentData = useRef<TinySplRow[] | undefined>();
  useEffect(
    function updateMostRecentData() {
      if (data) {
        mostRecentData.current = data;
      }
    },
    [data]
  );
  const result = useMemo(() => {
    const newData = data ?? mostRecentData.current;
    return Object.assign(rest, { data: newData, mutate });
  }, [data, mutate, rest]);

  return result;
};
