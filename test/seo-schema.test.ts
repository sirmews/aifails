import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
import { toIso8601, timeAgo } from '../src/views/utils';
import { generateRssFeed, generateSitemapXml } from '../src/services/seo';
import { createMockD1, createMockKV } from './helpers';
import type { Confession } from '../src/core/types';

type JsonLdNode = {
  '@type'?: string;
  '@id'?: string;
  dateCreated?: string;
  datePublished?: string;
  author?: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    url?: string;
  };
  mainEntity?: {
    '@type': string;
    dateCreated: string;
    answerCount?: number;
    author?: {
      '@type': string;
      name: string;
      url?: string;
    };
    suggestedAnswer?: Array<{
      '@type': string;
      dateCreated: string;
      author?: {
        '@type': string;
        name: string;
        url?: string;
      };
    }>;
    acceptedAnswer?: {
      '@type': string;
      dateCreated: string;
      author?: {
        '@type': string;
        name: string;
        url?: string;
      };
    };
  };
};

describe('SEO Date Formatting & Schema.org JSON-LD', () => {
  const mockD1 = createMockD1();
  const mockKV = createMockKV();

  const confessionWithSqliteDate = {
    id: 'test-conf-sqlite-date',
    prompt_used: 'Help me optimize this SQL query',
    what_it_did_instead: 'Dropped all database tables without confirmation',
    how_it_made_them_feel: 'Complete despair',
    mood: 'defeated',
    model_provider: 'anthropic',
    model_name: 'claude-3-5-sonnet',
    solidarity_count: 10,
    is_hidden: 0,
    created_at: '2026-08-28 14:30:00', // SQLite raw date format
  };

  const suggestionWithSqliteDate = {
    id: 'test-sug-sqlite-date',
    confession_id: 'test-conf-sqlite-date',
    suggestion_type: 'prompt' as const,
    body: 'Always specify read-only transaction mode in prompt instructions',
    author_name: null,
    created_at: '2026-08-28 15:00:00', // SQLite raw date format
  };

  mockD1.confessions.push(confessionWithSqliteDate);
  mockD1.suggestions.push(suggestionWithSqliteDate);

  const mockEnv = {
    DB: mockD1,
    CACHE_KV: mockKV,
    TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
    ENVIRONMENT: 'test',
    SESSION_SECRET: 'test-session-secret-key-32-bytes-long',
  };
  describe('toIso8601 utility', () => {
    it('normalizes SQLite datetime string without timezone to strict ISO 8601 UTC with Z', () => {
      const sqliteDate = '2026-08-28 12:34:56';
      const iso = toIso8601(sqliteDate);
      expect(iso).toBe('2026-08-28T12:34:56.000Z');
      expect(iso.endsWith('Z')).toBe(true);
    });

    it('preserves and standardizes ISO strings with Z', () => {
      const isoInput = '2026-08-20T12:00:00Z';
      const iso = toIso8601(isoInput);
      expect(iso).toBe('2026-08-20T12:00:00.000Z');
    });

    it('handles ISO strings missing Z suffix', () => {
      const rawIso = '2026-08-20T12:00:00';
      const iso = toIso8601(rawIso);
      expect(iso).toBe('2026-08-20T12:00:00.000Z');
      expect(iso.endsWith('Z')).toBe(true);
    });

    it('handles ISO strings with timezone offsets correctly', () => {
      const offsetDate = '2026-08-20T12:00:00+02:00';
      const iso = toIso8601(offsetDate);
      expect(iso).toBe('2026-08-20T10:00:00.000Z');
      expect(iso.endsWith('Z')).toBe(true);
    });

    it('returns valid ISO timestamp for null/undefined/empty input', () => {
      expect(toIso8601(null)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(toIso8601(undefined)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(toIso8601('')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('timeAgo utility with SQLite timestamps', () => {
    it('parses SQLite format without throwing or returning NaN', () => {
      const recentSqlite = new Date(Date.now() - 5 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .replace(/\..*$/, '');
      const formatted = timeAgo(recentSqlite);
      expect(formatted).toBe('5m ago');
    });
  });

  describe('Single Confession Page JSON-LD Structured Data', () => {


    it('renders dateCreated and datePublished in ISO 8601 with explicit timezone Z', async () => {
      const res = await app.request(
        'https://aifails.wtf/confessions/test-conf-sqlite-date',
        {},
        mockEnv
      );
      expect(res.status).toBe(200);

      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(jsonLdMatch).not.toBeNull();

      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': JsonLdNode[] };
      const qaPage = jsonLd['@graph']?.find((item) => item['@type'] === 'QAPage');
      expect(qaPage).toBeDefined();

      const question = qaPage?.mainEntity;
      expect(question?.['@type']).toBe('Question');
      expect(question?.dateCreated).toBe('2026-08-28T14:30:00.000Z');
      expect(question?.dateCreated.endsWith('Z')).toBe(true);

      expect(question?.author?.['@type']).toBe('Person');
      expect(question?.author?.url).toBe('https://aifails.wtf');

      const suggestedAnswer = question?.suggestedAnswer?.[0];
      expect(suggestedAnswer?.['@type']).toBe('Answer');
      expect(suggestedAnswer?.dateCreated).toBe('2026-08-28T14:30:00.000Z');
      expect(suggestedAnswer?.dateCreated.endsWith('Z')).toBe(true);
      expect(suggestedAnswer?.author?.['@type']).toBe('Organization');
      expect(suggestedAnswer?.author?.url).toBe('https://aifails.wtf');

      const acceptedAnswer = question?.acceptedAnswer;
      expect(acceptedAnswer?.['@type']).toBe('Answer');
      expect(acceptedAnswer?.dateCreated).toBe('2026-08-28T15:00:00.000Z');
      expect(acceptedAnswer?.dateCreated.endsWith('Z')).toBe(true);
      expect(acceptedAnswer?.author?.['@type']).toBe('Person');
      expect(acceptedAnswer?.author?.url).toBe('https://aifails.wtf');

      const techArticle = jsonLd['@graph']?.find((item) => item['@type'] === 'TechArticle');
      expect(techArticle).toBeDefined();
      expect(techArticle?.datePublished).toBe('2026-08-28T14:30:00.000Z');
      expect(techArticle?.datePublished?.endsWith('Z')).toBe(true);
      expect(techArticle?.author?.['@type']).toBe('Person');
      expect(techArticle?.author?.url).toBe('https://aifails.wtf');
      expect(techArticle?.publisher?.['@type']).toBe('Organization');
    });

    it('handles multiple suggestions with answerCount and full properties on all answers', async () => {
      const multiD1 = createMockD1();
      const multiConfession = { ...confessionWithSqliteDate, id: 'test-conf-multi' };
      const sug1 = { ...suggestionWithSqliteDate, id: 'sug-1', confession_id: 'test-conf-multi' };
      const sug2 = {
        id: 'sug-2',
        confession_id: 'test-conf-multi',
        suggestion_type: 'prompt' as const,
        body: 'Second prompt improvement suggestion',
        author_name: 'Lead Prompt Architect',
        created_at: '2026-08-28 16:00:00',
      };

      multiD1.confessions.push(multiConfession);
      multiD1.suggestions.push(sug1, sug2);

      const res = await app.request(
        'https://aifails.wtf/confessions/test-conf-multi',
        {},
        { ...mockEnv, DB: multiD1 }
      );
      expect(res.status).toBe(200);

      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': JsonLdNode[] };
      const qaPage = jsonLd['@graph']?.find((item) => item['@type'] === 'QAPage');
      const question = qaPage?.mainEntity;

      expect(question?.answerCount).toBe(3); // 1 AI failure + 2 suggestions
      expect(question?.suggestedAnswer?.length).toBe(2); // AI failure + sug2
      expect(question?.acceptedAnswer).toBeDefined(); // sug1

      const secondAnswer = question?.suggestedAnswer?.[1];
      expect(secondAnswer?.dateCreated).toBe('2026-08-28T16:00:00.000Z');
      expect(secondAnswer?.author?.name).toBe('Lead Prompt Architect');
      expect(secondAnswer?.author?.url).toBe('https://aifails.wtf');
    });

    it('renders BreadcrumbList and complete TechArticle metadata', async () => {
      const res = await app.request(
        'https://aifails.wtf/confessions/test-conf-sqlite-date',
        {},
        mockEnv
      );
      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': Array<Record<string, unknown>> };

      const breadcrumb = jsonLd['@graph']?.find((item) => item['@type'] === 'BreadcrumbList');
      expect(breadcrumb).toBeDefined();
      expect(breadcrumb?.itemListElement).toBeDefined();

      const techArticle = jsonLd['@graph']?.find((item) => item['@type'] === 'TechArticle');
      expect(techArticle?.dateModified).toBe('2026-08-28T14:30:00.000Z');
      expect(techArticle?.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': 'https://aifails.wtf/confessions/test-conf-sqlite-date',
      });
      expect(Array.isArray(techArticle?.image)).toBe(true);
  });
    });

  describe('Home Page JSON-LD Structured Data', () => {
    it('renders WebSite with EntryPoint SearchAction and CollectionPage ItemList', async () => {
      const res = await app.request('https://aifails.wtf/', {}, mockEnv);
      expect(res.status).toBe(200);

      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': Array<Record<string, unknown>> };

      const website = jsonLd['@graph']?.find((item) => item['@type'] === 'WebSite');
      expect(website).toBeDefined();
      expect(website?.name).toBe('Prompt Confessional');
      expect(website?.alternateName).toContain('aifails.wtf');

      const searchAction = website?.potentialAction as Record<string, unknown>;
      expect(searchAction?.['@type']).toBe('SearchAction');
      expect(searchAction?.target).toEqual({
        '@type': 'EntryPoint',
        urlTemplate: 'https://aifails.wtf/?q={search_term_string}',
      });

      const collection = jsonLd['@graph']?.find((item) => item['@type'] === 'CollectionPage');
      expect(collection).toBeDefined();
    });
  });

  describe('Changelog & MCP Pages JSON-LD Structured Data', () => {
    it('renders WebPage & Breadcrumbs on /changelog', async () => {
      const res = await app.request('https://aifails.wtf/changelog', {}, mockEnv);
      expect(res.status).toBe(200);

      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': Array<Record<string, unknown>> };

      const webpage = jsonLd['@graph']?.find((item) => item['@type'] === 'WebPage');
      expect(webpage).toBeDefined();
    });

    it('renders TechArticle & Breadcrumbs on /mcp', async () => {
      const res = await app.request('https://aifails.wtf/mcp', {}, mockEnv);
      expect(res.status).toBe(200);

      const html = await res.text();
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as { '@graph': Array<Record<string, unknown>> };

      const techArticle = jsonLd['@graph']?.find((item) => item['@type'] === 'TechArticle');
      expect(techArticle).toBeDefined();
    });
  });

  describe('RSS Feed & Sitemap with SQLite timestamps', () => {
    const sample: Confession = {
      id: 'test-c1',
      prompt_used: 'Generate unit tests',
      what_it_did_instead: 'Generated 100 empty tests that always pass',
      how_it_made_them_feel: 'Amused',
      mood: 'amused',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      solidarity_count: 5,
      created_at: '2026-08-28 10:00:00',
    };

    it('generates valid RSS pubDate from SQLite timestamp', () => {
      const rss = generateRssFeed([sample], 'https://aifails.wtf');
      expect(rss).toContain('<pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate>');
    });

    it('generates valid Sitemap lastmod from SQLite timestamp', () => {
      const sitemap = generateSitemapXml([sample], 'https://aifails.wtf');
      expect(sitemap).toContain('<lastmod>2026-08-28</lastmod>');
    });
  });
});
