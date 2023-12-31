import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TINY_SPL_AUTHORITY_SEED } from "@tiny-spl/contracts";

import { ReadApiAsset } from "@/app/common/utils/WrapperConnection";

import { getAssetCollectionId } from "./getAssetCollectionId";

export const filterTinySpls = async (
  assets: ReadApiAsset[],
  connection: Connection
) => {
  const collectionIds = Array.from(
    new Set(
      assets
        .filter((asset) => !asset.burnt)
        .map(getAssetCollectionId)
        .filter(Boolean) as string[]
    )
  );

  const tinySplAuthorityAddresses = collectionIds.map((collectionId) => {
    const [tinySplAuthority] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(TINY_SPL_AUTHORITY_SEED),
        new PublicKey(collectionId).toBuffer(),
      ],
      PROGRAM_ID
    );
    return { tinySplAuthority, collectionId };
  });
  const accountInfos = await connection.getMultipleAccountsInfo(
    tinySplAuthorityAddresses.map(({ tinySplAuthority }) => tinySplAuthority)
  );

  const tinySpls: ReadApiAsset[] = [];
  for (let i = 0; i < accountInfos.length; i++) {
    const accountInfo = accountInfos[i];
    const collectionId = tinySplAuthorityAddresses[i]?.collectionId;
    if (accountInfo && collectionId) {
      const items = assets.filter((asset) => {
        const assetCollectionId = getAssetCollectionId(asset);
        return !asset.burnt && assetCollectionId === collectionId;
      });
      tinySpls.push(...items);
    }
  }

  return tinySpls;
};
