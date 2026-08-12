export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
}
