import type { Child } from 'hono/jsx';
import { COMPILED_TAILWIND_CSS } from '../styles/tailwind.generated';

type LayoutProps = {
  title?: string;
  turnstileSiteKey?: string;
  head?: Child;
  children: Child;
};

// Embedded CSS Variables for Instant Zero-FOUC Edge SSR
const THEME_CSS = `
:root {
  --bg-primary: #191b22;
  --bg-card: #222530;
  --bg-subtle: #2d3140;
  --border-color: #3b4054;
  --border-subtle: #4b526b;
  --text-primary: #f3f4f8;
  --text-secondary: #c5c9d8;
  --text-muted: #8d94a8;
  --accent-primary: #f3f4f8;
  --accent-hover: #ffffff;
  --accent-text: #191b22;
  --badge-bg: #2d3140;
  --badge-text: #f3f4f8;
  --quote-bg: #1e212b;
  --quote-border: #4f5670;
  --quote-text: #e2e5ef;
  --amber-bg: #2b1e0a;
  --amber-border: #b45309;
  --amber-text: #fde68a;
  --amber-accent: #f59e0b;
  --danger-bg: #2d0e0e;
  --danger-border: #dc2626;
  --danger-text: #fca5a5;
  --success-bg: #0d2818;
  --success-border: #16a34a;
  --success-text: #86efac;
}

body {
  background-color: var(--bg-primary);
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    radial-gradient(ellipse 80% 40% at 50% -10%, rgba(245, 158, 11, 0.03), transparent 70%);
  background-size: 20px 20px, 100% 100%;
  background-position: 0 0, 0 0;
  background-attachment: fixed;
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}
`;

export function Layout({ title = 'Prompt Confessional — A safe space for AI frustration', turnstileSiteKey, head, children }: LayoutProps) {
  return (
    <html lang="en" class="h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content="A safe space to vent about large language model frustrations and share prompt fails." />
        
        {/* SVG Favicon with Table Flip Icon */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23222530'/><text y='58' x='50' text-anchor='middle' font-family='monospace' font-size='22' font-weight='bold' fill='%23f59e0b'>(╯°□°)╯</text></svg>"
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
                  header.className = 'sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur-xs px-3 py-1 border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex justify-between';
                  const headerLabel = document.createElement('span');
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
                    btn.classList.remove('hover:border-[var(--danger-border)]', 'hover:bg-[var(--danger-bg)]', 'hover:text-[var(--danger-text)]');
                    btn.classList.add('border-[var(--danger-border)]', 'bg-[var(--danger-bg)]', 'text-[var(--danger-text)]', 'font-semibold', 'cursor-default');
                    
                    if (countSpan) {
                      const current = parseInt(countSpan.textContent || '0', 10);
                      countSpan.textContent = (current + 1).toString();
                    }

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
