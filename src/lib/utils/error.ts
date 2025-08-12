import { ZodError } from "zod";

export class AppError extends Error {
	public status: number;
	public code: string;
	public isOperational: boolean;

	constructor(status: number, code: string, message: string, isOperational = true) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.status = status;
		this.code = code;
		this.isOperational = isOperational;
		this.name = this.constructor.name;
		Error.captureStackTrace(this);
	}

	static from(error: unknown, status = 500, code = "INTERNAL_ERROR"): AppError {
		if (error instanceof AppError) return error;
		const message = getErrorMessage(error);
		const appError = new AppError(status, code, message, false);
		if (error instanceof Error) appError.stack = error.stack;
		return appError;
	}
}

export const getZodErrorMessage = (err: ZodError) => {
	const error = err.issues.map(issue => {
		const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
		return `${path}${issue.message}`;
	});
	return `ZodError: ${JSON.stringify(error, null, 2)}`;
};

export const getErrorMessage = (err: unknown) => {
	if (err instanceof ZodError) return getZodErrorMessage(err);
	if (err instanceof Error) return err.message;
	return String(err);
};

const defineError = (statusCode: number, code: string, defaultMessage: string, isOperational = true) => {
	return (message = defaultMessage) => new AppError(statusCode, code, message, isOperational);
};

export const errors = {
	BAD_REQUEST: defineError(400, "BAD_REQUEST", "Bad Request"),
	UNAUTHORIZED: defineError(401, "UNAUTHORIZED", "Unauthorized"),
	FORBIDDEN: defineError(403, "FORBIDDEN", "Forbidden"),
	NOT_FOUND: defineError(404, "NOT_FOUND", "Not Found"),
	CONFLICT: defineError(409, "CONFLICT", "Conflict"),
	TOO_MANY_REQUESTS: defineError(429, "TOO_MANY_REQUESTS", "Too Many Requests"),
	INTERNAL_SERVER_ERROR: defineError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", false),

	INVALID_TOKEN: defineError(401, "INVALID_TOKEN", "Invalid token"),
	VALIDATION_ERROR: defineError(400, "VALIDATION_ERROR", "Validation failed"),
};

export type TErrorCode = keyof typeof errors;

export const tryCatch = async <T>(promise: Promise<T>): Promise<[T | null, Error | null]> => {
	try {
		const data = await promise;
		return [data, null];
	} catch (error) {
		return [null, error instanceof Error ? error : new Error(String(error))];
	}
};
