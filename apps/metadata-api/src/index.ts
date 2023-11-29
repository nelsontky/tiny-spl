import { onRequest } from "firebase-functions/v2/https";
import { fetchTransactionMetadata } from "./services/fetch-transaction-metadata";
import { fetchTokenCollectionAndAmount } from "./services/fetch-token-collection-and-amount";

export const tx = onRequest({ cors: true }, fetchTransactionMetadata);
export const collection = onRequest(
  { cors: true },
  fetchTokenCollectionAndAmount
);
