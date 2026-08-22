import type { ModelOption } from '../core/types';

const MOODS = [
  { value: 'furious', label: 'Furious', emoji: '😡' },
  { value: 'defeated', label: 'Defeated', emoji: '😩' },
  { value: 'bewildered', label: 'Bewildered', emoji: '🤯' },
  { value: 'amused', label: 'Darkly Amused', emoji: '😏' },
  { value: 'numb', label: 'Numb', emoji: '😐' },
  { value: 'vengeful', label: 'Vengeful', emoji: '🔥' },
];

type ConfessionFormProps = {
  models?: ModelOption[];
  turnstileSiteKey?: string;
};

export function ConfessionForm({ models = [], turnstileSiteKey }: ConfessionFormProps) {
  return (
    <div
      id="confess-modal-backdrop"
      class="hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-300 ease-out p-0 sm:p-4"
    >
      <div
        id="confess-modal-card"
        class="w-full max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-2xl transition-all duration-300 ease-out translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0 sm:max-w-xl"
      >
        {/* Modal Header */}
        <div class="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)]">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-[var(--text-primary)]">Submit a Confession</h2>
              <p class="text-xs text-[var(--text-muted)]">Vent about your prompt fail</p>
            </div>
          </div>

          <button
            type="button"
            id="close-modal-btn"
            class="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close confession modal"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form action="/confessions" method="post" class="space-y-4">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              What did you ask for?
            </label>
            <textarea
              name="prompt_used"
              required
              placeholder="Write a simple function that returns the current date. Just the date. Nothing else."
              rows={3}
              class="w-full resize-none rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            ></textarea>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              What did it do instead?
            </label>
            <textarea
              name="what_it_did_instead"
              required
              placeholder="It wrote a 200-line class with timezone conversion, a full DateUtils library, and a 3-paragraph explanation of ISO 8601."
              rows={3}
              class="w-full resize-none rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            ></textarea>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              How did it make you feel?
            </label>
            <textarea
              name="how_it_made_them_feel"
              required
              placeholder="I asked for ONE LINE. One. I got a dissertation."
              rows={2}
              class="w-full resize-none rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            ></textarea>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Your mood
            </label>
            <div class="flex flex-wrap gap-1.5">
              {MOODS.map((m, idx) => (
                <label class="cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value={m.value}
                    checked={idx === 0}
                    class="peer sr-only"
                  />
                  <span class="inline-block rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all peer-checked:border-[var(--accent-primary)] peer-checked:bg-[var(--accent-primary)] peer-checked:text-[var(--accent-text)] hover:border-[var(--border-subtle)]">
                    <span class="mr-1">{m.emoji}</span>
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Compact Searchable Model Combobox */}
          <div>
            <label class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              <svg class="h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Which model betrayed you? (optional)
            </label>
            <div class="relative" id="model-combobox-container">
              <input
                type="text"
                id="model-search-input"
                name="model_query"
                autocomplete="off"
                placeholder="Search model (e.g. Claude, GPT-4o, Llama)..."
                class="w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
              
              {/* Scrollable, Max-Height Filtered Dropdown */}
              <div
                id="model-dropdown"
                class="hidden absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-xl text-xs"
              >
                {models.slice(0, 10).map((m) => (
                  <div
                    class="model-option cursor-pointer rounded px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                    data-value={m.provider ? `${m.provider} / ${m.name}` : m.name}
                    data-search={`${m.provider || ''} ${m.name} ${m.id || ''}`.toLowerCase()}
                  >
                    <span class="font-semibold text-[var(--text-primary)]">{m.provider}</span>
                    {m.provider && <span class="text-[var(--text-muted)]"> / </span>}
                    <span class="text-[var(--text-secondary)]">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cloudflare Turnstile Anti-Bot Verification */}
          {turnstileSiteKey && (
            <div class="my-3 flex justify-center">
              <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto"></div>
            </div>
          )}

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-4 py-3 text-sm font-semibold text-[var(--accent-text)] transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] cursor-pointer"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Confession
          </button>
        </form>
      </div>
    </div>
  );
}
