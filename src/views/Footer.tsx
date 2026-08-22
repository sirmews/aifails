export function Footer() {
  return (
    <footer class="mt-auto border-t border-[var(--border-color)] py-8 text-center space-y-1.5 px-4">
      <p class="text-sm text-[var(--text-muted)]">
        Prompt Confessional — because talking to machines shouldn't feel this lonely.
      </p>
      <p class="text-xs text-[var(--text-muted)]">
        Frustratingly made by{' '}
        <a
          href="https://perfectlycromulent.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors"
        >
          Nav
        </a>{' '}
        with Gemini.
      </p>
    </footer>
  );
}
