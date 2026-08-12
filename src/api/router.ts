import { Hono, type Context } from 'hono';
import type { Env } from '../types/env';
import { getConfessions, getConfessionById, getSuggestionsForConfession, createConfession, incrementSolidarity, createSuggestion } from '../db';
import { getModels } from '../services/models';
import { verifyTurnstileToken } from '../auth/turnstile';
import { redactSecrets } from '../utils/gitleaks';
import { HomeView } from '../views/HomeView';
import { PermalinkView } from '../views/PermalinkView';
import { NotFoundView } from '../views/NotFoundView';

export const app = new Hono<{ Bindings: Env }>();

// Cache-Control header helper for heavy edge caching
const EDGE_CACHE_HEADER = 'public, max-age=30, s-maxage=120, stale-while-revalidate=86400';

function purgeHomeEdgeCache(c: Context<{ Bindings: Env }>) {
  if (c.executionCtx) {
    try {
      const cache = caches.default;
      const homeCacheKey = new Request(new URL('/', c.req.url).href);
      c.executionCtx.waitUntil(cache.delete(homeCacheKey).catch(() => {}));
    } catch {
      // Ignore cache purging errors
    }
  }
}

// 1. Home Page SSR Route
app.get('/', async (c) => {
  const url = new URL(c.req.url);
  const notice = url.searchParams.get('notice') ?? undefined;

  const confessions = await getConfessions(c.env.DB, 50);
  const models = await getModels(c.env.CACHE_KV);

  c.header('Cache-Control', EDGE_CACHE_HEADER);

  return c.html(
    HomeView({
      confessions,
      models,
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
      notice,
    })
  );
});

// 1.1 Permalink SSR Route
app.get('/confessions/:id', async (c) => {
  const id = c.req.param('id');
  const confession = await getConfessionById(c.env.DB, id);

  if (!confession) {
    return c.html(NotFoundView(), 404);
  }

  const suggestions = await getSuggestionsForConfession(c.env.DB, id);
  const models = await getModels(c.env.CACHE_KV);

  c.header('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=86400');

  return c.html(
    PermalinkView({
      confession,
      suggestions,
      models,
      turnstileSiteKey: c.env.TURNSTILE_SITE_KEY,
    })
  );
});

// 2. Submit Confession Route (with Gitleaks secret redaction & edge cache purging)
app.post('/confessions', async (c) => {
  const body = await c.req.parseBody();

  const rawPrompt = (body['prompt_used'] as string)?.trim() ?? '';
  const rawWhatHappened = (body['what_it_did_instead'] as string)?.trim() ?? '';
  const rawFeeling = (body['how_it_made_them_feel'] as string)?.trim() ?? '';
  const mood = (body['mood'] as string) || 'furious';
  const modelQuery = (body['model_query'] as string)?.trim();
  const turnstileToken = (body['cf-turnstile-response'] as string)?.trim();

  // Verify Cloudflare Turnstile token
  const clientIp = c.req.header('cf-connecting-ip');
  const turnstileResult = await verifyTurnstileToken(
    turnstileToken,
    c.env.TURNSTILE_SECRET_KEY,
    clientIp
  );

  if (!turnstileResult.success) {
    return c.text('Bot verification failed. Please try again.', 400);
  }

  if (!rawPrompt || !rawWhatHappened || !rawFeeling) {
    return c.text('All confession fields are required.', 400);
  }

  // Redact secrets/API keys/emails using Gitleaks rules before DB insert
  const prompt_used = redactSecrets(rawPrompt).cleanText;
  const what_it_did_instead = redactSecrets(rawWhatHappened).cleanText;
  const how_it_made_them_feel = redactSecrets(rawFeeling).cleanText;

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

// 3. Increment Solidarity Count
app.post('/confessions/:id/solidarity', async (c) => {
  const id = c.req.param('id');
  const count = await incrementSolidarity(c.env.DB, id);

  purgeHomeEdgeCache(c);

  const isJson = c.req.header('accept')?.includes('application/json');
  if (isJson) {
    return c.json({ success: true, count });
  }

  return c.redirect('/');
});

// 4. Submit Suggestion ("Ackchyually...") with Gitleaks secret redaction & cache purging
app.post('/confessions/:id/suggestions', async (c) => {
  const confession_id = c.req.param('id');
  const bodyData = await c.req.parseBody();

  const suggestion_type = (bodyData['suggestion_type'] as 'prompt' | 'model') || 'prompt';
  const rawBodyText = (bodyData['body'] as string)?.trim() ?? '';
  const author_name = redactSecrets((bodyData['author_name'] as string)?.trim() ?? '').cleanText;

  if (!rawBodyText) {
    return c.text('Suggestion body is required.', 400);
  }

  const bodyText = redactSecrets(rawBodyText).cleanText;

  await createSuggestion(c.env.DB, {
    confession_id,
    suggestion_type,
    body: bodyText,
    author_name: author_name || null,
  });

  purgeHomeEdgeCache(c);

  return c.redirect('/?notice=Correction+submitted+successfully');
});

// 5. Models JSON API Endpoint
app.get('/api/models', async (c) => {
  const models = await getModels(c.env.CACHE_KV);
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.json({ models });
});

// 6. Confessions JSON API Endpoint
app.get('/api/confessions', async (c) => {
  const confessions = await getConfessions(c.env.DB, 50);
  c.header('Cache-Control', EDGE_CACHE_HEADER);
  return c.json({ confessions });
});
