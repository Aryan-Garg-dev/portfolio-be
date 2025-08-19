import "express-async-errors";
import express from "express";
import setupServer from "@/lib/setup/server.ts";
import setupLogger from "@/lib/setup/logger.ts";
import setupSession from "@/lib/setup/session.ts";
import connectDB from "@/lib/setup/db.ts";
import logger from "@/lib/logger";
import env from "@/config/env.ts";
import { corsConfig } from "@/config/cors.ts";
import cache from "@/lib/cache";
import { appRouter } from "@/routes";

async function startServer() {
	const app = express();
	await connectDB();
	await cache.connect();
	setupLogger(app);
	setupSession(app);
	setupServer(app, {
		appPrefix: "/api",
		routes: appRouter(),
		corsConfig,
	});
	app
		.listen(env.PORT, () => {
			logger.info(`
      ################################################
           Server listening on port: ${env.PORT}      
      ################################################
    `);
		})
		.on("error", err => {
			logger.error(err.message, err.stack);
			process.exit(1);
		});
}

await startServer();
