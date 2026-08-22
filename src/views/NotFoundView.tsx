import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';

export function NotFoundView() {
  return (
    <Layout title="404 - Confession Not Found | Prompt Confessional">
      <Header />

      <main class="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center w-full">
        <div class="mb-4 rounded-full bg-[var(--bg-subtle)] p-4 text-[var(--text-muted)]">
          <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 class="mb-2 text-2xl font-bold text-[var(--text-primary)]">Confession Not Found</h1>
        <p class="mb-6 max-w-md text-sm text-[var(--text-secondary)]">
          The confession you are looking for does not exist or may have been removed.
        </p>
        <a
          href="/"
          class="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          ← Back to homepage
        </a>
      </main>

      <Footer />
    </Layout>
  );
}
