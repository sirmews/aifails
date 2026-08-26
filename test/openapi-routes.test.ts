import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
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

    const json = (await res.json()) as { linkset: Array<{ 'service-desc': Array<{ href: string }>; describedby: Array<{ href: string }> }> };
    const serviceDesc = json.linkset[0]['service-desc'];
    expect(serviceDesc.some((s) => s.href.endsWith('/openapi.json'))).toBe(true);
    expect(serviceDesc.some((s) => s.href.endsWith('/openapi.yaml'))).toBe(true);
    expect(serviceDesc.some((s) => s.href.endsWith('/.well-known/agent-skills/index.json'))).toBe(true);
    expect(serviceDesc.some((s) => s.href.endsWith('/cli.sh'))).toBe(true);
    const describedBy = json.linkset[0]['describedby'];
    expect(describedBy.some((s) => s.href.endsWith('/skill.md'))).toBe(true);
    expect(describedBy.some((s) => s.href.endsWith('/.well-known/agent-skills/aifails/SKILL.md'))).toBe(true);
  });

  it('Global Link header and SEO meta tags include canonical, robots, and OpenAPI spec', async () => {
    const res = await app.request('/', {}, mockEnv as any);
    const linkHeader = res.headers.get('Link') || '';
    expect(linkHeader).toContain('</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"');
    expect(linkHeader).toContain('</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"');
    expect(linkHeader).toContain('</cli.sh>; rel="service-desc"; type="text/x-shellscript"');
    expect(linkHeader).toContain('</skill.md>; rel="describedby"; type="text/markdown"');

    const html = await res.text();
    expect(html).toContain('<link rel="canonical" href="https://aifails.wtf/"');
    expect(html).toContain('max-image-preview:large');
    expect(html).toContain('SearchAction');
  });

  it('GET /sitemap.xml includes top-level routes and confessions', async () => {
    const res = await app.request('/sitemap.xml', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/xml');
    const xml = await res.text();
    expect(xml).toContain('/changelog');
    expect(xml).toContain('/mcp');
    expect(xml).toContain('/openapi.json');
    expect(xml).toContain('/.well-known/agent-skills/index.json');
  });

  it('GET /llms.txt documents OpenAPI 3.1 specifications', async () => {
    const res = await app.request('/llms.txt', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('## Machine Specifications & Agent Standards');
    expect(text).toContain('/openapi.json');
    expect(text).toContain('/.well-known/agent-skills/index.json');
    expect(text).toContain('/openapi.yaml');
  });

  it('GET /robots.txt includes OpenAPI directive', async () => {
    const res = await app.request('/robots.txt', {}, mockEnv as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('OpenAPI:');
    expect(text).toContain('Agent-Skills:');
    expect(text).toContain('/.well-known/agent-skills/index.json');
  });

  it('GET /skill.md returns raw skill markdown with ETag, Digest, and no unsafe pipes', async () => {
    const res = await app.request('/skill.md', {}, mockEnv as any);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    expect(res.headers.get('ETag')).toBeDefined();
    expect(res.headers.get('Digest')).toContain('sha-256=');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    const text = await res.text();
    expect(text).toContain('name: aifails');
    expect(text).toContain('## Declarative Tool Interfaces (Preferred)');
    expect(text).not.toContain('| sh -s --');
    expect(text).not.toContain('/cli.sh | sh');
    expect(text).not.toContain('/cli.sh | bash');
  });

  it('GET /cli.sh returns hardened shell script with SHA-256 integrity headers', async () => {
    const res = await app.request('/cli.sh', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/x-shellscript');
    expect(res.headers.get('ETag')).toBeDefined();
    expect(res.headers.get('Digest')).toContain('sha-256=');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    const text = await res.text();
    expect(text).toContain('#!/bin/sh');
    expect(text).toContain('set -efu');
    expect(text).toContain('aifails CLI — Query and submit LLM failures');
  });

  it('GET /changelog returns HTML view and supports Markdown negotiation', async () => {
    const resHtml = await app.request('/changelog', {}, mockEnv as any);
    expect(resHtml.status).toBe(200);
    expect(resHtml.headers.get('Content-Type')).toContain('text/html');
    const html = await resHtml.text();
    expect(html).toContain('Product Changelog');
    expect(html).toContain('v1.2.0');

    const resMd = await app.request(
      '/changelog',
      { headers: { 'Accept': 'text/markdown' } },
      mockEnv as any
    );
    expect(resMd.status).toBe(200);
    expect(resMd.headers.get('Content-Type')).toContain('text/markdown');
    const md = await resMd.text();
    expect(md).toContain('# aifails.wtf — Product Changelog');
  });

  it('GET /changelog.md returns pure markdown changelog', async () => {
    const res = await app.request('/changelog.md', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    const text = await res.text();
    expect(text).toContain('# aifails.wtf — Product Changelog & Release Stream');
    expect(text).toContain('## [v1.2.0]');
  });

  it('GET /.well-known/agent-skills/index.json conforms to Agent Skills Discovery RFC v0.2.0', async () => {
    const res = await app.request('/.well-known/agent-skills/index.json', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');

    const json = await res.json();
    expect(json.$schema).toBe('https://schemas.agentskills.io/discovery/0.2.0/schema.json');
    expect(Array.isArray(json.skills)).toBe(true);
    expect(json.skills.length).toBeGreaterThan(0);

    const skill = json.skills[0];
    expect(skill.name).toBe('aifails');
    expect(skill.type).toBe('skill-md');
    expect(typeof skill.description).toBe('string');
    expect(skill.description.length).toBeGreaterThan(10);
    expect(skill.description.length).toBeLessThanOrEqual(1024);
    expect(skill.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(skill.url).toContain('/.well-known/agent-skills/aifails/SKILL.md');

    // Fetch the actual skill artifact and verify digest integrity
    const skillRes = await app.request('/skill.md', {}, mockEnv as any);
    expect(skillRes.status).toBe(200);
    const skillContent = await skillRes.text();
    const encoded = new TextEncoder().encode(skillContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(skill.digest).toBe(`sha256:${hashHex}`);
  });

  it('GET /.well-known/agent-skills/aifails/SKILL.md redirects to /skill.md', async () => {
    const res = await app.request('/.well-known/agent-skills/aifails/SKILL.md', {}, mockEnv as any);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/skill.md');
  });

  it('GET /.well-known/skills/index.json redirects to v0.2.0 discovery index', async () => {
    const res = await app.request('/.well-known/skills/index.json', {}, mockEnv as any);
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('/.well-known/agent-skills/index.json');
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
