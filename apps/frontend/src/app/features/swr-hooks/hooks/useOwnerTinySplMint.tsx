import Decimal from "decimal.js";
import { useEffect, useMemo, useRef } from "react";
import useSWRImmutable from "swr/immutable";

import { TinySplRow } from "../types/TinySplRow";
import { getAssetAmount } from "../utils/getAssetAmount";
import { useTinySplsByOwner } from "./useTinySplsByOwner";

export const useOwnerTinySplMint = (
  walletAddress: string | undefined,
  mint: string | null
) => {
  const { data: tinySplRows, ...rest } = useTinySplsByOwner(walletAddress);

  const { data } = useSWRImmutable(
    !mint || !tinySplRows ? null : ["mintAssets", mint, tinySplRows],
    ([_, mint, tinySplRows]) => {
      const collection = tinySplRows.find(
        (tinySplRow) => tinySplRow.collectionId === mint
      );

      if (!collection) {
        return undefined;
      }

      collection.assets.sort((a, b) => {
        const amountA = getAssetAmount(a);
        const amountB = getAssetAmount(b);

        return new Decimal(amountB).cmp(amountA);
      });

      return collection;
    }
  );

  const mostRecentData = useRef<TinySplRow | undefined>();
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
    return Object.assign(rest, { data: newData });
  }, [data, rest]);

  return result;
};
