import { Hono } from 'hono';
import type { Env } from '../types/env';
import { homeRouter } from './routes/home';
import { confessionsRouter } from './routes/confessions';
import { seoRouter } from './routes/seo';
import { discoveryRouter } from './routes/discovery';
import { mcpRouter } from './routes/mcp';
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
    '</.well-known/api-catalog>; rel="api-catalog", </.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </cli.sh>; rel="service-desc"; type="text/x-shellscript", </.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json", </llms.txt>; rel="service-desc"; type="text/plain", </llms-full.txt>; rel="service-doc"; type="text/plain", </feed.md>; rel="describedby"; type="text/markdown", </skill.md>; rel="describedby"; type="text/markdown"'
  );
});

// Mount Sub-routers
app.route('/', homeRouter);
app.route('/', confessionsRouter);
app.route('/', seoRouter);
app.route('/', discoveryRouter);
app.route('/', mcpRouter);

// 404 & 500 Handlers
app.notFound((c) => {
  c.status(404);
  return c.html(NotFoundView());
});

app.onError((err, c) => {
  console.error('Unhandled server error:', err);
  c.status(500);
  return c.text('500 Internal Server Error', 500);
});
