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
