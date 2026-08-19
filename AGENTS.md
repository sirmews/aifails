# Prompt Confessional (`ugh-llms`) — Agent Guide

Anonymous, edge-rendered web app for LLM prompt fails. Users post confessions, vote solidarity, and suggest better prompts or models.

Human-facing overview: [README.md](README.md). Rate limits and vote integrity: [docs/security.md](docs/security.md).

## Stack

- Cloudflare Workers (`nodejs_compat`), Hono JSX SSR (not React)
- D1, KV (`CACHE_KV`), `caches.default`
- Rate limiters `CONFESSION_LIMITER` (5/min) and `SOLIDARITY_LIMITER` (30/min)
- Turnstile + HMAC session cookies
- Bun + Wrangler

## Commands

```bash
bun install                 # required before typecheck or wrangler
bun run dev
bun run typecheck
bun run deploy
bun run db:migrate          # local D1
bun run db:migrate:remote
bun run moderate list
bun run moderate:remote
bun run moderate hide <id> [--remote]
bun run moderate unhide <id> [--remote]
bun run moderate dismiss <id> [--remote]
```

## Layout

```
src/
  api/router.ts          # routes, cache purge
  auth/session.ts        # HMAC-SHA256 cookie
  auth/turnstile.ts
  core/types.ts
  db/confessions.ts      # D1 queries, is_hidden = 0 on public reads
  services/models.ts     # OpenRouter + KV, 3s timeout, static fallback
  services/seo.ts        # RSS, sitemap, OG SVG
  types/env.ts
  utils/gitleaks.ts      # secret / email redaction
  utils/moderation.ts    # slur filter; ordinary swearing allowed
  views/                 # Hono JSX. CSS variables live in Layout.tsx
  index.ts
migrations/              # 0001–0004
scripts/moderate.ts      # wrangler d1 execute
.github/workflows/deploy.yml
wrangler.jsonc
```

## Patterns

- Rate-limit key is `${clientIp}:${sessionId}` so NAT users are not locked out together.
- Solidarity uniqueness is the D1 PK `(confession_id, session_id)` with `INSERT OR IGNORE`, not the rate limiter.
- Submissions: `redactSecrets` then `sanitizeContent` before insert.
- Moderation is CLI-only. There is no admin HTTP route.
- `purgeHomeEdgeCache` deletes `/`, `/feed.xml`, and `/sitemap.xml` from `caches.default` after writes.

## Gotchas

1. Install with Bun before `tsc` or Wrangler so `@cloudflare/workers-types` and Hono JSX types resolve.
2. Views import `hono/jsx`. Do not import React.
3. Local Turnstile site key is `1x00000000000000000000AA`. Production keys are Worker secrets.
4. `scripts/moderate.ts` shells out to `bunx wrangler d1 execute`. It needs a Wrangler login for `--remote`.
5. D1/KV ids in `wrangler.jsonc` are local placeholders. Production deploy needs real ids plus `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.
6. Session HMAC secret is a hardcoded default in `src/auth/session.ts`. Do not ship that as-is.
