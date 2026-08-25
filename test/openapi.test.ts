import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
import { generateOpenApiSpec, generateOpenApiYaml } from '../src/services/openapi';

type MockConfession = {
  id: string;
  prompt_used: string;
  what_it_did_instead: string;
  how_it_made_them_feel: string;
  mood: string;
  model_provider: string | null;
  model_name: string | null;
  solidarity_count: number;
  is_hidden: number;
  created_at: string;
};

type MockSuggestion = {
  id: string;
  confession_id: string;
  suggestion_type: 'prompt' | 'model';
  body: string;
  author_name: string | null;
  created_at: string;
};

// Hermetic in-memory D1 Database mock
function createMockD1() {
  const confessions: MockConfession[] = [];
  const suggestions: MockSuggestion[] = [];
  const solidarityVotes = new Set<string>();

  return {
    confessions,
    suggestions,
    prepare(sql: string) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      return {
        bind(...params: unknown[]) {
          return {
            async first<T = Record<string, unknown>>(): Promise<T | null> {
              if (normalizedSql.includes('COUNT(*)')) {
                return { count: confessions.length } as unknown as T;
              }
              if (normalizedSql.includes('SELECT id FROM confessions')) {
                return (confessions.length > 0 ? { id: confessions[0].id } : null) as unknown as T;
              }
              if (normalizedSql.includes('FROM confessions') && normalizedSql.includes('WHERE id = ?')) {
                const id = params[0] as string;
                const found = confessions.find((c) => c.id === id);
                return (found || null) as unknown as T;
              }
              return null;
            },
            async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
              if (normalizedSql.includes('FROM confessions') && normalizedSql.includes('is_hidden = 0')) {
                return { results: confessions as unknown as T[] };
              }
              if (normalizedSql.includes('FROM confession_suggestions')) {
                const confId = params[0] as string;
                const filtered = confId
                  ? suggestions.filter((s) => s.confession_id === confId)
                  : suggestions;
                return { results: filtered as unknown as T[] };
              }
              return { results: [] };
            },
            async run() {
              if (normalizedSql.includes('INSERT INTO confessions')) {
                const [id, prompt, fail, feel, mood, provider, model, createdAt] = params as [
                  string,
                  string,
                  string,
                  string,
                  string,
                  string | null,
                  string | null,
                  string,
                ];
                const newConfession: MockConfession = {
                  id,
                  prompt_used: prompt,
                  what_it_did_instead: fail,
                  how_it_made_them_feel: feel,
                  mood,
                  model_provider: provider,
                  model_name: model,
                  solidarity_count: 0,
                  is_hidden: 0,
                  created_at: createdAt || new Date().toISOString(),
                };
                confessions.push(newConfession);
                return { success: true };
              }
              if (normalizedSql.includes('INSERT INTO confession_suggestions')) {
                const [id, confessionId, type, body, author, createdAt] = params as [
                  string,
                  string,
                  'prompt' | 'model',
                  string,
                  string | null,
                  string,
                ];
                const newSuggestion: MockSuggestion = {
                  id,
                  confession_id: confessionId,
                  suggestion_type: type,
                  body,
                  author_name: author,
                  created_at: createdAt || new Date().toISOString(),
                };
                suggestions.push(newSuggestion);
                return { success: true };
              }
              if (normalizedSql.includes('INSERT OR IGNORE INTO confession_solidarity')) {
                const [confId, sessId] = params as [string, string];
                const key = `${confId}:${sessId}`;
                if (solidarityVotes.has(key)) {
                  return { success: true, meta: { changes: 0 } };
                }
                solidarityVotes.add(key);
                const conf = confessions.find((c) => c.id === confId);
                if (conf) conf.solidarity_count += 1;
                return { success: true, meta: { changes: 1 } };
              }
              return { success: true };
            },
          };
        },
      };
    },
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      const results: unknown[] = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

// Hermetic mock KV with pre-seeded models
function createMockKV() {
  const store = new Map<string, unknown>();
  const mockModels = [
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
  ];
  store.set('openrouter_models_v1', mockModels);

  return {
    async get(key: string, type?: string) {
      const val = store.get(key);
      if (val === undefined || val === null) return null;
      if (type === 'json') {
        return typeof val === 'string' ? JSON.parse(val) : val;
      }
      return typeof val === 'string' ? val : JSON.stringify(val);
    },
    async put(key: string, value: unknown) {
      store.set(key, value);
    },
  };
}
const mockD1 = createMockD1();
const mockKV = createMockKV();
const mockEnv = {
  DB: mockD1,
  CACHE_KV: mockKV,
  ENVIRONMENT: 'test',
  SESSION_SECRET: 'test-session-secret-key-at-least-32-chars-long',
  TURNSTILE_SITE_KEY: '',
  TURNSTILE_SECRET_KEY: '',
};

