import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const buildTxsFromIxs = async ({
  connection,
  ixs,
  payer,
}: {
  ixs: TransactionInstruction[];
  connection: Connection;
  payer: PublicKey;
}) => {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  return { transaction, blockhash, lastValidBlockHeight };
};
