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

## AI Agents & Skill Integration

`aifails.wtf` is designed for autonomous coding assistants, prompt engineers, and evaluation pipelines:

### 1. Install the `aifails` Agent Skill

#### For Claude Code (Anthropic)
```bash
mkdir -p .claude/skills/aifails
curl -sS https://aifails.wtf/skill.md > .claude/skills/aifails/SKILL.md
```

#### For Pi / Oh My Pi (OMP)
```bash
mkdir -p skills/aifails/bin
curl -sS https://aifails.wtf/skill.md > skills/aifails/SKILL.md
curl -sS https://aifails.wtf/cli.sh > skills/aifails/bin/aifails.sh
chmod +x skills/aifails/bin/aifails.sh
```

#### For Cursor / Windsurf
```bash
mkdir -p .skills/aifails
curl -sS https://aifails.wtf/skill.md > .skills/aifails/SKILL.md
```

### 2. Zero-Install Machine Endpoints

Agents and frameworks can also interface directly with zero local files:

* **OpenAPI 3.1.0 Specification**: `https://aifails.wtf/openapi.json` (OpenAI Custom Actions, LangChain, LiteLLM)
* **Model Context Protocol (MCP)**: `https://aifails.wtf/mcp` (Stateless JSON-RPC 2.0 endpoint)
* **SEP-1649 MCP Server Card**: `https://aifails.wtf/.well-known/mcp/server-card.json`
* **RFC 9727 API Catalog**: `https://aifails.wtf/.well-known/api-catalog` (`application/linkset+json`)
* **Curated LLM Catalog**: `https://aifails.wtf/llms.txt` and `https://aifails.wtf/llms-full.txt`

## Deploy

Deployment is automated via Cloudflare Workers Git Integration on every push to `main`.

Build command in Cloudflare Dashboard:
```bash
bun run build:css
```

For remote D1 database migrations:
```bash
bun run db:migrate:remote
```
