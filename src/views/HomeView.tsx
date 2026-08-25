import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { Hero } from './Hero';
import { ConfessionForm } from './ConfessionForm';
import { ConfessionCard } from './ConfessionCard';
import { Footer } from './Footer';

type HomeViewProps = {
  confessions: Confession[];
  suggestionsMap?: Record<string, ConfessionSuggestion[]>;
  models?: ModelOption[];
  turnstileSiteKey?: string;
  notice?: string;
  query?: string;
  mood?: string;
  model?: string;
  nextCursor?: string | null;
  hasMore?: boolean;
  baseUrl?: string;
};
export function HomeView({
  confessions,
  suggestionsMap = {},
  models = [],
  turnstileSiteKey,
  notice,
  query = '',
  mood = 'all',
  model = 'all',
  nextCursor,
  hasMore = false,
  baseUrl = 'https://aifails.wtf',
}: HomeViewProps) {
  const totalSolidarity = confessions.reduce((sum, c) => sum + c.solidarity_count, 0);
  const hasActiveFilter = Boolean(query || (mood && mood !== 'all') || (model && model !== 'all'));

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Prompt Confessional — a safe space for AI frustration',
    description: 'Anonymous, community-driven database of LLM failures, prompt hallucinations, and developer solidarity.',
    url: baseUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: confessions.length,
      itemListElement: confessions.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: c.prompt_used.length > 80 ? `${c.prompt_used.slice(0, 80)}...` : c.prompt_used,
        url: `${baseUrl}/confessions/${c.id}`,
      })),
    },
  };

  const headElements = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c') }}
    />
  );

  return (
    <Layout turnstileSiteKey={turnstileSiteKey} head={headElements}>
      <Header />

      <Hero confessionCount={confessions.length} totalSolidarity={totalSolidarity} />

      {notice && (
        <div class="mx-auto max-w-3xl px-4 pb-4">
          <div class="rounded-md border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
            {notice}
          </div>
        </div>
      )}

      <ConfessionForm models={models} turnstileSiteKey={turnstileSiteKey} />

      <main class="mx-auto max-w-3xl space-y-4 px-4 pb-16 w-full">
        {/* Search & Filter Toolbar directly over card list */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-[3px_3px_0px_#0e1a26] mb-6">
          <form action="/" method="get" class="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div class="relative flex-1 min-w-[200px]">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                name="q"
                value={query}
                placeholder="Search prompts, responses, or feelings..."
                class="w-full rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] font-medium"
              />
            </div>

            {/* Mood Dropdown Filter */}
            <select
              name="mood"
              class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer font-bold"
            >
              <option value="all" selected={!mood || mood === 'all'}>All Moods</option>
              <option value="furious" selected={mood === 'furious'}>😡 Furious</option>
              <option value="defeated" selected={mood === 'defeated'}>😩 Defeated</option>
              <option value="bewildered" selected={mood === 'bewildered'}>🤯 Bewildered</option>
              <option value="baffled" selected={mood === 'baffled'}>🤔 Baffled</option>
              <option value="embarrassed" selected={mood === 'embarrassed'}>😳 Embarrassed</option>
              <option value="amused" selected={mood === 'amused'}>😏 Darkly Amused</option>
              <option value="numb" selected={mood === 'numb'}>😐 Numb</option>
              <option value="vengeful" selected={mood === 'vengeful'}>🔥 Vengeful</option>
            </select>

            {/* Submit & Reset */}
            <button
              type="submit"
              class="rounded-md bg-[var(--accent-primary)] px-4 py-2 text-sm font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
            >
              Filter
            </button>

            {hasActiveFilter ? (
              <a
                href="/"
                class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26]"
              >
                Clear
              </a>
            ) : (
              <a
                href="/random"
                class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3.5 py-2 text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26]"
                title="Jump to a random prompt fail"
              >
                <span>🔀</span>
                <span>Random</span>
              </a>
            )}
          </form>
        </div>

        {/* Active Filter Badge indicator */}
        {(query || (mood && mood !== 'all')) && (
          <div class="flex items-center gap-2 text-xs text-[var(--text-muted)] pb-2">
            <span>Filtering by:</span>
            {query && <span class="rounded border border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-text)] px-2 py-0.5 font-medium">"{query}"</span>}
            {mood && mood !== 'all' && <span class="rounded border border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-text)] px-2 py-0.5 font-medium">Mood: {mood}</span>}
          </div>
        )}

        {/* Confession Cards */}
        {confessions.length === 0 ? (
          <div class="rounded-lg border border-dashed border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
            <p class="text-base font-medium">No confessions found matching your search.</p>
            {(query || (mood && mood !== 'all')) && (
              <a href="/" class="mt-2 inline-block text-sm font-semibold text-[var(--amber-accent)] hover:underline">
                Clear filters to view all confessions
              </a>
            )}
          </div>
        ) : (
          confessions.map((c) => (
            <ConfessionCard key={c.id} confession={c} suggestions={suggestionsMap[c.id] ?? []} />
          ))
        )}

        {/* Load More Cursor Pagination */}
        {hasMore && nextCursor && (
          <div class="pt-6 text-center">
            <a
              href={`/?q=${encodeURIComponent(query ?? '')}&mood=${encodeURIComponent(mood ?? '')}&model=${encodeURIComponent(model ?? '')}&cursor=${encodeURIComponent(nextCursor)}`}
              class="inline-flex items-center gap-2 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-2.5 text-sm font-bold text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--bg-subtle)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
            >
              Load Older Confessions ↓
            </a>
          </div>
        )}
      </main>
      {/* Floating Announcement Toast Chip */}
      <aside
        id="changelog-toast"
        class="fixed bottom-4 right-4 z-40 hidden max-w-xs sm:max-w-sm rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 shadow-[4px_4px_0px_#0e1a26] transition-all duration-200"
        role="region"
        aria-label="New feature announcement"
      >
        <div class="flex items-start gap-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[var(--accent-primary)] text-sm font-bold text-[var(--accent-text)] border border-[var(--border-color)]">
            🚀
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs font-black text-[var(--text-primary)]">
                New: OpenAPI &amp; Agent Skills
              </span>
              <button
                type="button"
                id="close-changelog-toast"
                class="rounded p-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Dismiss announcement"
              >
                ✕
              </button>
            </div>
            <p class="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              OpenAPI 3.1.0 spec, universal Skills CLI, and direct JSON ingestion are now live.
            </p>
            <div class="pt-1">
              <a
                href="/changelog"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)] hover:underline"
              >
                <span>Read Changelog</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var toast = document.getElementById('changelog-toast');
    var closeBtn = document.getElementById('close-changelog-toast');
    var currentRelease = 'v1.2.0';
    if (!toast) return;

    try {
      if (localStorage.getItem('aifails_last_seen_release') !== currentRelease) {
        toast.classList.remove('hidden');
      }
    } catch(e) {
      toast.classList.remove('hidden');
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        try {
          localStorage.setItem('aifails_last_seen_release', currentRelease);
        } catch(e) {}
        toast.classList.add('opacity-0');
        setTimeout(function() {
          toast.classList.add('hidden');
        }, 200);
      });
    }
  });
})();
          `,
        }}
      />

      <Footer />
    </Layout>
  );
}
