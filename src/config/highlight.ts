import env from "./env.ts";

export const HIGHLIGHT_CONFIG = {
	projectID: env.HIGHLIGHT_PROJECT_ID,
	serviceName: env.HIGHLIGHT_SERVICE_NAME,
	serviceVersion: "git-sha",
	environment: env.NODE_ENV,
};
