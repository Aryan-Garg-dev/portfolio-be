import type { Request, Response, NextFunction, RequestHandler } from "express";
import { type ZodType, type infer as ZodInfer, ZodError } from "zod";
import { errors, getZodErrorMessage } from "@/lib/utils/error.ts";

export type TRequestSchema = {
	body?: ZodType<any>;
	query?: ZodType<any>;
	params?: ZodType<any>;
};

export type TInferRequest<T extends TRequestSchema> = Request<
	T["params"] extends ZodType<any> ? ZodInfer<T["params"]> : any,
	any,
	T["body"] extends ZodType<any> ? ZodInfer<T["body"]> : any,
	T["query"] extends ZodType<any> ? ZodInfer<T["query"]> : any
>;

export type TController<T extends TRequestSchema> = (
	req: TInferRequest<T>,
	res: Response,
	next: NextFunction
) => any | Promise<any>;

export const defineRequestSchema = (schema: TRequestSchema) => {
	return schema;
};

const createController = <T extends TRequestSchema>(schema: T, handler: TController<T>): RequestHandler => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schema.body) req.body = schema.body.parse(req.body);
			if (schema.params) req.params = schema.params.parse(req.params);
			if (schema.query) req.query = schema.query.parse(req.query);
			await handler(req as TInferRequest<T>, res, next);
		} catch (error) {
			if (error instanceof ZodError) {
				throw errors.VALIDATION_ERROR(getZodErrorMessage(error));
			}
			throw error;
		}
	};
};

export default createController;
