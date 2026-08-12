type SuggestionFormProps = {
  confessionId: string;
};

export function SuggestionForm({ confessionId }: SuggestionFormProps) {
  return (
    <form
      id={`suggestion-form-${confessionId}`}
      action={`/confessions/${confessionId}/suggestions`}
      method="post"
      class="hidden mt-3 rounded-xl border border-[var(--amber-border)] bg-[var(--amber-bg)] p-4"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-[var(--amber-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span class="text-xs font-bold uppercase tracking-wider text-[var(--amber-text)]">
            Submit a Correction ("Ackchyually...")
          </span>
        </div>
        <button
          type="button"
          class="toggle-suggestion-btn text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          data-confession-id={confessionId}
        >
          ✕
        </button>
      </div>

      <div class="mb-3 grid grid-cols-2 gap-2">
        <label class="flex items-center gap-2 rounded-lg border border-[var(--amber-border)] bg-[var(--bg-card)] p-2.5 text-xs font-semibold text-[var(--amber-text)] cursor-pointer">
          <input type="radio" name="suggestion_type" value="prompt" checked class="accent-[var(--amber-accent)]" />
          Fix the Prompt
        </label>
        <label class="flex items-center gap-2 rounded-lg border border-[var(--amber-border)] bg-[var(--bg-card)] p-2.5 text-xs font-semibold text-[var(--amber-text)] cursor-pointer">
          <input type="radio" name="suggestion_type" value="model" class="accent-[var(--amber-accent)]" />
          Recommend Model
        </label>
      </div>

      <textarea
        name="body"
        required
        placeholder="What should they have asked or used instead?"
        rows={2}
        class="w-full resize-none rounded-lg border border-[var(--amber-border)] bg-[var(--bg-card)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-accent)]"
      ></textarea>

      <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          name="author_name"
          placeholder="Your name or handle (optional)"
          class="rounded-lg border border-[var(--amber-border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber-accent)] focus:outline-none"
        />
        <button
          type="submit"
          class="rounded-lg bg-[var(--amber-accent)] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:opacity-90 cursor-pointer"
        >
          Submit Correction
        </button>
      </div>
    </form>
  );
}
