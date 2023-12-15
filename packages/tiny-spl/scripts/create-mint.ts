import "dotenv/config";
import {
  TINY_SPL_AUTHORITY_SEED,
  CONNECTION,
  PROGRAM,
  SIGNER,
  TOKEN_MINT_KEY,
} from "./constants";
import collectionMetadata from "./assets/metadata.json";
import {
  ComputeBudgetProgram,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 50000,
});

async function createMint() {
  const mplTokenMetadataProgramId = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
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
  const [tinySplAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from(TINY_SPL_AUTHORITY_SEED), mint.toBuffer()],
    PROGRAM.programId
  );

  const ix = await PROGRAM.methods
    .createMint({
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      uri: process.env.MINT_METADATA_URI,
    })
    .accounts({
      tinySplAuthority,
      masterEdition,
      metadata,
      mint,
      mintAuthority: SIGNER.publicKey,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      splTokenProgram: TOKEN_PROGRAM_ID,
      mplTokenMetadataProgram: mplTokenMetadataProgramId,
    })
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [computeBudgetIx, ix],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  transaction.sign([SIGNER, TOKEN_MINT_KEY]);

  console.log("Sending transaction...");
  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: true,
  });
  console.log("Transaction sent.");
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });

  console.log(`https://solscan.io/tx/${txid}`);
}

createMint();
