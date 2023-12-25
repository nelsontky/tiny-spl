import { useSWRWithAxiosProgress } from "@/app/common/hooks/useSWRWithAxiosProgress";
import { useWrapperConnection } from "@/app/common/hooks/useWrapperConnection";
import {
  GetAssetsByOwnerRpcInput,
  ReadApiAsset,
} from "@/app/common/utils/WrapperConnection";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TINY_SPL_AUTHORITY_SEED } from "@tiny-spl/contracts";
import { useCallback } from "react";
import useSWR from "swr";

const useAssetsByOwner = (
  getAssetsByOwnerRpcInput: GetAssetsByOwnerRpcInput
) => {
  const wrapperConnection = useWrapperConnection();

  const swr = useSWRWithAxiosProgress(
    "getAssetsByOwner",
    (onUploadProgress, onDownloadProgress) => () =>
      wrapperConnection.getAssetsByOwner(getAssetsByOwnerRpcInput, {
        onDownloadProgress,
        onUploadProgress,
      })
  );

  return swr;
};

export const useTinySplsByOwner = (
  getAssetsByOwnerRpcInput: GetAssetsByOwnerRpcInput
) => {
  const {
    data: assetsByOwner,
    progress: assetsByOwnerProgress,
    mutate: mutateAssetsByOwner,
  } = useAssetsByOwner(getAssetsByOwnerRpcInput);

  const { connection } = useConnection();

  const { data, mutate: mutateTinySpls } = useSWR(
    !assetsByOwner ? null : ["getTinySplsByOwner", assetsByOwner],
    async ([_, assetsByOwner]) => {
      const tinySplAuthorityAddresses = assetsByOwner.items.map((item) => {
        const itemId = item.id;
        const [tinySplAuthority] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(TINY_SPL_AUTHORITY_SEED),
            new PublicKey(itemId).toBuffer(),
          ],
          PROGRAM_ID
        );
        return { itemId, tinySplAuthority };
      });

      const accountInfos = await connection.getMultipleAccountsInfo(
        tinySplAuthorityAddresses.map(
          ({ tinySplAuthority }) => tinySplAuthority
        )
      );

      if (!accountInfos) {
        return [];
      }

      const tinySpls: ReadApiAsset[] = [];
      for (let i = 0; i < accountInfos.length; i++) {
        const accountInfo = accountInfos[i];
        if (accountInfo) {
          const item = assetsByOwner.items.find(
            (item) => item.id === tinySplAuthorityAddresses[i]?.itemId
          );
          if (item) {
            tinySpls.push(item);
          }
        }
      }

      return tinySpls;
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
