import type { Child } from 'hono/jsx';
import { COMPILED_TAILWIND_CSS } from '../styles/tailwind.generated';

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
  ogImage = 'https://aifails.wtf/og.svg',
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
        <meta name="theme-color" content="#191b22" />

        {/* Canonical & Open Graph */}
        <meta property="og:site_name" content="Prompt Confessional • aifails.wtf" />
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={resolvedOgTitle} />
        <meta property="og:description" content={resolvedOgDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={ogUrl} />

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

        {/* Lightweight Client-Side Script (~2KB) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('DOMContentLoaded', () => {
              // Modal & Slide-Out Sheet Logic
              const openBtn = document.getElementById('open-confess-btn');
              const closeBtn = document.getElementById('close-modal-btn');
              const backdrop = document.getElementById('confess-modal-backdrop');
              const modalCard = document.getElementById('confess-modal-card');

              function openModal() {
                if (!backdrop || !modalCard) return;
                backdrop.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                requestAnimationFrame(() => {
                  backdrop.classList.remove('opacity-0');
                  backdrop.classList.add('opacity-100');
                  modalCard.classList.remove('translate-y-full', 'sm:scale-95', 'sm:opacity-0');
                  modalCard.classList.add('translate-y-0', 'sm:scale-100', 'sm:opacity-100');
                });
              }

              function closeModal() {
                if (!backdrop || !modalCard) return;
                backdrop.classList.remove('opacity-100');
                backdrop.classList.add('opacity-0');
                modalCard.classList.remove('translate-y-0', 'sm:scale-100', 'sm:opacity-100');
                modalCard.classList.add('translate-y-full', 'sm:scale-95', 'sm:opacity-0');
                document.body.style.overflow = '';
                setTimeout(() => {
                  backdrop.classList.add('hidden');
                }, 300);
              }

              if (openBtn) openBtn.addEventListener('click', openModal);
              if (closeBtn) closeBtn.addEventListener('click', closeModal);

              if (backdrop) {
                backdrop.addEventListener('click', (e) => {
                  if (e.target === backdrop) closeModal();
                });
              }

              document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('hidden')) {
                  closeModal();
                }
              });

              // Searchable Model Combobox with Background Pre-fetching & Full Scrollable Catalog
              const modelInput = document.getElementById('model-search-input');
              const modelDropdown = document.getElementById('model-dropdown');
              if (modelInput && modelDropdown) {
                let allModels = null;
                let isFetching = false;

                // Extract initial SSR models as immediate offline fallback
                const initialModels = Array.from(modelDropdown.querySelectorAll('.model-option')).map(function(opt) {
                  const val = opt.getAttribute('data-value') || '';
                  const providerSpan = opt.querySelector('.font-semibold');
                  const provider = providerSpan ? providerSpan.textContent || '' : '';
                  const nameSpan = opt.querySelectorAll('span')[2];
                  const name = nameSpan ? nameSpan.textContent || '' : val;
                  return { provider: provider, name: name, id: val };
                });

                function loadFullModelCatalog() {
                  if (allModels || isFetching) return;
                  isFetching = true;
                  fetch('/api/models')
                    .then(function(res) { return res.ok ? res.json() : null; })
                    .then(function(data) {
                      const modelsPayload = Array.isArray(data) ? data : (data && Array.isArray(data.models) ? data.models : null);
                      if (modelsPayload && modelsPayload.length > 0) {
                        allModels = modelsPayload;
                        if (!modelDropdown.classList.contains('hidden')) {
                          renderAndFilter();
                        }
                      }
                    })
                    .catch(function() {})
                    .finally(function() { isFetching = false; });
                }

                // Prefetch model catalog in background immediately
                loadFullModelCatalog();

                function renderAndFilter() {
                  const query = modelInput.value.trim().toLowerCase();
                  const source = allModels || initialModels;

                  const filtered = source.filter(function(m) {
                    const searchStr = ((m.provider || '') + ' ' + (m.name || '') + ' ' + (m.id || '')).toLowerCase();
                    return !query || searchStr.indexOf(query) !== -1;
                  });

                  modelDropdown.textContent = '';

                  if (filtered.length === 0) {
                    const noMatches = document.createElement('div');
                    noMatches.className = 'px-3 py-2.5 text-xs text-[var(--text-muted)] italic text-center';
                    noMatches.textContent = 'No matching models found';
                    modelDropdown.appendChild(noMatches);
                    modelDropdown.classList.remove('hidden');
                    return;
                  }

                  const header = document.createElement('div');
                  header.className = 'sticky top-0 z-10 bg-[var(--bg-card)] px-3 py-2 border-b-2 border-[var(--border-color)] text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider flex justify-between items-center';
                  headerLabel.textContent = query ? 'Matching Models' : 'All Available Models';
                  const headerCount = document.createElement('span');
                  headerCount.textContent = String(filtered.length);
                  header.appendChild(headerLabel);
                  header.appendChild(headerCount);
                  modelDropdown.appendChild(header);

                  filtered.forEach(function(m) {
                    const val = m.provider ? m.provider + ' / ' + m.name : m.name;
                    const option = document.createElement('div');
                    option.className = 'model-option cursor-pointer rounded px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between';
                    option.dataset.value = val;

                    const labelWrap = document.createElement('div');
                    if (m.provider) {
                      const providerSpan = document.createElement('span');
                      providerSpan.className = 'font-semibold text-[var(--text-primary)]';
                      providerSpan.textContent = m.provider;

                      const separator = document.createElement('span');
                      separator.className = 'text-[var(--text-muted)]';
                      separator.textContent = ' / ';

                      labelWrap.appendChild(providerSpan);
                      labelWrap.appendChild(separator);
                    }

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'text-[var(--text-secondary)]';
                    nameSpan.textContent = m.name;
                    labelWrap.appendChild(nameSpan);

                    option.appendChild(labelWrap);
                    option.addEventListener('click', function() {
                      modelInput.value = option.dataset.value || '';
                      modelDropdown.classList.add('hidden');
                    });
                    modelDropdown.appendChild(option);
                  });

                  modelDropdown.classList.remove('hidden');
                }

                modelInput.addEventListener('focus', function() {
                  loadFullModelCatalog();
                  renderAndFilter();
                });

                modelInput.addEventListener('input', function() {
                  loadFullModelCatalog();
                  renderAndFilter();
                });

                document.addEventListener('click', function(e) {
                  if (!modelInput.contains(e.target) && !modelDropdown.contains(e.target)) {
                    modelDropdown.classList.add('hidden');
                  }
                });
              }

              // Real-Time Client-Side Secret & Email/PII Warning
              const SENSITIVE_PATTERNS = [
                /sk-[a-zA-Z0-9-_]{20,}/,
                /gh[pousr]_[a-zA-Z0-9]{36}/,
                /(?:AKIA|ASIA)[A-Z0-9]{16}/,
                /AIzaSy[a-zA-Z0-9-_]{33}/,
                /xox[baprs]-[0-9]{10,13}/,
                /-----BEGIN (?:RSA|OPENSSH) PRIVATE KEY-----/,
                /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\./,
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
              ];

              const textareas = document.querySelectorAll('textarea');
              textareas.forEach(textarea => {
                textarea.addEventListener('input', () => {
                  const val = textarea.value;
                  let hasSensitive = SENSITIVE_PATTERNS.some(pat => pat.test(val));
                  
                  let warningBanner = document.getElementById('secret-warning-banner');
                  if (hasSensitive) {
                    if (!warningBanner) {
                      warningBanner = document.createElement('div');
                      warningBanner.id = 'secret-warning-banner';
                      warningBanner.className = 'my-2 rounded-lg border border-[var(--amber-border)] bg-[var(--amber-bg)] p-3 text-xs font-semibold text-[var(--amber-text)] shadow-2xs';
                      warningBanner.innerHTML = '⚠️ <strong>Security Notice:</strong> Your text appears to contain an API key, private secret, or email address. It will be automatically redacted before storing.';
                      textarea.parentNode.insertBefore(warningBanner, textarea.nextSibling);
                    }
                  } else if (warningBanner) {
                    warningBanner.remove();
                  }
                });
              });


              // Intercept Solidarity Clicks for Instant AJAX Update & Active Button State
              document.querySelectorAll('.solidarity-form').forEach(form => {
                form.addEventListener('submit', async (e) => {
                  e.preventDefault();
                  const btn = form.querySelector('.solidarity-btn');
                  const countSpan = form.querySelector('.solidarity-count');
                  if (btn && !btn.disabled) {
                    btn.disabled = true;
                    btn.classList.add('bg-[var(--solidarity-bg)]', 'text-[var(--solidarity-text)]', 'translate-x-0.5', 'translate-y-0.5', 'shadow-[0.5px_0.5px_0px_#0e1a26]');

                    try {
                      const res = await fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' } });
                      if (!res.ok) console.warn('Solidarity update failed');
                    } catch (err) {
                      console.error('Solidarity network error', err);
                    }
                  }
                });
              });

              // Confirm Moderation Report Submissions Before Posting
              document.querySelectorAll('form.confirm-submit-form[data-confirm-message]').forEach(form => {
                form.addEventListener('submit', (e) => {
                  const message = form.getAttribute('data-confirm-message');
                  if (!message) return;
                  if (!window.confirm(message)) {
                    e.preventDefault();
                  }
                });
              });

              // Copy Permalink Handler
              document.querySelectorAll('.copy-permalink-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                  const relativePath = btn.getAttribute('data-permalink');
                  if (!relativePath) return;
                  const fullUrl = window.location.origin + relativePath;
                  try {
                    await navigator.clipboard.writeText(fullUrl);
                    const label = btn.querySelector('.copy-label');
                    if (label) {
                      const orig = label.textContent;
                      label.textContent = 'Copied!';
                      setTimeout(() => { label.textContent = orig; }, 2000);
                    }
                  } catch (err) {
                    console.error('Failed to copy permalink', err);
                  }
                });
              });
            });
          `,
          }}
        />
      </body>
    </html>
  );
}
