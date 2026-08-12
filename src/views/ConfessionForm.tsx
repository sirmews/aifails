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
  hidden?: boolean;
};

export function ConfessionForm({ models = [], turnstileSiteKey, hidden = true }: ConfessionFormProps) {
  return (
    <section id="confess-form-section" class={`mx-auto max-w-3xl px-4 pb-8 ${hidden ? 'hidden' : ''}`}>
      <form
        action="/confessions"
        method="post"
        class="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm"
      >
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
            What did you ask for?
          </label>
          <textarea
            name="prompt_used"
            required
            placeholder="Write a simple function that returns the current date. Just the date. Nothing else."
            rows={3}
            class="w-full resize-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          ></textarea>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
            What did it do instead?
          </label>
          <textarea
            name="what_it_did_instead"
            required
            placeholder="It wrote a 200-line class with timezone conversion, a full DateUtils library, and a 3-paragraph explanation of ISO 8601."
            rows={3}
            class="w-full resize-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          ></textarea>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
            How did it make you feel?
          </label>
          <textarea
            name="how_it_made_them_feel"
            required
            placeholder="I asked for ONE LINE. One. I got a dissertation."
            rows={2}
            class="w-full resize-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          ></textarea>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Your mood
          </label>
          <div class="flex flex-wrap gap-2">
            {MOODS.map((m, idx) => (
              <label class="cursor-pointer">
                <input
                  type="radio"
                  name="mood"
                  value={m.value}
                  checked={idx === 0}
                  class="peer sr-only"
                />
                <span class="inline-block rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-all peer-checked:border-[var(--accent-primary)] peer-checked:bg-[var(--accent-primary)] peer-checked:text-[var(--accent-text)] hover:border-[var(--border-subtle)]">
                  <span class="mr-1">{m.emoji}</span>
                  {m.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Compact Searchable Model Combobox */}
        <div>
          <label class="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
            <svg class="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
              class="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
            
            {/* Scrollable, Max-Height Filtered Dropdown */}
            <div
              id="model-dropdown"
              class="hidden absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-lg text-xs"
            >
              {models.map((m) => (
                <div
                  class="model-option cursor-pointer rounded-md px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                  data-value={`${m.provider} / ${m.name}`}
                  data-search={`${m.provider} ${m.name} ${m.id}`.toLowerCase()}
                >
                  <span class="font-semibold text-[var(--text-primary)]">{m.provider}</span>
                  <span class="text-[var(--text-muted)]"> / </span>
                  <span class="text-[var(--text-secondary)]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
          <p class="mt-1.5 text-xs text-[var(--text-muted)]">
            Type to filter matching AI models in real time
          </p>
        </div>

        {/* Cloudflare Turnstile Anti-Bot Verification */}
        {turnstileSiteKey && (
          <div class="my-3 flex justify-center">
            <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light"></div>
          </div>
        )}

        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-3 text-sm font-semibold text-[var(--accent-text)] transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] cursor-pointer"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Submit Confession
        </button>
      </form>
    </section>
  );
}
