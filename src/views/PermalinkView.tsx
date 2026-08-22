import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { ConfessionCard } from './ConfessionCard';
import { ConfessionForm } from './ConfessionForm';
import { SuggestionForm } from './SuggestionForm';
import { Footer } from './Footer';
import { timeAgo } from './utils';

type PermalinkViewProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
  models?: ModelOption[];
  turnstileSiteKey?: string;
  notice?: string;
};

export function PermalinkView({
  confession,
  suggestions = [],
  models = [],
  turnstileSiteKey,
  notice,
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
        {notice && (
          <div class="rounded-lg border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
            {notice}
          </div>
        )}

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

        {/* 2. Unified "Ackchyually..." Suggestions Card */}
        <section class="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-3">
          <div class="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <svg class="h-4 w-4 text-[var(--amber-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 class="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Ackchyually... ({suggestions.length})
            </h3>
          </div>

          {suggestions.length > 0 ? (
            <div class="divide-y divide-[var(--border-color)]">
              {suggestions.map((s, idx) => (
                <div key={s.id} class={`${idx === 0 ? 'pb-3.5' : idx === suggestions.length - 1 ? 'pt-3.5' : 'py-3.5'} space-y-1.5`}>
                  <div class="flex items-center justify-between text-xs">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] border border-[var(--border-color)] px-2.5 py-0.5 font-semibold text-[var(--badge-text)]">
                      <span>{s.suggestion_type === 'prompt' ? '💡 Prompt fix' : '🤖 Model fix'}</span>
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-[var(--text-muted)]">{timeAgo(s.created_at)}</span>
                      <form action={`/confessions/${confession.id}/suggestions/${s.id}/report`} method="post" class="inline m-0 p-0">
                        <button
                          type="submit"
                          title="Report this suggestion"
                          class="inline-flex items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--danger-text)] hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)] transition-colors cursor-pointer"
                          onclick="return confirm('Report this suggestion for moderation review?');"
                        >
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          <span class="hidden sm:inline">Report</span>
                        </button>
                      </form>
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed text-[var(--text-primary)]">{s.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p class="text-xs text-[var(--text-muted)] italic py-2 text-center">
              No "Ackchyually..." suggestions yet. Be the first to tell them what they should have asked or which model to use instead!
            </p>
          )}
        </section>

        {/* 3. Standalone "Ackchyually..." Form Card (Below the comments) */}
        <SuggestionForm confessionId={confession.id} />
      </main>

      <Footer />
    </Layout>
  );
}
