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
}: HomeViewProps) {
  const totalSolidarity = confessions.reduce((sum, c) => sum + c.solidarity_count, 0);

  return (
    <Layout turnstileSiteKey={turnstileSiteKey}>
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
        <div class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-xs mb-6">
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
                class="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--amber-accent)]"
              />
            </div>

            {/* Mood Dropdown Filter */}
            <select
              name="mood"
              class="rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--amber-accent)] cursor-pointer"
            >
              <option value="all" selected={!mood || mood === 'all'}>All Moods</option>
              <option value="furious" selected={mood === 'furious'}>🤬 Furious</option>
              <option value="embarrassed" selected={mood === 'embarrassed'}>😳 Embarrassed</option>
              <option value="amused" selected={mood === 'amused'}>😂 Amused</option>
              <option value="defeated" selected={mood === 'defeated'}>😔 Defeated</option>
              <option value="baffled" selected={mood === 'baffled'}>🤔 Baffled</option>
            </select>

            {/* Submit & Reset */}
            <button
              type="submit"
              class="rounded-md bg-[var(--accent-primary)] px-4 py-2 text-sm font-bold text-[var(--accent-text)] border border-[var(--accent-primary)] border-b-2 border-b-[#9ba1ad] shadow-[0_1.5px_0_0_#9ba1ad] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[0_2.5px_0_0_#9ba1ad,0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              Filter
            </button>

            {(query || (mood && mood !== 'all') || (model && model !== 'all')) && (
              <a
                href="/"
                class="rounded-md border border-[var(--border-color)] border-b-2 border-b-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] shadow-[0_1px_0_0_rgba(0,0,0,0.3)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none"
              >
                Clear
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
              href={`/?q=${encodeURIComponent(query ?? '')}&mood=${encodeURIComponent(mood ?? '')}&cursor=${encodeURIComponent(nextCursor)}`}
              class="inline-flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-xs hover:bg-[var(--bg-subtle)] active:scale-95 transition-all"
            >
              Load Older Confessions ↓
            </a>
          </div>
        )}
      </main>

      <Footer />
    </Layout>
  );
}
