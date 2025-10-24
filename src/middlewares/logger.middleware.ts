import type { TMiddleware } from "@/common/types";
import { randomUUIDv7 } from "bun";
import logger from "@/lib/logger";

export const loggerMiddleware: TMiddleware = (req, _res, next) => {
	const requestId = randomUUIDv7();
	req.requestId = requestId;
	req.logger = logger.child({ requestId, path: req.path, method: req.method });
	req.logger.info("Incoming request");
	next();
};
