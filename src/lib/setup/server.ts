import express from "express";
import type { Express, Request, Response, NextFunction, Router } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import compression from "compression";
import { errors } from "@/lib/utils/error.ts";
import { sendResponse } from "@/lib/utils/response.ts";
import type { TSetupServer } from "@/common/types";

export type TSetupServerOptions = {
	appPrefix: string;
	routes: Router;
	corsConfig?: CorsOptions;
};

const setupServer =
	(options: TSetupServerOptions): TSetupServer =>
	(app, setup) => {
		app.use(cors(options.corsConfig));
		app.use(express.json());
		app.use(helmet());
		app.use(compression());
		setup?.(app);
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
	};

export default setupServer;
