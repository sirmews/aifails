import type { Confession, ConfessionSuggestion } from '../core/types';
import { timeAgo, moodEmoji, moodLabel } from './utils';

type ConfessionCardProps = {
  confession: Confession;
  suggestions?: ConfessionSuggestion[];
  isPermalink?: boolean;
};

export function ConfessionCard({ confession, suggestions = [], isPermalink = false }: ConfessionCardProps) {
  return (
    <article class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5.5 shadow-[3.5px_3.5px_0px_#0e1a26]">
      {/* Mood badge + model */}
      <div class="mb-3.5 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-black text-[var(--text-primary)] shadow-[1.5px_1.5px_0px_#0e1a26]">
            <span>{moodEmoji(confession.mood)}</span>
            {moodLabel(confession.mood)}
          </span>
          {confession.model_name && (
            <span class="inline-flex items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {confession.model_provider ? `${confession.model_provider} / ` : ''}{confession.model_name}
            </span>
          )}
        </div>
        {isPermalink ? (
          <span class="text-xs font-semibold text-[var(--text-muted)]">{timeAgo(confession.created_at)}</span>
        ) : (
          <a
            href={`/confessions/${confession.id}`}
            class="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline transition-colors"
            title="View single confession"
          >
            {timeAgo(confession.created_at)}
          </a>
        )}
      </div>

      {/* 1. Prompt */}
      <div class="mb-3.5 border-l-4 border-[var(--border-subtle)] pl-3.5">
        <p class="mb-0.5 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
          What I asked for
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)] font-medium">{confession.prompt_used}</p>
      </div>

      {/* 2. What it did instead */}
      <div class="mb-3.5 border-l-4 border-[var(--danger-border)] pl-3.5">
        <p class="mb-0.5 text-xs font-black uppercase tracking-wider text-[var(--danger-text)]">
          What it did instead
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-primary)] font-medium">{confession.what_it_did_instead}</p>
      </div>

      {/* 3. The human reaction */}
      <div class="mb-4 border-l-4 border-[var(--amber-accent)] pl-3.5">
        <p class="mb-0.5 text-xs font-black uppercase tracking-wider text-[var(--amber-accent)]">
          How it made me feel
        </p>
        <p class="text-sm leading-relaxed text-[var(--text-secondary)] font-medium">{confession.how_it_made_them_feel}</p>
      </div>

      {/* Action Buttons Bar */}
      <div class="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t-2 border-[var(--border-color)]">
        {/* Left Actions: Primary Interactions */}
        <div class="flex flex-wrap items-center gap-2">
          {/* Solidarity Button (Solid Coral Pearl Orange) */}
          <form action={`/confessions/${confession.id}/solidarity`} method="post" class="solidarity-form inline m-0 p-0">
            <button
              type="submit"
              class="solidarity-btn inline-flex h-8.5 items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 text-xs font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--solidarity-bg)] hover:text-[var(--solidarity-text)] hover:shadow-[3.5px_3.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            >
              <span>♥</span>
              <span>Solidarity</span>
              <span class="solidarity-count font-black">{confession.solidarity_count}</span>
            </button>
          </form>

          {/* Ackchyually... Button (Solid Bart Yellow) */}
          <a
            href={isPermalink ? '#ackchyually-form' : `/confessions/${confession.id}#ackchyually-form`}
            class="inline-flex h-8.5 items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 text-xs font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--amber-bg)] hover:text-[var(--amber-text)] hover:shadow-[3.5px_3.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            title="View or submit Ackchyually suggestions"
          >
            <span>💡</span>
            <span>Ackchyually...</span>
            {suggestions.length > 0 && (
              <span class="ml-0.5 rounded border border-[var(--border-color)] bg-[var(--amber-bg)] px-1.5 py-0.2 text-[10px] font-black text-[var(--amber-text)]">
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
            class="copy-permalink-btn inline-flex h-8.5 items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] hover:shadow-[3.5px_3.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            data-permalink={`/confessions/${confession.id}`}
            title="Copy link to clipboard"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
              class="inline-flex h-8.5 items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)] hover:shadow-[3.5px_3.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
