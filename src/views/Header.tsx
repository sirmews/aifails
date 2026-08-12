export function Header({ showForm = false }: { showForm?: boolean }) {
  return (
    <header class="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-[var(--accent-text)]">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold leading-none tracking-tight text-[var(--text-primary)]">
              Prompt Confessional
            </h1>
            <p class="text-xs text-[var(--text-muted)]">a safe space for AI frustration</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          {/* Theme Selector */}
          <div class="relative inline-block text-left">
            <select
              id="theme-select"
              aria-label="Select Theme Mode"
              class="rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none"
            >
              <option value="day">☀️ Day</option>
              <option value="night">🌙 Night</option>
              <option value="twilight">🌆 Twilight</option>
            </select>
          </div>

          <button
            id="toggle-form-btn"
            type="button"
            class="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-hover)] active:scale-95 cursor-pointer"
          >
            {showForm ? 'Close' : 'Confess'}
          </button>
        </div>
      </div>
    </header>
  );
}
