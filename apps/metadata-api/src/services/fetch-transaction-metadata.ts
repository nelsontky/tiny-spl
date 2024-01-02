import * as bs58 from "bs58";
import type { Response } from "express";
import type { Request } from "firebase-functions/v2/https";
import { getConnection } from "../constants/connection";

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
    const connection = getConnection();
    const transaction = await connection.getTransaction(txId, {
      maxSupportedTransactionVersion: 0,
    });

    const logs = transaction?.meta?.innerInstructions?.[0]?.instructions?.map(
      (ix) => bs58.decode(ix.data)
    );

    if (!logs) {
      response.status(400).send({
        status: 400,
        message: `No metadata logs found for txId: ${txId}`,
      });
      return;
    }

    const uint8Array = Uint8Array.from(
      logs.reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, Array<number>())
    );
    const buffer = Buffer.from(uint8Array);

    const contentType =
      typeof request.query.contentType === "string"
        ? request.query.contentType
        : "application/json";
    response.setHeader("Content-Type", contentType);

    response.send(buffer);
  } catch {
    response.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
