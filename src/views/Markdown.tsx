import type { Child } from 'hono/jsx';

/**
 * Lightweight, safe Markdown and Code Renderer for Prompt Confessional
 * Converts fenced code blocks, inline code, bold, italics, and lists into Hono JSX nodes.
 */

type MarkdownBlock =
  | { type: 'code'; lang: string; code: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

function parseBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        type: 'code',
        lang: lang || 'code',
        code: codeLines.join('\n'),
      });
      continue;
    }

    // Bullet List items (- or *)
    if (/^\s*[-*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items: listItems });
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular Paragraph lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !/^\s*[-*]\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
    }
  }

  return blocks;
}

/**
 * Parses inline markdown (code, bold, italic) into safe JSX Child elements
 */
function renderInline(text: string): Child[] {
  const parts: Child[] = [];
  // Tokenize inline code `...`, bold **...**, and italic *...*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      parts.push(
        <code class="rounded border border-[var(--border-color)] bg-[#152435] px-1.5 py-0.5 font-mono text-[12px] font-bold text-[var(--accent-primary)] shadow-[1px_1px_0px_#0e1a26] break-all">
          {code}
        </code>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      parts.push(<strong>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em>{token.slice(1, -1)}</em>);
    } else {
      parts.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

type MarkdownProps = {
  content: string;
  class?: string;
};

export function Markdown({ content, class: className = '' }: MarkdownProps) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div class={`space-y-2.5 leading-relaxed break-words ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <div
              key={idx}
              class="relative my-3 rounded-md border-2 border-[var(--border-color)] bg-[#152435] shadow-[2.5px_2.5px_0px_#0e1a26] overflow-hidden"
            >
              <div class="absolute right-2.5 top-2.5 z-10">
                <button
                  type="button"
                  class="copy-code-block-btn inline-flex items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] shadow-xs transition-colors cursor-pointer"
                  title="Copy code"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
              <pre class="p-3.5 pr-16 overflow-x-auto font-mono text-xs sm:text-sm text-[#f0fdfa] leading-relaxed select-text font-medium"><code>{block.code}</code></pre>
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={idx} class="list-disc list-inside space-y-1 pl-1 text-sm text-[var(--text-primary)]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Paragraph
        return (
          <p key={idx} class="text-sm text-[var(--text-primary)] font-medium whitespace-pre-wrap">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
