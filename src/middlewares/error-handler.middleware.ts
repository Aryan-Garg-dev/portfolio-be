import type { Request, Response, NextFunction } from "express";
import logger from "@/lib/logger";
import { AppError } from "@/lib/utils/error.ts";
import { sendResponse } from "@/lib/utils/response.ts";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
	const error = AppError.from(err);

	logger.error(
		JSON.stringify(
			{
				message: error.message,
				stack: error.stack,
				name: error.name,
				path: req.path,
				method: req.method,
			},
			null,
			2
		)
	);

	sendResponse(res, {
		error: error.message,
		code: "INTERNAL_SERVER_ERROR",
		success: false,
		status: 500,
	});
};

export default errorHandler;
