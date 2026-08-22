export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
  CONFESSION_LIMITER?: RateLimit;
  SOLIDARITY_LIMITER?: RateLimit;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  SESSION_SECRET?: string;
  ENVIRONMENT?: string;
}
