import type { Confession } from '../core/types';

// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(INVALID_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
function toUtcIso(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  let normalized = dateStr.trim();
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T') + 'Z';
  } else if (!normalized.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(normalized)) {
    normalized = normalized + 'Z';
  }
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}


export function wrapSvgText(
  text: string,
  maxCharsPerLine: number = 65,
  maxLines: number = 2
): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // If text exceeded line budget, append ellipsis
  const combined = lines.join(' ');
  if (clean.length > combined.length && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[\s.,!?;:]*$/, '') + '...';
  }

  return lines.map((l) => escapeXml(l));
}

export function generateRssFeed(confessions: Confession[], baseUrl: string): string {
  const channelLink = escapeXml(baseUrl);
  const selfLink = escapeXml(`${baseUrl}/feed.xml`);
  const buildDate = new Date().toUTCString();

  const itemsXml = confessions
    .map((c) => {
      const title = escapeXml(
        `[${c.mood.toUpperCase()}] ${c.prompt_used.slice(0, 60)}${c.prompt_used.length > 60 ? '...' : ''}`
      );
      const link = escapeXml(`${baseUrl}/confessions/${c.id}`);
      const pubDate = new Date(toUtcIso(c.created_at)).toUTCString();
      const description = escapeXml(
        `Prompt: ${c.prompt_used}\n\nWhat it did instead:\n${c.what_it_did_instead}\n\nHow it made them feel:\n${c.how_it_made_them_feel}`
      );

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Prompt Confessional — aifails.wtf</title>
    <link>${channelLink}</link>
    <description>Anonymous confessions of prompt failures, model betrayals, and coding hallucinations.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${selfLink}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

export function generateSitemapXml(confessions: Confession[], baseUrl: string): string {
  const urlsXml = confessions
    .map((c) => {
      const loc = escapeXml(`${baseUrl}/confessions/${c.id}`);
      const lastmod = toUtcIso(c.created_at).split('T')[0];
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${baseUrl}/`)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeXml(`${baseUrl}/changelog`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${escapeXml(`${baseUrl}/mcp`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${escapeXml(`${baseUrl}/openapi.json`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${escapeXml(`${baseUrl}/.well-known/agent-skills/index.json`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${urlsXml}
</urlset>`;
}

export function generateSiteOgImageSvg(_stats?: { confessionCount?: number; solidarityCount?: number }): string {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Matte Canvas Background -->
  <rect width="1200" height="630" fill="#1e334a" />

  <!-- Hard Shadow for Outer Card -->
  <rect x="56" y="44" width="1100" height="552" rx="16" fill="#0e1a26" />
  <!-- Outer Card Frame -->
  <rect x="50" y="38" width="1100" height="552" rx="16" fill="#2a4766" stroke="#0e1a26" stroke-width="3.5" />

  <!-- Top Bar: Balanced Keycap & Right Domain Badge -->
  <g transform="translate(85, 62)">
    <!-- 3D Keycap Logo Button -->
    <rect x="3" y="3" width="155" height="52" rx="9" fill="#0e1a26" />
    <rect width="155" height="52" rx="9" fill="#fed41d" stroke="#0e1a26" stroke-width="2.5" />
    <text x="77" y="34" font-family="-apple-system, system-ui, sans-serif" font-size="22" font-weight="900" letter-spacing="-1.5" fill="#000000" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding Text Group -->
    <text x="180" y="24" font-family="-apple-system, system-ui, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Prompt Confessional</text>
    <text x="180" y="46" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="#97bede">a safe space for AI frustration</text>

    <!-- Site Domain Badge (Top Right) -->
    <rect x="878" y="3" width="152" height="52" rx="9" fill="#0e1a26" />
    <rect x="875" y="0" width="152" height="52" rx="9" fill="#fed41d" stroke="#0e1a26" stroke-width="2.5" />
    <text x="951" y="32" font-family="ui-monospace, Menlo, monospace" font-size="18" font-weight="900" fill="#000000" text-anchor="middle">aifails.wtf</text>
  </g>

  <!-- Card Body with Signature 3-Part Layout (Spacious & Clean) -->
  <g transform="translate(85, 148)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="7" height="104" rx="3" fill="#4e7ba8" />
    <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#97bede" letter-spacing="1.5">WHAT I ASKED FOR</text>
    <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff">
      <tspan x="24" dy="0">&quot;Fix a simple typo and keep the existing tests passing.&quot;</tspan>
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 130)">
      <rect x="0" y="0" width="7" height="146" rx="3" fill="#ef4444" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fca5a5" letter-spacing="1.5">WHAT IT DID INSTEAD</text>
      <text x="24" y="62" font-family="-apple-system, system-ui, sans-serif" font-size="30" font-weight="800" fill="#ffffff">
        <tspan x="24" dy="0">Rewrote the entire test framework from scratch in Rust,</tspan>
        <tspan x="24" dy="42">deleted 40 passing tests, and left the typo untouched.</tspan>
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 302)">
      <rect x="0" y="0" width="7" height="88" rx="3" fill="#fed41d" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fed41d" letter-spacing="1.5">HOW IT MADE THEM FEEL</text>
      <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="600" fill="#d6e7f7">
        <tspan x="24" dy="0">&quot;Stared at my ceiling for 20 minutes wondering why I chose tech.&quot;</tspan>
      </text>
    </g>
  </g>
</svg>`;
}

export function generateOgImageSvg(confession: Confession): string {
  const modelName = confession.model_name
    ? escapeXml(`${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`)
    : 'Unknown Model';

  const promptLines = wrapSvgText(confession.prompt_used, 52, 2);
  const failLines = wrapSvgText(confession.what_it_did_instead, 52, 3);
  const feelingLines = wrapSvgText(confession.how_it_made_them_feel, 52, 2);

  const moodUpper = escapeXml(confession.mood ? confession.mood.toUpperCase() : 'FURIOUS');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Matte Background -->
  <rect width="1200" height="630" fill="#1e334a" />

  <!-- Hard Shadow -->
  <rect x="56" y="44" width="1100" height="552" rx="16" fill="#0e1a26" />
  <!-- Main Card Container -->
  <rect x="50" y="38" width="1100" height="552" rx="16" fill="#2a4766" stroke="#0e1a26" stroke-width="3.5" />

  <!-- Top Bar: Balanced Keycap & Right Mood Badge -->
  <g transform="translate(85, 62)">
    <!-- 3D Keycap Logo Tile -->
    <rect x="3" y="3" width="155" height="52" rx="9" fill="#0e1a26" />
    <rect width="155" height="52" rx="9" fill="#fed41d" stroke="#0e1a26" stroke-width="2.5" />
    <text x="77" y="34" font-family="-apple-system, system-ui, sans-serif" font-size="22" font-weight="900" letter-spacing="-1.5" fill="#000000" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding Text Group -->
    <text x="180" y="24" font-family="-apple-system, system-ui, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Prompt Confessional</text>
    <text x="180" y="46" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="#97bede">a safe space for AI frustration</text>

    <!-- Mood Badge (Top Right) -->
    <rect x="878" y="3" width="152" height="52" rx="9" fill="#0e1a26" />
    <rect x="875" y="0" width="152" height="52" rx="9" fill="#f97316" stroke="#0e1a26" stroke-width="2.5" />
    <text x="951" y="33" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="900" fill="#000000" text-anchor="middle">${moodUpper}</text>
  </g>

  <!-- Card Body with Left Borders (Spacious & Clean) -->
  <g transform="translate(85, 148)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="7" height="104" rx="3" fill="#4e7ba8" />
    <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#97bede" letter-spacing="1.5">WHAT I ASKED FOR • ${modelName.toUpperCase()}</text>
    <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff">
${promptLines.map((l, i) => `      <tspan x="24" dy="${i === 0 ? 0 : 38}">${l}</tspan>`).join('\n')}
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 130)">
      <rect x="0" y="0" width="7" height="146" rx="3" fill="#ef4444" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fca5a5" letter-spacing="1.5">WHAT IT DID INSTEAD</text>
      <text x="24" y="62" font-family="-apple-system, system-ui, sans-serif" font-size="30" font-weight="800" fill="#ffffff">
${failLines.map((l, i) => `        <tspan x="24" dy="${i === 0 ? 0 : 40}">${l}</tspan>`).join('\n')}
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 302)">
      <rect x="0" y="0" width="7" height="88" rx="3" fill="#fed41d" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fed41d" letter-spacing="1.5">HOW IT MADE THEM FEEL</text>
      <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="600" fill="#d6e7f7">
${feelingLines.map((l, i) => `        <tspan x="24" dy="${i === 0 ? 0 : 36}">&quot;${l}&quot;</tspan>`).join('\n')}
      </text>
    </g>
  </g>
</svg>`;
}
