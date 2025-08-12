import RedisStore from "rate-limit-redis";
import rateLimit, { type Options as RateLimitOptions } from "express-rate-limit";
import cache from "@/lib/cache";

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
	});

export default createRateLimit;
