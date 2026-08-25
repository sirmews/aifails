import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
import { generateOpenApiSpec, generateOpenApiYaml } from '../src/services/openapi';

// Mock in-memory D1 Database for hermetic router tests
function createMockD1(): any {
  const confessions: any[] = [];
  const suggestions: any[] = [];
  const solidarityVotes = new Set<string>();

  return {
    prepare(sql: string) {
      return {
        bind(...params: any[]) {
          return {
            async first() {
              if (sql.includes('COUNT(*)')) {
                return { count: confessions.length };
              }
              if (sql.includes('SELECT id FROM confessions')) {
                return confessions.length > 0 ? { id: confessions[0].id } : null;
              }
              if (sql.includes('SELECT * FROM confessions WHERE id =')) {
                const id = params[0];
                return confessions.find((c) => c.id === id) || null;
              }
              return null;
            },
            async all() {
              if (sql.includes('FROM confessions WHERE is_hidden = 0')) {
                return { results: confessions };
              }
              if (sql.includes('FROM confession_suggestions')) {
                return { results: suggestions };
              }
              return { results: [] };
            },
            async run() {
              if (sql.includes('INSERT INTO confessions')) {
                const [id, prompt, fail, feel, mood, provider, model] = params;
                const newConfession = {
                  id,
                  prompt_used: prompt,
                  what_it_did_instead: fail,
                  how_it_made_them_feel: feel,
                  mood,
                  model_provider: provider,
                  model_name: model,
                  solidarity_count: 0,
                  is_hidden: 0,
                  created_at: new Date().toISOString(),
                };
                confessions.push(newConfession);
                return { success: true };
              }
              if (sql.includes('INSERT OR IGNORE INTO confession_solidarity')) {
                const [confId, sessId] = params;
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
    async batch(statements: any[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

// Mock KV namespace
function createMockKV(): any {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.get(key) || null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
  };
}

const mockEnv = {
  DB: createMockD1(),
  CACHE_KV: createMockKV(),
  ENVIRONMENT: 'test',
  SESSION_SECRET: 'test-session-secret-key-at-least-32-chars-long',
  TURNSTILE_SITE_KEY: '',
  TURNSTILE_SECRET_KEY: '',
};

describe('OpenAPI 3.1.0 Specification Generator', () => {
  it('generates a valid OpenAPI 3.1.0 spec object', () => {
    const spec = generateOpenApiSpec('https://aifails.wtf') as any;
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
  });

  it('Global Link header includes OpenAPI spec', async () => {
    const res = await app.request('/', {}, mockEnv as any);
    const linkHeader = res.headers.get('Link') || '';
    expect(linkHeader).toContain('</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"');
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
});

describe('JSON API Endpoints (Agent Interfacing)', () => {
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
    expect(json.permalink).toContain(`/confessions/${json.id}`);
    expect(json.markdown_url).toContain(`/confessions/${json.id}.md`);
    expect(json.confession.prompt_used).toBe(payload.prompt_used);
    expect(json.confession.mood).toBe('amused');
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

  it('GET /api/confessions returns list with nextCursor', async () => {
    const res = await app.request('/api/confessions', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.confessions)).toBe(true);
    expect(json.hasMore).toBeDefined();
  });

  it('GET /api/models returns model list', async () => {
    const res = await app.request('/api/models', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.models)).toBe(true);
  });
});
