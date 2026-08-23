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
${urlsXml}
</urlset>`;
}

export function generateSiteOgImageSvg(stats?: { confessionCount?: number; solidarityCount?: number }): string {
  const confessionCount = stats?.confessionCount ?? 3;
  const solidarityCount = stats?.solidarityCount ?? 84;

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Matte Canvas Background -->
  <rect width="1200" height="630" fill="#1e334a" />

  <!-- Hard Shadow for Outer Card -->
  <rect x="56" y="46" width="1100" height="550" rx="14" fill="#0e1a26" />
  <!-- Outer Card Frame -->
  <rect x="50" y="40" width="1100" height="550" rx="14" fill="#2a4766" stroke="#0e1a26" stroke-width="3" />

  <!-- 3D Keycap Logo Tile -->
  <g transform="translate(90, 80)">
    <rect x="4" y="4" width="150" height="52" rx="8" fill="#0e1a26" />
    <rect width="150" height="52" rx="8" fill="#fed41d" stroke="#0e1a26" stroke-width="2.5" />
    <text x="75" y="34" font-family="ui-monospace, monospace" font-size="22" font-weight="900" fill="#000000" text-anchor="middle">(╯°□°)╯</text>
  </g>

  <!-- Header Branding -->
  <text x="265" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">Prompt Confessional</text>
  <text x="265" y="134" font-family="ui-monospace, monospace" font-size="17" font-weight="800" fill="#fed41d">aifails.wtf</text>

  <!-- Hero Main Title -->
  <text x="90" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" fill="#ffffff" letter-spacing="-1">You are not alone.</text>
  
  <!-- Subheading & Punchline -->
  <text x="90" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#d6e7f7">
    <tspan x="90" dy="0">Working with LLMs is one of the most maddening experiences in tech.</tspan>
    <tspan x="90" dy="36">They don&#39;t listen. They do too much. They hallucinate wildly.</tspan>
    <tspan x="90" dy="36">A safe space to vent prompt fails and vote community solidarity.</tspan>
  </text>

  <!-- Feature Action Badges -->
  <g transform="translate(90, 420)">
    <!-- Confession Pill -->
    <rect x="3" y="3" width="220" height="48" rx="8" fill="#0e1a26" />
    <rect x="0" y="0" width="220" height="48" rx="8" fill="#3a5e85" stroke="#0e1a26" stroke-width="2" />
    <text x="110" y="30" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">🤬 ${confessionCount} Confessions</text>

    <!-- Solidarity Pill (Coral Pearl Orange) -->
    <rect x="243" y="3" width="230" height="48" rx="8" fill="#0e1a26" />
    <rect x="240" y="0" width="230" height="48" rx="8" fill="#f97316" stroke="#0e1a26" stroke-width="2" />
    <text x="355" y="30" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">♥ ${solidarityCount} in Solidarity</text>

    <!-- Ackchyually Pill (Bart Yellow) -->
    <rect x="493" y="3" width="260" height="48" rx="8" fill="#0e1a26" />
    <rect x="490" y="0" width="260" height="48" rx="8" fill="#fed41d" stroke="#0e1a26" stroke-width="2" />
    <text x="620" y="30" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">💡 &quot;Ackchyually...&quot; Fixes</text>
  </g>

  <!-- URL Footer Banner -->
  <rect x="50" y="530" width="1100" height="60" rx="0" fill="#152435" stroke="#0e1a26" stroke-width="2" />
  <text x="90" y="567" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#97bede">Anonymous &amp; Edge-Rendered Prompt Fails</text>
  <text x="1110" y="567" font-family="ui-monospace, monospace" font-size="17" font-weight="900" fill="#fed41d" text-anchor="end">https://aifails.wtf</text>
</svg>`;
}

