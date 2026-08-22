import type { Confession, ConfessionSuggestion, ModelOption } from '../core/types';
import { Layout } from './Layout';
import { Header } from './Header';
import { ConfessionCard } from './ConfessionCard';
import { ConfessionForm } from './ConfessionForm';

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

      <main class="mx-auto max-w-3xl space-y-4 px-4 py-6 w-full">
        <div>
          <a
            href="/"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            ← Back to all confessions
          </a>
        </div>

        <ConfessionCard confession={confession} suggestions={suggestions} isPermalink={true} />
      </main>

      <footer class="mt-auto border-t border-[var(--border-color)] py-8 text-center">
        <p class="text-sm text-[var(--text-muted)]">
          Prompt Confessional — because talking to machines shouldn't feel this lonely.
        </p>
      </footer>
    </Layout>
  );
}
