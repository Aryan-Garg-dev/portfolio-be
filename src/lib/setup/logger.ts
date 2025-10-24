import type { TSetupServer } from "@/common/types";
import { loggerMiddleware } from "@/middlewares/logger.middleware.ts";

const setupLogger: TSetupServer = (app, setup) => {
	app.use(loggerMiddleware);
	setup?.(app);
};

export default setupLogger;
