import * as anchor from "@coral-xyz/anchor";
import { AccountMeta, ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import {
  CONNECTION,
  PROGRAM,
  SIGNER,
  TINY_SPL_AUTHORITY_SEED,
  TOKEN_MINT_KEY,
  TREE_CREATOR,
  TREE_ID,
  WRONG_AUTHORITY,
} from "../scripts/constants";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  MetadataArgs,
  Creator,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as COMPRESSION_PROGRAM_ID,
  ConcurrentMerkleTreeAccount,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { assert, expect } from "chai";
import { sendAndConfirmIxs } from "../scripts/sendAndConfirmIxs";
import { BN } from "bn.js";

const mplTokenMetadataProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const [treeAuthority] = PublicKey.findProgramAddressSync(
  [TREE_ID.toBuffer()],
  BUBBLEGUM_PROGRAM_ID
);
const mint = TOKEN_MINT_KEY.publicKey;
const [metadata] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    mplTokenMetadataProgramId.toBuffer(),
    mint.toBuffer(),
  ],
  mplTokenMetadataProgramId
);
const [masterEdition] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    mplTokenMetadataProgramId.toBuffer(),
    mint.toBuffer(),
    Buffer.from("edition"),
  ],
  mplTokenMetadataProgramId
);
const [bubblegumSigner] = PublicKey.findProgramAddressSync(
  [Buffer.from("collection_cpi")],
  BUBBLEGUM_PROGRAM_ID
);
const [tinySplAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from(TINY_SPL_AUTHORITY_SEED), mint.toBuffer()],
  PROGRAM.programId
);

const TOKENS_TO_MINT = 3;

