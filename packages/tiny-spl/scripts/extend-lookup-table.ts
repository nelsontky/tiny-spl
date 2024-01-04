import {
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { CONNECTION, SIGNER } from "./constants";
import { PublicKey } from "@metaplex-foundation/js";

(async () => {
  const slot = await CONNECTION.getSlot();

  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: SIGNER.publicKey,
    authority: SIGNER.publicKey,
    lookupTable: new PublicKey("Cg9fZtcBxxw8eobV4uvmQMYdkdxfex5zibR1QELnuoKp"),
    addresses: [
      // new PublicKey("4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK"),
      // new PublicKey("2GcCdocF2A2HdYMHPow6YJQxp4MbTjdSmS2eypAe4C6E"),
      // new PublicKey("DEEZyno8D9RCCghEWkTNarZrCW7HvvWE9z64tiqvQKpH"),
      // new PublicKey("tREeAmmEC1HmN8aPKnzPagu84sQAsXg8KGzX97EZP2n"),
      // new PublicKey("BeVAJYKxywLi79ka4BV2REvGFeBR8Mk45sJdfJgYtwk7"),
      // new PublicKey("HURxPdTRu9wBrb64hDMR9ZB3RqAgFQEQ2K6zjpbZZ7Lc"),
      // new PublicKey("Tree2dfRMEjvHKn8BfmQXmgcCcLiVtHqMKq5j9oKN5g"),
      // new PublicKey("3aVQP4jSj5ab4Br73bVL7d7c96bJGuHXuE4iaMXPzas3"),
      // new PublicKey("EzGv9FqDepT6winVNWGiLVrTKjPD5KgB2jTiHhmFR4X6"),
      // new PublicKey("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK")
      new PublicKey("tReeB6PqRnvzcKprWQhSjBzLRzG7zX6AAF2kQdy3Y3f"),
      new PublicKey("22kvmCjDhDZw7MzFUWsu5tNVfvh3t4ZZ73jauCaH6djt"),
    ],
  });

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [extendInstruction],
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
