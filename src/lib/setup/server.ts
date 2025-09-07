import express, { type Router } from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import errorHandler from "@/middlewares/error-handler.middleware.ts";
import { errors } from "@/lib/utils/error.ts";
import { sendResponse } from "@/lib/utils/response.ts";

export type TSetupServerOptions = {
	appPrefix: string;
	routes: Router;
	corsConfig?: CorsOptions;
};

const setupServer = (app: Express, options: TSetupServerOptions) => {
	app.use(cors(options.corsConfig));
	app.use(express.json());
	app.use(mongoSanitize());
	app.use(helmet());
	app.use(compression());
	app.get("/", (req: Request, res: Response) => {
		return sendResponse(res, {
			message: "Server is Healthy",
			success: true,
			status: 200,
		});
	});
	app.use(options.appPrefix, options.routes);
	app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
		next(errors.NOT_FOUND("Route does not exist"));
	});
	app.use(errorHandler);
};

export default setupServer;
