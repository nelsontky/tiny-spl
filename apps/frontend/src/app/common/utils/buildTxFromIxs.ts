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
  lookupTableAddress,
}: {
  ixs: TransactionInstruction[];
  connection: Connection;
  payer: PublicKey;
  lookupTableAddress?: PublicKey;
}) => {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const lookupTableAccount = !lookupTableAddress
    ? undefined
    : (await connection.getAddressLookupTable(lookupTableAddress)).value;

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToV0Message(lookupTableAccount ? [lookupTableAccount] : undefined);
  const transaction = new VersionedTransaction(messageV0);

  return { transaction, blockhash, lastValidBlockHeight };
};
