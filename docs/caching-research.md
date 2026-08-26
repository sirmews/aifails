# Edge Caching Research (`caches.default` vs Workers Cache)

Investigation into why the edge cache tier of this application never engages, what
Cloudflare's official documentation says, and what we should do about it.

Researched: 2026-08-26, against developers.cloudflare.com docs last updated
Jul–Aug 2026, plus live testing against production (`aifails.wtf`).

---

## 1. TL;DR

The "30s CDN edge cache + stale-while-revalidate" tier described by
`EDGE_CACHE_HEADER` does not exist today. Nothing ever writes to
`caches.default`, and Cloudflare's zone CDN never caches Worker-generated HTML
by default. The header is honest to browsers (`max-age=5`) but decorative to our
own edge. `purgeEdgeCache` deletes keys that were never stored.

The recommended fix is to adopt **Workers Cache**, Cloudflare's newer,
purpose-built mechanism for caching Worker responses (`"cache": { "enabled":
true }` in `wrangler.jsonc`). It honors our existing `Cache-Control` headers
(including `stale-while-revalidate`), supports `Vary: Accept` for our content
negotiation, is tiered by default, and provides global tag-based purging via
`ctx.cache.purge()` — which directly replaces our colo-local `purgeEdgeCache`.

---

## 2. Current implementation

| Piece | Location | Behavior |
|---|---|---|
| `EDGE_CACHE_HEADER` | `src/api/helpers.ts:28` | `public, max-age=5, s-maxage=30, stale-while-revalidate=86400` |
| `purgeEdgeCache` | `src/api/helpers.ts:30` | `caches.default.delete(...)` on `/`, `/feed.xml`, `/sitemap.xml`, `/og.svg`, optional permalink routes |
| Cacheable reads | `src/api/routes/home.ts`, `seo.ts`, `discovery.ts`, `confessions.ts`, `mcp.ts` | Set `EDGE_CACHE_HEADER` or longer `s-maxage` variants |
| Writes to cache | — | **None.** No `cache.put` / `cache.match` exists anywhere in `src/` |

## 3. Empirical findings (production)

Five sequential requests to `https://aifails.wtf/`, plus one each to
`/feed.xml`, `/sitemap.xml`, `/og.svg`:

- All return `HTTP 200` with the expected `Cache-Control` headers.
- **No response ever carries a `cf-cache-status` header.** Per Cloudflare:
  *"You can tell an object is attempting to cache if one sees the
  `CF-Cache-Status` at all"* ([How the Cache works](https://developers.cloudflare.com/workers/reference/how-the-cache-works/)).
  Its complete absence means the cache is never consulted and never populated.

## 4. Why nothing is cached (confirmed against official docs)

### 4.1 The Cache API is write-it-yourself

