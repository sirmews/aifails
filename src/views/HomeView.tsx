import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { Hero } from './Hero';
import { ConfessionForm } from './ConfessionForm';
import { ConfessionCard } from './ConfessionCard';

type HomeViewProps = {
  confessions: Confession[];
  suggestionsMap?: Record<string, ConfessionSuggestion[]>;
  models?: ModelOption[];
  turnstileSiteKey?: string;
  notice?: string;
};

export function HomeView({ confessions, suggestionsMap = {}, models = [], turnstileSiteKey, notice }: HomeViewProps) {
  const totalSolidarity = confessions.reduce((sum, c) => sum + c.solidarity_count, 0);

  return (
    <Layout turnstileSiteKey={turnstileSiteKey}>
      <Header />

      <Hero confessionCount={confessions.length} totalSolidarity={totalSolidarity} />

      {notice && (
        <div class="mx-auto max-w-3xl px-4 pb-4">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        </div>
      )}

      <ConfessionForm models={models} turnstileSiteKey={turnstileSiteKey} />

      <main class="mx-auto max-w-3xl space-y-4 px-4 pb-16 w-full">
        {confessions.length === 0 ? (
          <div class="rounded-2xl border border-dashed border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
            <p class="text-base font-medium">No confessions yet. Be the first to vent!</p>
          </div>
        ) : (
          confessions.map((c) => (
            <ConfessionCard key={c.id} confession={c} suggestions={suggestionsMap[c.id] ?? []} />
          ))
        )}
      </main>

      <footer class="mt-auto border-t border-[var(--border-color)] py-8 text-center">
        <p class="text-sm text-[var(--text-muted)]">
          Prompt Confessional — because talking to machines shouldn't feel this lonely.
        </p>
      </footer>
    </Layout>
  );
}
