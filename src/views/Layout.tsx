import type { Child } from 'hono/jsx';

type LayoutProps = {
  title?: string;
  turnstileSiteKey?: string;
  head?: Child;
  children: Child;
};

// Embedded CSS Variables for Instant Zero-FOUC Edge SSR
const THEME_CSS = `
:root, [data-theme="day"] {
  --bg-primary: #fafaf9;
  --bg-card: #ffffff;
  --bg-subtle: #f5f5f4;
  --border-color: #e7e5e4;
  --border-subtle: #d6d3d1;
  --text-primary: #1c1917;
  --text-secondary: #57534e;
  --text-muted: #a8a29e;
  --accent-primary: #1c1917;
  --accent-hover: #44403c;
  --accent-text: #ffffff;
  --badge-bg: #f5f5f4;
  --badge-text: #57534e;
  --quote-bg: #f5f5f4;
  --quote-border: #d6d3d1;
  --quote-text: #44403c;
  --amber-bg: #fffbeb;
  --amber-border: #fde68a;
  --amber-text: #78350f;
  --amber-accent: #d97706;
}

[data-theme="night"] {
  --bg-primary: #09090b;
  --bg-card: #18181b;
  --bg-subtle: #27272a;
  --border-color: #3f3f46;
  --border-subtle: #52525b;
  --text-primary: #ffffff;
  --text-secondary: #e4e4e7;
  --text-muted: #a1a1aa;
  --accent-primary: #ffffff;
  --accent-hover: #e4e4e7;
  --accent-text: #09090b;
  --badge-bg: #27272a;
  --badge-text: #f4f4f5;
  --quote-bg: #18181b;
  --quote-border: #ffffff;
  --quote-text: #f4f4f5;
  --amber-bg: #2e1000;
  --amber-border: #92400e;
  --amber-text: #fffbeb;
  --amber-accent: #fbbf24;
}

[data-theme="twilight"] {
  --bg-primary: #181124;
  --bg-card: #241836;
  --bg-subtle: #32234b;
  --border-color: #3e2b5b;
  --border-subtle: #543973;
  --text-primary: #fdf4ff;
  --text-secondary: #e8d5f5;
  --text-muted: #ad99c4;
  --accent-primary: #f43f5e;
  --accent-hover: #e11d48;
  --accent-text: #ffffff;
  --badge-bg: #32234b;
  --badge-text: #e8d5f5;
  --quote-bg: #241836;
  --quote-border: #f43f5e;
  --quote-text: #e8d5f5;
  --amber-bg: #3b1c32;
  --amber-border: #6b2d56;
  --amber-text: #fce7f3;
  --amber-accent: #ec4899;
}

body {
  background-color: var(--bg-primary);
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
        
        {/* SEO RSS & Sitemap Auto-Discovery Links */}
        <link rel="alternate" type="application/rss+xml" title="Prompt Confessional RSS Feed" href="/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {head}
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Immediate Non-Blocking Theme Restoration Script (Prevents FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              const saved = localStorage.getItem('theme_mode') || 'day';
              document.documentElement.setAttribute('data-theme', saved);
            })();
          `,
          }}
        />

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
              // Theme Switcher Sync
              const themeSelect = document.getElementById('theme-select');
              const currentTheme = localStorage.getItem('theme_mode') || 'day';
              if (themeSelect) {
                themeSelect.value = currentTheme;
                themeSelect.addEventListener('change', (e) => {
                  const val = e.target.value;
                  document.documentElement.setAttribute('data-theme', val);
                  localStorage.setItem('theme_mode', val);
                });
              }

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

              // Compact Searchable Model Combobox
              const modelInput = document.getElementById('model-search-input');
              const modelDropdown = document.getElementById('model-dropdown');
              if (modelInput && modelDropdown) {
                const options = Array.from(modelDropdown.querySelectorAll('.model-option'));
                const MAX_VISIBLE = 15;

                function filterModels() {
                  const query = modelInput.value.trim().toLowerCase();
                  let count = 0;

                  options.forEach(opt => {
                    const searchData = opt.getAttribute('data-search') || '';
                    if (!query || searchData.includes(query)) {
                      if (count < MAX_VISIBLE) {
                        opt.style.display = 'block';
                        count++;
                      } else {
                        opt.style.display = 'none';
                      }
                    } else {
                      opt.style.display = 'none';
                    }
                  });

                  if (count > 0) {
                    modelDropdown.classList.remove('hidden');
                  } else {
                    modelDropdown.classList.add('hidden');
                  }
                }

                modelInput.addEventListener('focus', filterModels);
                modelInput.addEventListener('input', filterModels);

                options.forEach(opt => {
                  opt.addEventListener('click', () => {
                    modelInput.value = opt.getAttribute('data-value') || '';
                    modelDropdown.classList.add('hidden');
                  });
                });

                document.addEventListener('click', (e) => {
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

              // Toggle Suggestion Forms
              document.querySelectorAll('.toggle-suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                  const id = btn.getAttribute('data-confession-id');
                  const form = document.getElementById('suggestion-form-' + id);
                  if (form) {
                    form.classList.toggle('hidden');
                  }
                });
              });

              // Intercept Solidarity Clicks for Instant AJAX Update
              document.querySelectorAll('.solidarity-form').forEach(form => {
                form.addEventListener('submit', async (e) => {
                  e.preventDefault();
                  const btn = form.querySelector('button');
                  const countSpan = form.querySelector('.solidarity-count');
                  if (btn && !btn.disabled) {
                    btn.disabled = true;
                    btn.classList.remove('hover:bg-rose-50', 'hover:text-rose-600');
                    btn.classList.add('bg-rose-50', 'text-rose-600', 'cursor-default');
                    
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
