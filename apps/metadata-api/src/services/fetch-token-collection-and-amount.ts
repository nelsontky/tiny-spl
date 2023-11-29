import "dotenv/config";
import type { Response } from "express";
import type { Request } from "firebase-functions/v2/https";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";

const umi = createUmi(process.env.RPC_URL!);
umi.use(mplTokenMetadata());

export const fetchTokenCollectionAndAmount = async (
  request: Request,
  response: Response<any>
) => {
  try {
    const collectionId = request.query.id;
    const tokenAmount = request.query.amount;

    if (typeof collectionId !== "string") {
      response.status(404).send({ status: 404, message: "Not Found" });
      return;
    }

    if (typeof tokenAmount !== "string" || isNaN(Number(tokenAmount))) {
      response.status(400).send({ status: 400, message: "Bad Request" });
      return;
    }

    const asset = await fetchDigitalAsset(umi, publicKey(collectionId));
    const metadataUri = asset.metadata.uri;
    const collectionMetadata = await fetch(metadataUri).then((res) =>
      res.json()
    );

    response.send({
      ...collectionMetadata,
      attributes: [
        {
          trait_type: "Amount",
          value: new Intl.NumberFormat("en-US").format(Number(tokenAmount)),
        },
      ],
    });
  } catch {
    response.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