describe("tiny-spl", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("should fail when invalid mint authority tries to mint", async () => {
    const ix = await PROGRAM.methods
      .mintTo(new anchor.BN(Number.MAX_SAFE_INTEGER))
      .accounts({
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        tinySplAuthority,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        newLeafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mintAuthority: WRONG_AUTHORITY.publicKey,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .instruction();

    const result = await sendAndConfirmIxs(
      [ix],
      WRONG_AUTHORITY.publicKey,
      [WRONG_AUTHORITY, TREE_CREATOR],
      true
    );

    const errorCode = (result.value?.err as any).InstructionError[1].Custom;
    expect(errorCode).to.equal(2003);
  });

  it("should allow mint authority to mint tokens", async () => {
    const MINT_COUNT = new anchor.BN(TOKENS_TO_MINT);

    const prevSupply = (
      await PROGRAM.account.tinySplAuthority.fetch(
        tinySplAuthority,
        "confirmed"
      )
    ).currentSupply;

    const ix = await PROGRAM.methods
      .mintTo(MINT_COUNT, new anchor.BN(21_000_000))
      .accounts({
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        tinySplAuthority,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        newLeafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mintAuthority: SIGNER.publicKey,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .instruction();

    await sendAndConfirmIxs([ix], SIGNER.publicKey, [SIGNER, TREE_CREATOR]);

    const currentSupply = (
      await PROGRAM.account.tinySplAuthority.fetch(
        tinySplAuthority,
        "confirmed"
      )
    ).currentSupply;

    assert(currentSupply.eq(prevSupply.add(MINT_COUNT)));
  });

  it("should not allow owner to split token to invalid amounts", async () => {
    const assets = await CONNECTION.getAssetsByOwner({
      ownerAddress: SIGNER.publicKey.toBase58(),
      limit: 1,
      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    });

    const newestAsset = assets.items[0];
    const assetProof = await CONNECTION.getAssetProof(
      new PublicKey(newestAsset.id)
    );

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      CONNECTION,
      TREE_ID
    );
    const canopyDepth = treeAccount.getCanopyDepth();

    // parse the list of proof addresses into a valid AccountMeta[]
    const proofPath: AccountMeta[] = assetProof.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const ixWithTooManySplits = await PROGRAM.methods
      .split(
        new anchor.BN(TOKENS_TO_MINT),
        new PublicKey(newestAsset.id),
        [...new PublicKey(assetProof.root.trim()).toBytes()],
        new anchor.BN(newestAsset.compression.leaf_id),
        newestAsset.compression.leaf_id,
        [new anchor.BN(2), new anchor.BN(2)] // invalid split amounts
      )
      .accounts({
        leafOwner: SIGNER.publicKey,
        leafDelegate: SIGNER.publicKey,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        collectionMint: mint,
        tinySplAuthority,
        merkleTree: TREE_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        authority: SIGNER.publicKey,
        bubblegumSigner,
        collectionMetadata: metadata,
        editionAccount: masterEdition,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        newLeafOwner: SIGNER.publicKey,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .remainingAccounts(proofPath)
      .instruction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    const result1 = await sendAndConfirmIxs(
      [modifyComputeUnits, ixWithTooManySplits],
      SIGNER.publicKey,
      [SIGNER, TREE_CREATOR],
      true
    );

    const ixWithZero = await PROGRAM.methods
      .split(
        new anchor.BN(TOKENS_TO_MINT),
        new PublicKey(newestAsset.id),
        [...new PublicKey(assetProof.root.trim()).toBytes()],
        new anchor.BN(newestAsset.compression.leaf_id),
        newestAsset.compression.leaf_id,
        [new anchor.BN(0), new anchor.BN(3)] // invalid split amounts
      )
      .accounts({
        leafOwner: SIGNER.publicKey,
        leafDelegate: SIGNER.publicKey,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        collectionMint: mint,
        tinySplAuthority,
        merkleTree: TREE_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        authority: SIGNER.publicKey,
        bubblegumSigner,
        collectionMetadata: metadata,
        editionAccount: masterEdition,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        newLeafOwner: SIGNER.publicKey,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .remainingAccounts(proofPath)
      .instruction();

    const result2 = await sendAndConfirmIxs(
      [modifyComputeUnits, ixWithZero],
      SIGNER.publicKey,
      [SIGNER, TREE_CREATOR],
      true
    );

    const errorCode1 = (result1.value?.err as any).InstructionError[1].Custom;
    const errorCode2 = (result2.value?.err as any).InstructionError[1].Custom;
    expect(errorCode1).to.equal(6006);
    expect(errorCode2).to.equal(6006);
  });

  it("should allow token owner to split token", async () => {
    const assets = await CONNECTION.getAssetsByOwner({
      ownerAddress: SIGNER.publicKey.toBase58(),
      limit: 1,
      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    });

    const newestAsset = assets.items[0];
    const assetProof = await CONNECTION.getAssetProof(
      new PublicKey(newestAsset.id)
    );

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      CONNECTION,
      TREE_ID
    );
    const canopyDepth = treeAccount.getCanopyDepth();

    // parse the list of proof addresses into a valid AccountMeta[]
    const proofPath: AccountMeta[] = assetProof.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const ix = await PROGRAM.methods
      .split(
        new anchor.BN(TOKENS_TO_MINT),
        new PublicKey(newestAsset.id),
        [...new PublicKey(assetProof.root.trim()).toBytes()],
        new anchor.BN(newestAsset.compression.leaf_id),
        newestAsset.compression.leaf_id,
        [new anchor.BN(1), new anchor.BN(2)]
      )
      .accounts({
        leafOwner: SIGNER.publicKey,
        leafDelegate: SIGNER.publicKey,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        collectionMint: mint,
        tinySplAuthority,
        merkleTree: TREE_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        authority: SIGNER.publicKey,
        bubblegumSigner,
        collectionMetadata: metadata,
        editionAccount: masterEdition,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        newLeafOwner: SIGNER.publicKey,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .remainingAccounts(proofPath)
      .instruction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    const result = await sendAndConfirmIxs(
      [modifyComputeUnits, ix],
      SIGNER.publicKey,
      [SIGNER, TREE_CREATOR],
      true
    );

    expect(result.value.err).to.be.null;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultAssets = await CONNECTION.getAssetsByOwner({
      ownerAddress: SIGNER.publicKey.toBase58(),
      limit: 2,
      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    });

    const resultAssetsQuantity = resultAssets.items.map((asset) =>
      new URL(asset.content.json_uri).searchParams.get("amount")
    );
    const totalNewAssetsAmount = resultAssetsQuantity.reduce(
      (acc, curr) => (curr ? acc + parseInt(curr) : acc),
      0
    );
    expect(totalNewAssetsAmount).to.equal(TOKENS_TO_MINT);
  });

  it("should not allow token owner to combine the same token", async () => {
    // upload metadata for the new token
    const assets = await CONNECTION.getAssetsByOwner({
      ownerAddress: SIGNER.publicKey.toBase58(),
      limit: 1,
      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    });

    const newestAsset = assets.items[0];
    const assetProof = await CONNECTION.getAssetProof(
      new PublicKey(newestAsset.id)
    );

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      CONNECTION,
      TREE_ID
    );
    const canopyDepth = treeAccount.getCanopyDepth();

    // parse the list of proof addresses into a valid AccountMeta[]
    const proofPath: AccountMeta[] = assetProof.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const amount = new URL(newestAsset.content.json_uri).searchParams.get(
      "amount"
    );
    const combineIx = await PROGRAM.methods
      .combine(
        [new BN(amount), new BN(amount)],
        [new PublicKey(newestAsset.id), new PublicKey(newestAsset.id)],
        [
          [...new PublicKey(assetProof.root.trim()).toBytes()],
          [...new PublicKey(assetProof.root.trim()).toBytes()],
        ],
        [
          new anchor.BN(newestAsset.compression.leaf_id),
          new anchor.BN(newestAsset.compression.leaf_id),
        ],
        [newestAsset.compression.leaf_id, newestAsset.compression.leaf_id],
        [proofPath.length, proofPath.length + proofPath.length]
      )
      .accounts({
        authority: SIGNER.publicKey,
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        leafDelegate: SIGNER.publicKey,
        leafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        newLeafOwner: SIGNER.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tinySplAuthority,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .remainingAccounts([...proofPath, ...proofPath])
      .instruction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    const result = await sendAndConfirmIxs(
      [modifyComputeUnits, combineIx],
      SIGNER.publicKey,
      [SIGNER, TREE_CREATOR],
      true
    );

    const errorCode = (result.value?.err as any).InstructionError[1].Custom;
    expect(errorCode).to.equal(6007);
  });

  it("should allow token owner to combine tokens", async () => {
    // upload metadata for the new token
    const assets = await CONNECTION.getAssetsByOwner({
      ownerAddress: SIGNER.publicKey.toBase58(),
      limit: 2,
      sortBy: {
        sortBy: "created",
        sortDirection: "desc",
      },
    });

    const [assetA, assetB] = assets.items;
    const assetProofA = await CONNECTION.getAssetProof(
      new PublicKey(assetA.id)
    );
    const assetProofB = await CONNECTION.getAssetProof(
      new PublicKey(assetB.id)
    );

    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      CONNECTION,
      TREE_ID
    );
    const canopyDepth = treeAccount.getCanopyDepth();

    // parse the list of proof addresses into a valid AccountMeta[]
    const proofPathA: AccountMeta[] = assetProofA.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProofA.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const proofPathB: AccountMeta[] = assetProofB.proof
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false,
      }))
      .slice(0, assetProofB.proof.length - (!!canopyDepth ? canopyDepth : 0));

    const amountA = new URL(assetA.content.json_uri).searchParams.get("amount");
    const amountB = new URL(assetB.content.json_uri).searchParams.get("amount");
    const combineIx = await PROGRAM.methods
      .combine(
        [new BN(amountA), new BN(amountB)],
        [new PublicKey(assetA.id), new PublicKey(assetB.id)],
        [
          [...new PublicKey(assetProofA.root.trim()).toBytes()],
          [...new PublicKey(assetProofB.root.trim()).toBytes()],
        ],
        [
          new anchor.BN(assetA.compression.leaf_id),
          new anchor.BN(assetB.compression.leaf_id),
        ],
        [assetA.compression.leaf_id, assetB.compression.leaf_id],
        [proofPathA.length, proofPathA.length + proofPathB.length]
      )
      .accounts({
        authority: SIGNER.publicKey,
        bubblegumSigner,
        collectionMetadata: metadata,
        collectionMint: mint,
        compressionProgram: COMPRESSION_PROGRAM_ID,
        editionAccount: masterEdition,
        leafDelegate: SIGNER.publicKey,
        leafOwner: SIGNER.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        merkleTree: TREE_ID,
        mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        newLeafOwner: SIGNER.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tinySplAuthority,
        tokenMetadataProgram: mplTokenMetadataProgramId,
        treeAuthority,
        treeCreatorOrDelegate: TREE_CREATOR.publicKey,
      })
      .remainingAccounts([...proofPathA, ...proofPathB])
      .instruction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    const result = await sendAndConfirmIxs(
      [modifyComputeUnits, combineIx],
      SIGNER.publicKey,
      [SIGNER, TREE_CREATOR],
      true
    );

    expect(result.value.err).to.be.null;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newestAsset = (
      await CONNECTION.getAssetsByOwner({
        ownerAddress: SIGNER.publicKey.toBase58(),
        limit: 1,
        sortBy: {
          sortBy: "created",
          sortDirection: "desc",
        },
      })
    ).items[0];
    const amount = new URL(newestAsset.content.json_uri).searchParams.get(
      "amount"
    );

    expect(parseInt(amount)).to.equal(parseInt(amountA) + parseInt(amountB));
  });
});
