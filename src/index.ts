import express from "express";
import setup from "@/lib/setup";
import setupServer from "@/lib/setup/server.ts";
import setupLogger from "@/lib/setup/logger.ts";
import setupMonitoring from "@/lib/setup/monitoring.ts";
import setupErrorHandler from "@/lib/setup/error-handler.ts";
import setupCache from "@/lib/setup/cache.ts";
import setupDB from "@/lib/setup/db.ts";
import logger from "@/lib/logger";
import env from "@/config/env.ts";
import { corsConfig } from "@/config/cors.ts";
import { appRouter } from "@/routes";

async function startServer() {
	const app = express();
	await setup(app, [
		setupMonitoring,
		setupLogger,
		setupDB,
		setupCache,
		// setupSession,
		setupServer({
			appPrefix: "/api",
			routes: appRouter(),
			corsConfig,
		}),
		setupErrorHandler,
	]);
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
