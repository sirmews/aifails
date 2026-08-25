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
  generateSkillMarkdown,
  generateCliScript,
  formatConfessionMarkdown,
  formatConfessionJson,
} from '../services/agent';
import { generateOpenApiSpec, generateOpenApiYaml } from '../services/openapi';
import { generateChangelogMarkdown } from '../services/changelog';
import { handleMcpJsonRpc, type JsonRpcRequest } from '../services/mcp';
import { OG_DEFAULT_PNG_BYTES } from '../assets/og-default';
import { HomeView } from '../views/HomeView';
import { PermalinkView } from '../views/PermalinkView';
import { McpView } from '../views/McpView';
import { ChangelogView } from '../views/ChangelogView';
import { NotFoundView } from '../views/NotFoundView';
export const app = new Hono<{ Bindings: Env }>();

// Global Security & Agent Discovery Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  // RFC 8288 & RFC 9727 Section 3 Link Headers for Agent Discovery
  c.header(
    'Link',
    '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </cli.sh>; rel="service-desc"; type="text/x-shellscript", </.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json", </llms.txt>; rel="service-desc"; type="text/plain", </llms-full.txt>; rel="service-doc"; type="text/plain", </feed.md>; rel="describedby"; type="text/markdown", </skill.md>; rel="describedby"; type="text/markdown"'
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
  return c.newResponse(formatConfessionMarkdown(confession, suggestions, baseUrl), 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
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
  const isJson = c.req.header('content-type')?.includes('application/json');

  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = isJson ? `${clientIp}:sug` : `${clientIp}:${session.sessionId}:sug`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      if (isJson) {
        return c.json({ error: 'Rate limit exceeded. Please wait a minute before submitting another suggestion.' }, 429);
      }
      return c.text('Rate limit exceeded. Please wait a minute before submitting another suggestion.', 429);
    }
  }

  let suggestion_type: 'prompt' | 'model' = 'prompt';
  let rawBodyText = '';

  if (isJson) {
    const jsonBody = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    suggestion_type = jsonBody['suggestion_type'] === 'model' ? 'model' : 'prompt';
    rawBodyText = typeof jsonBody['body'] === 'string' ? jsonBody['body'].trim() : '';
  } else {
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

    suggestion_type =
      typeof bodyData['suggestion_type'] === 'string' && bodyData['suggestion_type'] === 'model'
        ? 'model'
        : 'prompt';
    rawBodyText = typeof bodyData['body'] === 'string' ? bodyData['body'].trim() : '';
  }

  if (!rawBodyText) {
    if (isJson) {
      return c.json({ error: 'Suggestion body cannot be empty.' }, 400);
    }
    return c.text('Suggestion body cannot be empty.', 400);
  }
  if (rawBodyText.length > 2000) {
    if (isJson) {
      return c.json({ error: 'Suggestion exceeds maximum allowed length of 2000 characters.' }, 400);
    }
    return c.text('Suggestion exceeds maximum allowed length of 2000 characters.', 400);
  }

  const bodyText = sanitizeContent(redactSecrets(rawBodyText).cleanText).cleanText;

  const suggestion = await createSuggestion(c.env.DB, {
    confession_id,
    suggestion_type,
    body: bodyText,
  });

  purgeEdgeCache(c, confession_id);

  if (isJson) {
    return c.json({ success: true, id: suggestion.id, suggestion }, 201);
  }

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

// 8a. RFC 9727 API Catalog Endpoint (application/linkset+json)
app.get('/.well-known/api-catalog', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/.well-known/api-catalog`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const catalog = {
    linkset: [
      {
        anchor: baseUrl,
        'api-catalog': [
          {
            href: `${baseUrl}/.well-known/api-catalog`,
            type: 'application/linkset+json',
          },
        ],
        'service-desc': [
          {
            href: `${baseUrl}/openapi.json`,
            type: 'application/vnd.oai.openapi+json',
          },
          {
            href: `${baseUrl}/openapi.json`,
            type: 'application/json',
          },
          {
            href: `${baseUrl}/openapi.yaml`,
            type: 'application/yaml',
          },
          {
            href: `${baseUrl}/.well-known/mcp/server-card.json`,
            type: 'application/json',
          },
          {
            href: `${baseUrl}/llms.txt`,
            type: 'text/plain',
          },
          {
            href: `${baseUrl}/cli.sh`,
            type: 'text/x-shellscript',
          },
        ],
        'service-doc': [
          {
            href: `${baseUrl}/llms-full.txt`,
            type: 'text/plain',
          },
        ],
        describedby: [
          {
            href: `${baseUrl}/feed.md`,
            type: 'text/markdown',
          },
          {
            href: `${baseUrl}/skill.md`,
            type: 'text/markdown',
          },
        ],
      },
    ],
  };

  return c.newResponse(JSON.stringify(catalog, null, 2), 200, {
    'Content-Type': 'application/linkset+json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
  });
});

// 8b. Model Context Protocol (MCP) Server & Discovery Card Endpoints
app.get('/mcp', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/mcp`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const acceptHeader = c.req.header('accept') || '';
  if (acceptHeader.includes('application/json')) {
    return c.redirect('/.well-known/mcp/server-card.json');
  }
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.html(McpView());
});

