export function Header() {
  return (
    <header class="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-3 sm:px-4 py-3">
        <a href="/" class="group flex items-center gap-2.5 sm:gap-3 transition-opacity">
          {/* 3D Tactile Keycap Logo Tile */}
          <div class="relative flex h-8 sm:h-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)] px-2.5 font-mono text-xs sm:text-sm font-extrabold tracking-tight border-b-2 border-r border-[#9ba1ad] shadow-[0_2px_0_0_#9ba1ad] transition-all duration-150 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_0_0_#9ba1ad,0_4px_8px_rgba(0,0,0,0.3)] group-active:translate-y-0.5 group-active:shadow-[0_1px_0_0_#9ba1ad] select-none cursor-pointer">
            (╯°□°)╯
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold leading-none tracking-tight text-[var(--text-primary)]">
              Prompt Confessional
            </h1>
            <p class="hidden sm:block text-xs font-medium text-[var(--text-secondary)] mt-0.5">a safe space for AI frustration</p>
          </div>
        </a>

        <div class="flex items-center gap-2 sm:gap-3">
          {/* Open Confess Modal Button */}
          <button
            id="open-confess-btn"
            type="button"
            class="relative rounded-md bg-[var(--accent-primary)] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[var(--accent-text)] border border-[var(--accent-primary)] border-b-2 border-b-[#9ba1ad] shadow-[0_1.5px_0_0_#9ba1ad] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[0_2.5px_0_0_#9ba1ad,0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
          >
            Confess
          </button>
        </div>
      </div>
    </header>
  );
}
