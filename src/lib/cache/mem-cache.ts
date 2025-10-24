import { parse, stringify } from "superjson";

interface Serializer {
	stringify: (obj: any) => string;
	parse: <T = any>(obj: string) => T;
}

interface Cache {
	get: <T = any>(key: string) => T | null;
	set: ((key: string, value: any) => void) | ((key: string, value: any, ttlInMs?: number) => void);
	delete: (key: string) => void;
}

export const JSONSerializer: Serializer = {
	stringify: JSON.stringify,
	parse: JSON.parse,
};

export const superjsonSerializer: Serializer = {
	parse,
	stringify,
};

// Least Recently Used - is evicted
export class LRUCache implements Cache {
	private readonly _capacity: number;
	private readonly _cache: Map<string, string>;
	private readonly _serializer: Serializer;

	constructor(capacity: number = 100_000, serializer: Serializer = JSONSerializer) {
		this._capacity = capacity;
		this._cache = new Map();
		this._serializer = serializer;
	}

	get<T = any>(key: string) {
		const raw = this._cache.get(key);
		if (!raw) return null;
		this._cache.delete(key);
		this._cache.set(key, raw);
		return this._serializer.parse<T>(raw);
	}

	set(key: string, value: any) {
		const serialized = this._serializer.stringify(value);
		if (this._cache.has(key)) this._cache.delete(key);
		else if (this._cache.size >= this._capacity) this._cache.delete(this._cache.keys().next().value!);
		this._cache.set(key, serialized);
	}

	delete(key: string) {
		this._cache.delete(key);
	}
}

// Least Frequently Used - is evicted
export class LFUCache implements Cache {
	private readonly _capacity: number;
	private readonly _cache: Map<string, { value: string; freq: number }>;
	private readonly _serializer: Serializer;

	constructor(capacity: number = 100_000, serializer: Serializer = JSONSerializer) {
		this._capacity = capacity;
		this._cache = new Map();
		this._serializer = serializer;
	}

	get<T = any>(key: string) {
		const entry = this._cache.get(key);
		if (!entry) return null;
		entry.freq++;
		return this._serializer.parse<T>(entry.value);
	}

	set(key: string, value: any) {
		const serializedValue = this._serializer.stringify(value);

		if (this._cache.has(key)) {
			const entry = this._cache.get(key)!;
			entry.value = serializedValue;
			entry.freq++;
			return;
		}

		if (this._cache.size >= this._capacity) {
			let lfuKey: string = "";
			let minFreq = Infinity;
			for (const [key, { freq }] of this._cache) {
				if (freq < minFreq) {
					minFreq = freq;
					lfuKey = key;
				}
			}
			if (lfuKey) this._cache.delete(lfuKey);
		}

		this._cache.set(key, { value: serializedValue, freq: 1 });
	}

	delete(key: string) {
		this._cache.delete(key);
	}
}

type LRFUEntry = { value: string; freq: number; lastAccess: number };

// Combination of Least Recently Used and Least Frequently used determined by lambda factor is evicted
export class LRFUCache implements Cache {
	private readonly _capacity: number;
	private readonly _cache: Map<string, LRFUEntry>;
	private readonly _serializer: Serializer;
	private readonly _lambda: number;

	constructor(capacity: number = 100_000, factor: number = 0.5, serializer: Serializer = JSONSerializer) {
		this._capacity = capacity;
		this._cache = new Map();
		this._serializer = serializer;
		this._lambda = factor;
	}

	get<T = any>(key: string) {
		const entry = this._cache.get(key);
		if (!entry) return null;
		entry.freq++;
		entry.lastAccess = Date.now();
		return this._serializer.parse<T>(entry.value);
	}

	private _score(entry: LRFUEntry): number {
		const age = Date.now() - entry.lastAccess;
		const recencyWeight = Math.exp((-this._lambda * age) / 1000);
		return this._lambda * entry.freq + (1 - this._lambda) * recencyWeight;
	}

	set(key: string, value: any) {
		const serializedValue = this._serializer.stringify(value);

		if (this._cache.has(key)) {
			const entry = this._cache.get(key)!;
			entry.value = serializedValue;
			entry.freq++;
			entry.lastAccess = Date.now();
			return;
		}

		if (this._cache.size >= this._capacity) {
			let minKey: string = "";
			let minScore = Infinity;
			for (const [k, e] of this._cache) {
				const s = this._score(e);
				if (s < minScore) {
					minScore = s;
					minKey = k;
				}
			}
			if (minKey) this._cache.delete(minKey);
		}

		this._cache.set(key, {
			value: serializedValue,
			freq: 1,
			lastAccess: Date.now(),
		});
	}

	delete(key: string) {
		this._cache.delete(key);
	}
}

type TTLEntry = { value: string; freq: number; lastAccess: number; ttl?: number };

// LRFUCache with TTL
export class MemCache implements Cache {
	private readonly _capacity: number;
	private readonly _cache: Map<string, TTLEntry>;
	private readonly _serializer: Serializer;
	private readonly _lambda: number;

	constructor(capacity: number = 100_000, factor: number = 0.5, serializer: Serializer = JSONSerializer) {
		this._capacity = capacity;
		this._cache = new Map();
		this._serializer = serializer;
		this._lambda = factor;
	}

	get<T = any>(key: string) {
		const item = this._cache.get(key);
		if (!item) return null;

		if (item.ttl && Date.now() - item.lastAccess > item.ttl) {
			this._cache.delete(key);
			return null;
		}

		item.freq++;
		item.lastAccess = Date.now();
		return this._serializer.parse<T>(item.value);
	}

	private _score(item: TTLEntry): number {
		const age = Date.now() - item.lastAccess;
		const recencyWeight = Math.exp((-this._lambda * age) / 1000);
		return this._lambda * item.freq + (1 - this._lambda) * recencyWeight;
	}

	set(key: string, value: any, ttlInMs?: number) {
		const serializedValue = this._serializer.stringify(value);

		if (this._cache.has(key)) {
			const entry = this._cache.get(key)!;
			entry.value = serializedValue;
			entry.freq++;
			entry.lastAccess = Date.now();
			entry.ttl = ttlInMs;
			return;
		}

		if (this._cache.size >= this._capacity) {
			let minKey: string = "";
			let minScore = Infinity;
			for (const [k, e] of this._cache) {
				const s = this._score(e);
				if (s < minScore) {
					minScore = s;
					minKey = k;
				}
			}
			if (minKey) this._cache.delete(minKey);
		}

		this._cache.set(key, {
			value: serializedValue,
			freq: 1,
			lastAccess: Date.now(),
			ttl: ttlInMs,
		});
	}

	delete(key: string) {
		this._cache.delete(key);
	}
}

export default MemCache;
