import type { Response } from "express";
import type { Request } from "firebase-functions/v2/https";
import * as crypto from "crypto";
import { getProgram } from "../constants/program";
import { BN } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { getConnection } from "../constants/connection";

interface MintDeezNutsDTO {
  publicKey: string;
  hCaptchaVerificationToken: string;
}

export const mintDeezNuts = async (
  request: Request,
  response: Response<any>
) => {
  try {
    const body = request.body as MintDeezNutsDTO;
    if (!body.publicKey || !body.hCaptchaVerificationToken) {
      response.status(400).send({ status: 400, message: "Bad Request" });
      return;
    }

    const isHCaptchaTokenValid = await verifyHCaptchaToken(
      body.hCaptchaVerificationToken
    );
    if (!isHCaptchaTokenValid) {
      response
        .status(400)
        .send({ status: 400, message: "Captcha error. Please try again." });
      return;
    }

    const amount = crypto.randomInt(100, 1001);
    const serializedTransaction = await buildMintToTransaction(
      body.publicKey,
      amount
    );

    response.send({
      amount,
      transaction: serializedTransaction,
    });
  } catch {
    response
      .status(500)
      .send({ status: 500, message: "Internal Server Error" });
  }
};

async function verifyHCaptchaToken(token: string) {
  try {
    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      body: JSON.stringify({
        secret: process.env.HCAPTCHA_SECRET,
        response: token,
      }),
    });
    const json = await response.json();
    return json.success;
  } catch {
    return false;
  }
}

const DEEZ_NUTS_AUTHORITY = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.DEEZ_NUTS_AUTHORITY!))
);

async function buildMintToTransaction(publicKey: string, amount: number) {
  const program = getProgram();
  const ix = await program.methods
    .mintTo(new BN(amount))
    .accounts({
      bubblegumSigner: "4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK",
      collectionMetadata: "2GcCdocF2A2HdYMHPow6YJQxp4MbTjdSmS2eypAe4C6E",
      collectionMint: "DEEZyno8D9RCCghEWkTNarZrCW7HvvWE9z64tiqvQKpH",
      tinySplAuthority: "EzGv9FqDepT6winVNWGiLVrTKjPD5KgB2jTiHhmFR4X6",
      compressionProgram: "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
      editionAccount: "HURxPdTRu9wBrb64hDMR9ZB3RqAgFQEQ2K6zjpbZZ7Lc",
      logWrapper: "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
      merkleTree: "Tree2dfRMEjvHKn8BfmQXmgcCcLiVtHqMKq5j9oKN5g",
      mintAuthority: DEEZ_NUTS_AUTHORITY.publicKey,
      mplBubblegumProgram: "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
      tokenMetadataProgram: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      treeAuthority: "3aVQP4jSj5ab4Br73bVL7d7c96bJGuHXuE4iaMXPzas3",
      newLeafOwner: publicKey,
      treeCreatorOrDelegate: "EzGv9FqDepT6winVNWGiLVrTKjPD5KgB2jTiHhmFR4X6",
    })
    .instruction();

  const { blockhash } = await getConnection().getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(publicKey),
    recentBlockhash: blockhash,
    instructions: [
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 10_000,
      }),
      ix,
    ],
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);

  transaction.sign([DEEZ_NUTS_AUTHORITY]);

  return Buffer.from(transaction.serialize()).toString("base64");
}
