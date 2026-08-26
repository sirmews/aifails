import { Hono } from 'hono';
import type { Env } from '../../types/env';
import {
  getConfessions,
  getConfessionById,
  getSuggestionsForConfession,
  getSuggestionsMapForConfessions,
} from '../../db';
import { getModels } from '../../services/models';
import {
  generateLlmsFullTxt,
  formatConfessionMarkdown,
  formatConfessionJson,
} from '../../services/agent';
import { HomeView } from '../../views/HomeView';
import { PermalinkView } from '../../views/PermalinkView';
import { NotFoundView } from '../../views/NotFoundView';
import {
  getClientIp,
  isReadRateLimited,
  EDGE_CACHE_HEADER,
} from '../helpers';

export const homeRouter = new Hono<{ Bindings: Env }>();

// 1. Home Page SSR Route
homeRouter.get('/', async (c) => {
  const url = new URL(c.req.url);
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const notice = url.searchParams.get('notice') ?? undefined;
  const query = url.searchParams.get('q') ?? undefined;
  const mood = url.searchParams.get('mood') ?? undefined;
  const model = url.searchParams.get('model') ?? undefined;
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const { confessions, nextCursor, hasMore } = await getConfessions(c.env.DB, {
    query,
    mood,
    model,
    cursor,
    limit: 20,
  });
  const [models, suggestionsMap] = await Promise.all([
    getModels(c.env.CACHE_KV),
    getSuggestionsMapForConfessions(
      c.env.DB,
      confessions.map((conf) => conf.id)
    ),
  ]);

  // Content Negotiation for AI Agents & Automated Crawlers (e.g. Accept: text/markdown)
  const acceptHeader = c.req.header('accept') || c.req.header('Accept') || '';
  if (acceptHeader.includes('text/markdown') || acceptHeader.includes('text/x-markdown')) {
    return c.newResponse(generateLlmsFullTxt(confessions, suggestionsMap, url.origin), 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': EDGE_CACHE_HEADER,
    });
  }

  if (acceptHeader.includes('application/json')) {
    c.header('Content-Type', 'application/json; charset=utf-8');
    c.header('Vary', 'Accept');
    c.header('Cache-Control', EDGE_CACHE_HEADER);
    return c.json({
      confessions: confessions.map((conf) => formatConfessionJson(conf, suggestionsMap[conf.id] || [], url.origin)),
      nextCursor,
      hasMore,
    });
  }
  c.header('Vary', 'Accept');
  c.header('Cache-Control', EDGE_CACHE_HEADER);
  c.header(
    'Link',
    '</.well-known/api-catalog>; rel="api-catalog", </llms.txt>; rel="service-desc"; type="text/plain", </llms-full.txt>; rel="service-doc"; type="text/plain", </feed.md>; rel="describedby"; type="text/markdown"'
  );

  return c.html(
    HomeView({
      confessions,
      suggestionsMap,
      models,
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      notice,
      query,
      mood,
      model,
      nextCursor,
      hasMore,
      baseUrl: url.origin,
    })
  );
});

// 2. Single Confession Permalink Route
homeRouter.get('/confessions/:id', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  let id = c.req.param('id');
  let format: 'html' | 'md' | 'json' = 'html';

  if (id.endsWith('.md')) {
    id = id.slice(0, -3);
    format = 'md';
  } else if (id.endsWith('.json')) {
    id = id.slice(0, -5);
    format = 'json';
  } else {
    const acceptHeader = c.req.header('Accept') || '';
    if (acceptHeader.includes('text/markdown')) {
      format = 'md';
    } else if (acceptHeader.includes('application/json')) {
      format = 'json';
    }
  }

  const url = new URL(c.req.url);
  const notice = url.searchParams.get('notice') ?? undefined;
  const confession = await getConfessionById(c.env.DB, id);

  if (!confession) {
    if (format === 'json') return c.json({ error: 'Confession not found' }, 404);
    if (format === 'md') return c.text('# Error 404\n\nConfession not found.', 404);
    c.status(404);
    return c.html(NotFoundView());
  }

  const suggestions = await getSuggestionsForConfession(c.env.DB, id);
  c.header('Vary', 'Accept');

  if (format === 'md') {
    return c.newResponse(formatConfessionMarkdown(confession, suggestions, url.origin), 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': EDGE_CACHE_HEADER,
    });
  }

  if (format === 'json') {
    c.header('Content-Type', 'application/json; charset=utf-8');
    c.header('Cache-Control', EDGE_CACHE_HEADER);
    return c.json(formatConfessionJson(confession, suggestions, url.origin));
  }

  const models = await getModels(c.env.CACHE_KV);
  c.header('Cache-Control', EDGE_CACHE_HEADER);

  return c.html(
    PermalinkView({
      confession,
      suggestions,
      models,
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      notice,
      baseUrl: url.origin,
    })
  );
});
