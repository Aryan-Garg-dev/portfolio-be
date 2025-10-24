import type { TSetupServer } from "@/common/types";
import errorHandler from "@/middlewares/error-handler.middleware.ts";

const setupErrorHandler: TSetupServer = (app, setup) => {
	setup?.(app);
	app.use(errorHandler);
};

export default setupErrorHandler;
