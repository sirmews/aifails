# Prompt Confessional

Anonymous, edge-rendered site for venting about LLM failure modes. Post a prompt fail, get solidarity votes, and collect better prompt or model suggestions.

## Stack

- Cloudflare Workers with Hono JSX (SSR, no React)
- Cloudflare D1 (SQLite) and KV
- Cloudflare Turnstile, native rate limiters, HMAC session cookies
- Bun + Wrangler

## Local development

```bash
bun install
bun run db:migrate
bun run dev
```

The app listens on `http://localhost:8787`. Local Turnstile uses Cloudflare's dummy site key, so the widget always passes.

`wrangler.jsonc` still has placeholder D1 and KV ids (`local-ugh-llms-db`, `local-cache-kv`). That is enough for `wrangler dev`. Production needs real resource ids and secrets — see [Deploy](#deploy).

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Wrangler local Worker |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run deploy` | Deploy the Worker |
| `bun run db:migrate` | Apply D1 migrations locally |
| `bun run db:migrate:remote` | Apply D1 migrations in production |
| `bun run moderate list` | Pending reports (add `--remote` for prod) |
| `bun run moderate hide <id>` | Soft-delete a confession |
| `bun run moderate unhide <id>` | Restore a hidden confession |
| `bun run moderate dismiss <id>` | Dismiss reports without hiding |

## How it is put together

User submissions go through secret redaction, then a slur filter (ordinary swearing is left alone), then D1. Solidarity is one vote per HMAC-signed session, enforced by a composite primary key. Public queries omit `is_hidden = 1` rows.

Themes (day / night / twilight) and CSS variables live in `src/views/Layout.tsx` so the first paint has no extra stylesheet request.

More detail: [docs/security.md](docs/security.md). Agent-oriented notes: [AGENTS.md](AGENTS.md).

## Deploy

GitHub Actions typechecks on every push to `main`, deploys the Worker, and runs a nightly D1 export. That pipeline needs:

1. A real D1 database and KV namespace, with their ids in `wrangler.jsonc`
2. GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
3. Production Turnstile keys (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) as Worker secrets
4. A non-default HMAC session secret (today it is hardcoded in `src/auth/session.ts`)

Until those exist, CI typecheck will pass and deploy / nightly backup will fail.
