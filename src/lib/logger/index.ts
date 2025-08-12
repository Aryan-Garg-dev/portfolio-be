import WinstonLogger from "@/lib/logger/winston.impl.ts";
import type { ILogger } from "@/lib/logger/logger.interface.ts";

const logger: ILogger = WinstonLogger.instance;

export default logger;