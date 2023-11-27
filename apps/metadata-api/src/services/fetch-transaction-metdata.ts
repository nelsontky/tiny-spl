import { Connection } from "@solana/web3.js";
import { Env } from "../types/env";
import bs58 from "bs58";
import { error } from "itty-router";

export const fetchTransactionMetadata = async (
	txId: string | undefined,
	env: Env,
) => {
	if (!txId) {
		return error(404);
	}

	try {
		const connection = new Connection(env.RPC_URL, "confirmed");
		const transaction = await connection.getTransaction(txId, {
			maxSupportedTransactionVersion: 0,
		});

		const logs = transaction?.meta?.innerInstructions?.[0]?.instructions?.map(
			(ix) => new TextDecoder().decode(bs58.decode(ix.data)),
		);

		if (!logs) {
			return error(400, `No metadata logs found for txId: ${txId}`);
		}

		return JSON.parse(logs.join(""));
	} catch {
		return error(500);
	}
};
