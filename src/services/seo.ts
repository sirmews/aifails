import type { Confession } from '../core/types';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssFeed(confessions: Confession[], baseUrl: string): string {
  const itemsXml = confessions
    .map((c) => {
      const title = escapeXml(`Asked: "${c.prompt_used.slice(0, 60)}${c.prompt_used.length > 60 ? '...' : ''}"`);
      const link = `${baseUrl}/confessions/${c.id}`;
      const pubDate = new Date(c.created_at).toUTCString();
      const moodLabel = c.mood ? c.mood.toUpperCase() : 'CONFESSION';

      return `
    <item>
      <title>[${moodLabel}] ${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[
        <p><strong>What I asked for:</strong> ${escapeXml(c.prompt_used)}</p>
        <p><strong>What it did instead:</strong> ${escapeXml(c.what_it_did_instead)}</p>
        <p><em>&ldquo;${escapeXml(c.how_it_made_them_feel)}&rdquo;</em></p>
      ]]></description>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Prompt Confessional</title>
    <link>${baseUrl}</link>
    <description>A safe space to vent about large language model frustrations and share prompt fails.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;
}

export function generateSitemapXml(confessions: Confession[], baseUrl: string): string {
  const urlsXml = confessions
    .map((c) => {
      const lastMod = new Date(c.created_at).toISOString();
      return `
  <url>
    <loc>${baseUrl}/confessions/${c.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urlsXml}
</urlset>`;
}

export function generateOgImageSvg(confession: Confession): string {
  const promptTruncated = escapeXml(
    confession.prompt_used.length > 80 ? confession.prompt_used.slice(0, 80) + '...' : confession.prompt_used
  );
  const failTruncated = escapeXml(
    confession.what_it_did_instead.length > 120 ? confession.what_it_did_instead.slice(0, 120) + '...' : confession.what_it_did_instead
  );
  const feelingTruncated = escapeXml(
    confession.how_it_made_them_feel.length > 80 ? confession.how_it_made_them_feel.slice(0, 80) + '...' : confession.how_it_made_them_feel
  );
  const modelName = confession.model_name ? escapeXml(`${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`) : 'AI Model Fail';

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181124" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Header Branding -->
  <rect x="80" y="60" width="48" height="48" rx="12" fill="#f43f5e" />
  <path d="M104 74 C100 82 92 88 92 96 C92 102 98 106 104 106 C110 106 116 102 116 96 C116 88 108 82 104 74 Z" fill="#ffffff" />
  <text x="144" y="94" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff">Prompt Confessional</text>
  
  <rect x="980" y="64" width="140" height="36" rx="18" fill="#32234b" />
  <text x="1050" y="87" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f43f5e" text-anchor="middle">${escapeXml(confession.mood.toUpperCase())}</text>

  <!-- Prompt Card Box -->
  <rect x="80" y="150" width="1040" height="420" rx="24" fill="#241836" stroke="#3e2b5b" stroke-width="2" />

  <!-- Asked Section -->
  <text x="120" y="200" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ad99c4" letter-spacing="1">WHAT I ASKED FOR (${modelName})</text>
  <text x="120" y="240" font-family="system-ui, sans-serif" font-size="24" fill="#fdf4ff">${promptTruncated}</text>

  <!-- Did Instead Section -->
  <text x="120" y="320" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f43f5e" letter-spacing="1">WHAT IT DID INSTEAD</text>
  <text x="120" y="360" font-family="system-ui, sans-serif" font-size="24" fill="#fdf4ff">${failTruncated}</text>

  <!-- Feeling Section -->
  <rect x="120" y="430" width="960" height="100" rx="12" fill="#181124" />
  <text x="150" y="490" font-family="system-ui, sans-serif" font-size="22" font-style="italic" fill="#e8d5f5">&ldquo;${feelingTruncated}&rdquo;</text>
</svg>`;
}
