import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { ConfessionCard } from './ConfessionCard';
import { ConfessionForm } from './ConfessionForm';
import { SuggestionForm } from './SuggestionForm';
import { timeAgo } from './utils';

type PermalinkViewProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
  models?: ModelOption[];
  turnstileSiteKey?: string;
};

export function PermalinkView({
  confession,
  suggestions = [],
  models = [],
  turnstileSiteKey,
}: PermalinkViewProps) {
  const ogTitle = `Prompt Confession: Asked for '${confession.prompt_used.slice(0, 60)}...'`;
  const ogDescription = `What it did instead: '${confession.what_it_did_instead.slice(0, 120)}...'`;
  const url = `https://promptconfessional.com/confessions/${confession.id}`;

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: ogTitle,
    articleBody: `Prompt: ${confession.prompt_used}\nWhat it did instead: ${confession.what_it_did_instead}\nHow it made them feel: ${confession.how_it_made_them_feel}`,
    datePublished: confession.created_at,
    url,
  };

  const headElements = (
    <>
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
    </>
  );

  return (
    <Layout title={ogTitle} turnstileSiteKey={turnstileSiteKey} head={headElements}>
      <Header />

      <ConfessionForm models={models} turnstileSiteKey={turnstileSiteKey} />

      <main class="mx-auto max-w-3xl space-y-6 px-4 py-6 w-full pb-16">
        <div>
          <a
            href="/"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            ← Back to all confessions
          </a>
        </div>

        {/* 1. Main Confession Card */}
        <ConfessionCard confession={confession} suggestions={suggestions} isPermalink={true} />

        {/* 2. List of Existing Ackchyuallys */}
        <section class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {suggestions.length > 0
                ? `Ackchyually... (${suggestions.length})`
                : 'No "Ackchyually..." suggestions yet'}
            </h3>
          </div>

          {suggestions.length > 0 ? (
            <div class="space-y-3">
              {suggestions.map((s) => (
                <div key={s.id} class="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--border-color)] px-2.5 py-0.5 font-semibold text-[var(--badge-text)]">
                      <span>{s.suggestion_type === 'prompt' ? '💡 Prompt fix' : '🤖 Model fix'}</span>
                    </span>
                    <span class="text-[var(--text-muted)]">{timeAgo(s.created_at)}</span>
                  </div>
                  <p class="text-sm leading-relaxed text-[var(--text-primary)]">{s.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div class="rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center text-xs text-[var(--text-muted)]">
              Be the first to tell them what they should have asked or which model to use instead.
            </div>
          )}
        </section>

        {/* 3. Standalone "Ackchyually..." Form Card (Below the comments) */}
        <SuggestionForm confessionId={confession.id} />
      </main>

      <footer class="mt-auto border-t border-[var(--border-color)] py-8 text-center">
        <p class="text-sm text-[var(--text-muted)]">
          Prompt Confessional — because talking to machines shouldn't feel this lonely.
        </p>
      </footer>
    </Layout>
  );
}