describe('OpenAPI 3.1.0 Specification Generator', () => {
  it('generates a valid OpenAPI 3.1.0 spec object', () => {
    const spec = generateOpenApiSpec('https://aifails.wtf') as Record<string, any>;
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBe('aifails.wtf — Prompt Confessional API');
    expect(spec.paths['/api/confessions']).toBeDefined();
    expect(spec.paths['/api/confessions'].get.operationId).toBe('listPromptFailures');
    expect(spec.paths['/api/confessions'].post.operationId).toBe('submitPromptFailure');
    expect(spec.paths['/api/random'].get.operationId).toBe('getRandomPromptFailure');
    expect(spec.paths['/confessions/{id}'].get.operationId).toBe('getPromptFailureById');
    expect(spec.paths['/confessions/{id}/solidarity'].post.operationId).toBe('voteSolidarity');
    expect(spec.paths['/confessions/{id}/suggestions'].post.operationId).toBe('submitPromptSuggestion');
    expect(spec.paths['/api/models'].get.operationId).toBe('listCatalogModels');
    expect(spec.components.schemas.Confession).toBeDefined();
    expect(spec.components.schemas.NewConfessionRequest).toBeDefined();

    // Verify mood query example conforms to enum
    const moodParam = spec.paths['/api/confessions'].get.parameters.find((p: any) => p.name === 'mood');
    expect(moodParam.schema.enum).toContain(moodParam.schema.example);

    // Verify SolidarityResponse has success field
    expect(spec.components.schemas.SolidarityResponse.required).toContain('success');
  });

  it('generates clean OpenAPI YAML', () => {
    const yaml = generateOpenApiYaml('https://aifails.wtf');
    expect(yaml).toContain('openapi: 3.1.0');
    expect(yaml).toContain('title: aifails.wtf — Prompt Confessional API');
    expect(yaml).toContain('/api/confessions:');
    expect(yaml).toContain('operationId: listPromptFailures');
  });
});

