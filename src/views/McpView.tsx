import { Layout } from './Layout';
import { Header } from './Header';
import { Footer } from './Footer';
import { McpPanels } from './mcp-panels';

export function McpView({ baseUrl = 'https://aifails.wtf' }: { baseUrl?: string }) {
  const url = `${baseUrl}/mcp`;
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${url}#techarticle`,
        headline: 'Connect Agent Skills & MCP — aifails.wtf',
        description: 'Connect real-world LLM anti-patterns, prompt guardrails, and failure modes directly to Claude Code, Pi, Cursor, Codex, OpenCode, and Claude Desktop via Agent Skills or Model Context Protocol.',
        url,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        author: {
          '@type': 'Organization',
          name: 'Prompt Confessional',
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Prompt Confessional',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/og.png`,
          },
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Prompt Confessional',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Agent Skills & MCP',
              item: url,
            },
          ],
        },
      },
    ],
  };

  const headElements = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c') }}
    />
  );

  return (
    <Layout
      title="Connect Agent Skills & MCP — aifails.wtf"
      description="Connect real-world LLM anti-patterns, prompt guardrails, and failure modes directly to Claude Code, Pi, Cursor, Codex, OpenCode, and Claude Desktop via Agent Skills or Model Context Protocol."
      ogTitle="Agent Skills & MCP — aifails.wtf"
      ogDescription="Turn aifails.wtf into an active immune system for your coding agents (Claude, Cursor, Codex, Pi, OpenCode, Devin)."
      ogUrl={url}
      head={headElements}
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
                Integrate with AI Coding Agents
              </h2>
              <p class="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                Protect your agents from repeating known LLM failure modes and anti-patterns
              </p>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
            Prompt Confessional exports full real-time machine specifications across <strong class="text-[var(--text-primary)]">Agent Skills</strong>, <strong class="text-[var(--text-primary)]">Model Context Protocol (MCP)</strong>, <strong class="text-[var(--text-primary)]">OpenAPI 3.1</strong>, and <strong class="text-[var(--text-primary)]">LLMs.txt</strong>.
          </p>
        </div>

        {/* Interactive Integration Recipes */}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <span>🚀</span>
              <span>1-Click Integration Recipes</span>
            </h3>
            <span class="text-[11px] font-mono text-[var(--text-muted)] font-semibold hidden sm:inline">
              Pick your agent or IDE
            </span>
          </div>

          {/* Tab Selector Toolbar */}
          <div class="flex flex-wrap gap-1.5 p-1 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-[2.5px_2.5px_0px_#0e1a26]">
            <button
              type="button"
              data-tab="skills-cli"
              class="mcp-tab-btn flex-1 min-w-[120px] rounded-md px-3 py-1.5 text-xs font-black text-[var(--accent-text)] bg-[var(--accent-primary)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-all cursor-pointer text-center"
            >
              ⚡ Skills CLI
            </button>
            <button
              type="button"
              data-tab="claude-code"
              class="mcp-tab-btn flex-1 min-w-[120px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              Claude Code
            </button>
            <button
              type="button"
              data-tab="cursor"
              class="mcp-tab-btn flex-1 min-w-[120px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              Cursor / Windsurf
            </button>
            <button
              type="button"
              data-tab="pi"
              class="mcp-tab-btn flex-1 min-w-[100px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              Pi / OMP
            </button>
            <button
              type="button"
              data-tab="codex"
              class="mcp-tab-btn flex-1 min-w-[100px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              Codex CLI
            </button>
            <button
              type="button"
              data-tab="opencode"
              class="mcp-tab-btn flex-1 min-w-[100px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              OpenCode
            </button>
            <button
              type="button"
              data-tab="claude-desktop"
              class="mcp-tab-btn flex-1 min-w-[120px] rounded-md px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-subtle)] shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer text-center"
            >
              Claude Desktop
            </button>
          </div>

          <McpPanels />
        </div>

        {/* Exposed Tools Catalog */}
        <div class="space-y-3 pt-2">
          <h3 class="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            Included Capabilities &amp; Tools
          </h3>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="font-mono text-xs font-bold text-[var(--accent-primary)]">
                get_anti_patterns
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Queries known LLM traps by framework (e.g. Tailwind, Rust, D1, Next.js) and returns actionable negative prompt rules.
              </p>
            </div>

            <div class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[2px_2px_0px_#0e1a26] space-y-1.5">
              <div class="font-mono text-xs font-bold text-[#38bdf8]">
                get_random_fail
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                Fetches a random prompt failure with developer reaction and community prompt fixes in clean Markdown.
              </p>
            </div>

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
            <a href="/.well-known/agent-skills/index.json" class="rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] p-2 hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between">
              <span>⚡ Skills Index (RFC v0.2.0)</span>
              <span class="text-[10px] text-[var(--accent-primary)]">/.well-known/agent-skills/index.json</span>
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
