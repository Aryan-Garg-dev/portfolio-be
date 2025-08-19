import type { Response } from "express";

type TBaseResponse = {
	success: boolean;
	status: number;
	message?: string;
};

type TSuccessResponse<T> = TBaseResponse & {
	success: true;
	data?: T;
};

type TErrorResponse = TBaseResponse & {
	success: false;
	error: string;
	code?: string;
};

type TPaginatedMeta = {
	page: number;
	perPage: number;
	total: number;
	totalPages: number;
};

type TPaginatedResponse<T> = TSuccessResponse<T[]> & {
	meta: TPaginatedMeta;
};

export type TResponse<T> = TSuccessResponse<T> | TErrorResponse | TPaginatedResponse<T>;

function hasMeta<T>(res: any): res is TPaginatedResponse<T> {
	return res.meta && typeof res.meta === "object";
}

export function sendResponse<T>(res: Response, response: TResponse<T>) {
	const { status, success, message } = response;

	if (success) {
		const base = {
			success: true,
			message,
			data: response.data,
		};

		if (hasMeta(response)) {
			return res.status(status).json({
				...base,
				meta: (response as TPaginatedResponse<T>).meta,
			});
		}

		return res.status(status).json(base);
	}

	return res.status(status).json({
		success: false,
		error: response.error,
		code: response.code,
	});
}

export const response = {
	ok: <T>(data: T, message = "OK", status = 200): TResponse<T> => ({
		success: true,
		status,
		message,
		data,
	}),

	created: <T>(data: T, message = "Created"): TResponse<T> => ({
		success: true,
		status: 201,
		message,
		data,
	}),

	paginated: <T>(data: T[], meta: TPaginatedMeta, message = "OK"): TPaginatedResponse<T> => ({
		success: true,
		status: 200,
		message,
		data,
		meta,
	}),

	error: (error: string, status = 500, code = "INTERNAL_SERVER_ERROR"): TResponse<null> => ({
		success: false,
		status,
		error,
		code,
	}),
};
