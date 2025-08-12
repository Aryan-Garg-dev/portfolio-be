export interface ICache {
  connect(): Promise<void>;
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlInSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  checkHealth(): Promise<void>;
  delByPattern(pattern: string): Promise<void>;
}

