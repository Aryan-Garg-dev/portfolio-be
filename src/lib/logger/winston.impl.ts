import winston from "winston";
import type { ILogger } from "@/lib/logger/logger.interface.ts";


class WinstonLogger implements ILogger {
	private readonly _logger: winston.Logger;
	private static _instance: WinstonLogger;


	constructor() {
		this._logger =  winston.createLogger({
			level: "info",
			format: winston.format.combine(
				winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				winston.format.errors({ stack: true }),
				winston.format.printf(({ timestamp, level, message, stack }) => {
					return `${timestamp} ${level}: ${stack || message}`;
				})
			),
			transports: [new winston.transports.Console()],
		});
	}

	static get instance(): WinstonLogger {
		if (!WinstonLogger._instance) {
			WinstonLogger._instance = new WinstonLogger();
		}
		return WinstonLogger._instance;
	}

	info(message: string, ...meta: any) {
		this._logger.info(message, ...meta);
	}

	warn(message: string, ...meta: any) {
		this._logger.warn(message, ...meta);

	}

	error(message: string, ...meta: any) {
		this._logger.error(message, ...meta);
	}

	debug(message: string, ...meta: any) {
		this._logger.debug(message, ...meta);
	}

	http(message: string, ...meta: any) {
		this._logger.debug(message, ...meta);
	}
}

export default WinstonLogger;
