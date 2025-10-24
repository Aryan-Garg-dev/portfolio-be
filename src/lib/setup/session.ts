import { RedisStore } from "connect-redis";
import env from "@/config/env.ts";
import session from "express-session";
import cache from "@/lib/cache";
import type { TSetupServer } from "@/common/types";
import logger from "@/lib/setup/logger.ts";

const setupSession: TSetupServer = (app, setup) => {
	const redisStore = new RedisStore({
		client: cache.client,
		prefix: env.SESSION_PREFIX,
	});

	app.set("trust proxy", 1);
	app.use(
		session({
			store: redisStore,
			secret: env.SESSION_SECRET,
			resave: false,
			proxy: env.NODE_ENV === "production",
			saveUninitialized: false,
			cookie: {
				secure: env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 3 * 24 * 60 * 60 * 1000, // expiry for 3 days
				sameSite: env.NODE_ENV === "production" ? "none" : "lax",
			},
		})
	);

	setup?.(app);
};

export default setupSession;
