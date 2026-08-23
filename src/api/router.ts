import { Hono, type Context } from 'hono';
import type { Env } from '../types/env';
import {
  getConfessions,
  getConfessionById,
  createConfession,
  incrementSolidarity,
  createSuggestion,
  getSuggestionsForConfession,
  getSuggestionsMapForConfessions,
  createReport,
  createSuggestionReport,
} from '../db';
import { getModels } from '../services/models';
import { verifyTurnstileToken } from '../auth/turnstile';
import { getOrCreateSessionId } from '../auth/session';
import { redactSecrets } from '../utils/gitleaks';
import { sanitizeContent } from '../utils/moderation';
import { generateRssFeed, generateSitemapXml, generateOgImageSvg } from '../services/seo';
import { HomeView } from '../views/HomeView';
import { PermalinkView } from '../views/PermalinkView';
import { NotFoundView } from '../views/NotFoundView';
export const app = new Hono<{ Bindings: Env }>();

// Global Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
});

function getSessionHelper(c: Context<{ Bindings: Env }>) {
  const isSecure = c.req.url.startsWith('https://') || c.env.ENVIRONMENT === 'production';
  if (!c.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required for session handling');
  }
  return getOrCreateSessionId(c.req.header('Cookie'), c.env.SESSION_SECRET, isSecure);
}

function getClientIp(c: Context<{ Bindings: Env }>) {
  return c.req.header('cf-connecting-ip') || '127.0.0.1';
}

async function isReadRateLimited(c: Context<{ Bindings: Env }>, rateLimitKey: string): Promise<boolean> {
  if (!c.env.READ_LIMITER) {
    return false;
  }

  const { success } = await c.env.READ_LIMITER.limit({ key: rateLimitKey });
  return !success;
}

// Cache-Control header helper for heavy edge caching
const EDGE_CACHE_HEADER = 'public, max-age=30, s-maxage=120, stale-while-revalidate=86400';
function purgeHomeEdgeCache(c: Context<{ Bindings: Env }>) {
  if (c.executionCtx) {
    try {
      const cache = caches.default;
      const origin = new URL(c.req.url).origin;
      c.executionCtx.waitUntil(
        Promise.all([
          cache.delete(new Request(origin + '/')),
          cache.delete(new Request(origin + '/feed.xml')),
          cache.delete(new Request(origin + '/sitemap.xml')),
        ]).catch(() => {})
      );
    } catch {
      // Ignore cache purging errors
    }
  }
}

// 1. Home Page SSR Route
app.get('/', async (c) => {
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

  c.header('Cache-Control', EDGE_CACHE_HEADER);

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
    })
  );
});

// 2. Submit Confession Route (with Rate Limiting, Session handling, Gitleaks secret redaction & edge cache purging)
app.post('/confessions', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  // Edge Rate Limiter check (5 posts / minute per IP+session)
  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please wait a minute before submitting another confession.', 429);
    }
  }

  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, unknown>;

  const rawPrompt = typeof body['prompt_used'] === 'string' ? body['prompt_used'].trim() : '';
  const rawWhatHappened = typeof body['what_it_did_instead'] === 'string' ? body['what_it_did_instead'].trim() : '';
  const rawFeeling = typeof body['how_it_made_them_feel'] === 'string' ? body['how_it_made_them_feel'].trim() : '';
  const mood = (typeof body['mood'] === 'string' && body['mood']) || 'furious';
  const modelQuery = typeof body['model_query'] === 'string' ? body['model_query'].trim() : '';
  const turnstileToken = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'].trim() : '';

  // Verify Cloudflare Turnstile token (fail-closed in production)
  const turnstileResult = await verifyTurnstileToken(
    turnstileToken,
    c.env.TURNSTILE_SECRET_KEY,
    clientIp,
    c.env.ENVIRONMENT
  );

  if (!turnstileResult.success) {
    return c.text('Bot verification failed. Please try again.', 400);
  }

  if (!rawPrompt || !rawWhatHappened || !rawFeeling) {
    return c.text('All confession fields are required.', 400);
  }

  if (rawPrompt.length > 4000 || rawWhatHappened.length > 4000 || rawFeeling.length > 2000) {
    return c.text('Input exceeds maximum allowed length.', 400);
  }

  // Redact secrets/API keys/emails using Gitleaks rules & sanitize hate speech/slurs before DB insert
  const prompt_used = sanitizeContent(redactSecrets(rawPrompt).cleanText).cleanText;
  const what_it_did_instead = sanitizeContent(redactSecrets(rawWhatHappened).cleanText).cleanText;
  const how_it_made_them_feel = sanitizeContent(redactSecrets(rawFeeling).cleanText).cleanText;
  let model_provider: string | null = null;
  let model_name: string | null = null;

  if (modelQuery) {
    if (modelQuery.includes('/')) {
      const parts = modelQuery.split('/');
      model_provider = parts[0].trim();
      model_name = parts.slice(1).join('/').trim();
    } else {
      model_name = modelQuery;
    }
  }

  await createConfession(c.env.DB, {
    prompt_used,
    what_it_did_instead,
    how_it_made_them_feel,
    mood,
    model_provider,
    model_name,
  });

  purgeHomeEdgeCache(c);

  return c.redirect('/?notice=Confession+submitted+successfully');
});

