import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
	server: {
		FRONTEND_URL: z.url().default("http://localhost:3000"),
		REDIS_URL: z.url(),
		SESSION_PREFIX: z.string().min(3).default("app"),
		SESSION_SECRET: z.string().min(6),
		NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
		PORT: z.coerce.number().default(8080),
		DB_URL: z.url(),
		RESEND_API_KEY: z.string().min(1),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

export default env;