export function generateOgImageSvg(confession: Confession): string {
  const modelName = confession.model_name
    ? escapeXml(`${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`)
    : 'Unknown Model';

  const promptLines = wrapSvgText(confession.prompt_used, 70, 2);
  const failLines = wrapSvgText(confession.what_it_did_instead, 70, 3);
  const feelingLines = wrapSvgText(confession.how_it_made_them_feel, 70, 2);

  const moodUpper = escapeXml(confession.mood ? confession.mood.toUpperCase() : 'FURIOUS');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Matte Background -->
  <rect width="1200" height="630" fill="#1e334a" />

  <!-- Hard Shadow -->
  <rect x="56" y="41" width="1100" height="560" rx="14" fill="#0e1a26" />
  <!-- Main Card Container -->
  <rect x="50" y="35" width="1100" height="560" rx="14" fill="#2a4766" stroke="#0e1a26" stroke-width="3" />

  <!-- Top Bar -->
  <g transform="translate(85, 60)">
    <!-- 3D Keycap Logo Tile -->
    <rect x="3" y="3" width="110" height="40" rx="6" fill="#0e1a26" />
    <rect width="110" height="40" rx="6" fill="#fed41d" stroke="#0e1a26" stroke-width="2" />
    <text x="55" y="26" font-family="ui-monospace, monospace" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding -->
    <text x="125" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#ffffff">Prompt Confessional</text>
    <text x="375" y="28" font-family="ui-monospace, monospace" font-size="16" font-weight="800" fill="#fed41d">• aifails.wtf</text>

    <!-- Mood Badge (Solid Coral Pearl Orange) -->
    <rect x="853" y="5" width="165" height="36" rx="6" fill="#0e1a26" />
    <rect x="850" y="2" width="165" height="36" rx="6" fill="#f97316" stroke="#0e1a26" stroke-width="2" />
    <text x="932" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#000000" text-anchor="middle">${moodUpper}</text>
  </g>

  <!-- Card Body with Left Borders -->
  <g transform="translate(85, 125)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="5" height="95" rx="2" fill="#4e7ba8" />
    <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#97bede" letter-spacing="1">WHAT I ASKED FOR • ${modelName.toUpperCase()}</text>
    <text x="20" y="48" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#ffffff">
${promptLines.map((l, i) => `      <tspan x="20" dy="${i === 0 ? 0 : 28}">${l}</tspan>`).join('\n')}
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 115)">
      <rect x="0" y="0" width="5" height="115" rx="2" fill="#ef4444" />
      <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#fca5a5" letter-spacing="1">WHAT IT DID INSTEAD</text>
      <text x="20" y="48" font-family="system-ui, sans-serif" font-size="21" font-weight="800" fill="#ffffff">
${failLines.map((l, i) => `        <tspan x="20" dy="${i === 0 ? 0 : 28}">${l}</tspan>`).join('\n')}
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 250)">
      <rect x="0" y="0" width="5" height="75" rx="2" fill="#fed41d" />
      <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#fed41d" letter-spacing="1">HOW IT MADE THEM FEEL</text>
      <text x="20" y="48" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#d6e7f7">
${feelingLines.map((l, i) => `        <tspan x="20" dy="${i === 0 ? 0 : 25}">&ldquo;${l}&rdquo;</tspan>`).join('\n')}
      </text>
    </g>
  </g>

  <!-- Bottom Interaction Footer Bar -->
  <g transform="translate(85, 520)">
    <rect x="0" y="0" width="1015" height="50" rx="8" fill="#152435" stroke="#0e1a26" stroke-width="2" />
    <text x="20" y="32" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#f97316">♥ ${confession.solidarity_count} in solidarity</text>
    <text x="190" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#97bede">• Submit &quot;Ackchyually...&quot; fixes on aifails.wtf</text>
    <text x="995" y="32" font-family="ui-monospace, monospace" font-size="14" font-weight="800" fill="#fed41d" text-anchor="end">https://aifails.wtf/confessions/${confession.id}</text>
  </g>
</svg>`;
}
