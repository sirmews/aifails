import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';

export function McpView() {
  const claudeDesktopConfig = `{
  "mcpServers": {
    "aifails": {
      "url": "https://aifails.wtf/mcp"
    }
  }
}`;
  const claudeCodeCli = 'claude mcp add --transport http aifails https://aifails.wtf/mcp';

  return (
    <Layout
      title="Connect Model Context Protocol (MCP) — aifails.wtf"
      description="Connect real-world LLM anti-patterns, prompt guardrails, and failure modes directly to Claude Desktop, Cursor, Windsurf, and Claude Code."
      ogTitle="Model Context Protocol (MCP) — aifails.wtf"
      ogDescription="Turn aifails.wtf into an active immune system for your coding agents (Claude, Cursor, Windsurf, Devin)."
    >
      <Header />

      <main class="mx-auto max-w-3xl space-y-6 px-4 py-8 w-full pb-16">
        {/* Navigation Breadcrumb */}
        <div class="flex items-center justify-between">
          <a
            href="/"
            class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26]"
          >
            ← Back to all prompt fails
          </a>
          <span class="rounded border border-[var(--accent-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-mono font-bold text-[var(--accent-primary)] shadow-[1px_1px_0px_#0e1a26]">
            JSON-RPC 2.0 • HTTP Transport
          </span>
        </div>

        {/* Hero Header */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-[4px_4px_0px_#0e1a26] space-y-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)] border-2 border-[var(--border-color)] text-lg font-black shadow-[2px_2px_0px_#0e1a26]">
              ⚡
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Model Context Protocol (MCP)
              </h2>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                The collective immune system against LLM coding mistakes
              </p>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-[var(--text-secondary)]">
            Connect <code class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-xs font-bold text-[var(--accent-primary)]">aifails.wtf</code> directly to your coding assistant. Your agent can query known hallucinations, negative prompt rules, and community fixes before touching your codebase.
          </p>
        </div>

        {/* Quick Setup Cards */}
        <div class="space-y-4">
          <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            1-Click Setup Guides
          </h3>

          {/* 1. Claude Code CLI */}
          <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[3px_3px_0px_#0e1a26] space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🤖</span> Claude Code CLI
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-semibold">Terminal</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] font-medium">
              Run this single command in your terminal to register the MCP server globally:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
              <code class="select-all">{claudeCodeCli}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(claudeCodeCli)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          {/* 2. Claude Desktop */}
          <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[3px_3px_0px_#0e1a26] space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🖥️</span> Claude Desktop App
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-semibold">claude_desktop_config.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] font-medium">
              Add this block to your <code class="font-mono text-[var(--accent-primary)] font-bold">claude_desktop_config.json</code> under <code class="font-mono font-bold">mcpServers</code>:
            </p>
            <div class="relative rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-slate-200 overflow-x-auto">
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(claudeDesktopConfig)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Config', 2000); })`}
                class="absolute top-2.5 right-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Config
              </button>
              <pre class="pt-2"><code>{claudeDesktopConfig}</code></pre>
            </div>
          </div>

          {/* 3. Cursor & Windsurf */}
          <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[3px_3px_0px_#0e1a26] space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>⚡</span> Cursor &amp; Windsurf
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-semibold">Settings → MCP</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] font-medium">
              Add a new MCP server in your IDE settings with Type <code class="font-mono font-bold text-[var(--accent-primary)]">HTTP / SSE</code> and Server URL:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-amber-300 overflow-x-auto">
              <code class="select-all">https://aifails.wtf/mcp</code>
              <button
                type="button"
                onclick="navigator.clipboard.writeText('https://aifails.wtf/mcp').then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy URL', 2000); })"
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>

        {/* Exposed Tools Catalog */}
        <div class="space-y-3 pt-2">
          <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            Included MCP Tools
          </h3>

          <div class="grid gap-3 sm:grid-cols-3">
            {/* Tool 1 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--accent-primary)]">
                <span>🛡️</span>
                <span>get_anti_patterns</span>
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Queries known LLM traps by framework (e.g. NAPI-rs, Tailwind, Rust) and returns actionable negative prompt rules.
              </p>
            </div>

            {/* Tool 2 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-[#38bdf8]">
                <span>🔀</span>
                <span>get_random_fail</span>
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Fetches a random prompt failure with developer reaction and community prompt fixes.
              </p>
            </div>

            {/* Tool 3 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                <span>✍️</span>
                <span>submit_fail</span>
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Anonymously contributes prompt failures directly from agent sessions with automated Gitleaks secret scrubbing.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </Layout>
  );
}
