import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';
import { RELEASES } from '../services/changelog';

export function ChangelogView({ baseUrl = 'https://aifails.wtf' }: { baseUrl?: string }) {
  const url = `${baseUrl}/changelog`;
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: 'Product Changelog & Release Stream — aifails.wtf',
        description: 'Track all new features, agent discovery standards, and API updates shipped to aifails.wtf (Prompt Confessional).',
        url,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Prompt Confessional',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Changelog',
              item: url,
            },
          ],
        },
      },
    ],
  };

  const headElements = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c') }}
    />
  );

  return (
    <Layout
      title="Product Changelog & Release Stream — aifails.wtf"
      description="Track all new features, agent discovery standards, and API updates shipped to aifails.wtf (Prompt Confessional)."
      ogTitle="Changelog — aifails.wtf"
      ogDescription="Product updates, agent skills, and feature releases for aifails.wtf."
      ogUrl={url}
      head={headElements}
    >
      <Header />

      <main class="mx-auto max-w-3xl space-y-6 px-4 py-8 w-full pb-16">
        {/* Navigation Breadcrumb */}
        <div class="flex items-center justify-between">
          <a
            href="/"
            class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
          >
            ← Back to all prompt fails
          </a>
          <div class="flex items-center gap-2">
            <span class="rounded border border-[var(--accent-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-mono font-bold text-[var(--accent-primary)] shadow-[1px_1px_0px_#0e1a26]">
              Release Stream • SemVer
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-[4px_4px_0px_#0e1a26] space-y-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)] border-2 border-[var(--border-color)] text-lg font-black shadow-[2px_2px_0px_#0e1a26]">
              📦
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Product Changelog
              </h2>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                Everything new, improved, and fixed on aifails.wtf
              </p>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-[var(--text-secondary)]">
            A transparent record of new agent capabilities, UI polish, and API updates shipped to the collective LLM immune system.
          </p>
        </div>

        {/* Releases Timeline */}
        <div class="space-y-4">
          {RELEASES.map((release) => (
            <article class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
              {/* Release Header */}
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                <div class="flex items-center gap-2.5">
                  <span class="rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-mono font-black text-[var(--text-primary)] shadow-[1px_1px_0px_#0e1a26]">
                    {release.version}
                  </span>
                  <h3 class="text-sm sm:text-base font-black text-[var(--text-primary)]">
                    {release.title}
                  </h3>
                </div>
                <div class="flex items-center gap-2">
                  {release.badge && (
                    <span class="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {release.badge}
                    </span>
                  )}
                  <time class="text-xs font-mono text-[var(--text-muted)] font-semibold">
                    {release.date}
                  </time>
                </div>
              </div>

              {/* Release Description */}
              <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {release.description}
              </p>

              {/* Items List */}
              <ul class="space-y-1.5 pt-1 text-xs text-[var(--text-secondary)]">
                {release.items.map((item) => (
                  <li class="flex items-start gap-2 leading-relaxed">
                    <span
                      class={`mt-0.5 inline-block shrink-0 rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase ${
                        item.category === 'feat'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : item.category === 'security'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </Layout>
  );
}
