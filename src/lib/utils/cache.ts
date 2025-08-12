import cache from "@/lib/cache";
import stringify from "fast-json-stable-stringify";
import { CryptoHasher } from "bun";

function hashArgs(args: any[]): string {
  const hasher = new CryptoHasher("sha256");
  hasher.update(stringify(args));
  return Buffer.from(hasher.digest()).toString("hex");
}

export interface ICacheOptions {
  ttl?: number;
  prefix?: string;
}

export type TAsyncFunc<TArgs extends any[] = any[], TResult = any> = (...args: TArgs) => Promise<TResult>;

export type TCacheEnhanced<TArgs extends any[], TResult> = TAsyncFunc<TArgs, TResult> & {
  invalidate: () => Promise<void>;
};

export function withCache<TArgs extends any[] = any[], TResult = any>(
  fn: TAsyncFunc<TArgs, TResult>,
  { ttl = 60, prefix = "" }: ICacheOptions = {}
): TCacheEnhanced<TArgs, TResult> {
  const wrapped = async (...args: TArgs): Promise<TResult> => {
    const functionName = fn.name || "anonymous";
    const cacheKey = `${prefix}:${functionName}:${hashArgs(args)}`;
    const cached = await cache.get<TResult>(cacheKey);
    if (cached) return cached;

    const result = await fn(...args);
    await cache.set(cacheKey, JSON.stringify(result), ttl);
    return result;
  };

  (wrapped as TCacheEnhanced<TArgs, TResult>).invalidate = async () => {
    await cache.delByPattern(`${prefix}:*`);
  };

  return wrapped as TCacheEnhanced<TArgs, TResult>;
}

export function useCache<TArgs extends any[], TResult>(
  { ttl = 60, prefix = "" }: ICacheOptions = {}
) {
  return (
    _target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<TAsyncFunc<TArgs, TResult>>
  ): void => {
    // biome-ignore lint/style/noNonNullAssertion: _
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: TArgs): Promise<TResult> {
      const cacheKey = `${prefix}:${String(propertyKey)}:${hashArgs(args)}`;

      const cached = await cache.get<TResult>(cacheKey);
      if (cached) return cached;

      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, JSON.stringify(result), ttl);
      return result;
    };
  };
}
