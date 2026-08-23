export function Header() {
  return (
    <header class="sticky top-0 z-40 border-b-2 border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-3 sm:px-4 py-3">
        <a href="/" class="group flex items-center gap-2.5 sm:gap-3 transition-opacity">
          {/* 100% Solid Hard-Shadow Keycap Logo */}
          <div class="relative flex h-8 sm:h-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)] px-2.5 font-mono text-xs sm:text-sm font-black tracking-tight border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0px_#0e1a26] group-active:translate-x-0.5 group-active:translate-y-0.5 group-active:shadow-[1px_1px_0px_#0e1a26] select-none cursor-pointer">
            (╯°□°)╯
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black leading-none tracking-tight text-[var(--text-primary)]">
              Prompt Confessional
            </h1>
            <p class="hidden sm:block text-xs font-semibold text-[var(--text-secondary)] mt-0.5">a safe space for AI frustration</p>
          </div>
        </a>

        <div class="flex items-center gap-2 sm:gap-3">
          {/* Solid Bart Yellow Confess Button */}
          <button
            id="open-confess-btn"
            type="button"
            class="relative rounded-md bg-[var(--accent-primary)] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer shrink-0"
          >
            Confess
          </button>
        </div>
      </div>
    </header>
  );
}
