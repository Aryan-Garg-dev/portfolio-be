import workerpool, { type Pool, type WorkerPoolOptions } from "workerpool";

export type Asyncified<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>;

export class WorkerPool {
	private pool: Pool;

	constructor(options?: WorkerPoolOptions) {
		this.pool = workerpool.pool(undefined, options);
	}

	run<T extends (...args: any[]) => any>(fn: T, args: Parameters<T>): Promise<ReturnType<T>> {
		return this.pool.exec(fn, args);
	}

	asyncify<T extends (...args: any[]) => any>(fn: T): Asyncified<T> {
		return (...args: Parameters<T>) => this.pool.exec(fn, args);
	}

	async proxy<T extends Record<string, (...args: any[]) => any>>(
		functions: T
	): Promise<{ [K in keyof T]: Asyncified<T[K]> }> {
		const worker = await this.pool.proxy(functions);
		const proxyObj: any = {};
		for (const key of Object.keys(worker)) {
			proxyObj[key] = (...args: any[]) => (worker as any)[key](...args);
		}
		return proxyObj as { [K in keyof T]: Asyncified<T[K]> };
	}

	terminate(force?: boolean): Promise<void> {
		return this.pool.terminate(force);
	}
}
