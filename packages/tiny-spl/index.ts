import { PublicKey } from "@solana/web3.js";
import idl from "./target/idl/tiny_spl.json";
import { TinySpl } from "./target/types/tiny_spl";

const PROGRAM_ID = new PublicKey("tsP1jf31M3iGNPmANP3ep3iWCMTxpMFLNbewWVWWbSo");

const TINY_SPL_AUTHORITY_SEED = "tiny_spl";

export { idl, PROGRAM_ID, TinySpl, TINY_SPL_AUTHORITY_SEED };
