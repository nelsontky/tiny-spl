import {
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { CONNECTION, SIGNER } from "./constants";

(async () => {
  const slot = await CONNECTION.getSlot();

  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: SIGNER.publicKey,
      payer: SIGNER.publicKey,
      recentSlot: slot,
    });

  console.log("lookup table address:", lookupTableAddress.toBase58());

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [lookupTableInst],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  transaction.sign([SIGNER]);

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
})();
