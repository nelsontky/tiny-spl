import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import idl from "../target/idl/tiny_spl.json";
import { TinySpl } from "../target/types/tiny_spl";

import "dotenv/config";

export const SIGNER = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SIGNER!))
);

export const CONNECTION = new Connection(process.env.RPC_URL!, "confirmed");

export const PROGRAM = new Program(
  idl as any,
  "Csp1puACJBUVDZV5PZqdHnHHBbhQe76GiaxAGMZDQZ8L",
  new AnchorProvider(CONNECTION, new Wallet(SIGNER), {
    commitment: "confirmed",
  })
) as Program<TinySpl>;

export const TOKEN_MINT_KEY = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.TOKEN_MINT_KEY!))
);

export const TINY_SPL_AUTHORITY_SEED = "tiny_spl";

export const TREE_ID = new PublicKey(process.env.TREE_ADDRESS!);

export const RECEIVER_ID = new PublicKey(process.env.RECEIVER_ADDRESS!);

export const METADATA_BUFFER_START =
  8 + // discriminator
  32; // authority
