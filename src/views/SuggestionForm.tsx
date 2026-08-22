type SuggestionFormProps = {
  confessionId: string;
};

export function SuggestionForm({ confessionId }: SuggestionFormProps) {
  return (
    <section
      id="ackchyually-form"
      class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs space-y-4"
    >
      <div class="flex items-center gap-2">
        <svg
          class="h-4 w-4 text-[var(--amber-accent)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h2 class="text-sm font-bold tracking-tight text-[var(--text-primary)]">
          Ackchyually... (Because you know better)
        </h2>
      </div>

      <form action={`/confessions/${confessionId}/suggestions`} method="post" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <label class="flex items-center justify-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer hover:border-[var(--amber-border)] transition-colors">
            <input type="radio" name="suggestion_type" value="prompt" checked class="accent-[var(--amber-accent)]" />
            <span>Fix the Prompt</span>
          </label>
          <label class="flex items-center justify-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer hover:border-[var(--amber-border)] transition-colors">
            <input type="radio" name="suggestion_type" value="model" class="accent-[var(--amber-accent)]" />
            <span>Recommend Model</span>
          </label>
        </div>

        <textarea
          name="body"
          required
          placeholder="What should they have asked or which model should they have used instead?"
          rows={3}
          class="w-full resize-none rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--amber-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-accent)]"
        ></textarea>

        <div class="flex justify-end">
          <button
            type="submit"
            class="inline-flex h-8 items-center justify-center rounded-md bg-[var(--accent-primary)] px-4 text-xs font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-hover)] active:scale-95 cursor-pointer"
          >
            Post "Ackchyually..."
          </button>
        </div>
      </form>
    </section>
  );
}
