import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
import { purgeEdgeCache, purgeEdgeTags, EDGE_CACHE_HEADER } from '../src/api/helpers';
import { createMockD1, createMockKV } from './helpers';

const mockD1 = createMockD1();
const mockKV = createMockKV();
const mockEnv = {
  DB: mockD1,
  CACHE_KV: mockKV,
  TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  ENVIRONMENT: 'test',
  SESSION_SECRET: 'test-session-secret-key-32-bytes-long',
};

// Seed a test confession
mockD1.confessions.push({
  id: 'test-confession-cache-1',
  prompt_used: 'Write a quicksort algorithm in Python',
  what_it_did_instead: 'Generated a bubble sort with O(n^3) time complexity',
  how_it_made_them_feel: 'Questioned computational physics',
  mood: 'rage',
  model_provider: 'openai',
  model_name: 'gpt-4o',
  solidarity_count: 5,
  is_hidden: 0,
  created_at: new Date().toISOString(),
});

describe('Workers Cache Headers & Cache-Tag Assertions', () => {
  it('GET / returns EDGE_CACHE_HEADER and Cache-Tag: home, confessions-list', async () => {
    const res = await app.request('/', { method: 'GET' }, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(EDGE_CACHE_HEADER);
    expect(res.headers.get('Cache-Tag')).toBe('home, confessions-list');
  });

  it('GET /?notice=... sets Cache-Control: private, no-store and omits Cache-Tag', async () => {
    const res = await app.request('/?notice=Confession+submitted+successfully', { method: 'GET' }, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(res.headers.get('Cache-Tag')).toBeNull();
  });

  it('GET / with Accept: text/markdown returns Cache-Tag: home, feed', async () => {
    const res = await app.request(
      '/',
      {
        method: 'GET',
        headers: { Accept: 'text/markdown' },
      },
      mockEnv
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(EDGE_CACHE_HEADER);
    expect(res.headers.get('Cache-Tag')).toBe('home, feed');
  });

  it('GET / with Accept: application/json returns Cache-Tag: home, api', async () => {
    const res = await app.request(
      '/',
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      mockEnv
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(EDGE_CACHE_HEADER);
    expect(res.headers.get('Cache-Tag')).toBe('home, api');
  });

  it('GET /confessions/:id returns confession-specific Cache-Tag', async () => {
    const res = await app.request('/confessions/test-confession-cache-1', { method: 'GET' }, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe(EDGE_CACHE_HEADER);
    expect(res.headers.get('Cache-Tag')).toBe('confession-test-confession-cache-1, confessions-detail');
  });

  it('GET /confessions/:id?notice=... sets private, no-store and omits Cache-Tag', async () => {
    const res = await app.request(
      '/confessions/test-confession-cache-1?notice=Report+submitted+for+review',
      { method: 'GET' },
      mockEnv
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(res.headers.get('Cache-Tag')).toBeNull();
  });

  it('GET /confessions/:id.json and .md return format-specific Cache-Tags', async () => {
    const resJson = await app.request('/confessions/test-confession-cache-1.json', { method: 'GET' }, mockEnv);
    expect(resJson.status).toBe(200);
    expect(resJson.headers.get('Cache-Tag')).toBe('confession-test-confession-cache-1, api');

    const resMd = await app.request('/confessions/test-confession-cache-1.md', { method: 'GET' }, mockEnv);
    expect(resMd.status).toBe(200);
    expect(resMd.headers.get('Cache-Tag')).toBe('confession-test-confession-cache-1, markdown');
  });

  it('GET /feed.xml and /sitemap.xml return proper Cache-Tags', async () => {
    const resFeed = await app.request('/feed.xml', { method: 'GET' }, mockEnv);
    expect(resFeed.status).toBe(200);
    expect(resFeed.headers.get('Cache-Tag')).toBe('feed, rss');

    const resSitemap = await app.request('/sitemap.xml', { method: 'GET' }, mockEnv);
    expect(resSitemap.status).toBe(200);
    expect(resSitemap.headers.get('Cache-Tag')).toBe('sitemap, seo');
  });

  it('GET /api/models and /api/confessions return proper Cache-Tags', async () => {
    const resModels = await app.request('/api/models', { method: 'GET' }, mockEnv);
    expect(resModels.status).toBe(200);
    expect(resModels.headers.get('Cache-Tag')).toBe('models, api');

    const resConfessions = await app.request('/api/confessions', { method: 'GET' }, mockEnv);
    expect(resConfessions.status).toBe(200);
    expect(resConfessions.headers.get('Cache-Tag')).toBe('confessions-list, api');
  });

  it('GET /openapi.json, /.well-known/api-catalog, and /mcp return proper Cache-Tags', async () => {
    const resOpenApi = await app.request('/openapi.json', { method: 'GET' }, mockEnv);
    expect(resOpenApi.status).toBe(200);
    expect(resOpenApi.headers.get('Cache-Tag')).toBe('discovery, openapi');

    const resCatalog = await app.request('/.well-known/api-catalog', { method: 'GET' }, mockEnv);
    expect(resCatalog.status).toBe(200);
    expect(resCatalog.headers.get('Cache-Tag')).toBe('discovery, api-catalog');

    const resMcp = await app.request('/mcp', { method: 'GET' }, mockEnv);
    expect(resMcp.status).toBe(200);
    expect(resMcp.headers.get('Cache-Tag')).toBe('mcp');
    expect(resMcp.headers.get('Vary')).toBe('Accept');

    const resChangelog = await app.request('/changelog', { method: 'GET' }, mockEnv);
    expect(resChangelog.status).toBe(200);
    expect(resChangelog.headers.get('Cache-Tag')).toBe('changelog');
    expect(resChangelog.headers.get('Vary')).toBe('Accept');

    const resLlmsFull = await app.request('/llms-full.txt', { method: 'GET' }, mockEnv);
    expect(resLlmsFull.status).toBe(200);
    expect(resLlmsFull.headers.get('Cache-Tag')).toBe('feed, llms-txt, discovery');
  });
});
describe('Global Tag Purging Helper Execution Safety', () => {
  it('purgeEdgeTags calls executionCtx.cache.purge with provided tags', async () => {
    let purgedTags: string[] = [];
    let waitUntilCalled = false;

    const mockCtx = {
      executionCtx: {
        waitUntil: (promise: Promise<unknown>) => {
          waitUntilCalled = true;
          promise.catch(() => {});
        },
        cache: {
          purge: async (options: { tags?: string[] }) => {
            purgedTags = options.tags || [];
            return { success: true, errors: [] };
          },
        },
      },
    } as unknown as Parameters<typeof purgeEdgeTags>[0];

    purgeEdgeTags(mockCtx, ['home', 'feed']);
    expect(waitUntilCalled).toBe(true);
    expect(purgedTags).toEqual(['home', 'feed']);
  });

  it('purgeEdgeCache includes default tags and optional confession tag', async () => {
    let purgedTags: string[] = [];

    const mockCtx = {
      executionCtx: {
        waitUntil: (promise: Promise<unknown>) => {
          promise.catch(() => {});
        },
        cache: {
          purge: async (options: { tags?: string[] }) => {
            purgedTags = options.tags || [];
            return { success: true, errors: [] };
          },
        },
      },
    } as unknown as Parameters<typeof purgeEdgeCache>[0];
    purgeEdgeCache(mockCtx, '123-abc');
    expect(purgedTags).toContain('home');
    expect(purgedTags).toContain('confessions-list');
    expect(purgedTags).toContain('feed');
    expect(purgedTags).toContain('sitemap');
    expect(purgedTags).toContain('og-image');
    expect(purgedTags).toContain('seo');
    expect(purgedTags).toContain('llms-txt');
    expect(purgedTags).toContain('confession-123-abc');
  });

  it('purgeEdgeTags gracefully handles missing executionCtx or cache without throwing', () => {
    const emptyCtx = {} as unknown as Parameters<typeof purgeEdgeTags>[0];
    expect(() => purgeEdgeTags(emptyCtx, ['home'])).not.toThrow();
    expect(() => purgeEdgeCache(emptyCtx)).not.toThrow();
  });
});