// 3. Single Confession Permalink SSR Route
app.get('/confessions/:id', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const id = c.req.param('id');
  const url = new URL(c.req.url);
  const notice = url.searchParams.get('notice') ?? undefined;
  const confession = await getConfessionById(c.env.DB, id);

  if (!confession) {
    c.status(404);
    return c.html(NotFoundView());
  }

  const suggestions = await getSuggestionsForConfession(c.env.DB, id);
  const models = await getModels(c.env.CACHE_KV);

  c.header('Cache-Control', EDGE_CACHE_HEADER);

  return c.html(
    PermalinkView({
      confession,
      suggestions,
      models,
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      notice,
    })
  );
});

// 4. Increment Solidarity Count (Rate limited + 1 vote per session)
app.post('/confessions/:id/solidarity', async (c) => {
  const id = c.req.param('id');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  // 1. Edge Rate Limiter check (30 clicks / minute per IP+session)
  if (c.env.SOLIDARITY_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}`;
    const { success } = await c.env.SOLIDARITY_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please slow down.', 429);
    }
  }
  // 2. D1 Atomic 1-vote-per-session check
  const result = await incrementSolidarity(c.env.DB, id, session.sessionId);

  purgeHomeEdgeCache(c);

  const isJson = c.req.header('accept')?.includes('application/json');
  if (isJson) {
    return c.json({
      success: true,
      count: result.count,
      added: result.added,
      alreadyVoted: result.alreadyVoted ?? false,
    });
  }

  return c.redirect(`/confessions/${id}`);
});

// 5. Report Confession Route
app.post('/confessions/:id/report', async (c) => {
  const id = c.req.param('id');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}:rep`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please wait a minute before submitting another report.', 429);
    }
  }

  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, unknown>;
  const reason = (typeof body['reason'] === 'string' && body['reason'].trim()) || 'Inappropriate content';

  if (reason.length > 500) {
    return c.text('Report reason exceeds maximum allowed length of 500 characters.', 400);
  }

  await createReport(c.env.DB, { confessionId: id, reason, sessionId: session.sessionId });

  const isJson = c.req.header('accept')?.includes('application/json');
  if (isJson) {
    return c.json({ success: true, message: 'Report submitted successfully' });
  }

  return c.redirect('/?notice=Report+submitted+for+review');
});

