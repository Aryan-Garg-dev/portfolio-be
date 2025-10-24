import type { Express } from "express";

import { H, Handlers } from "@highlight-run/node";
import { HIGHLIGHT_CONFIG } from "@/config/highlight.ts";

const setupMonitoring = (app: Express, setup?: (app: Express) => void) => {
	if (!H.isInitialized()) {
		H.init(HIGHLIGHT_CONFIG);
	}
	app.use(Handlers.middleware(HIGHLIGHT_CONFIG));
	setup?.(app);
	app.use(Handlers.errorHandler(HIGHLIGHT_CONFIG));
};

export default setupMonitoring;
