import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey } from "@solana/web3.js";

const [BUBBLEGUM_SIGNER] = PublicKey.findProgramAddressSync(
  [Buffer.from("collection_cpi")],
  BUBBLEGUM_PROGRAM_ID
);

const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export { BUBBLEGUM_SIGNER, MPL_TOKEN_METADATA_PROGRAM_ID };
