import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { CONNECTION } from "./constants";

export const sendAndConfirmIxs = async (
  ixs: TransactionInstruction[],
  payerKey: PublicKey,
  signers: Keypair[],
  skipPreflight = false
) => {
  const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 40_000,
  });

  try {
    const { blockhash, lastValidBlockHeight } =
      await CONNECTION.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey,
      recentBlockhash: blockhash,
      instructions: [setComputeUnitPriceIx, ...ixs],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);

    transaction.sign(signers);
    const txid = await CONNECTION.sendTransaction(transaction, {
      skipPreflight,
    });
    console.log(`https://solscan.io/tx/${txid}`);
    const result = await CONNECTION.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature: txid,
    });

    return result;
  } catch (e) {
    return { value: { err: e } };
  }
};
