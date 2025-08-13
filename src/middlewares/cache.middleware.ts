import type { Request, Response, NextFunction } from "express";
import { CryptoHasher } from "bun";

type TCacheVisibility = 'private' | 'public';
type TCacheBehavior = 'static' | 'fresh' | 'stale-ok' | 'no-cache' | 'no-store';

type TCacheOptions<T extends TCacheBehavior = TCacheBehavior> = {
  visibility: TCacheVisibility;
  behavior: T;
  varyHeaders?: string[];
  generateETag?: boolean;
} & (
  T extends 'static'
    ? { maxAge?: number }
    : T extends 'fresh' | 'stale-ok'
      ? {
      maxAge?: number;
    } & (T extends 'stale-ok' ? { staleWhileRevalidate?: number } : {})
      : T extends 'no-cache' | 'no-store'
        ? {}
        : {}
  );

interface ICacheConfig {
  cacheControl: string;
  vary: string[];
  generateETag: boolean;
}

const BEHAVIOR_CONFIGS = {
  'static': { maxAge: 31536000, staleWhileRevalidate: 0, directives: ['immutable'] },
  'fresh': { maxAge: 300, staleWhileRevalidate: 0, directives: ['must-revalidate'] },
  'stale-ok': { maxAge: 600, staleWhileRevalidate: 1200, directives: [] },
  'no-cache': { maxAge: 0, staleWhileRevalidate: 0, directives: ['no-cache', 'must-revalidate'] },
  'no-store': { maxAge: 0, staleWhileRevalidate: 0, directives: ['no-store', 'no-cache', 'must-revalidate'] }
} as const;

function cacheHeaders<T extends TCacheBehavior>(options: TCacheOptions<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();

    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return next();
    }

    const config = buildCacheConfig(options);

    res.setHeader('Cache-Control', config.cacheControl);

    if (config.vary.length > 0) {
      res.setHeader('Vary', config.vary.join(', '));
    }

    if (config.generateETag) {
      setupETagGeneration(req, res);
    }

    return next();
  };
}

function buildCacheConfig(options: TCacheOptions): ICacheConfig {
  const behaviorConfig = BEHAVIOR_CONFIGS[options.behavior];

  const parts: string[] = [options.visibility];

  const maxAge = ('maxAge' in options && options.maxAge) ? options.maxAge : behaviorConfig.maxAge;
  if (maxAge > 0) {
    parts.push(`max-age=${maxAge}`);
  }

  // Add stale-while-revalidate for stale-ok behavior
  if (options.behavior === 'stale-ok') {
    const swr = ('staleWhileRevalidate' in options) ? options.staleWhileRevalidate : behaviorConfig.staleWhileRevalidate;
    if (swr && swr > 0) {
      parts.push( `stale-while-revalidate=${swr}`);
    }
  }

  parts.push(...behaviorConfig.directives);

  let defaultVary: string[] = [];

  if (options.visibility === 'private') {
    defaultVary = ['Authorization', 'Cookie'];
  } else {
    defaultVary = ['Accept-Encoding'];
    if (options.behavior !== 'static') {
      defaultVary.push('Accept');
    }
  }

  return {
    cacheControl: parts.join(', '),
    vary: [...defaultVary, ...(options.varyHeaders || [])],
    generateETag: options.generateETag ?? (options.behavior === 'fresh' || options.behavior === 'stale-ok')
  };
}

function setupETagGeneration(req: Request, res: Response) {
  if ((res as any)._etagWrapped) return;
  (res as any)._etagWrapped = true;

  const etagHasher = new CryptoHasher("md5");
  const originalSend = res.send;

  res.send = function (data) {
    if (res.statusCode === 200 && data != null) {
      let dataString: string;

      if (typeof data === "object") {
        dataString = JSON.stringify(data);
      } else {
        dataString = String(data);
      }

      const etag = `"${etagHasher.update(dataString).digest("hex")}"`;
      res.setHeader("ETag", etag);

      const clientETag = req.headers["if-none-match"];
      if (clientETag === etag) {
        return res.status(304).end();
      }
    }

    return originalSend.call(this, data);
  };
}

export default cacheHeaders;