import type { Child } from 'hono/jsx';

type LayoutProps = {
  title?: string;
  turnstileSiteKey?: string;
  head?: Child;
  children: Child;
};

// Embedded CSS Variables for Instant Zero-FOUC Edge SSR
const THEME_CSS = `
:root {
  --bg-primary: #f0f1f4;
  --bg-card: #ffffff;
  --bg-subtle: #f8f9fb;
  --border-color: #dcdfe5;
  --border-subtle: #c5c9d3;
  --text-primary: #0f1117;
  --text-secondary: #333742;
  --text-muted: #5c6270;
  --accent-primary: #0f1117;
  --accent-hover: #262a36;
  --accent-text: #ffffff;
  --badge-bg: #e5e8ee;
  --badge-text: #1a1c23;
  --quote-bg: #f5f6f8;
  --quote-border: #b8bdcb;
  --quote-text: #22252e;
  --amber-bg: #fffbeb;
  --amber-border: #f59e0b;
  --amber-text: #854d0e;
  --amber-accent: #d97706;
  --danger-bg: #fef2f2;
  --danger-border: #ef4444;
  --danger-text: #b91c1c;
  --success-bg: #f0fdf4;
  --success-border: #22c55e;
  --success-text: #15803d;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0a0b0d;
    --bg-card: #14161b;
    --bg-subtle: #1e2027;
    --border-color: #2b2e38;
    --border-subtle: #3a3f4d;
    --text-primary: #f8f9fb;
    --text-secondary: #d1d5df;
    --text-muted: #9399a8;
    --accent-primary: #f8f9fb;
    --accent-hover: #e2e5eb;
    --accent-text: #0a0b0d;
    --badge-bg: #22252e;
    --badge-text: #f0f2f7;
    --quote-bg: #181a20;
    --quote-border: #4d5466;
    --quote-text: #e8ebf2;
    --amber-bg: #231804;
    --amber-border: #92400e;
    --amber-text: #fef08a;
    --amber-accent: #f59e0b;
    --danger-bg: #240a0a;
    --danger-border: #991b1b;
    --danger-text: #fca5a5;
    --success-bg: #0b2313;
    --success-border: #15803d;
    --success-text: #86efac;
  }
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
