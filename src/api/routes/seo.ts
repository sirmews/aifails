import { Hono } from 'hono';
import type { Env } from '../../types/env';
import { getConfessions, getConfessionById } from '../../db';
import { generateRssFeed, generateSitemapXml, generateOgImageSvg, generateSiteOgImageSvg } from '../../services/seo';
import { OG_DEFAULT_PNG_BYTES } from '../../assets/og-default';
import { getClientIp, isReadRateLimited } from '../helpers';

export const seoRouter = new Hono<{ Bindings: Env }>();

// 1. RSS 2.0 XML Feed Endpoint
seoRouter.get('/feed.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/feed.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 50 });
  const baseUrl = new URL(c.req.url).origin;
  const rssXml = generateRssFeed(confessions, baseUrl);

  c.header('Content-Type', 'application/xml; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  c.header('Cache-Tag', 'feed, rss');
  return c.text(rssXml);
});

seoRouter.get('/rss.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/rss.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }
  return c.redirect('/feed.xml', 301);
});

// 2. Dynamic XML Sitemap Endpoint
seoRouter.get('/sitemap.xml', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/sitemap.xml`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const { confessions } = await getConfessions(c.env.DB, { limit: 500 });
  const baseUrl = new URL(c.req.url).origin;
  const sitemapXml = generateSitemapXml(confessions, baseUrl);

  c.header('Content-Type', 'application/xml; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  c.header('Cache-Tag', 'sitemap, seo');
  return c.body(sitemapXml);
});

// 3. Robots.txt Crawler, Content-Signal & Agent Directives
seoRouter.get('/robots.txt', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/robots.txt`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const baseUrl = new URL(c.req.url).origin;
  const robotsTxt = `# As a condition of accessing this website, you agree to
# the site-wide terms and conditions.

User-agent: *
Allow: /
Allow: /api/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /openapi.json
Allow: /openapi.yaml
Allow: /.well-known/
Allow: /.well-known/agent-skills/
Allow: /.well-known/agent-skills/index.json
Allow: /skill.md
Allow: /cli.sh
Allow: /mcp
Allow: /feed.xml
Allow: /feed.md
Allow: /changelog
Allow: /changelog.md
Allow: /sitemap.xml
Allow: /og.png
Allow: /og.svg
Disallow: /*?*cursor=

# Human & AI Agent Content Mining Permissions
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
LLMs-Txt: ${baseUrl}/llms.txt
OpenAPI: ${baseUrl}/openapi.json
Agent-Skills: ${baseUrl}/.well-known/agent-skills/index.json
`;

  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=86400');
  c.header('Cache-Tag', 'seo, robots');
  return c.text(robotsTxt);
});

// 4. Site-wide Static 1200x630 Social Preview PNG
seoRouter.get('/og.png', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/og.png`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  return new Response(OG_DEFAULT_PNG_BYTES, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'Cache-Tag': 'og-image, seo',
    },
  });
});

seoRouter.get('/api/og.png', (c) => c.redirect('/og.png'));

seoRouter.get('/og.svg', async (c) => {
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
  c.header('Cache-Tag', 'og-image, seo');
  return c.body(svg);
});

seoRouter.get('/api/og.svg', (c) => c.redirect('/og.svg'));

// 5. Dynamic Confession Social PNG & SVG Card Endpoints
seoRouter.get('/confessions/:id/og.png', async (c) => {
  if (await isReadRateLimited(c, `read:${getClientIp(c)}:/confessions/og.png`)) {
    return c.text('Rate limit exceeded. Please slow down.', 429);
  }

  const id = c.req.param('id');
  return new Response(OG_DEFAULT_PNG_BYTES, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      'Cache-Tag': `confession-${id}, og-image`,
    },
  });
});

seoRouter.get('/confessions/:id/og.svg', async (c) => {
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
  c.header('Cache-Tag', `confession-${id}, og-image`);
  return c.body(svg);
});
