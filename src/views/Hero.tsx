type HeroProps = {
  confessionCount: number;
  totalSolidarity: number;
};

export function Hero({ confessionCount, totalSolidarity }: HeroProps) {
  return (
    <section class="mx-auto max-w-3xl px-4 pt-12 pb-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          You are not alone.
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
          Working with large language models is one of the most maddening experiences
          in modern technology. They don't listen. They do too much. They do too little.
          They ignore you when you change direction. This is a place to vent — share what
          you asked for, what it did instead, and how it made you feel.
        </p>
        <div class="mt-6 flex items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
          <span class="flex items-center gap-1.5">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {confessionCount} confessions
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="h-4 w-4 text-[var(--danger-text)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {totalSolidarity} in solidarity
          </span>
        </div>
      </div>
    </section>
  );
}