app.get('/skills', (c) => c.redirect('/mcp'));
app.get('/agents', (c) => c.redirect('/mcp'));

app.post('/mcp', async (c) => {
  const clientIp = getClientIp(c);
  if (await isReadRateLimited(c, `read:${clientIp}:/mcp`)) {
    return c.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32000, message: 'Rate limit exceeded. Please slow down.' },
      },
      429
    );
  }

  let body: JsonRpcRequest;
  try {
    body = (await c.req.json()) as JsonRpcRequest;
  } catch {
    return c.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: invalid JSON' },
      },
      400
    );
  }

  const baseUrl = new URL(c.req.url).origin;
  const session = await getSessionHelper(c);

  const isWriteRateLimited = async () => {
    if (!c.env.CONFESSION_LIMITER) return false;
    const rateLimitKey = `${clientIp}:${session.sessionId}:mcp`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    return !success;
  };

  const response = await handleMcpJsonRpc(c.env.DB, body, baseUrl, {
    isWriteRateLimited,
    onConfessionCreated: () => purgeEdgeCache(c),
  });

  if (!response) {
    return c.body(null, 204);
  }

  c.header('Content-Type', 'application/json; charset=utf-8');
  c.header('Access-Control-Allow-Origin', '*');
  return c.json(response);
});

app.options('/mcp', (c) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  c.header('Access-Control-Max-Age', '86400');
  return c.body(null, 204);
});

app.get('/.well-known/mcp/server-card.json', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/.well-known/mcp/server-card.json`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const serverCard = {
    serverInfo: {
      name: 'aifails-mcp',
      title: 'Prompt Confessional MCP',
      description: 'LLM failure catalog, anti-pattern guardrails, and community prompt fixes',
      version: '1.0.0',
    },
    transport: {
      type: 'http',
      url: `${baseUrl}/mcp`,
    },
    capabilities: {
      tools: true,
    },
  };
  return c.newResponse(JSON.stringify(serverCard, null, 2), 200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
  });
});

app.get('/.well-known/mcp.json', (c) => c.redirect('/.well-known/mcp/server-card.json'));
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
  return c.newResponse(generateLlmsFullTxt(confessions, suggestionsMap, baseUrl), 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
  });
});

app.get('/confessions.md', (c) => c.redirect('/feed.md'));

// 8c. OpenAPI 3.1 Specification Endpoints (JSON & YAML)
app.get('/openapi.json', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/openapi.json`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const spec = generateOpenApiSpec(baseUrl);
  return c.newResponse(JSON.stringify(spec, null, 2), 200, {
    'Content-Type': 'application/vnd.oai.openapi+json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
  });
});

app.get('/.well-known/openapi.json', (c) => c.redirect('/openapi.json'));

app.get('/openapi.yaml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/openapi.yaml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const yaml = generateOpenApiYaml(baseUrl);
  return c.newResponse(yaml, 200, {
    'Content-Type': 'application/yaml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
  });
});

app.get('/.well-known/openapi.yaml', (c) => c.redirect('/openapi.yaml'));

// Helper for SHA-256 script integrity and ETag headers
async function computeSha256Digest(content: string): Promise<{ hex: string; base64: string }> {
  const encoded = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const base64 = btoa(String.fromCharCode(...hashArray));
  return { hex, base64 };
}

// 8d. Agent Skill & CLI Download Endpoints
app.get('/skill.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/skill.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const skill = generateSkillMarkdown(baseUrl);
  const { hex, base64 } = await computeSha256Digest(skill);
  return c.newResponse(skill, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
    'ETag': `"${hex}"`,
    'Digest': `sha-256=${base64}`,
    'X-Content-Type-Options': 'nosniff',
  });
});

app.get('/.well-known/skill.md', (c) => c.redirect('/skill.md'));

app.get('/cli.sh', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/cli.sh`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  const script = generateCliScript(baseUrl);
  const { hex, base64 } = await computeSha256Digest(script);
  return c.newResponse(script, 200, {
    'Content-Type': 'text/x-shellscript; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
    'ETag': `"${hex}"`,
    'Digest': `sha-256=${base64}`,
    'X-Content-Type-Options': 'nosniff',
  });
});

app.get('/bin/aifails.sh', (c) => c.redirect('/cli.sh'));

// 8e. Product Changelog Endpoints (HTML & Markdown)
app.get('/changelog', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/changelog`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const acceptHeader = c.req.header('Accept') || '';
  const baseUrl = new URL(c.req.url).origin;

  if (acceptHeader.includes('text/markdown')) {
    return c.newResponse(generateChangelogMarkdown(baseUrl), 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    });
  }

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.html(ChangelogView());
});

