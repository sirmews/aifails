export function Footer() {
  return (
    <footer class="mt-auto border-t-2 border-[var(--border-color)] bg-[var(--bg-primary)] py-8 text-center space-y-3 px-4">
      {/* Quick Agent & Machine-Readable Discovery Links */}
      <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-[var(--text-secondary)]">
        <a
          href="/mcp"
          class="inline-flex items-center gap-1.5 hover:text-[var(--accent-primary)] hover:underline transition-colors"
          title="Connect to Claude Desktop, Cursor, and Windsurf via Model Context Protocol"
        >
          <span>⚡</span>
          <span>Connect MCP</span>
        </a>
        <span class="text-[var(--border-subtle)]">•</span>
        <a
          href="/llms.txt"
          class="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:underline transition-colors"
          title="AI Agent guidelines and index"
        >
          <span>🤖</span>
          <span>LLMs.txt</span>
        </a>
        <span class="text-[var(--border-subtle)]">•</span>
        <a
          href="/feed.xml"
          class="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:underline transition-colors"
          title="RSS 2.0 Feed"
        >
          <span>📡</span>
          <span>RSS Feed</span>
        </a>
        <span class="text-[var(--border-subtle)]">•</span>
        <a
          href="/sitemap.xml"
          class="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:underline transition-colors"
          title="XML Sitemap"
        >
          <span>🗺️</span>
          <span>Sitemap</span>
        </a>
      </div>

      <p class="text-xs text-[var(--text-muted)] font-medium">
        Prompt Confessional — because talking to machines shouldn&#39;t feel this lonely.
      </p>

      <p class="text-xs text-[var(--text-muted)]">
        Frustratingly made by{' '}
        <a
          href="https://perfectlycromulent.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors"
        >
          Nav
        </a>{' '}
        with Gemini.
      </p>
    </footer>
  );
}
