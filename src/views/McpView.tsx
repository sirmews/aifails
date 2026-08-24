import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';

export function McpView() {
  const standardMcpJson = `{
  "mcpServers": {
    "aifails": {
      "url": "https://aifails.wtf/mcp"
    }
  }
}`;

  const openCodeJson = `{
  "mcp": {
    "servers": {
      "aifails": {
        "type": "http",
        "url": "https://aifails.wtf/mcp"
      }
    }
  }
}`;

  const claudeCodeCli = 'claude mcp add --transport http aifails https://aifails.wtf/mcp';
  const codexCli = 'codex mcp add aifails --url https://aifails.wtf/mcp';
  const piCli = 'pi mcp add aifails https://aifails.wtf/mcp';

  return (
    <Layout
      title="Connect Model Context Protocol (MCP) — aifails.wtf"
      description="Connect real-world LLM anti-patterns, prompt guardrails, and failure modes directly to Claude Code, Claude Desktop, Cursor, Codex, Pi, and OpenCode."
      ogTitle="Model Context Protocol (MCP) — aifails.wtf"
      ogDescription="Turn aifails.wtf into an active immune system for your coding agents (Claude, Cursor, Codex, Pi, OpenCode, Devin)."
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

        {/* Multi-Agent Tabbed Setup Guide */}
        <div class="space-y-3 pt-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Agent Setup Guides
            </h3>
            <span class="text-xs font-semibold text-[var(--text-muted)]">
              Select your harness below
            </span>
          </div>

          {/* Tab Navigation Buttons */}
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-black text-[var(--accent-text)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer shrink-0"
              data-tab="claude-code"
            >
              🤖 Claude Code
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="claude-desktop"
            >
              🖥️ Claude Desktop
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="cursor"
            >
              ⚡ Cursor &amp; Windsurf
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="codex"
            >
              🧠 Codex
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="pi"
            >
              🥧 Pi
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="opencode"
            >
              💻 OpenCode
            </button>
          </div>

          {/* Tab 1: Claude Code CLI */}
          <div id="tab-panel-claude-code" class="mcp-tab-panel rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🤖</span> Claude Code CLI Integration
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">Terminal CLI</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Run this single command in your terminal to register the MCP server globally for all Claude Code projects:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
              <code class="select-all">{claudeCodeCli}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(claudeCodeCli)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
          </div>

          {/* Tab 2: Claude Desktop */}
          <div id="tab-panel-claude-desktop" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🖥️</span> Claude Desktop App
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">claude_desktop_config.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Add this block to your <code class="font-mono text-[var(--accent-primary)] font-bold">claude_desktop_config.json</code> under <code class="font-mono font-bold">mcpServers</code>:
            </p>
            <div class="relative rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3.5 text-xs font-mono text-slate-200 overflow-x-auto">
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(standardMcpJson)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Config', 2000); })`}
                class="absolute top-2.5 right-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Config
              </button>
              <pre class="pt-2"><code>{standardMcpJson}</code></pre>
            </div>
          </div>

          {/* Tab 3: Cursor & Windsurf */}
          <div id="tab-panel-cursor" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>⚡</span> Cursor &amp; Windsurf
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">.cursor/mcp.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              In Cursor, go to <code class="font-mono font-bold">Settings → Features → MCP → Add New MCP Server</code> with Type <code class="font-mono font-bold text-[var(--accent-primary)]">HTTP</code>, or add to <code class="font-mono font-bold">.cursor/mcp.json</code>:
            </p>
            <div class="relative rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3.5 text-xs font-mono text-amber-300 overflow-x-auto">
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(standardMcpJson)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Config', 2000); })`}
                class="absolute top-2.5 right-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Config
              </button>
              <pre class="pt-2"><code>{standardMcpJson}</code></pre>
            </div>
          </div>

          {/* Tab 4: Codex CLI */}
          <div id="tab-panel-codex" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🧠</span> OpenAI Codex CLI
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">~/.codex/config.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Run this command or add the MCP block to your <code class="font-mono font-bold text-[var(--accent-primary)]">~/.codex/config.json</code>:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-cyan-400 overflow-x-auto">
              <code class="select-all">{codexCli}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(codexCli)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
          </div>

          {/* Tab 5: Pi Coding Agent */}
          <div id="tab-panel-pi" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🥧</span> Pi Coding Agent (`pi`)
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">~/.pi/config.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Add the MCP server to your <code class="font-mono font-bold text-[var(--accent-primary)]">pi</code> coding agent session:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-amber-400 overflow-x-auto">
              <code class="select-all">{piCli}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(piCli)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
          </div>

          {/* Tab 6: OpenCode */}
          <div id="tab-panel-opencode" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>💻</span> OpenCode
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">opencode.json</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Add this block to your project's <code class="font-mono font-bold text-[var(--accent-primary)]">opencode.json</code> or global config:
            </p>
            <div class="relative rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto">
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(openCodeJson)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Config', 2000); })`}
                class="absolute top-2.5 right-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Config
              </button>
              <pre class="pt-2"><code>{openCodeJson}</code></pre>
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

        {/* Client-Side Tab Switching Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var tabs = document.querySelectorAll('.mcp-tab-btn');
    var panels = document.querySelectorAll('.mcp-tab-panel');

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var targetId = 'tab-panel-' + tab.getAttribute('data-tab');

        // Update tabs active state
        tabs.forEach(function(t) {
          t.classList.remove('bg-[var(--accent-primary)]', 'text-[var(--accent-text)]', 'font-black', 'shadow-[2.5px_2.5px_0px_#0e1a26]');
          t.classList.add('bg-[var(--bg-subtle)]', 'text-[var(--text-secondary)]', 'font-bold', 'shadow-[2px_2px_0px_#0e1a26]');
        });

        tab.classList.remove('bg-[var(--bg-subtle)]', 'text-[var(--text-secondary)]', 'font-bold', 'shadow-[2px_2px_0px_#0e1a26]');
        tab.classList.add('bg-[var(--accent-primary)]', 'text-[var(--accent-text)]', 'font-black', 'shadow-[2.5px_2.5px_0px_#0e1a26]');

        // Update panels visibility
        panels.forEach(function(panel) {
          if (panel.id === targetId) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });
      });
    });
  });
})();
            `,
          }}
        />
      </main>

      <Footer />
    </Layout>
  );
}
