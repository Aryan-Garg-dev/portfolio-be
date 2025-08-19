import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { TInferRequest, TRequestHandler, TRequestSchema } from "@/common/types/http.ts";
import { asyncHandler } from "@/lib/utils/error.ts";

export const defineRequestSchema = (schema: TRequestSchema) => {
	return schema;
};

type THandlerOptions = {
	fallbackErrorMessage?: string;
	meta?: {
		//method: '',
		// ...
	};
};

/*
export type TMetaEnhancedHandler = RequestHandler & {
	meta?: {

	}
}
*/

const createHandler = <T extends TRequestSchema>(
	schema: T,
	handler: TRequestHandler<T>,
	options?: THandlerOptions
): RequestHandler => {
	return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
		if (schema.body) req.body = schema.body.parse(req.body);
		if (schema.params) req.params = schema.params.parse(req.params);
		if (schema.query) req.query = schema.query.parse(req.query);
		await handler(req as TInferRequest<T>, res, next);
	}, options?.fallbackErrorMessage);
};

export default createHandler;
