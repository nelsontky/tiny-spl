import Decimal from "decimal.js";
import useSWRImmutable from "swr/immutable";

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

      console.log(collection);

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

  return Object.assign(rest, { data });
};
