import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { ConfessionCard } from './ConfessionCard';
import { ConfessionForm } from './ConfessionForm';
import { SuggestionForm } from './SuggestionForm';
import { Footer } from './Footer';
import { Markdown } from './Markdown';
import { ShareCardModal } from './ShareCardModal';
import { timeAgo } from './utils';

type PermalinkViewProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
  models?: ModelOption[];
  turnstileSiteKey?: string;
  notice?: string;
  baseUrl?: string;
};

export function PermalinkView({
  confession,
  suggestions = [],
  models = [],
  turnstileSiteKey,
  notice,
  baseUrl = 'https://aifails.wtf',
}: PermalinkViewProps) {
  const modelName = confession.model_name
    ? `${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`
    : 'AI';
  const promptSnippet = confession.prompt_used.length > 55
    ? `${confession.prompt_used.slice(0, 55)}...`
    : confession.prompt_used;
  const failSnippet = confession.what_it_did_instead.length > 110
    ? `${confession.what_it_did_instead.slice(0, 110)}...`
    : confession.what_it_did_instead;

  const ogTitle = `"${promptSnippet}" (${modelName}) — aifails.wtf`;
  const ogDescription = `What it did instead: "${failSnippet}" • Feeling: ${confession.how_it_made_them_feel}`;
  const url = `${baseUrl}/confessions/${confession.id}`;
  const ogImage = `${baseUrl}/confessions/${confession.id}/og.png`;

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: ogTitle,
    articleBody: `Prompt: ${confession.prompt_used}\nWhat it did instead: ${confession.what_it_did_instead}\nHow it made them feel: ${confession.how_it_made_them_feel}`,
    datePublished: confession.created_at,
    url,
    image: ogImage,
    author: {
      '@type': 'Person',
      name: 'Anonymous',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Prompt Confessional',
      url: baseUrl,
    },
  };

  const headElements = (
    <>
      <link rel="canonical" href={url} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c') }}
      />
    </>
  );

  return (
    <Layout
      title={ogTitle}
      description={ogDescription}
      ogTitle={ogTitle}
      ogDescription={ogDescription}
      ogImage={ogImage}
      ogUrl={url}
      ogType="article"
      turnstileSiteKey={turnstileSiteKey}
      head={headElements}
    >
      <Header />

      <ConfessionForm models={models} turnstileSiteKey={turnstileSiteKey} />

      <main class="mx-auto max-w-3xl space-y-6 px-4 py-6 w-full pb-16">
        {notice && (
          <div class="rounded-md border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
            {notice}
          </div>
        )}

        {/* Top Navigation & Share Bar */}
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div class="flex flex-wrap items-center gap-2">
            <a
              href="/"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
            >
              ← All Fails
            </a>
            <a
              href={`/random?exclude=${confession.id}`}
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--bg-subtle)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
              title="Jump to another random fail"
            >
              <span>🔀</span>
              <span>Random Fail</span>
            </a>
          </div>
          <div class="flex items-center gap-2">
            {/* High-Res Share Image Modal Button */}
            <button
              id="open-share-modal-btn"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
              title="Preview and share 2x high-res image for Slack, Discord, and Twitter"
            >
              <span>📸</span>
              <span>Share Image</span>
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"What it did instead: ${failSnippet}" — AI Fail on aifails.wtf`)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[#38bdf8] hover:border-[var(--border-subtle)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
              title="Tweet this fail (yes, we still call it Twitter)"
            >
              <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
              </svg>
              <span>Tweet</span>
            </a>
            <a
              href={`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(ogTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
              title="Share on Reddit"
            >
              <svg class="h-3 w-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.248 0 .687.561 1.248 1.248 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.561-1.248-1.249-1.248zm-5.467 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.336.336 0 0 0-.232-.094z"/>
              </svg>
              <span>Reddit</span>
            </a>
          </div>
        </div>
        {/* 1. Main Confession Card */}
        <ConfessionCard confession={confession} suggestions={suggestions} isPermalink={true} />

        {/* 2. Unified "Ackchyually..." Suggestions Card */}
        <section class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3px_3px_0px_#0e1a26] space-y-3">
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
                    <span class="inline-flex items-center gap-1.5 rounded border border-[var(--border-color)] bg-[var(--badge-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--badge-text)]">
                      <span>{s.suggestion_type === 'prompt' ? '💡 Prompt fix' : '🤖 Model fix'}</span>
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-[var(--text-muted)]">{timeAgo(s.created_at)}</span>
                      <form
                        action={`/confessions/${confession.id}/suggestions/${s.id}/report`}
                        method="post"
                        class="confirm-submit-form inline m-0 p-0"
                        data-confirm-message="Report this suggestion for moderation review?"
                      >
                        <button
                          type="submit"
                          title="Report this suggestion"
                          class="inline-flex items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--danger-text)] hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)] transition-colors cursor-pointer"
                        >
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          <span class="hidden sm:inline">Report</span>
                        </button>
                      </form>
                    </div>
                  </div>
                  <Markdown content={s.body} class="text-sm pt-1" />
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
        <SuggestionForm confessionId={confession.id} turnstileSiteKey={turnstileSiteKey} />
        {/* Bottom Discover More Bar */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center space-y-3 shadow-[3.5px_3.5px_0px_#0e1a26]">
          <h3 class="text-base font-black text-[var(--text-primary)]">
            Have your own AI prompt horror story?
          </h3>
          <p class="text-xs font-semibold text-[var(--text-muted)] max-w-md mx-auto">
            Don&#39;t suffer in silence. Share what you asked for, what it did instead, and find solidarity.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onclick="document.getElementById('open-confess-btn')?.click()"
              class="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
            >
              <span>Confess Anonymously</span>
            </button>
            <a
              href={`/random?exclude=${confession.id}`}
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26]"
            >
              <span>🔀 Next Random Fail →</span>
            </a>
            <a
              href="/"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26]"
            >
              <span>Browse Feed</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />

      <ShareCardModal confession={confession} url={url} />
    </Layout>
  );
}
