import type { Child } from 'hono/jsx';
import { COMPILED_TAILWIND_CSS } from '../styles/tailwind.generated';
import { LAYOUT_CLIENT_SCRIPT } from './layout-script';
type LayoutProps = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  turnstileSiteKey?: string;
  head?: Child;
  children: Child;
};

// Embedded CSS Variables for Instant Zero-FOUC Edge SSR
const THEME_CSS = `
:root {
  --bg-primary: #1e334a;
  --bg-card: #2a4766;
  --bg-subtle: #3a5e85;
  --border-color: #0e1a26;
  --border-subtle: #4e7ba8;
  --text-primary: #ffffff;
  --text-secondary: #d6e7f7;
  --text-muted: #97bede;
  --accent-primary: #fed41d;
  --accent-hover: #ffe047;
  --accent-text: #000000;
  --badge-bg: #3a5e85;
  --badge-text: #ffffff;
  --quote-bg: #223b54;
  --quote-border: #4e7ba8;
  --quote-text: #d6e7f7;
  --amber-bg: #fed41d;
  --amber-border: #0e1a26;
  --amber-text: #000000;
  --amber-accent: #fed41d;
  --solidarity-bg: #f97316;
  --solidarity-border: #0e1a26;
  --solidarity-text: #000000;
  --solidarity-accent: #f97316;
  --danger-bg: #401d24;
  --danger-border: #ef4444;
  --danger-text: #fca5a5;
  --success-bg: #0d2818;
  --success-border: #16a34a;
  --success-text: #86efac;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
`;

export function Layout({
  title = 'Prompt Confessional — A safe space for AI frustration (aifails.wtf)',
  description = 'When large language models fail, hallucinate, or refuse to listen — share what you asked for, what it did instead, and how it made you feel.',
  ogTitle,
  ogDescription,
  ogImage = 'https://aifails.wtf/og.png',
  ogUrl = 'https://aifails.wtf/',
  ogType = 'website',
  turnstileSiteKey,
  head,
  children,
}: LayoutProps) {
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;

  return (
    <html lang="en" class="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content="#1e334a" />
        <meta name="apple-mobile-web-app-title" content="aifails.wtf" />

        {/* Canonical Link */}
        <link rel="canonical" href={ogUrl} />

        {/* Canonical & Open Graph (WhatsApp, Facebook, Discord, iMessage compliant) */}
        <meta property="og:site_name" content="Prompt Confessional • aifails.wtf" />
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={resolvedOgTitle} />
        <meta property="og:description" content={resolvedOgDescription} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={resolvedOgTitle} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resolvedOgTitle} />
        <meta name="twitter:description" content={resolvedOgDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* SVG Favicon with Table Flip Icon */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='14' fill='%231e334a' stroke='%230e1a26' stroke-width='6'/><rect x='10' y='20' width='80' height='60' rx='10' fill='%23fed41d' stroke='%230e1a26' stroke-width='4'/><text y='58' x='50' text-anchor='middle' font-family='monospace' font-size='18' font-weight='900' fill='%23000000'>(╯°□°)╯</text></svg>"
        />
        {/* SEO RSS & Sitemap Auto-Discovery Links */}
        <link rel="alternate" type="application/rss+xml" title="Prompt Confessional RSS Feed" href="/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {head}
        <style dangerouslySetInnerHTML={{ __html: `${COMPILED_TAILWIND_CSS}\n${THEME_CSS}` }} />


        {turnstileSiteKey && (
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        )}
      </head>
      <body class="flex min-h-full flex-col font-sans selection:bg-[var(--accent-primary)] selection:text-[var(--accent-text)] bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {children}

        {/* Lightweight Client-Side Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: LAYOUT_CLIENT_SCRIPT,
          }}
        />
      </body>
    </html>
  );
}
