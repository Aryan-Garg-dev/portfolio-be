import RedisStore from "rate-limit-redis";
import rateLimit, { type Options as RateLimitOptions } from "express-rate-limit";
import cache from "@/lib/cache";
import { sendResponse } from "@/lib/utils/response.ts";

export type TCreateRateLimitOptions = Pick<RateLimitOptions, "windowMs" | "limit" | "message">;

const createRateLimit = (options: TCreateRateLimitOptions) =>
	rateLimit({
		store: new RedisStore({
			sendCommand: (...args) => cache.client.sendCommand(args),
		}),
		windowMs: options.windowMs,
		limit: options.limit,
		message: options.message,
		standardHeaders: true,
		legacyHeaders: false,
		handler: (_, res) => {
			sendResponse(res, {
				success: false,
				status: 429,
				code: "TOO_MANY_REQUESTS",
				error: `${options.message}`,
			});
		},
	});

export default createRateLimit;
