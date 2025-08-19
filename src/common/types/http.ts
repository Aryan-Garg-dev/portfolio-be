import type { NextFunction, Response, Request } from "express";
import type { infer as ZodInfer, ZodType } from "zod";

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

export type TRequestHandler<T extends TRequestSchema> = (
	req: TInferRequest<T>,
	res: Response,
	next: NextFunction
) => any | Promise<any>;
