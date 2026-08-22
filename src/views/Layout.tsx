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
  --bg-primary: #f7f5f0;
  --bg-card: #ffffff;
  --bg-subtle: #eeeae1;
  --border-color: #dfd9ce;
  --border-subtle: #cfc7b9;
  --text-primary: #221f1b;
  --text-secondary: #48423a;
  --text-muted: #686054;
  --accent-primary: #2c2722;
  --accent-hover: #443e37;
  --accent-text: #faf8f5;
  --badge-bg: #eae5dc;
  --badge-text: #3a352c;
  --quote-bg: #f3efe6;
  --quote-border: #cdc4b4;
  --quote-text: #352f28;
  --amber-bg: #fef7ea;
  --amber-border: #f8dfb6;
  --amber-text: #7c4714;
  --amber-accent: #b86b1f;
  --danger-bg: #fdf3f2;
  --danger-border: #e8a59b;
  --danger-text: #962c20;
  --success-bg: #f1f8f3;
  --success-border: #bfe0c7;
  --success-text: #20572f;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #17181c;
    --bg-card: #202227;
    --bg-subtle: #292c33;
    --border-color: #333742;
    --border-subtle: #414754;
    --text-primary: #f0eee9;
    --text-secondary: #c5cad4;
    --text-muted: #9ba1ad;
    --accent-primary: #ded8ce;
    --accent-hover: #f2ede4;
    --accent-text: #17181c;
    --badge-bg: #2b2e37;
    --badge-text: #e0e3eb;
    --quote-bg: #1c1e23;
    --quote-border: #4a505e;
    --quote-text: #e2dfd9;
    --amber-bg: #291e13;
    --amber-border: #593f20;
    --amber-text: #fde4ba;
    --amber-accent: #e09838;
    --danger-bg: #2a1616;
    --danger-border: #632e2c;
    --danger-text: #fca7a2;
    --success-bg: #15271b;
    --success-border: #2c5437;
    --success-text: #a7e5ba;
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
