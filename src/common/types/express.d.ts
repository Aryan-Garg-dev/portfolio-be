import "express";
import type ILogger from "@/lib/logger";

declare module "express-serve-static-core" {
	interface Request {
		geo?: {
			range: [number, number];
			country: string;
			region: string;
			eu: "0" | "1";
			timezone: string;
			city: string;
			ll: [number, number];
			metro: number;
			area: number;
		};

		logger?: ILogger;
		requestId?: string;
	}
}