// 5. Submit Suggestion ("Ackchyually...") with Gitleaks secret redaction & cache purging
app.post('/confessions/:id/suggestions', async (c) => {
  const confession_id = c.req.param('id');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}:sug`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please wait a minute before submitting another suggestion.', 429);
    }
  }

  const bodyData = (await c.req.parseBody().catch(() => ({}))) as Record<string, unknown>;

  const suggestion_type = (typeof bodyData['suggestion_type'] === 'string' && bodyData['suggestion_type'] === 'model') ? 'model' : 'prompt';
  const rawBodyText = typeof bodyData['body'] === 'string' ? bodyData['body'].trim() : '';

  if (!rawBodyText) {
    return c.text('Suggestion body is required.', 400);
  }

  if (rawBodyText.length > 2000) {
    return c.text('Suggestion exceeds maximum allowed length of 2000 characters.', 400);
  }

  const bodyText = sanitizeContent(redactSecrets(rawBodyText).cleanText).cleanText;

  await createSuggestion(c.env.DB, {
    confession_id,
    suggestion_type,
    body: bodyText,
  });

  purgeHomeEdgeCache(c);

  return c.redirect(`/confessions/${confession_id}`);
});

// 6. Report Suggestion ("Ackchyually...") Route
app.post('/confessions/:confessionId/suggestions/:suggestionId/report', async (c) => {
  const confessionId = c.req.param('confessionId');
  const suggestionId = c.req.param('suggestionId');
  const clientIp = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}:rep`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please wait a minute before submitting another report.', 429);
    }
  }

  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, unknown>;
  const reason = (typeof body['reason'] === 'string' && body['reason'].trim()) || 'Inappropriate content';

  if (reason.length > 500) {
    return c.text('Report reason exceeds maximum allowed length of 500 characters.', 400);
  }

  await createSuggestionReport(c.env.DB, {
    suggestionId,
    confessionId,
    reason,
    sessionId: session.sessionId,
  });
  const isJson = c.req.header('accept')?.includes('application/json');
  if (isJson) {
    return c.json({ success: true, message: 'Suggestion report submitted successfully' });
  }

  return c.redirect(`/confessions/${confessionId}?notice=${encodeURIComponent('Report submitted for review.')}`);
});

// 6. RSS 2.0 XML Feed Endpoint
app.get('/feed.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/feed.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const baseUrl = new URL(c.req.url).origin;
  const rssXml = generateRssFeed(confessions, baseUrl);

  c.header('Content-Type', 'application/rss+xml; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.body(rssXml);
});

app.get('/rss.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/rss.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  return c.redirect('/feed.xml');
});

// 7. Dynamic XML Sitemap Endpoint
app.get('/sitemap.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/sitemap.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const baseUrl = new URL(c.req.url).origin;
  const sitemapXml = generateSitemapXml(confessions, baseUrl);

  c.header('Content-Type', 'application/xml; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.body(sitemapXml);
});

// 8. Robots.txt Crawler Directives
app.get('/robots.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/robots.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=86400');
  return c.text(robotsTxt);
});

// 9. Dynamic SVG Social Card Banner Endpoint
app.get('/confessions/:id/og.svg', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions/og.svg`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const id = c.req.param('id');
  const confession = await getConfessionById(c.env.DB, id);

  if (!confession) {
    return c.text('Not Found', 404);
  }

  const svg = generateOgImageSvg(confession);
  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return c.body(svg);
});

// 10. Models JSON API Endpoint
app.get('/api/models', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/api/models`)) {
    return c.json({ error: 'Rate limit exceeded. Please slow down.' }, 429);
  }

  const models = await getModels(c.env.CACHE_KV);
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.json({ models });
});

// 11. Confessions JSON API Endpoint
app.get('/api/confessions', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/api/confessions`)) {
    return c.json({ error: 'Rate limit exceeded. Please slow down.' }, 429);
  }

  const url = new URL(c.req.url);
  const query = url.searchParams.get('q') ?? undefined;
  const mood = url.searchParams.get('mood') ?? undefined;
  const model = url.searchParams.get('model') ?? undefined;
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const result = await getConfessions(c.env.DB, { query, mood, model, cursor, limit: 50 });
  c.header('Cache-Control', EDGE_CACHE_HEADER);
  return c.json(result);
});

// 12. Branded 404 & 500 Error Handlers
app.notFound((c) => {
  c.status(404);
  return c.html(NotFoundView());
});

app.onError((err, c) => {
  console.error('Unhandled server error:', err);
  c.status(500);
  return c.text('500 Internal Server Error', 500);
});
