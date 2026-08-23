type SuggestionFormProps = {
  confessionId: string;
  turnstileSiteKey?: string;
};

export function SuggestionForm({ confessionId, turnstileSiteKey }: SuggestionFormProps) {
  return (
    <section
      id="ackchyually-form"
      class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3px_3px_0px_#0e1a26] space-y-4"
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
          <label class="cursor-pointer">
            <input type="radio" name="suggestion_type" value="prompt" checked class="peer sr-only" />
            <span class="flex items-center justify-center gap-2 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] p-2.5 text-xs font-bold text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#0e1a26] peer-checked:translate-x-0.5 peer-checked:translate-y-0.5 peer-checked:shadow-none peer-checked:border-[var(--border-color)] peer-checked:bg-[var(--accent-primary)] peer-checked:text-[var(--accent-text)]">
              <span>Fix the Prompt</span>
            </span>
          </label>
          <label class="cursor-pointer">
            <input type="radio" name="suggestion_type" value="model" class="peer sr-only" />
            <span class="flex items-center justify-center gap-2 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] p-2.5 text-xs font-bold text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_#0e1a26] peer-checked:translate-x-0.5 peer-checked:translate-y-0.5 peer-checked:shadow-none peer-checked:border-[var(--border-color)] peer-checked:bg-[var(--accent-primary)] peer-checked:text-[var(--accent-text)]">
              <span>Recommend Model</span>
            </span>
          </label>
        </div>

        <textarea
          name="body"
          required
          placeholder="What should they have asked or which model should they have used instead?"
          rows={3}
          class="w-full resize-none rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        ></textarea>

        {/* Cloudflare Turnstile Anti-Bot Verification */}
        {turnstileSiteKey && (
          <div class="my-2 flex justify-end">
            <div
              class="cf-turnstile"
              data-sitekey={turnstileSiteKey}
              data-action="suggestion"
              data-theme="auto"
            ></div>
          </div>
        )}
        <div class="flex justify-end">
          <button
            type="submit"
            class="inline-flex h-8 items-center justify-center rounded-md bg-[var(--accent-primary)] px-4 text-xs font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
          >
            Post "Ackchyually..."
          </button>
        </div>
      </form>
    </section>
  );
}
