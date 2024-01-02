import { Connection } from "@solana/web3.js";

export const getConnection = () => new Connection(process.env.RPC_URL!, "confirmed");
