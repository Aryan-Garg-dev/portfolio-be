export class Result<T> {
	private readonly _success: boolean;
	private readonly _value?: T;
	private readonly _error?: Error;

	private constructor(success: boolean, value?: T, error?: Error) {
		this._success = success;
		this._value = value;
		this._error = error;
	}

	static success<T>(value?: T): Result<T> {
		return new Result<T>(true, value);
	}

	static error<T>(error: Error): Result<T> {
		return new Result<T>(false, undefined, error);
	}

	isSuccess(): boolean {
		return this._success;
	}

	isFailure(): boolean {
		return !this._success;
	}

	getValue(): T | undefined {
		return this._value;
	}

	getError(): Error | undefined {
		return this._error;
	}
}
