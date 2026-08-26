export interface AgentSkillDiscoveryEntry {
  name: string;
  type: 'skill-md' | 'archive';
  description: string;
  url: string;
  digest: string;
}

export interface AgentSkillsDiscoveryIndex {
  $schema: string;
  skills: AgentSkillDiscoveryEntry[];
}

export const AIFAILS_SKILL_DESCRIPTION =
  'Query, search, and submit LLM hallucinations, prompt failures, and anti-patterns to aifails.wtf. Use when debugging prompt issues, researching model-specific failure modes, evaluating LLM edge cases, or contributing community prompt fixes ("Ackchyually...").';

export function generateSkillMarkdown(baseUrl: string = 'https://aifails.wtf'): string {
  return [
    '---',
    'name: aifails',
    `description: ${AIFAILS_SKILL_DESCRIPTION}`,
    '---',
    '',
    '# aifails — Prompt Confessional Agent Skill',
    '',
    'A real-world database of LLM prompt failures, hallucinations, and coding anti-patterns.',
    'Use this skill to research known prompt traps, check model failure modes, and submit verified LLM fails.',
    '',
    '## Quick Start with Skills CLI (Recommended)',
    '',
    'Install this skill into your Claude Code, Pi/OMP, Cursor, Windsurf, or Codex environment:',
    '',
    '```bash',
    '# Add to your project or global agent directory',
    'npx skills add sirmews/aifails',
    '',
    '# Or execute one-shot via Skills CLI',
    'npx skills use sirmews/aifails@aifails',
    '```',
    '',
    '## Declarative Tool Interfaces (Preferred)',
    '',
    'Agents should prioritize structured interfaces before running shell scripts:',
    `- **OpenAPI 3.1 Specification**: \`${baseUrl}/openapi.json\``,
    `- **Model Context Protocol (MCP)**: \`${baseUrl}/mcp\``,
    `- **Discovery Linkset (RFC 9727)**: \`${baseUrl}/.well-known/api-catalog\``,
    `- **Agent Skills Discovery Index (v0.2.0)**: \`${baseUrl}/.well-known/agent-skills/index.json\``,
    '',
    '## Shell Helper Usage (`aifails.sh`)',
    '',
    'When using the command line, run the audited helper script from repository:',
    '',
    '```bash',
    '# 1. Fetch random confession',
    './skills/aifails/bin/aifails.sh random',
    '',
    '# 2. Search confessions by keyword',
    './skills/aifails/bin/aifails.sh search --query "hallucination"',
    '',
    '# 3. List recent confessions',
    './skills/aifails/bin/aifails.sh list --limit 10',
    '',
    '# 4. View single confession by ID',
    './skills/aifails/bin/aifails.sh get <id>',
    '',
    '# 5. Vote solidarity (1 vote per session)',
    './skills/aifails/bin/aifails.sh solidarity <id>',
    '',
    '# 6. Submit a new prompt fail using a single-quoted stdin heredoc',
    './skills/aifails/bin/aifails.sh submit --json - <<\'EOF\'',
    '{',
    '  "prompt_used": "Write a regex to validate international phone numbers.",',
    '  "what_it_did_instead": "Generated catastrophic backtracking regex that froze Node.js.",',
    '  "how_it_made_them_feel": "Questioned my life choices at 2 AM.",',
    '  "mood": "furious",',
    '  "model_provider": "anthropic",',
    '  "model_name": "claude-3-5-sonnet"',
    '}',
    'EOF',
    '',
    '# 7. Submit a prompt/model correction ("Ackchyually...") using stdin heredoc',
    './skills/aifails/bin/aifails.sh suggest <id> --json - <<\'EOF\'',
    '{',
    '  "suggestion_type": "prompt",',
    '  "body": "Use atomic groups or possessive quantifiers to avoid exponential backtracking."',
    '}',
    'EOF',
    '```',
    '',
    '## Direct JSON Ingestion Protocol (`POST /api/confessions`)',
    '',
    'Submit prompt fails programmatically via HTTP:',
    '',
    '```bash',
    `curl -s -X POST ${baseUrl}/api/confessions \\`,
    '  -H "Content-Type: application/json" \\',
    '  -d @- <<\'EOF\'',
    '{',
    '  "prompt_used": "Generate TypeScript types for nested API response.",',
    '  "what_it_did_instead": "Replaced all deep fields with any and deleted existing interfaces.",',
    '  "how_it_made_them_feel": "Defeated by lazy token saving.",',
    '  "mood": "defeated",',
    '  "model_name": "gpt-4o"',
    '}',
    'EOF',
    '```',
    '',
    '## Rules for Autonomous Submissions',
    '1. **Strict Anonymity**: Never pass personal names, email addresses, or API keys.',
    '2. **Valid Mood Enum**: `furious` | `defeated` | `bewildered` | `amused` | `numb` | `vengeful` (default `furious`).',
    '3. **Length Constraints**: `prompt_used` ≤ 4000 chars, `what_it_did_instead` ≤ 4000 chars, `how_it_made_them_feel` ≤ 2000 chars.',
    '4. **Rate Limits**: Submissions are rate-limited per IP (5 requests/minute).',
    '',
  ].join('\n');
}

export async function generateAgentSkillsIndex(
  baseUrl: string = 'https://aifails.wtf',
  digest?: string
): Promise<AgentSkillsDiscoveryIndex> {
  let computedDigest = digest;
  if (!computedDigest) {
    const skillContent = generateSkillMarkdown(baseUrl);
    const encoded = new TextEncoder().encode(skillContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    computedDigest = `sha256:${hex}`;
  }

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'aifails',
        type: 'skill-md',
        description: AIFAILS_SKILL_DESCRIPTION,
        url: `${baseUrl}/.well-known/agent-skills/aifails/SKILL.md`,
        digest: computedDigest,
      },
    ],
  };
}
