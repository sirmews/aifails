export function McpPanels() {
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
    <div class="space-y-3 pt-1">
      {/* Tab 1: Skills CLI */}
      <div id="tab-panel-skills-cli" class="mcp-tab-panel rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <span class="text-sm font-black text-[var(--text-primary)]">
            Universal Skills CLI (skills.sh)
          </span>
          <span class="text-[11px] font-mono text-[var(--accent-primary)] font-bold">Recommended</span>
        </div>
        <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
          Install the public <code class="font-mono font-bold text-[var(--accent-primary)]">aifails</code> skill across Claude Code, Pi/OMP, Cursor, and Codex with one command:
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
          Or run in one-shot mode:
        </p>
        <div class="relative flex items-center justify-between rounded-md border-2 border-[var(--border-color)] bg-[#13202e] p-3 text-xs font-mono text-amber-400 overflow-x-auto">
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

      {/* Tab 2: Claude Code */}
      <div id="tab-panel-claude-code" class="mcp-tab-panel hidden rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-[3.5px_3.5px_0px_#0e1a26] space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
          <span class="text-sm font-black text-[var(--text-primary)]">
            Anthropic Claude Code
          </span>
          <span class="text-[11px] font-mono text-[var(--text-muted)] font-bold">Skill or MCP</span>
        </div>
        <p class="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
          Option A — Add as a Claude Code project skill:
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
          Option B — Connect via MCP:
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
            Anthropic Claude Desktop
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
  );
}
