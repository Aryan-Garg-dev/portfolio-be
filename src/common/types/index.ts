export type TPrettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type TValueOf<T> = T[keyof T];

export type TMakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type TMakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
