import {
  TINY_SPL_AUTHORITY_SEED,
  CONNECTION,
  PROGRAM,
  RECEIVER_ID,
  SIGNER,
  TOKEN_MINT_KEY,
  TREE_ID,
  TREE_CREATOR,
} from "./constants";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  PROGRAM_ID as COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { BN } from "bn.js";

async function mintTo() {
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

  const ix = await PROGRAM.methods
    .mintTo(new BN(69))
    .accounts({
      bubblegumSigner,
      collectionMetadata: metadata,
      collectionMint: mint,
      tinySplAuthority,
      compressionProgram: COMPRESSION_PROGRAM_ID,
      editionAccount: masterEdition,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      merkleTree: TREE_ID,
      mintAuthority: SIGNER.publicKey,
      mplBubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      tokenMetadataProgram: mplTokenMetadataProgramId,
      treeAuthority,
      newLeafOwner: RECEIVER_ID,
      treeCreatorOrDelegate: TREE_CREATOR.publicKey,
    })
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  transaction.sign([SIGNER, TREE_CREATOR]);

  console.log("Sending transaction...");
  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: true,
  });
  console.log("Transaction sent:", txid);
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });

  console.log(`https://solscan.io/tx/${txid}`);
}

mintTo();
