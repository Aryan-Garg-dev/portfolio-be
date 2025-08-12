import morgan, { type StreamOptions } from "morgan";
import type { Express } from "express";
import env from "@/config/env.ts";
import logger from "@/lib/logger";

const LOG_FORMAT = env.NODE_ENV === "production" ? "combined" : "dev";
const stream: StreamOptions = {
	write(message: string) {
		logger.http(message.trim());
	},
};

const setupLogger = (app: Express) => {
	app.use(morgan(LOG_FORMAT, { stream }));
};

export default setupLogger;
