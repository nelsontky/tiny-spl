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

import { getAssetCollectionId } from "../../swr-hooks/utils/getAssetCollectionId";
import { TREE_ADDRESS_3 } from "../constants/treeAddresses";

export const buildSplitTinySplTx = async ({
  asset,
  connection,
  tinySplProgram,
  sourceAmount,
  destinationAmounts,
  signer,
}: {
  asset: ReadApiAsset;
  tinySplProgram: Program<TinySpl>;
  connection: WrapperConnection;
  sourceAmount: string;
  destinationAmounts: string[];
  signer: PublicKey;
}) => {
  const collectionId = getAssetCollectionId(asset);

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
  const assetProof = await connection.getAssetProof(new PublicKey(asset.id));

  const [sourceTreeAuthority] = PublicKey.findProgramAddressSync(
    [new PublicKey(asset.compression.tree).toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );
  const [destinationTreeAuthority] = PublicKey.findProgramAddressSync(
    [TREE_ADDRESS_3.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    connection,
    new PublicKey(assetProof.tree_id)
  );
  const canopyDepth = treeAccount.getCanopyDepth();
  const proofPath: AccountMeta[] = assetProof.proof
    .map((node: string) => ({
      pubkey: new PublicKey(node),
      isSigner: false,
      isWritable: false,
    }))
    .slice(0, assetProof.proof.length - (canopyDepth ? canopyDepth : 0));

  const ix = await tinySplProgram.methods
    .split(
      new BN(sourceAmount),
      new PublicKey(asset.id),
      [...new PublicKey(assetProof.root.trim()).toBytes()],
      new BN(asset.compression.leaf_id),
      asset.compression.leaf_id,
      destinationAmounts.map((amount) => new BN(amount))
    )
    .accounts({
      leafOwner: signer,
      leafDelegate: signer,
      compressionProgram: COMPRESSION_PROGRAM_ID,
      collectionMint: collectionId,
      tinySplAuthority,
      sourceMerkleTree: assetProof.tree_id,
      destinationMerkleTree: TREE_ADDRESS_3,
      systemProgram: SystemProgram.programId,
      authority: signer,
      bubblegumSigner: BUBBLEGUM_SIGNER,
      collectionMetadata,
      editionAccount,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      newLeafOwner: signer,
      tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      sourceTreeAuthority,
      destinationTreeAuthority,
      treeCreatorOrDelegate: tinySplAuthority,
    })
    .remainingAccounts(proofPath)
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
