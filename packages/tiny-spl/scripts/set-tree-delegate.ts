import {
  createSetTreeDelegateInstruction,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  TINY_SPL_AUTHORITY_SEED,
  CONNECTION,
  PROGRAM,
  TOKEN_MINT_KEY,
  TREE_ID,
  TREE_CREATOR,
} from "./constants";

export async function setTreeDelegate() {
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [TREE_ID.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const mint = TOKEN_MINT_KEY.publicKey;
  const [tinySplAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from(TINY_SPL_AUTHORITY_SEED), mint.toBuffer()],
    PROGRAM.programId
  );

  const ix = createSetTreeDelegateInstruction({
    merkleTree: TREE_ID,
    newTreeDelegate: new PublicKey(
      "B8WiiEc4KBcfL7nTcSc7urC9DiyBVZ1W3wQaahwzGpST"
    ),
    treeAuthority: treeAuthority,
    treeCreator: TREE_CREATOR.publicKey,
  });
  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: TREE_CREATOR.publicKey,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  transaction.sign([TREE_CREATOR]);

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

setTreeDelegate();