describe('OpenAPI & Discovery Routes Integration', () => {
  it('GET /openapi.json returns 200 with OpenAPI Content-Type & CORS', async () => {
    const res = await app.request('/openapi.json', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.oai.openapi+json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await res.json();
    expect(json.openapi).toBe('3.1.0');
    expect(json.paths['/api/confessions']).toBeDefined();
  });

  it('GET /.well-known/openapi.json redirects to /openapi.json', async () => {
    const res = await app.request('/.well-known/openapi.json', {}, mockEnv as any);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/openapi.json');
  });

  it('GET /openapi.yaml returns 200 with YAML Content-Type', async () => {
    const res = await app.request('/openapi.yaml', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/yaml');
    const text = await res.text();
    expect(text).toContain('openapi: 3.1.0');
  });

  it('GET /.well-known/api-catalog includes OpenAPI 3.1 in linkset', async () => {
    const res = await app.request('/.well-known/api-catalog', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/linkset+json');

    const json = await res.json();
    const serviceDesc = json.linkset[0]['service-desc'];
    expect(serviceDesc.some((s: any) => s.href.endsWith('/openapi.json'))).toBe(true);
    expect(serviceDesc.some((s: any) => s.href.endsWith('/openapi.yaml'))).toBe(true);
    expect(serviceDesc.some((s: any) => s.href.endsWith('/cli.sh'))).toBe(true);
    const describedBy = json.linkset[0]['describedby'];
    expect(describedBy.some((s: any) => s.href.endsWith('/skill.md'))).toBe(true);
  });

  it('Global Link header includes OpenAPI spec, CLI script, and skill', async () => {
    const res = await app.request('/', {}, mockEnv as any);
    const linkHeader = res.headers.get('Link') || '';
    expect(linkHeader).toContain('</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"');
    expect(linkHeader).toContain('</cli.sh>; rel="service-desc"; type="text/x-shellscript"');
    expect(linkHeader).toContain('</skill.md>; rel="describedby"; type="text/markdown"');
  });
  it('GET /llms.txt documents OpenAPI 3.1 specifications', async () => {
    const res = await app.request('/llms.txt', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('## Machine Specifications & Agent Standards');
    expect(text).toContain('/openapi.json');
    expect(text).toContain('/openapi.yaml');
  });

  it('GET /robots.txt includes OpenAPI directive', async () => {
    const res = await app.request('/robots.txt', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('OpenAPI:');
    expect(text).toContain('/openapi.json');
  });

  it('GET /skill.md returns raw skill markdown definition', async () => {
    const res = await app.request('/skill.md', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    const text = await res.text();
    expect(text).toContain('name: aifails');
    expect(text).toContain('# aifails — LLM Prompt Failures & Anti-Patterns Skill');
  });

  it('GET /cli.sh returns executable POSIX shell script', async () => {
    const res = await app.request('/cli.sh', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/x-shellscript');
    const text = await res.text();
    expect(text).toContain('#!/bin/sh');
    expect(text).toContain('aifails.sh - Interface with aifails.wtf');
  });
});

describe('JSON API Endpoints (Agent Interfacing)', () => {
  let createdConfessionId = '';

  it('POST /api/confessions creates a new confession via JSON payload', async () => {
    const payload = {
      prompt_used: 'Write a quicksort in Rust',
      what_it_did_instead: 'Generated invalid unsafe pointer dereference',
      how_it_made_them_feel: 'Amused and terrified',
      mood: 'amused',
      model_provider: 'anthropic',
      model_name: 'claude-3-5-sonnet',
    };

    const res = await app.request(
      '/api/confessions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.id).toBeDefined();
    createdConfessionId = json.id;
    expect(json.permalink).toContain(`/confessions/${json.id}`);
    expect(json.markdown_url).toContain(`/confessions/${json.id}.md`);
    expect(json.confession.prompt_used).toBe(payload.prompt_used);
    expect(json.confession.mood).toBe('amused');
  });

  it('POST /api/confessions defaults unknown mood string to furious', async () => {
    const payload = {
      prompt_used: 'Test mood fallback',
      what_it_did_instead: 'Broken output',
      how_it_made_them_feel: 'Sad',
      mood: 'invalid_non_enum_mood',
    };

    const res = await app.request(
      '/api/confessions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.confession.mood).toBe('furious');
  });

  it('POST /api/confessions redacts API keys and secrets automatically', async () => {
    const payload = {
      prompt_used: 'Check my API key sk-proj-1234567890abcdef1234567890abcdef',
      what_it_did_instead: 'Refused with secret error',
      how_it_made_them_feel: 'Careless',
      mood: 'furious',
    };

    const res = await app.request(
      '/api/confessions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.confession.prompt_used).not.toContain('sk-proj-1234567890abcdef1234567890abcdef');
    expect(json.confession.prompt_used).toContain('[REDACTED_OPENAI_API_KEY]');
  });

  it('POST /api/confessions rejects missing required fields with 400', async () => {
    const res = await app.request(
      '/api/confessions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_used: 'Incomplete payload' }),
      },
      mockEnv as any
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('POST /confessions/:id/suggestions supports JSON payload and returns 201', async () => {
    expect(createdConfessionId).toBeTruthy();

    const payload = {
      suggestion_type: 'prompt',
      body: 'Use standard library slice sorting: slice.sort()',
    };

    const res = await app.request(
      `/confessions/${createdConfessionId}/suggestions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      mockEnv as any
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.id).toBeDefined();
    expect(json.suggestion.body).toBe(payload.body);
    expect(json.suggestion.suggestion_type).toBe('prompt');
  });

  it('POST /confessions/:id/solidarity increments vote count and returns 200', async () => {
    expect(createdConfessionId).toBeTruthy();

    const res = await app.request(
      `/confessions/${createdConfessionId}/solidarity`,
      {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      },
      mockEnv as any
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(1);
    expect(json.added).toBe(true);
    expect(json.alreadyVoted).toBe(false);
  });

  it('GET /api/confessions returns list with parsed limit', async () => {
    const res = await app.request('/api/confessions?limit=5', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.confessions)).toBe(true);
    expect(json.confessions.length).toBeGreaterThan(0);
    expect(json.hasMore).toBeDefined();
  });

  it('GET /api/models returns hermetic mock model list without network calls', async () => {
    const res = await app.request('/api/models', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.models)).toBe(true);
    expect(json.models.length).toBe(2);
    expect(json.models[0].id).toBe('anthropic/claude-3-5-sonnet');
  });
});
