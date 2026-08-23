import type { D1Database } from '@cloudflare/workers-types';
import {
  getConfessions,
  getConfessionById,
  getRandomConfessionId,
  createConfession,
  getSuggestionsForConfession,
  getSuggestionsMapForConfessions,
} from '../db';
import { redactSecrets } from '../utils/gitleaks';
import { sanitizeContent } from '../utils/moderation';

export const MCP_TOOLS_DEFINITIONS = [
  {
    name: 'get_anti_patterns',
    description:
      'Search and retrieve known LLM failure modes, hallucinations, and negative prompt guardrails to avoid repeating common coding mistakes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword, framework, or technology to check (e.g. "Rust", "NAPI-rs", "Tailwind", "PDF", "regex", "git").',
        },
        model: {
          type: 'string',
          description: 'Filter by specific AI model (e.g. "gpt-4o", "claude-3.5-sonnet", "gemini-1.5-pro", "deepseek-r1").',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of anti-patterns to return (default 5, max 10).',
        },
      },
    },
  },
  {
    name: 'get_random_fail',
    description: 'Fetch a random real-world prompt fail with community "Ackchyually..." prompt fixes.',
    inputSchema: {
      type: 'object',
      properties: {
        exclude_id: {
          type: 'string',
          description: 'Optional confession ID to exclude (avoids repeating the same fail).',
        },
      },
    },
  },
  {
    name: 'submit_fail',
    description:
      'Anonymously contribute a real-world LLM failure or prompt hallucination. All secrets and API keys are automatically redacted.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt_used: {
          type: 'string',
          description: 'What you asked the AI model to do (max 4,000 characters).',
        },
        what_it_did_instead: {
          type: 'string',
          description: 'What the model did wrong or hallucinated (max 4,000 characters).',
        },
        how_it_made_them_feel: {
          type: 'string',
          description: 'How the failure made you feel / emotional reaction (max 2,000 characters).',
        },
        mood: {
          type: 'string',
          enum: ['furious', 'defeated', 'bewildered', 'amused', 'numb', 'vengeful'],
          description: 'Reaction mood (default: "amused").',
        },
        model: {
          type: 'string',
          description: 'AI model name (e.g. "anthropic/claude-3.5-sonnet", "openai/gpt-4o", "deepseek/deepseek-r1").',
        },
      },
      required: ['prompt_used', 'what_it_did_instead', 'how_it_made_them_feel'],
    },
  },
];

export async function executeGetAntiPatterns(
  db: D1Database,
  args: { query?: string; model?: string; limit?: number },
  baseUrl: string = 'https://aifails.wtf'
): Promise<string> {
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 10);
  const { confessions } = await getConfessions(db, {
    query: args.query,
    model: args.model,
    limit,
  });

  if (confessions.length === 0) {
    return `No specific anti-patterns found matching query "${args.query ?? ''}". General rule: verify all library imports, never delete working logic with placeholders, and never force-push in automated scripts.`;
  }

  const suggestionsMap = await getSuggestionsMapForConfessions(
    db,
    confessions.map((c) => c.id)
  );

  let output = `# Known LLM Anti-Patterns & Guardrails (${confessions.length} found)\n\n`;
  output += `Use these real-world failure cases to avoid repeating common model mistakes:\n\n`;

  confessions.forEach((c, idx) => {
    const model = c.model_name
      ? `${c.model_provider ? c.model_provider + ' / ' : ''}${c.model_name}`
      : 'AI Model';
    const suggestions = suggestionsMap[c.id] || [];

    output += `### ${idx + 1}. ${model} — [${c.mood || '🤡'}]\n`;
    output += `- **What the user asked**: "${c.prompt_used}"\n`;
    output += `- **What went wrong**: ${c.what_it_did_instead}\n`;
    output += `- **Developer takeaway**: ${c.how_it_made_them_feel}\n`;

    if (suggestions.length > 0) {
      output += `- **Community "Ackchyually..." Fix**:\n`;
      suggestions.forEach((s) => {
        output += `  > ${s.body.replace(/\n/g, '\n  > ')}\n`;
      });
    }

    output += `- **Permalink**: ${baseUrl}/confessions/${c.id}\n\n`;
  });

  return output.trim();
}

export async function executeGetRandomFail(
  db: D1Database,
  args: { exclude_id?: string },
  baseUrl: string = 'https://aifails.wtf'
): Promise<string> {
  const randomId = await getRandomConfessionId(db, args.exclude_id);
  if (!randomId) {
    return 'No prompt failures found in database.';
  }

  const confession = await getConfessionById(db, randomId);
  if (!confession) {
    return 'Confession not found.';
  }

  const suggestions = await getSuggestionsForConfession(db, randomId);
  const model = confession.model_name
    ? `${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`
    : 'Unknown Model';

  let output = `# Random Prompt Fail: ${confession.id}\n\n`;
  output += `- **Model**: \`${model}\`\n`;
  output += `- **Mood**: ${confession.mood || '🤡'}\n`;
  output += `- **Solidarity**: ${confession.solidarity_count} developer votes\n`;
  output += `- **Permalink**: ${baseUrl}/confessions/${confession.id}\n\n`;

  output += `## What was asked\n${confession.prompt_used}\n\n`;
  output += `## What it did instead\n${confession.what_it_did_instead}\n\n`;
  output += `## How it made them feel\n${confession.how_it_made_them_feel}\n\n`;

  if (suggestions.length > 0) {
    output += `## Community "Ackchyually..." Fixes (${suggestions.length})\n`;
    suggestions.forEach((s, idx) => {
      output += `### Fix #${idx + 1}\n${s.body}\n\n`;
    });
  }

  return output.trim();
}

export async function executeSubmitFail(
  db: D1Database,
  args: {
    prompt_used: string;
    what_it_did_instead: string;
    how_it_made_them_feel: string;
    mood?: string;
    model?: string;
  },
  baseUrl: string = 'https://aifails.wtf'
): Promise<{ message: string; permalink: string; id: string }> {
  if (!args.prompt_used || !args.what_it_did_instead || !args.how_it_made_them_feel) {
    throw new Error('All three fields (prompt_used, what_it_did_instead, how_it_made_them_feel) are required.');
  }

  if (
    args.prompt_used.length > 4000 ||
    args.what_it_did_instead.length > 4000 ||
    args.how_it_made_them_feel.length > 2000
  ) {
    throw new Error('Input exceeds maximum character length limits.');
  }

  // 1. Scrub API keys, tokens, emails using Gitleaks scanner
  const prompt_used = sanitizeContent(redactSecrets(args.prompt_used).cleanText).cleanText;
  const what_it_did_instead = sanitizeContent(redactSecrets(args.what_it_did_instead).cleanText).cleanText;
  const how_it_made_them_feel = sanitizeContent(redactSecrets(args.how_it_made_them_feel).cleanText).cleanText;

  let model_provider: string | null = null;
  let model_name: string | null = null;

  if (args.model && args.model.trim()) {
    const cleanModel = args.model.trim();
    if (cleanModel.includes('/')) {
      const parts = cleanModel.split('/');
      model_provider = parts[0].trim();
      model_name = parts.slice(1).join('/').trim();
    } else {
      model_name = cleanModel;
    }
  }

  const confession = await createConfession(db, {
    prompt_used,
    what_it_did_instead,
    how_it_made_them_feel,
    mood: args.mood || 'amused',
    model_provider,
    model_name,
  });

  const permalink = `${baseUrl}/confessions/${confession.id}`;

  return {
    message: 'Prompt fail submitted anonymously. Secrets have been automatically scrubbed.',
    id: confession.id,
    permalink,
  };
}