The [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
is an ephemeral, key-value store keyed by `Request` URL. Responses are stored
**only** via explicit `cache.put()`. Setting `Cache-Control` on a Worker's
response does not populate anything. Since this codebase only calls
`cache.delete()` (in `purgeEdgeCache`), the cache stays permanently empty and
every delete returns `false`.

### 4.2 The zone CDN ignores HTML by default

Per [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/):
*"Cloudflare only caches based on file extension and not by MIME type... The
Cloudflare CDN does not cache HTML or JSON by default."* Our SSR HTML,
markdown, and JSON responses are therefore never edge-cached by the zone CDN
either — regardless of `s-maxage`. Only the browser honors `max-age=5`.

### 4.3 Even if we wired up read-through caching, three limits apply

From the [Cache API reference](https://developers.cloudflare.com/workers/runtime-apis/cache/):

1. **No SWR**: `stale-while-revalidate` and `stale-if-error` are explicitly
   *not supported* by `cache.put`/`cache.match`.
2. **Set-Cookie blocks caching**: responses with `Set-Cookie` are never cached
   unless the header is stripped or `Cache-Control: private=Set-Cookie` is set.
3. **Colo-local purge**: `cache.delete()` evicts only in the data center where
   the Worker ran. Global eviction requires the zone Purge API (purge
   everything / by tag / host / prefix). Also, the Cache API is incompatible
   with Tiered Cache.

### 4.4 Content negotiation caveat

We serve HTML, `text/markdown`, and JSON from the same URLs via `Vary: Accept`
(`src/api/routes/home.ts:59`). Any cache layer must honor `Vary`, or agents
requesting markdown could receive cached HTML.

---

## 5. What Cloudflare officially recommends now: Workers Cache

Docs: [Workers Cache](https://developers.cloudflare.com/workers/cache/) (last
updated Jul 21, 2026).

Workers Cache sits **in front of** the Worker: on a hit, Cloudflare returns the
cached response *without executing the Worker* (no CPU billed); on a miss the
Worker runs and its response is stored automatically per RFC 9111 semantics.

Enablement is one config change:

```jsonc
// wrangler.jsonc
{
  "compatibility_date": "<today>",
  "cache": { "enabled": true }
}
```

Why it fits this project specifically:

| Requirement | Workers Cache behavior |
|---|---|
| `s-maxage` edge TTL | Honored per RFC 9111 |
| `stale-while-revalidate` | **Supported** (unlike the Cache API) |
| `Vary: Accept` content negotiation | Supported — separate variant per distinct header value |
| Global invalidation after writes | `ctx.cache.purge({ tags })` / `import { cache } from 'cloudflare:workers'`; tag responses with `Cache-Tag` |
| Latency/CPU | Tiered (lower + upper tier) by default, request collapsing on misses; hits cost zero CPU |
| Session safety | `Set-Cookie` responses and `Authorization` requests trigger automatic bypass |

Notes:

- Zone-level Cache Rules, cache levels, and the extension allowlist have **no
  effect** on Workers Cache; the Worker's own `Cache-Control` headers are the
  entire configuration surface.
- Every request (hit or miss) is billed at the standard Workers request rate;
  CPU is only billed when the Worker actually runs.
- Variants under `Vary` share one purge entry: purging a tag/prefix matching
  any variant invalidates all variants of that URL — convenient for us, since
  HTML/markdown/JSON variants of a permalink die together.

### Alternatives considered

1. **Read-through Cache API pattern** (`cache.match` → render → `new
   Response(res.body, res)` → `waitUntil(cache.put(res.clone()))`): documented,
   works on custom domains, but loses SWR, requires manual Set-Cookie
   handling, has colo-local-only purging, no request collapsing, and no tiered
   caching. Strictly worse than Workers Cache for this app.
2. **Zone Cache Rule ("Eligible for cache") for HTML routes + REST Purge API**:
   viable, but adds dashboard configuration outside the repo, doesn't skip
   Worker execution as cleanly (Worker still runs before the cache), and purge
   requires a scoped API token in the Worker environment.

---

## 6. Recommended plan

1. Add `"cache": { "enabled": true }` to `wrangler.jsonc` (and bump
   `compatibility_date`).
2. Replace `purgeEdgeCache` with `ctx.cache.purge({ tags })`: tag home-page
   responses `Cache-Tag: home`, feeds `feed`, permalinks
   `confession:<id>`, then purge those tags after writes (global, unlike
   `cache.delete`).
3. Keep `EDGE_CACHE_HEADER` as-is — it finally becomes fully effective,
   including SWR.
4. Verify via repeated `curl -I https://aifails.wtf/`: expect
   `cf-cache-status: MISS` then `HIT`.
5. Confirm GET routes never emit `Set-Cookie` (currently true — sessions are
   established on POST only), otherwise those routes silently bypass.
6. Delete the now-dead `caches.default` code from `src/api/helpers.ts`.

## 7. Sources

- https://developers.cloudflare.com/workers/cache/ (Workers Cache, Jul 2026)
- https://developers.cloudflare.com/workers/runtime-apis/cache/ (Cache API, Aug 2026)
- https://developers.cloudflare.com/workers/reference/how-the-cache-works/ (Jul 2026)
- https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ (Aug 2026)
