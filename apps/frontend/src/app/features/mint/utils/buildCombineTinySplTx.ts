import { BN, Program } from "@coral-xyz/anchor";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  ConcurrentMerkleTreeAccount,
  PROGRAM_ID as COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  AccountMeta,
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { TINY_SPL_AUTHORITY_SEED, TinySpl } from "@tiny-spl/contracts";

import {
  BUBBLEGUM_SIGNER,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@/app/common/constants";
import { buildTxsFromIxs } from "@/app/common/utils/buildTxFromIxs";
import {
  ReadApiAsset,
  WrapperConnection,
} from "@/app/common/utils/WrapperConnection";

import { getAssetAmount } from "../../swr-hooks/utils/getAssetAmount";
import { getAssetCollectionId } from "../../swr-hooks/utils/getAssetCollectionId";

export const buildCombineTinySplTx = async ({
  assets,
  connection,
  tinySplProgram,
  signer,
}: {
  assets: ReadApiAsset[];
  tinySplProgram: Program<TinySpl>;
  connection: WrapperConnection;
  signer: PublicKey;
}) => {
  // we use this first asset to get collection and tree id
  // all assets in a single mint should be from the same collection and tree
  const firstAsset = assets[0];

  if (!firstAsset) {
    throw new Error("At least one asset is required");
  }

  const collectionId = getAssetCollectionId(firstAsset);
  if (!collectionId) {
    throw new Error(
      "Collection Id not found, this should not happen. NFT might not be a valid tiny spl"
    );
  }

  const [collectionMetadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(collectionId).toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  const [editionAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(collectionId).toBuffer(),
      Buffer.from("edition"),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  const [tinySplAuthority] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(TINY_SPL_AUTHORITY_SEED),
      new PublicKey(collectionId).toBuffer(),
    ],
    tinySplProgram.programId
  );

  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [new PublicKey(firstAsset.compression.tree).toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const assetProofs = await Promise.all(
    assets.map(
      async (asset) => await connection.getAssetProof(new PublicKey(asset.id))
    )
  );
  const firstAssetProof = assetProofs[0];

  if (!firstAssetProof) {
    throw new Error("Asset proof not found, this should not happen");
  }

  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    connection,
    new PublicKey(firstAssetProof.tree_id)
  );
  const canopyDepth = treeAccount.getCanopyDepth();

  const proofPaths: AccountMeta[][] = assetProofs.map((assetProof) =>
    assetProof.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (canopyDepth ? canopyDepth : 0))
  );
  const proofPathEndIndexesExcluded = proofPaths.reduce((acc, curr) => {
    const prevEndIndex = acc.at(-1) ?? 0;
    const nextEndIndex = prevEndIndex + curr.length;
    acc.push(nextEndIndex);

    return acc;
  }, new Array<number>());

  const ix = await tinySplProgram.methods
    .combine(
      assets.map((asset) => new BN(getAssetAmount(asset))),
      assets.map((asset) => new PublicKey(asset.id)),
      assetProofs.map((assetProof) => [
        ...new PublicKey(assetProof.root.trim()).toBytes(),
      ]),
      assets.map((asset) => new BN(asset.compression.leaf_id)),
      assets.map((asset) => asset.compression.leaf_id),
      proofPathEndIndexesExcluded
    )
    .accounts({
      leafOwner: signer,
      leafDelegate: signer,
      compressionProgram: COMPRESSION_PROGRAM_ID,
      collectionMint: collectionId,
      tinySplAuthority,
      merkleTree: firstAssetProof.tree_id,
      systemProgram: SystemProgram.programId,
      authority: signer,
      bubblegumSigner: BUBBLEGUM_SIGNER,
      collectionMetadata,
      editionAccount,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      newLeafOwner: signer,
      tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      treeAuthority,
      treeCreatorOrDelegate: tinySplAuthority,
    })
    .remainingAccounts(proofPaths.flat())
    .instruction();

  return buildTxsFromIxs({
    connection,
    ixs: [
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 50_000,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 14_000_000,
      }),
      ix,
    ],
    payer: signer,
  });
};
