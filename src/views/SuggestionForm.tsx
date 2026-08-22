type SuggestionFormProps = {
  confessionId: string;
};

export function SuggestionForm({ confessionId }: SuggestionFormProps) {
  return (
    <form
      id={`suggestion-form-${confessionId}`}
      action={`/confessions/${confessionId}/suggestions`}
      method="post"
      class="hidden mt-3 rounded-xl border border-[var(--amber-border)] bg-[var(--bg-subtle)] p-3.5 space-y-3"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5 text-[var(--amber-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span class="text-xs font-bold uppercase tracking-wider text-[var(--amber-text)]">
            Ackchyually... (Better Prompt / Model)
          </span>
        </div>
        <button
          type="button"
          class="toggle-suggestion-btn text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded cursor-pointer"
          data-confession-id={confessionId}
        >
          ✕
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label class="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer hover:border-[var(--amber-border)] transition-colors">
          <input type="radio" name="suggestion_type" value="prompt" checked class="accent-[var(--amber-accent)]" />
          <span>Fix the Prompt</span>
        </label>
        <label class="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer hover:border-[var(--amber-border)] transition-colors">
          <input type="radio" name="suggestion_type" value="model" class="accent-[var(--amber-accent)]" />
          <span>Recommend Model</span>
        </label>
      </div>

      <textarea
        name="body"
        required
        placeholder="What should they have asked or used instead?"
        rows={2}
        class="w-full resize-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-accent)]"
      ></textarea>

      <div class="flex justify-end">
        <button
          type="submit"
          class="rounded-lg bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-hover)] active:scale-95 cursor-pointer shrink-0"
        >
          Post "Ackchyually..."
        </button>
      </div>
    </form>
  );
}