app.get('/changelog.md', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/changelog.md`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  const baseUrl = new URL(c.req.url).origin;
  return c.newResponse(generateChangelogMarkdown(baseUrl), 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Access-Control-Allow-Origin': '*',
  });
});

// 9. Robots.txt Crawler, Content-Signal & Agent Directives
app.get('/robots.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/robots.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const robotsTxt = `# As a condition of accessing this website, you agree to
# abide by the following content signals:

# (a)  If a content-signal = yes, you may collect content
# for the corresponding use.
# (b)  If a content-signal = no, you may not collect content
# for the corresponding use.
# (c)  If the website operator does not include a content
# signal for a corresponding use, the website operator
# neither grants nor restricts permission via content signal
# with respect to the corresponding use.

# The content signals and their meanings are:

# search: building a search index and providing search
# results (e.g., returning hyperlinks and short excerpts
# from your website's contents).  Search does not include
# providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models
# (e.g., retrieval augmented generation, grounding, or other
# real-time taking of content for generative AI search
# answers).
# ai-train: training or fine-tuning AI models.

# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS
# RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN
# UNION DIRECTIVE 2019/790 ON COPYRIGHT AND RELATED RIGHTS
# IN THE DIGITAL SINGLE MARKET.

User-agent: *
Content-Signal: ai-train=no, search=yes, ai-input=yes
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
LLMs-Txt: ${baseUrl}/llms.txt
OpenAPI: ${baseUrl}/openapi.json
`;

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

  const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);
  const limit = Math.min(Math.max(isNaN(limitParam) ? 20 : limitParam, 1), 50);

  const result = await getConfessions(c.env.DB, { query, mood, model, cursor, limit });
  c.header('Cache-Control', EDGE_CACHE_HEADER);
  return c.json(result);
});

app.post('/api/confessions', async (c) => {
  const clientIp = getClientIp(c);
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  // Edge Rate Limiter check (5 posts / minute per IP+session)
  if (c.env.CONFESSION_LIMITER) {
    const rateLimitKey = `${clientIp}:api`;
    const { success } = await c.env.CONFESSION_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.json({ error: 'Rate limit exceeded. Please wait a minute before submitting another confession.' }, 429);
    }
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const rawPrompt = typeof body['prompt_used'] === 'string' ? body['prompt_used'].trim() : '';
  const rawWhatHappened = typeof body['what_it_did_instead'] === 'string' ? body['what_it_did_instead'].trim() : '';
  const rawFeeling = typeof body['how_it_made_them_feel'] === 'string' ? body['how_it_made_them_feel'].trim() : '';
  const allowedMoods = new Set(['furious', 'defeated', 'bewildered', 'amused', 'numb', 'vengeful']);
  const rawMood = typeof body['mood'] === 'string' ? body['mood'].trim() : '';
  const mood = allowedMoods.has(rawMood) ? rawMood : 'furious';
  const modelQuery = typeof body['model_query'] === 'string' ? body['model_query'].trim() : '';
  const explicitProvider = typeof body['model_provider'] === 'string' ? body['model_provider'].trim() : '';
  const explicitModel = typeof body['model_name'] === 'string' ? body['model_name'].trim() : '';

  if (!rawPrompt || !rawWhatHappened || !rawFeeling) {
    return c.json({ error: 'All confession fields (prompt_used, what_it_did_instead, how_it_made_them_feel) are required.' }, 400);
  }

  if (rawPrompt.length > 4000 || rawWhatHappened.length > 4000 || rawFeeling.length > 2000) {
    return c.json({ error: 'Input exceeds maximum allowed length.' }, 400);
  }

  // Redact secrets/API keys/emails using Gitleaks rules & sanitize hate speech/slurs before DB insert
  const prompt_used = sanitizeContent(redactSecrets(rawPrompt).cleanText).cleanText;
  const what_it_did_instead = sanitizeContent(redactSecrets(rawWhatHappened).cleanText).cleanText;
  const how_it_made_them_feel = sanitizeContent(redactSecrets(rawFeeling).cleanText).cleanText;
  let model_provider: string | null = explicitProvider || null;
  let model_name: string | null = explicitModel || null;

  if (!model_name && modelQuery) {
    if (modelQuery.includes('/')) {
      const parts = modelQuery.split('/');
      model_provider = parts[0].trim();
      model_name = parts.slice(1).join('/').trim();
    } else {
      model_name = modelQuery;
    }
  }

  const confession = await createConfession(c.env.DB, {
    prompt_used,
    what_it_did_instead,
    how_it_made_them_feel,
    mood,
    model_provider,
    model_name,
  });

  purgeEdgeCache(c);

  const baseUrl = new URL(c.req.url).origin;
  return c.json(
    {
      success: true,
      id: confession.id,
      permalink: `${baseUrl}/confessions/${confession.id}`,
      markdown_url: `${baseUrl}/confessions/${confession.id}.md`,
      confession,
    },
    201
  );
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
