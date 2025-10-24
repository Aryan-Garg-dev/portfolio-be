import { createClient, type RedisClientType } from "redis";
import env from "@/config/env.ts";
import logger from "@/lib/logger";
import type { IRedisCache } from "@/lib/cache/redis-cache/redis-cache.interface.ts";

class RedisCache implements IRedisCache {
	private static _instance: RedisCache;
	private readonly _client: RedisClientType;

	private constructor() {
		this._client = createClient({ url: env.REDIS_URL });
	}

	async connect(): Promise<boolean> {
		try {
			await this._client.connect();
			logger.info("Connected to redis!");
			return true;
		} catch (err) {
			logger.error(`Redis connection failed: ${JSON.stringify(err, null, 2)}`);
			return false;
		}
	}

	static get instance(): RedisCache {
		if (!RedisCache._instance) {
			RedisCache._instance = new RedisCache();
		}
		return RedisCache._instance;
	}

	get client(): RedisClientType {
		if (!this._client.isOpen) {
			throw new Error("Redis client is not connected");
		}
		return this._client;
	}

	async get<T = unknown>(key: string): Promise<T | null> {
		const val = await this._client.get(key);
		return val ? (JSON.parse(val) as T) : null;
	}

	async set<T = unknown>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
		const json = JSON.stringify(value);
		if (ttlInSeconds) {
			await this._client.set(key, json, { EX: ttlInSeconds });
		} else {
			await this._client.set(key, json);
		}
	}

	async del(key: string): Promise<void> {
		await this._client.del(key);
	}

	async checkHealth(): Promise<void> {
		await this._client.ping();
	}

	async delByPattern(pattern: string): Promise<void> {
		const keys = await this._client.keys(pattern);
		if (keys.length > 0) {
			await this._client.del(keys);
		}
	}
}

export default RedisCache;
