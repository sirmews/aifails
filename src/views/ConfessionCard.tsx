import type { Confession, ConfessionSuggestion } from '../core/types';
import { timeAgo, moodEmoji, moodLabel } from './utils';
import { SuggestionForm } from './SuggestionForm';

type ConfessionCardProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
};

export function ConfessionCard({ confession, suggestions = [] }: ConfessionCardProps) {
  return (
    <article class="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Mood badge + model */}
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] px-2.5 py-1 text-xs font-medium text-[var(--badge-text)]">
            <span>{moodEmoji(confession.mood)}</span>
            {moodLabel(confession.mood)}
          </span>
          {confession.model_name && (
            <span class="inline-flex items-center gap-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-1 text-xs font-medium text-[var(--badge-text)]">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {confession.model_provider ? `${confession.model_provider} / ` : ''}
              {confession.model_name}
            </span>
          )}
        </div>
        <span class="text-xs text-[var(--text-muted)]">{timeAgo(confession.created_at)}</span>
      </div>

      {/* Prompt */}
      <div class="mb-3 border-l-2 border-[var(--border-subtle)] pl-3">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          What I asked for
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)]">{confession.prompt_used}</p>
      </div>

      {/* What happened */}
      <div class="mb-3 border-l-2 border-red-400 pl-3">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          What it did instead
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)]">{confession.what_it_did_instead}</p>
      </div>

      {/* Feeling */}
      <div class="mb-4 flex gap-2 rounded-lg border-l-2 border-[var(--quote-border)] bg-[var(--quote-bg)] p-3">
        <svg class="h-4 w-4 shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <p class="text-sm italic leading-relaxed text-[var(--quote-text)]">{confession.how_it_made_them_feel}</p>
      </div>

      {/* Existing Suggestions List */}
      {suggestions.length > 0 && (
        <div class="mb-4 space-y-2 rounded-xl border border-[var(--amber-border)] bg-[var(--amber-bg)] p-3">
          <p class="text-xs font-bold uppercase tracking-wider text-[var(--amber-text)]">
            Corrections ({suggestions.length})
          </p>
          {suggestions.map((s) => (
            <div key={s.id} class="rounded-lg bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] shadow-2xs">
              <div class="mb-1 flex items-center justify-between font-semibold text-[var(--amber-text)]">
                <span class="capitalize">{s.suggestion_type} fix</span>
                <span class="text-[var(--text-muted)] font-normal">{timeAgo(s.created_at)}</span>
              </div>
              <p class="leading-normal">{s.body}</p>
              {s.author_name && (
                <p class="mt-1 text-[10px] text-[var(--text-muted)]">— {s.author_name}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactions and suggestions */}
      <div class="flex flex-wrap items-center gap-2">
        <form action={`/confessions/${confession.id}/solidarity`} method="post" class="solidarity-form inline">
          <button
            type="submit"
            class="flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
          >
            <svg class="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Show solidarity
            <span class="solidarity-count ml-1 font-semibold">{confession.solidarity_count}</span>
          </button>
        </form>

        <button
          type="button"
          class="toggle-suggestion-btn flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--amber-bg)] hover:text-[var(--amber-text)] active:scale-95 cursor-pointer"
          data-confession-id={confession.id}
        >
          <svg class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Ackchyually...
        </button>

        <a
          href={`/confessions/${confession.id}`}
          class="flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] active:scale-95 cursor-pointer"
        >
          <svg class="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Share Permalink
        </a>

        <button
          type="button"
          class="copy-permalink-btn flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] active:scale-95 cursor-pointer"
          data-permalink={`/confessions/${confession.id}`}
        >
          <svg class="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="copy-label">Copy link</span>
        </button>

        <form action={`/confessions/${confession.id}/report`} method="post" class="inline ml-auto">
          <button
            type="submit"
            title="Report this post"
            class="flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-red-500 transition-all cursor-pointer"
            onclick="return confirm('Report this post for moderation review?');"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            Report
          </button>
        </form>
      </div>
      <SuggestionForm confessionId={confession.id} />
    </article>
  );
}
