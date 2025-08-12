import type { CorsOptions } from "cors";
import env from "@/config/env.ts";

export const corsConfig: CorsOptions = {
	allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	origin: env.FRONTEND_URL,
};
