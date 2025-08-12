import type { RequestHandler } from "express";
import createRateLimit, { type TCreateRateLimitOptions } from "@/middlewares/rate-limit.middleware.ts";
import { Router } from "express";

export type TRouteDefinition = {
	method: "get" | "post" | "put" | "delete" | "patch";
	path: string;
	handler: RequestHandler;
	middlewares?: RequestHandler[];
	rateLimit?: TCreateRateLimitOptions;
};

export function defineRoute(config: TRouteDefinition): TRouteDefinition {
	return config;
}

const setupRoutes = (routes: TRouteDefinition[], basePath = "") => {
	const router = Router();

	for (const route of routes) {
		const { method, path, handler, middlewares = [], rateLimit } = route;
		if (rateLimit) middlewares.push(createRateLimit(rateLimit));
		router[method](basePath + path, ...middlewares, handler);
	}

	return router;
};

export default setupRoutes;
