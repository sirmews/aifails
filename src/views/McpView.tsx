import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';

export function McpView() {
  const npxSkillsCmd = 'npx skills add sirmews/aifails';
  const npxSkillsUseCmd = 'npx skills use sirmews/aifails@aifails';
  const claudeCodeSkillCmd = 'mkdir -p .claude/skills/aifails && curl -sS https://aifails.wtf/skill.md > .claude/skills/aifails/SKILL.md';

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

  const claudeCodeMcpCmd = 'claude mcp add --transport http aifails https://aifails.wtf/mcp';
  const codexCli = 'codex mcp add aifails --url https://aifails.wtf/mcp';
  const piCli = 'pi mcp add aifails https://aifails.wtf/mcp';

  return (
    <Layout
      title="Connect Agent Skills & MCP — aifails.wtf"
      description="Connect real-world LLM anti-patterns, prompt guardrails, and failure modes directly to Claude Code, Pi, Cursor, Codex, OpenCode, and Claude Desktop via Agent Skills or Model Context Protocol."
      ogTitle="Agent Skills & MCP — aifails.wtf"
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
          <div class="flex items-center gap-2">
            <span class="rounded border border-[var(--accent-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-mono font-bold text-[var(--accent-primary)] shadow-[1px_1px_0px_#0e1a26]">
              Agent Skills • MCP • OpenAPI 3.1
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-[4px_4px_0px_#0e1a26] space-y-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-primary)] text-[var(--accent-text)] border-2 border-[var(--border-color)] text-lg font-black shadow-[2px_2px_0px_#0e1a26]">
              ⚡
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Agent Skills &amp; MCP Integration
              </h2>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                The collective immune system against LLM coding mistakes
              </p>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-[var(--text-secondary)]">
            Connect <code class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-xs font-bold text-[var(--accent-primary)]">aifails.wtf</code> directly to your coding assistant. Your agent can query known hallucinations, negative prompt guardrails, and community fixes before touching your codebase.
          </p>
        </div>

        {/* Quick 1-Click Install Banner */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] p-4 sm:p-5 shadow-[3px_3px_0px_#0e1a26] space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🚀</span>
              <span class="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                Fastest Setup: Universal Skills CLI
              </span>
            </div>
            <span class="text-[10px] font-mono font-bold text-[var(--accent-primary)]">
              Claude Code • Pi • Cursor
            </span>
          </div>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
            Install the verified <code class="font-mono font-bold text-[var(--text-primary)]">aifails</code> skill package across all coding agents in one terminal command:
          </p>
          <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
            <code class="select-all">{npxSkillsCmd}</code>
            <button
              type="button"
              onclick={`navigator.clipboard.writeText(${JSON.stringify(npxSkillsCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
              class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
            >
              Copy Command
            </button>
          </div>
        </div>

        {/* Multi-Agent Tabbed Setup Guide */}
        <div class="space-y-3 pt-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Environment Setup Guides
            </h3>
            <span class="text-xs font-semibold text-[var(--text-muted)]">
              Select your agent harness below
            </span>
          </div>

          {/* Tab Navigation Buttons */}
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-black text-[var(--accent-text)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer shrink-0"
              data-tab="skills-cli"
            >
              Skills CLI
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="claude-code"
            >
              Claude Code
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="claude-desktop"
            >
              Claude Desktop
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="cursor"
            >
              Cursor &amp; Windsurf
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="pi"
            >
              Pi / OMP
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="codex"
            >
              Codex
            </button>
            <button
              type="button"
              class="mcp-tab-btn rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] cursor-pointer shrink-0"
              data-tab="opencode"
            >
              OpenCode
            </button>
          </div>

          {/* Tab 1: Skills CLI */}
          <div id="tab-panel-skills-cli" class="mcp-tab-panel rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                Skills CLI (`npx skills`)
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">Universal Package</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Add the <code class="font-mono font-bold text-[var(--accent-primary)]">aifails</code> skill to your workspace or run it on-demand without installing:
            </p>
            <div class="space-y-2">
              <div class="text-[11px] font-bold text-[var(--text-secondary)]">Install into project:</div>
              <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                <code class="select-all">{npxSkillsCmd}</code>
                <button
                  type="button"
                  onclick={`navigator.clipboard.writeText(${JSON.stringify(npxSkillsCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                  class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
                >
                  Copy Command
                </button>
              </div>
              <div class="text-[11px] font-bold text-[var(--text-secondary)] pt-1">One-shot usage without installation:</div>
              <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-cyan-400 overflow-x-auto">
                <code class="select-all">{npxSkillsUseCmd}</code>
                <button
                  type="button"
                  onclick={`navigator.clipboard.writeText(${JSON.stringify(npxSkillsUseCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                  class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
                >
                  Copy Command
                </button>
              </div>
            </div>
          </div>

          {/* Tab 2: Claude Code */}
          <div id="tab-panel-claude-code" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                Claude Code (Anthropic)
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">Skill or MCP</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Option A: Install the native <code class="font-mono font-bold text-[var(--accent-primary)]">.claude/skills/</code> definition (recommended, zero-token overhead):
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
              <code class="select-all">{claudeCodeSkillCmd}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(claudeCodeSkillCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium pt-1">
              Option B: Connect via global MCP server daemon:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-cyan-400 overflow-x-auto">
              <code class="select-all">{claudeCodeMcpCmd}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(claudeCodeMcpCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
          </div>

          {/* Tab 3: Claude Desktop */}
          <div id="tab-panel-claude-desktop" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                Claude Desktop App
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

          {/* Tab 4: Cursor & Windsurf */}
          <div id="tab-panel-cursor" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                Cursor &amp; Windsurf
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

          {/* Tab 5: Pi / Oh My Pi */}
          <div id="tab-panel-pi" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                Pi / Oh My Pi (`pi` / `omp`)
              </span>
              <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">Skill or MCP</span>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Install the <code class="font-mono font-bold text-[var(--accent-primary)]">aifails</code> skill package directly into your Pi workspace:
            </p>
            <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
              <code class="select-all">{npxSkillsCmd}</code>
              <button
                type="button"
                onclick={`navigator.clipboard.writeText(${JSON.stringify(npxSkillsCmd)}).then(() => { this.textContent = '✓ Copied'; setTimeout(() => this.textContent = 'Copy Command', 2000); })`}
                class="ml-3 shrink-0 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                Copy Command
              </button>
            </div>
            <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium pt-1">
              Or connect via MCP:
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

          {/* Tab 6: Codex CLI */}
          <div id="tab-panel-codex" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                OpenAI Codex CLI
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

          {/* Tab 7: OpenCode */}
          <div id="tab-panel-opencode" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-3">
            <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span class="text-sm font-black text-[var(--text-primary)]">
                OpenCode
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
            Included Capabilities &amp; Tools
          </h3>

          <div class="grid gap-3 sm:grid-cols-3">
            {/* Tool 1 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="font-mono text-xs font-bold text-[var(--accent-primary)]">
                get_anti_patterns
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Queries known LLM traps by framework (e.g. Tailwind, Rust, D1, Next.js) and returns actionable negative prompt rules.
              </p>
            </div>

            {/* Tool 2 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="font-mono text-xs font-bold text-[#38bdf8]">
                get_random_fail
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Fetches a random prompt failure with developer reaction and community prompt fixes in clean Markdown.
              </p>
            </div>

            {/* Tool 3 */}
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="font-mono text-xs font-bold text-emerald-400">
                submit_fail
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Anonymously contributes prompt failures directly from agent sessions with automated Gitleaks secret scrubbing.
              </p>
            </div>
          </div>
        </div>

        {/* Machine Specifications Links */}
        <div class="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[3px_3px_0px_#0e1a26] space-y-2">
          <div class="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
            Machine Specifications &amp; Direct Descriptors
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
            <a href="/openapi.json" class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between">
              <span>📄 OpenAPI 3.1 (JSON)</span>
              <span class="text-[10px] text-[var(--accent-primary)]">/openapi.json</span>
            </a>
            <a href="/skill.md" class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between">
              <span>📦 Raw Skill Definition</span>
              <span class="text-[10px] text-[var(--accent-primary)]">/skill.md</span>
            </a>
            <a href="/.well-known/api-catalog" class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between">
              <span>🌐 RFC 9727 API Catalog</span>
              <span class="text-[10px] text-[var(--accent-primary)]">/.well-known/api-catalog</span>
            </a>
            <a href="/llms-full.txt" class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between">
              <span>🤖 Full Anti-Pattern Catalog</span>
              <span class="text-[10px] text-[var(--accent-primary)]">/llms-full.txt</span>
            </a>
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
