import type { Confession, ConfessionSuggestion } from '../core/types';
import { timeAgo, moodEmoji, moodLabel } from './utils';

type ConfessionCardProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
  isPermalink?: boolean;
};

export function ConfessionCard({ confession, suggestions = [], isPermalink = false }: ConfessionCardProps) {
  return (
    <article class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition-shadow hover:shadow-sm">
      {/* Mood badge + model */}
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded border border-[var(--border-color)] bg-[var(--badge-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--badge-text)]">
            <span>{moodEmoji(confession.mood)}</span>
            {moodLabel(confession.mood)}
          </span>
          {confession.model_name && (
            <span class="inline-flex items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--badge-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--badge-text)]">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {confession.model_provider ? `${confession.model_provider} / ` : ''}
              {confession.model_name}
            </span>
          )}
        </div>
        {isPermalink ? (
          <span class="text-xs text-[var(--text-muted)]">{timeAgo(confession.created_at)}</span>
        ) : (
          <a
            href={`/confessions/${confession.id}`}
            class="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline transition-colors"
            title="View single confession"
          >
            {timeAgo(confession.created_at)}
          </a>
        )}
      </div>

      {/* 1. Prompt */}
      <div class="mb-3.5 border-l-[3px] border-[var(--border-subtle)] pl-3.5">
        <p class="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          What I asked for
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)]">{confession.prompt_used}</p>
      </div>

      {/* 2. What it did instead */}
      <div class="mb-3.5 border-l-[3px] border-[var(--danger-border)] pl-3.5">
        <p class="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          What it did instead
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)]">{confession.what_it_did_instead}</p>
      </div>

      {/* 3. The human reaction */}
      <div class="mb-4 border-l-[3px] border-[var(--amber-border)] pl-3.5">
        <p class="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          How it made me feel
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-secondary)]">{confession.how_it_made_them_feel}</p>
      </div>

      {/* Action Buttons Bar */}
      <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--border-color)]">
        {/* Left Actions: Primary Interactions */}
        <div class="flex flex-wrap items-center gap-2">
          {/* Solidarity Button */}
          <form action={`/confessions/${confession.id}/solidarity`} method="post" class="solidarity-form inline m-0 p-0">
            <button
              type="submit"
              class="solidarity-btn inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-color)] border-b-2 border-b-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-secondary)] shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--danger-border)] hover:border-b-2 hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)] hover:shadow-[0_2.5px_0_0_#dc2626] active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <svg class="h-3.5 w-3.5 text-[var(--danger-text)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Solidarity</span>
              <span class="solidarity-count font-bold text-[var(--text-primary)]">{confession.solidarity_count}</span>
            </button>
          </form>

          {/* Ackchyually... Button */}
          <a
            href={isPermalink ? '#ackchyually-form' : `/confessions/${confession.id}#ackchyually-form`}
            class="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-color)] border-b-2 border-b-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-secondary)] shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--amber-border)] hover:border-b-2 hover:bg-[var(--amber-bg)] hover:text-[var(--amber-text)] hover:shadow-[0_2.5px_0_0_#b45309] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="View or submit Ackchyually suggestions"
          >
            <svg class="h-3.5 w-3.5 text-[var(--amber-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Ackchyually...</span>
            {suggestions.length > 0 && (
              <span class="ml-0.5 rounded border border-[var(--amber-border)] bg-[var(--amber-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--amber-text)]">
                {suggestions.length}
              </span>
            )}
          </a>
        </div>

        {/* Right Actions: Utilities */}
        <div class="flex items-center gap-2">
          {/* Share / Copy Link Button */}
          <button
            type="button"
            class="copy-permalink-btn inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-color)] border-b-2 border-b-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 text-xs font-medium text-[var(--text-secondary)] shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:shadow-[0_2.5px_0_0_#4b526b] active:translate-y-0.5 active:shadow-none cursor-pointer"
            data-permalink={`/confessions/${confession.id}`}
            title="Copy link to clipboard"
          >
            <svg class="h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span class="copy-label">Share</span>
          </button>

          {/* Report / Flag Button */}
          <form
            action={`/confessions/${confession.id}/report`}
            method="post"
            class="confirm-submit-form inline m-0 p-0"
            data-confirm-message="Report this post for moderation review?"
          >
            <button
              type="submit"
              title="Report this post"
              class="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-color)] border-b-2 border-b-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 text-xs font-medium text-[var(--text-secondary)] shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--danger-border)] hover:border-b-2 hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)] hover:shadow-[0_2.5px_0_0_#dc2626] active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <svg class="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--danger-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <span class="hidden sm:inline">Report</span>
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
