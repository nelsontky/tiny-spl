import { onRequest } from "firebase-functions/v2/https";
import { fetchTransactionMetadata } from "./services/fetch-transaction-metadata";
import { fetchTokenCollectionAndAmount } from "./services/fetch-token-collection-and-amount";
import { mintDeezNuts } from "./services/mint-deez-nuts";

export const tx = onRequest({ cors: true }, fetchTransactionMetadata);
export const collection = onRequest(
  { cors: true },
  fetchTokenCollectionAndAmount
);
export const mint = onRequest({ cors: true /*[/tinys\.pl$/]*/ }, mintDeezNuts);
