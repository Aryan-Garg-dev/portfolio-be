import type { Types, HydratedDocument } from "mongoose";

export type TPrettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TValueOf<T> = T[keyof T];

export type TMakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type TMakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type TLeanDoc<T extends { _id: any }> =
  Omit<T, keyof HydratedDocument<T>> & { _id: Types.ObjectId };

