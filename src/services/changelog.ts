export type ChangelogItem = {
  category: 'feat' | 'fix' | 'security' | 'docs';
  description: string;
};

export type ChangelogRelease = {
  version: string;
  date: string;
  title: string;
  description: string;
  badge?: string;
  items: ChangelogItem[];
};

export const RELEASES: ChangelogRelease[] = [
  {
    version: 'v1.2.0',
    date: '2026-08-25',
    title: 'OpenAPI 3.1 & Agent Skills Ecosystem',
    description:
      'Full machine-readable OpenAPI 3.1.0 specification, universal Agent Skill CLI distribution, direct JSON ingestion endpoints, and automated script integrity headers.',
    badge: 'Latest Release',
    items: [
      {
        category: 'feat',
        description: 'OpenAPI 3.1.0 JSON & YAML machine specifications at `/openapi.json` and `/openapi.yaml`.',
      },
      {
        category: 'feat',
        description: 'Universal Agent Skill package installable via `npx skills add sirmews/aifails`.',
      },
      {
        category: 'feat',
        description: 'Direct JSON ingestion endpoint at `POST /api/confessions` with edge rate limiting and secret redaction.',
      },
      {
        category: 'security',
        description: 'Hardened shell scripts with `set -efu`, stdin heredoc isolation, and SHA-256 `ETag`/`Digest` headers on `/cli.sh`.',
      },
      {
        category: 'security',
        description: 'Rotated production session secret to a secure cryptographically random 256-bit key.',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-08-24',
    title: 'High-DPI Share Cards & LinkedIn Carousel Export',
    description:
      'High-resolution 1600x900 canvas previews for Slack and Twitter, plus client-side multi-slide PDF document generation for LinkedIn carousels.',
    items: [
      {
        category: 'feat',
        description: '2x High-DPI 1600x900 canvas share card modal with 1-click system clipboard copy.',
      },
      {
        category: 'feat',
        description: 'Multi-slide LinkedIn Carousel PDF export generated 100% client-side with compact mobile stepper navigation.',
      },
      {
        category: 'fix',
        description: 'Scaled typography tokens and removed target model overlap on slide previews for better mobile legibility.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-08-23',
    title: 'Initial Launch & Level 4 Agent-Integrated Discovery',
    description:
      'Anonymous prompt fail confessional, community prompt fixes ("Ackchyually..."), Gitleaks secret scrubbing, D1 solidarity deduplication, and edge MCP server.',
    items: [
      {
        category: 'feat',
        description: 'Anonymous prompt confessions with zero author tracking and automated Gitleaks secret/API key redaction.',
      },
      {
        category: 'feat',
        description: 'Community prompt fixes and alternative model recommendations branded as "Ackchyually...".',
      },
      {
        category: 'feat',
        description: 'Level 4 Agent-Integrated discovery via RFC 9727 linksets, RFC 8288 Link headers, and `/llms.txt`.',
      },
      {
        category: 'feat',
        description: 'Edge Model Context Protocol (MCP) JSON-RPC 2.0 endpoint at `/mcp` with 1-click agent setup guides.',
      },
    ],
  },
];

export function generateChangelogMarkdown(baseUrl: string = 'https://aifails.wtf'): string {
  const lines = [
    '# aifails.wtf — Product Changelog & Release Stream',
    '',
    '> Complete release notes and feature changelog for aifails.wtf (Prompt Confessional).',
    `> Base URL: ${baseUrl}`,
    '',
    '---',
    '',
  ];

  for (const release of RELEASES) {
    lines.push(`## [${release.version}] - ${release.date}`);
    lines.push(`### ${release.title}`);
    lines.push('');
    lines.push(release.description);
    lines.push('');
    lines.push('**Changes:**');
    for (const item of release.items) {
      const tag = item.category.toUpperCase();
      lines.push(`- **[${tag}]**: ${item.description}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
