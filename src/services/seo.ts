import type { Confession } from '../core/types';

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
      const pubDate = new Date(c.created_at).toUTCString();
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
      const lastmod = new Date(c.created_at).toISOString().split('T')[0];
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

  <!-- Top Bar: Prominent Keycap Logo & Large Title -->
  <g transform="translate(85, 50)">
    <!-- 3D Keycap Logo Button (Large & Bold) -->
    <rect x="4" y="4" width="170" height="60" rx="10" fill="#0e1a26" />
    <rect width="170" height="60" rx="10" fill="#fed41d" stroke="#0e1a26" stroke-width="3" />
    <text x="85" y="39" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="900" letter-spacing="-2" fill="#000000" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding Text Group -->
    <text x="195" y="27" font-family="-apple-system, system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Prompt Confessional</text>
    <text x="195" y="51" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="700" fill="#97bede">a safe space for AI frustration</text>

    <!-- Site Domain Badge (Top Right) -->
    <rect x="864" y="7" width="165" height="46" rx="8" fill="#0e1a26" />
    <rect x="860" y="3" width="165" height="46" rx="8" fill="#fed41d" stroke="#0e1a26" stroke-width="2.5" />
    <text x="942" y="32" font-family="ui-monospace, Menlo, monospace" font-size="18" font-weight="900" fill="#000000" text-anchor="middle">aifails.wtf</text>
  </g>

  <!-- Card Body with Signature 3-Part Layout -->
  <g transform="translate(85, 132)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="7" height="96" rx="3" fill="#4e7ba8" />
    <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#97bede" letter-spacing="1.5">WHAT I ASKED FOR</text>
    <text x="24" y="56" font-family="-apple-system, system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff">
      <tspan x="24" dy="0">&quot;Fix a simple typo and keep the existing tests passing.&quot;</tspan>
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 116)">
      <rect x="0" y="0" width="7" height="142" rx="3" fill="#ef4444" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fca5a5" letter-spacing="1.5">WHAT IT DID INSTEAD</text>
      <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="30" font-weight="800" fill="#ffffff">
        <tspan x="24" dy="0">Rewrote the entire test framework from scratch in Rust,</tspan>
        <tspan x="24" dy="40">deleted 40 passing tests, and left the typo untouched.</tspan>
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 278)">
      <rect x="0" y="0" width="7" height="82" rx="3" fill="#fed41d" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fed41d" letter-spacing="1.5">HOW IT MADE THEM FEEL</text>
      <text x="24" y="58" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="600" fill="#d6e7f7">
        <tspan x="24" dy="0">&quot;Stared at my ceiling for 20 minutes wondering why I chose tech.&quot;</tspan>
      </text>
    </g>
  </g>

  <!-- Clean Watermark Footer Bar -->
  <g transform="translate(85, 526)">
    <rect x="0" y="0" width="1025" height="48" rx="8" fill="#152435" stroke="#0e1a26" stroke-width="2" />
    <text x="24" y="30" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="#97bede">Prompt Confessional • Anonymous &amp; Edge-Rendered Prompt Fails</text>
    <text x="1000" y="30" font-family="ui-monospace, Menlo, monospace" font-size="17" font-weight="800" fill="#fed41d" text-anchor="end">https://aifails.wtf</text>
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

  <!-- Top Bar: Prominent Keycap Logo & Large Title -->
  <g transform="translate(85, 50)">
    <!-- 3D Keycap Logo Tile -->
    <rect x="4" y="4" width="170" height="60" rx="10" fill="#0e1a26" />
    <rect width="170" height="60" rx="10" fill="#fed41d" stroke="#0e1a26" stroke-width="3" />
    <text x="85" y="39" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="900" letter-spacing="-2" fill="#000000" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding Text Group -->
    <text x="195" y="27" font-family="-apple-system, system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Prompt Confessional</text>
    <text x="195" y="51" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="700" fill="#97bede">a safe space for AI frustration</text>

    <!-- Mood Badge (Top Right) -->
    <rect x="864" y="7" width="165" height="46" rx="8" fill="#0e1a26" />
    <rect x="860" y="3" width="165" height="46" rx="8" fill="#f97316" stroke="#0e1a26" stroke-width="2.5" />
    <text x="942" y="32" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="900" fill="#000000" text-anchor="middle">${moodUpper}</text>
  </g>

  <!-- Card Body with Left Borders -->
  <g transform="translate(85, 132)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="7" height="96" rx="3" fill="#4e7ba8" />
    <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#97bede" letter-spacing="1.5">WHAT I ASKED FOR • ${modelName.toUpperCase()}</text>
    <text x="24" y="56" font-family="-apple-system, system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff">
${promptLines.map((l, i) => `      <tspan x="24" dy="${i === 0 ? 0 : 36}">${l}</tspan>`).join('\n')}
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 116)">
      <rect x="0" y="0" width="7" height="142" rx="3" fill="#ef4444" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fca5a5" letter-spacing="1.5">WHAT IT DID INSTEAD</text>
      <text x="24" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="30" font-weight="800" fill="#ffffff">
${failLines.map((l, i) => `        <tspan x="24" dy="${i === 0 ? 0 : 38}">${l}</tspan>`).join('\n')}
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 278)">
      <rect x="0" y="0" width="7" height="82" rx="3" fill="#fed41d" />
      <text x="24" y="22" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="900" fill="#fed41d" letter-spacing="1.5">HOW IT MADE THEM FEEL</text>
      <text x="24" y="58" font-family="-apple-system, system-ui, sans-serif" font-size="26" font-weight="600" fill="#d6e7f7">
${feelingLines.map((l, i) => `        <tspan x="24" dy="${i === 0 ? 0 : 34}">&quot;${l}&quot;</tspan>`).join('\n')}
      </text>
    </g>
  </g>

  <!-- Bottom Watermark Footer Bar (Clean & Streamlined - No Busy Buttons) -->
  <g transform="translate(85, 526)">
    <rect x="0" y="0" width="1025" height="48" rx="8" fill="#152435" stroke="#0e1a26" stroke-width="2" />
    <text x="24" y="30" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="700" fill="#97bede">Prompt Confessional • aifails.wtf</text>
    <text x="1000" y="30" font-family="ui-monospace, Menlo, monospace" font-size="17" font-weight="800" fill="#fed41d" text-anchor="end">https://aifails.wtf/confessions/${confession.id}</text>
  </g>
</svg>`;
}
