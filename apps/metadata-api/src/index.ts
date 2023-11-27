import { error, json } from "itty-router";
import apiRouter from "./router";
import { Env } from "./types/env";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		return apiRouter.handle(request, env, ctx).then(json).catch(error);
	},
};
