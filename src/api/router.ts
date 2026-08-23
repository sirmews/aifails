import { Hono, type Context } from 'hono';
import type { Env } from '../types/env';
import {
  getConfessions,
  getConfessionById,
  getRandomConfessionId,
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
import { generateRssFeed, generateSitemapXml, generateOgImageSvg, generateSiteOgImageSvg } from '../services/seo';
import {
  generateLlmsTxt,
  generateLlmsFullTxt,
  formatConfessionMarkdown,
  formatConfessionJson,
} from '../services/agent';
import { OG_DEFAULT_PNG_BYTES } from '../assets/og-default';
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
});

function getSessionHelper(c: Context<{ Bindings: Env }>) {
  const isSecure = c.req.url.startsWith('https://') || c.env.ENVIRONMENT === 'production';
  return getOrCreateSessionId(
    c.req.header('Cookie'),
    c.env.SESSION_SECRET || 'ugh-llms-default-session-hmac-secret-key-2026',
    isSecure
  );
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

// Tiered Edge Cache: 5s browser, 30s Cloudflare CDN edge, with background SWR
const EDGE_CACHE_HEADER = 'public, max-age=5, s-maxage=30, stale-while-revalidate=86400';

function purgeEdgeCache(c: Context<{ Bindings: Env }>, confessionId?: string) {
  if (c.executionCtx) {
    try {
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
      c.executionCtx.waitUntil(Promise.all(purgeRequests).catch(() => {}));
    } catch {
      // Ignore cache purging errors
    }
  }
}
const purgeHomeEdgeCache = purgeEdgeCache;

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
      baseUrl: url.origin,
    })
  );
});

// 2. Submit Confession Route (with Rate Limiting, Session handling, Gitleaks secret redaction & edge cache purging)
app.post('/confessions', async (c) => {
  const clientIp = getClientIp(c);
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
  const turnstileResult = await verifyTurnstileToken({
    token: turnstileToken,
    secretKey: c.env.TURNSTILE_SECRET_KEY,
    remoteIp: clientIp,
    expectedAction: 'confession',
    expectedHostnames: [
      'aifails.wtf',
      'www.aifails.wtf',
      'ugh-llms.sirmews.workers.dev',
      'localhost',
      '127.0.0.1',
      new URL(c.req.url).hostname,
    ],
    environment: c.env.ENVIRONMENT,
  });

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

  purgeEdgeCache(c);

  return c.redirect('/?notice=Confession+submitted+successfully');
});


// 3. Random Confession Route
app.get('/random', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/random`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const excludeId = c.req.query('exclude') || undefined;
  const randomId = await getRandomConfessionId(c.env.DB, excludeId);

  // Set no-cache on the random redirect so every hit picks a fresh random fail
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (randomId) {
    return c.redirect(`/confessions/${randomId}`);
  }

  return c.redirect('/');
});

// 3a. Random Confession API & Markdown Endpoints for AI Agents
app.get('/api/random', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/api/random`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const randomId = await getRandomConfessionId(c.env.DB);
  if (!randomId) return c.json({ error: 'No confessions found' }, 404);
  const confession = await getConfessionById(c.env.DB, randomId);
  if (!confession) return c.json({ error: 'Not found' }, 404);
  const suggestions = await getSuggestionsForConfession(c.env.DB, randomId);
  const baseUrl = new URL(c.req.url).origin;
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  return c.json(formatConfessionJson(confession, suggestions, baseUrl));
});

app.get('/random.json', (c) => c.redirect('/api/random'));

app.get('/random.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/random.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const randomId = await getRandomConfessionId(c.env.DB);
  if (!randomId) return c.text('# Error\n\nNo confessions found.', 404);
  const confession = await getConfessionById(c.env.DB, randomId);
  if (!confession) return c.text('# Error\n\nConfession not found.', 404);
  const suggestions = await getSuggestionsForConfession(c.env.DB, randomId);
  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  return c.text(formatConfessionMarkdown(confession, suggestions, baseUrl));
});

