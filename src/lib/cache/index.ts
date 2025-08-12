import type { IRedisCache } from "@/lib/cache/redis-cache/redis-cache.interface.ts";
import RedisCache from "@/lib/cache/redis-cache/redis-cache.impl.ts";

const cache: IRedisCache = RedisCache.instance;


export default cache;