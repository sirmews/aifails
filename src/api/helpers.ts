import type { Context } from 'hono';
import type { Env } from '../types/env';
import { getOrCreateSessionId } from '../auth/session';

export function getSessionHelper(c: Context<{ Bindings: Env }>) {
  const isSecure = c.req.url.startsWith('https://') || c.env.ENVIRONMENT === 'production';
  return getOrCreateSessionId(
    c.req.header('Cookie'),
    c.env.SESSION_SECRET || 'ugh-llms-default-session-hmac-secret-key-2026',
    isSecure
  );
}

export function getClientIp(c: Context<{ Bindings: Env }>): string {
  return c.req.header('cf-connecting-ip') || '127.0.0.1';
}

export async function isReadRateLimited(c: Context<{ Bindings: Env }>, rateLimitKey: string): Promise<boolean> {
  if (!c.env.READ_LIMITER) {
    return false;
  }

  const { success } = await c.env.READ_LIMITER.limit({ key: rateLimitKey });
  return !success;
}

// Tiered Edge Cache: 5s browser, 30s Cloudflare CDN edge, with background SWR
export const EDGE_CACHE_HEADER = 'public, max-age=5, s-maxage=30, stale-while-revalidate=86400';

export function purgeEdgeCache(c: Context<{ Bindings: Env }>, confessionId?: string) {
  try {
    const executionCtx = c.executionCtx;
    if (executionCtx && typeof executionCtx.waitUntil === 'function') {
      const cache = caches.default;
      const origin = new URL(c.req.url).origin;
      const purgeRequests = [
        cache.delete(new Request(origin + '/')),
        cache.delete(new Request(origin + '/feed.xml')),
        cache.delete(new Request(origin + '/sitemap.xml')),
        cache.delete(new Request(origin + '/og.svg')),
      ];
      if (confessionId) {
        purgeRequests.push(
          cache.delete(new Request(origin + `/confessions/${confessionId}`)),
          cache.delete(new Request(origin + `/confessions/${confessionId}/og.svg`))
        );
      }
      executionCtx.waitUntil(Promise.all(purgeRequests).catch(() => {}));
    }
  } catch {
    // Ignore cache purging errors in non-Worker or test environments
  }
}

export async function computeSha256Digest(content: string): Promise<{ hex: string; base64: string }> {
  const encoded = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const base64 = btoa(String.fromCharCode(...hashArray));
  return { hex, base64 };
}
