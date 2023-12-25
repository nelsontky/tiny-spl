import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import useSWRImmutable from "swr/immutable";
import { idl, PROGRAM_ID, TinySpl } from "@tiny-spl/contracts";
import { Keypair } from "@solana/web3.js";

const READONLY_WALLET = {
  publicKey: Keypair.generate().publicKey,
  signAllTransactions: () => {
    throw new Error("read-only wallet");
  },
  signTransaction: () => {
    throw new Error("read-only wallet");
  },
};

export const useTinySplProgram = () => {
  const { connection } = useConnection();

  // cache the program instance
  const { data } = useSWRImmutable(
    ["tinySplProgram", connection],
    ([_, connection]) =>
      new Program(
        idl as any,
        PROGRAM_ID,
        new AnchorProvider(connection, READONLY_WALLET, {
          commitment: connection.commitment,
        })
      ) as Program<TinySpl>
  );

  return data as Program<TinySpl>;
};
