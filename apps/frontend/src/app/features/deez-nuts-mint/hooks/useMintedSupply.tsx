import { PublicKey } from "@solana/web3.js";
import useSWR from "swr";

import { useTinySplProgram } from "@/app/common/hooks/useTinySplProgram";

export const useMintedSupply = (collectionId: string) => {
  const program = useTinySplProgram();

  const swr = useSWR(["mintedSupply", collectionId], async () => {
    const [tinySplAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("tiny_spl"), new PublicKey(collectionId).toBuffer()],
      program.programId
    );

    const supply = (
      await program.account.tinySplAuthority.fetch(
        tinySplAuthority,
        "confirmed"
      )
    ).currentSupply;

    return supply;
  });

  return swr;
};
