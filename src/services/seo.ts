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
  <defs>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#191b22" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#ffffff" fill-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="630" fill="#191b22" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Outer Card Frame -->
  <rect x="50" y="40" width="1100" height="550" rx="16" fill="#222530" stroke="#3b4054" stroke-width="2" />

  <!-- 3D Keycap Logo Tile -->
  <g transform="translate(90, 80)">
    <rect width="150" height="52" rx="10" fill="#f3f4f8" stroke="#9ba1ad" stroke-width="2" />
    <rect y="48" width="150" height="6" rx="2" fill="#9ba1ad" />
    <text x="75" y="34" font-family="ui-monospace, monospace" font-size="22" font-weight="900" fill="#191b22" text-anchor="middle">(╯°□°)╯</text>
  </g>

  <!-- Header Branding -->
  <text x="260" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" fill="#f3f4f8" letter-spacing="-0.5">Prompt Confessional</text>
  <text x="260" y="132" font-family="ui-monospace, monospace" font-size="16" font-weight="700" fill="#f59e0b">aifails.wtf</text>

  <!-- Hero Main Title -->
  <text x="90" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#f3f4f8" letter-spacing="-1">You are not alone.</text>
  
  <!-- Subheading & Punchline -->
  <text x="90" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#c5c9d8">
    <tspan x="90" dy="0">Working with LLMs is one of the most maddening experiences in tech.</tspan>
    <tspan x="90" dy="36">They don&#39;t listen. They do too much. They hallucinate wildly.</tspan>
    <tspan x="90" dy="36">A safe space to vent prompt fails and vote community solidarity.</tspan>
  </text>

  <!-- Feature Action Badges -->
  <g transform="translate(90, 420)">
    <!-- Confession Pill -->
    <rect x="0" y="0" width="220" height="46" rx="8" fill="#2d3140" stroke="#4b526b" stroke-width="1.5" />
    <text x="110" y="29" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#f3f4f8" text-anchor="middle">🤬 ${confessionCount} Confessions</text>

    <!-- Solidarity Pill -->
    <rect x="235" y="0" width="230" height="46" rx="8" fill="#2b1820" stroke="#f43f5e" stroke-width="1.5" />
    <text x="350" y="29" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#fda4af" text-anchor="middle">♥ ${solidarityCount} in Solidarity</text>

    <!-- Ackchyually Pill -->
    <rect x="480" y="0" width="260" height="46" rx="8" fill="#2b1e0a" stroke="#b45309" stroke-width="1.5" />
    <text x="610" y="29" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#fde68a" text-anchor="middle">💡 &quot;Ackchyually...&quot; Fixes</text>
  </g>

  <!-- URL Footer Banner -->
  <rect x="50" y="530" width="1100" height="60" rx="0" fill="#1e212b" stroke="#3b4054" stroke-width="1" />
  <text x="90" y="567" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="#8d94a8">Anonymous &amp; Edge-Rendered Prompt Fails</text>
  <text x="1110" y="567" font-family="ui-monospace, monospace" font-size="16" font-weight="700" fill="#f59e0b" text-anchor="end">https://aifails.wtf</text>
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
  <defs>
    <radialGradient id="card-glow" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#191b22" stop-opacity="0" />
    </radialGradient>
    <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.035" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#191b22" />
  <rect width="1200" height="630" fill="url(#dot-grid)" />
  <rect width="1200" height="630" fill="url(#card-glow)" />

  <!-- Main Card Container -->
  <rect x="50" y="35" width="1100" height="560" rx="16" fill="#222530" stroke="#3b4054" stroke-width="2" />

  <!-- Top Bar -->
  <g transform="translate(85, 60)">
    <!-- 3D Keycap Logo Tile -->
    <rect width="110" height="40" rx="8" fill="#f3f4f8" stroke="#9ba1ad" stroke-width="1.5" />
    <rect y="37" width="110" height="4" rx="1" fill="#9ba1ad" />
    <text x="55" y="27" font-family="ui-monospace, monospace" font-size="16" font-weight="900" fill="#191b22" text-anchor="middle">(╯°□°)╯</text>

    <!-- Branding -->
    <text x="125" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#f3f4f8">Prompt Confessional</text>
    <text x="355" y="28" font-family="ui-monospace, monospace" font-size="15" font-weight="700" fill="#f59e0b">• aifails.wtf</text>

    <!-- Mood Badge -->
    <rect x="850" y="2" width="165" height="36" rx="6" fill="#2b1820" stroke="#f43f5e" stroke-width="1.5" />
    <text x="932" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#fda4af" text-anchor="middle">${moodUpper}</text>
  </g>

  <!-- Card Body with Left Borders -->
  <g transform="translate(85, 125)">
    <!-- 1. What I asked for -->
    <rect x="0" y="0" width="4" height="95" rx="2" fill="#4b526b" />
    <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#8d94a8" letter-spacing="1">WHAT I ASKED FOR • ${modelName.toUpperCase()}</text>
    <text x="20" y="48" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#f3f4f8">
${promptLines.map((l, i) => `      <tspan x="20" dy="${i === 0 ? 0 : 28}">${l}</tspan>`).join('\n')}
    </text>

    <!-- 2. What it did instead -->
    <g transform="translate(0, 115)">
      <rect x="0" y="0" width="4" height="115" rx="2" fill="#dc2626" />
      <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fca5a5" letter-spacing="1">WHAT IT DID INSTEAD</text>
      <text x="20" y="48" font-family="system-ui, sans-serif" font-size="21" font-weight="700" fill="#f3f4f8">
${failLines.map((l, i) => `        <tspan x="20" dy="${i === 0 ? 0 : 28}">${l}</tspan>`).join('\n')}
      </text>
    </g>

    <!-- 3. How it made me feel -->
    <g transform="translate(0, 250)">
      <rect x="0" y="0" width="4" height="75" rx="2" fill="#f59e0b" />
      <text x="20" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fde68a" letter-spacing="1">HOW IT MADE THEM FEEL</text>
      <text x="20" y="48" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#c5c9d8">
${feelingLines.map((l, i) => `        <tspan x="20" dy="${i === 0 ? 0 : 25}">&ldquo;${l}&rdquo;</tspan>`).join('\n')}
      </text>
    </g>
  </g>

  <!-- Bottom Interaction Footer Bar -->
  <g transform="translate(85, 520)">
    <rect x="0" y="0" width="1015" height="50" rx="8" fill="#1e212b" stroke="#3b4054" stroke-width="1" />
    <text x="20" y="32" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#fda4af">♥ ${confession.solidarity_count} in solidarity</text>
    <text x="190" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#8d94a8">• Submit &quot;Ackchyually...&quot; fixes on aifails.wtf</text>
    <text x="995" y="32" font-family="ui-monospace, monospace" font-size="14" font-weight="700" fill="#f59e0b" text-anchor="end">https://aifails.wtf/confessions/${confession.id}</text>
  </g>
</svg>`;
}
