import { Connection } from "@solana/web3.js";
import * as bs58 from "bs58";
import type { Response } from "express";
import type { Request } from "firebase-functions/v2/https";

export const fetchTransactionMetadata = async (
  request: Request,
  response: Response<any>
) => {
  const txId = request.query.id;
  if (typeof txId !== "string") {
    response.status(404).send({ status: 404, message: "Not Found" });
    return;
  }

  try {
    const connection = new Connection(process.env.RPC_URL!, "confirmed");
    const transaction = await connection.getTransaction(txId, {
      maxSupportedTransactionVersion: 0,
    });

    const logs = transaction?.meta?.innerInstructions?.[0]?.instructions?.map(
      (ix) => new TextDecoder().decode(bs58.decode(ix.data))
    );

    if (!logs) {
      response.status(400).send({
        status: 400,
        message: `No metadata logs found for txId: ${txId}`,
      });
      return;
    }

    response.send(JSON.parse(logs.join("")));
  } catch {
    response.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
