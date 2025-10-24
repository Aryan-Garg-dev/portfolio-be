// logger/PinoLogger.ts
import pino, { type Logger as PinoBaseLogger } from "pino";
import type { ILogger } from "./logger.interface.ts";
import env from "@/config/env.ts";
import { HIGHLIGHT_CONFIG } from "@/config/highlight.ts";

export class PinoLogger implements ILogger {
	private logger: PinoBaseLogger;

	constructor(context?: Record<string, any>) {
		this.logger = pino({
			level: env.LOG_LEVEL,
			transport:
				env.NODE_ENV !== "production"
					? { target: "pino-pretty", options: { colorize: true } }
					: env.MONITORING
						? { target: "@highlight-run/pino", options: HIGHLIGHT_CONFIG }
						: undefined,
		}).child(context || {});
	}

	info(message: string, ...meta: any[]): void {
		this.logger.info({ meta }, message);
	}

	error(message: string, ...meta: any[]): void {
		this.logger.error({ meta }, message);
	}

	warn(message: string, ...meta: any[]): void {
		this.logger.warn({ meta }, message);
	}

	debug(message: string, ...meta: any[]): void {
		this.logger.debug({ meta }, message);
	}

	child(context: Record<string, any>): ILogger {
		return new PinoLogger(context);
	}
}
