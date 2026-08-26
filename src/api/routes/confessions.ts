import { Hono } from 'hono';
import type { Env } from '../../types/env';
import {
  getConfessions,
  getConfessionById,
  getRandomConfessionId,
  createConfession,
  incrementSolidarity,
  createSuggestion,
  getSuggestionsForConfession,
  createReport,
  createSuggestionReport,
} from '../../db';
import { getModels } from '../../services/models';
import { verifyTurnstileToken } from '../../auth/turnstile';
import { redactSecrets } from '../../utils/gitleaks';
import { sanitizeContent } from '../../utils/moderation';
import { formatConfessionMarkdown, formatConfessionJson } from '../../services/agent';
import {
  getClientIp,
  getSessionHelper,
  isReadRateLimited,
  purgeEdgeCache,
  EDGE_CACHE_HEADER,
} from '../helpers';

export const confessionsRouter = new Hono<{ Bindings: Env }>();

// 1. Submit Confession Route
confessionsRouter.post('/confessions', async (c) => {
  const clientIp = getClientIp(c);
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

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

// 2. Random Confession Routes
confessionsRouter.get('/random', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/random`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const excludeId = c.req.query('exclude') || undefined;
  const randomId = await getRandomConfessionId(c.env.DB, excludeId);

  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (randomId) {
    return c.redirect(`/confessions/${randomId}`);
  }

  return c.redirect('/');
});

confessionsRouter.get('/api/random', async (c) => {
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

confessionsRouter.get('/random.json', (c) => c.redirect('/api/random'));

confessionsRouter.get('/random.md', async (c) => {
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

// 3. Increment Solidarity Count
confessionsRouter.post('/confessions/:id/solidarity', async (c) => {
  const id = c.req.param('id');
  const clientIp = getClientIp(c);
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

  if (c.env.SOLIDARITY_LIMITER) {
    const rateLimitKey = `${clientIp}:${session.sessionId}`;
    const { success } = await c.env.SOLIDARITY_LIMITER.limit({ key: rateLimitKey });
    if (!success) {
      return c.text('Rate limit exceeded. Please slow down.', 429);
    }
  }

  const result = await incrementSolidarity(c.env.DB, id, session.sessionId);
  purgeEdgeCache(c, id);

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

// 4. Report Confession Route
confessionsRouter.post('/confessions/:id/report', async (c) => {
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

// 5. Submit Suggestion ("Ackchyually...")
confessionsRouter.post('/confessions/:id/suggestions', async (c) => {
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

// 6. Report Suggestion
confessionsRouter.post('/confessions/:confessionId/suggestions/:suggestionId/report', async (c) => {
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
    return c.json({ success: true, message: 'Report submitted successfully' });
  }

  return c.redirect(`/confessions/${confessionId}?notice=Report+submitted+for+review`);
});

// 7. Models JSON API Endpoint
confessionsRouter.get('/api/models', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/api/models`)) {
    return c.json({ error: 'Rate limit exceeded. Please slow down.' }, 429);
  }

  const models = await getModels(c.env.CACHE_KV);
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return c.json({ models });
});

// 8. Confessions JSON API Endpoint
confessionsRouter.get('/api/confessions', async (c) => {
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

confessionsRouter.post('/api/confessions', async (c) => {
  const clientIp = getClientIp(c);
  const session = await getSessionHelper(c);
  if (session.setCookieHeader) {
    c.header('Set-Cookie', session.setCookieHeader);
  }

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
  const ALLOWED_MOODS: Record<string, true> = {
    furious: true,
    defeated: true,
    bewildered: true,
    amused: true,
    numb: true,
    vengeful: true,
  };
  const rawMood = typeof body['mood'] === 'string' ? body['mood'].trim() : '';
  const mood = ALLOWED_MOODS[rawMood] ? rawMood : 'furious';
  const modelQuery = typeof body['model_query'] === 'string' ? body['model_query'].trim() : '';
  const explicitProvider = typeof body['model_provider'] === 'string' ? body['model_provider'].trim() : '';
  const explicitModel = typeof body['model_name'] === 'string' ? body['model_name'].trim() : '';

  if (!rawPrompt || !rawWhatHappened || !rawFeeling) {
    return c.json({ error: 'All confession fields (prompt_used, what_it_did_instead, how_it_made_them_feel) are required.' }, 400);
  }

  if (rawPrompt.length > 4000 || rawWhatHappened.length > 4000 || rawFeeling.length > 2000) {
    return c.json({ error: 'Input exceeds maximum allowed length.' }, 400);
  }

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
