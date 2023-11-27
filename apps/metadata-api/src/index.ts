import { onRequest } from "firebase-functions/v2/https";
import { fetchTransactionMetadata } from "./services/fetch-transaction-metadata";

export const tx = onRequest((request, response) => {
  fetchTransactionMetadata(request, response);
});
