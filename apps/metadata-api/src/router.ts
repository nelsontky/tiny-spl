import { Router, error } from "itty-router";
import { fetchTransactionMetadata } from "./services/fetch-transaction-metdata";

const router = Router();

router.get("/tx/:txId", (request, env) =>
	fetchTransactionMetadata(request.params.txId, env),
);

router.all("*", () => error(404));

export default router;
