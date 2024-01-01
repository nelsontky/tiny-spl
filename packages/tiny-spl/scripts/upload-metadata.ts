import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  CONNECTION,
  METADATA_BUFFER_START,
  PROGRAM,
  SIGNER,
} from "./constants";
import { chunk } from "lodash";
import generateMetaData from "./generate-metadata";

const PART_LENGTH = 920;
const TRANSACTION_CHUNK_SIZE = 3;

const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 50_000,
});

const metadata = generateMetaData();

(async () => {
  let metadataAccount: PublicKey;
  try {
    const metadataSize = Buffer.from(metadata).length;
    console.log("size:", metadataSize);
    metadataAccount = (await createMetadataAccount(metadataSize)).publicKey;

    await initializeMetadataAccount(metadataSize, metadataAccount);

    await uploadMetadata(metadata, metadataAccount);
    const txId = await logMetadata(metadataAccount);
    console.log(`Metadata txId: https://solscan.io/tx/${txId}`);
  } catch (e) {
    console.error(e);
  } finally {
    await closeMetadataAccount(metadataAccount);
  }

  // await closeMetadataAccount(metadataAccount)
})();

async function createMetadataAccount(metadataSize: number) {
  const metadataAccount = Keypair.generate();

  console.log(`Creating metadata account: ${metadataAccount.publicKey}`);

  const space = METADATA_BUFFER_START + metadataSize;

  const ix = SystemProgram.createAccount({
    fromPubkey: SIGNER.publicKey,
    newAccountPubkey: metadataAccount.publicKey,
    space,
    lamports: await CONNECTION.getMinimumBalanceForRentExemption(space),
    programId: PROGRAM.programId,
  });

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [computeBudgetIx, ix],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([SIGNER, metadataAccount]);

  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: false,
  });
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });

  return metadataAccount;
}

export default async function initializeMetadataAccount(
  metadataSize: number,
  metadataAccount: PublicKey
) {
  console.log("Initializing metadata account...");

  const ix = await PROGRAM.methods
    .initMetadataAccount(metadataSize)
    .accounts({
      authority: SIGNER.publicKey,
      metadata: metadataAccount,
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
  transaction.sign([SIGNER]);

  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: false,
  });
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });
}

async function uploadMetadata(metadata: string, metadataAccount: PublicKey) {
  console.log("Uploading metadata...");

  const metadataBuffer = Buffer.from(metadata);
  const transactionsCount = Math.ceil(metadataBuffer.length / PART_LENGTH);
  const metadataBufferParts = Array.from(
    { length: transactionsCount },
    (_, i) => metadataBuffer.subarray(i * PART_LENGTH, (i + 1) * PART_LENGTH)
  );

  const chunks = chunk(metadataBufferParts, TRANSACTION_CHUNK_SIZE);

  // I know this is not the best way to do it, but it works decently
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    await Promise.all(
      chunk.map(async (part, j) => {
        const index = (i * TRANSACTION_CHUNK_SIZE + j) * PART_LENGTH;
        const ix = await PROGRAM.methods
          .uploadLoggingMetadata(index, part)
          .accounts({
            authority: SIGNER.publicKey,
            metadata: metadataAccount,
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
        transaction.sign([SIGNER]);

        const txid = await CONNECTION.sendTransaction(transaction, {
          skipPreflight: true,
        });
        await CONNECTION.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: txid,
        });
      })
    );

    console.log(
      `Sent ${Math.min(
        (i + 1) * TRANSACTION_CHUNK_SIZE,
        transactionsCount
      )}/${transactionsCount} transactions`
    );
  }
}

async function logMetadata(metadataAccount: PublicKey) {
  console.log("Logging metadata...");

  const ix = await PROGRAM.methods
    .logMetadata()
    .accounts({
      metadata: metadataAccount,
      authority: SIGNER.publicKey,
      noopProgram: new PublicKey("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
    })
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 14_000_000,
      }),
      ix,
    ],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([SIGNER]);

  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: true,
  });
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });

  return txid;
}

async function closeMetadataAccount(metadataAccount: PublicKey) {
  console.log("Closing metadata account...");

  const ix = await PROGRAM.methods
    .closeMetadataAccount()
    .accounts({
      metadata: metadataAccount,
      authority: SIGNER.publicKey,
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
  transaction.sign([SIGNER]);

  const txid = await CONNECTION.sendTransaction(transaction, {
    skipPreflight: false,
  });
  await CONNECTION.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txid,
  });
}
