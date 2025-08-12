import type { ICache } from "@/lib/cache/cache.interface.ts";
import type { RedisClientType } from "redis";

export interface IRedisCache extends ICache {
  client: RedisClientType
}