// 3b. Single Confession Permalink Route (Supporting HTML, .md, .json & Content Negotiation)
app.get('/confessions/:id', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  let id = c.req.param('id');
  let format: 'html' | 'md' | 'json' = 'html';

  // Check explicit file extension
  if (id.endsWith('.md')) {
    id = id.slice(0, -3);
    format = 'md';
  } else if (id.endsWith('.json')) {
    id = id.slice(0, -5);
    format = 'json';
  } else {
    // Check Accept header content negotiation
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

  if (format === 'md') {
    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('Cache-Control', EDGE_CACHE_HEADER);
    return c.text(formatConfessionMarkdown(confession, suggestions, url.origin));
  }

  if (format === 'json') {
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

// 4. Increment Solidarity Count (Rate limited + 1 vote per session)
app.post('/confessions/:id/solidarity', async (c) => {
  const id = c.req.param('id');
  const clientIp = getClientIp(c);
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
  const clientIp = getClientIp(c);
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
  const clientIp = getClientIp(c);
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

  const turnstileToken =
    typeof bodyData['cf-turnstile-response'] === 'string'
      ? bodyData['cf-turnstile-response'].trim()
      : '';

  if (c.env.TURNSTILE_SITE_KEY) {
    const turnstileResult = await verifyTurnstileToken({
      token: turnstileToken,
      secretKey: c.env.TURNSTILE_SECRET_KEY,
      remoteIp: clientIp,
      expectedAction: 'suggestion',
      expectedHostnames: [
        'aifails.wtf',
        'www.aifails.wtf',
        'ugh-llms.sirmews.workers.dev',
        'localhost',
        '127.0.0.1',
        new URL(c.req.url).hostname,
      ],
      environment: c.env.ENVIRONMENT,
    });

    if (!turnstileResult.success) {
      return c.text('Bot verification failed. Please try again.', 400);
    }
  }

  const suggestion_type =
    typeof bodyData['suggestion_type'] === 'string' && bodyData['suggestion_type'] === 'model'
      ? 'model'
      : 'prompt';
  const rawBodyText = typeof bodyData['body'] === 'string' ? bodyData['body'].trim() : '';

  if (!rawBodyText) {
    return c.text('Suggestion body cannot be empty.', 400);
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

  purgeEdgeCache(c, confession_id);

  return c.redirect(`/confessions/${confession_id}`);
});

// 6. Report Suggestion ("Ackchyually...") Route
app.post('/confessions/:confessionId/suggestions/:suggestionId/report', async (c) => {
  const confessionId = c.req.param('confessionId');
  const suggestionId = c.req.param('suggestionId');
  const clientIp = getClientIp(c);
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

// 8. LLMs.txt & Agent Catalog Standard Endpoints
app.get('/llms.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/llms.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.text(generateLlmsTxt(baseUrl));
});

app.get('/llms-full.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/llms-full.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const suggestionsMap = await getSuggestionsMapForConfessions(
    c.env.DB,
    confessions.map((conf) => conf.id)
  );
  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.text(generateLlmsFullTxt(confessions, suggestionsMap, baseUrl));
});

app.get('/feed.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/feed.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const suggestionsMap = await getSuggestionsMapForConfessions(
    c.env.DB,
    confessions.map((conf) => conf.id)
  );
  const baseUrl = new URL(c.req.url).origin;
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=300, s-maxage=3600');
  return c.text(generateLlmsFullTxt(confessions, suggestionsMap, baseUrl));
});

app.get('/confessions.md', (c) => c.redirect('/feed.md'));

// 9. Robots.txt Crawler & Agent Directives
app.get('/robots.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/robots.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\nLLMs-Txt: ${baseUrl}/llms.txt\n`;

  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=86400');
  return c.text(robotsTxt);
});
// 9. Site-wide Static 1200x630 Social Preview PNG (100% WhatsApp/iMessage compatible)
app.get('/og.png', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/og.png`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  return new Response(OG_DEFAULT_PNG_BYTES, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
});

app.get('/api/og.png', (c) => c.redirect('/og.png'));

app.get('/og.svg', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/og.svg`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 100 });
  const totalSolidarity = confessions.reduce((sum, item) => sum + item.solidarity_count, 0);

  const svg = generateSiteOgImageSvg({
    confessionCount: confessions.length,
    solidarityCount: totalSolidarity,
  });

  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.body(svg);
});

app.get('/api/og.svg', (c) => c.redirect('/og.svg'));

// 9b. Dynamic Confession Social PNG & SVG Card Endpoints
app.get('/confessions/:id/og.png', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions/og.png`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  return new Response(OG_DEFAULT_PNG_BYTES, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
});
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
