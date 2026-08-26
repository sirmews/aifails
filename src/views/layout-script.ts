export const LAYOUT_CLIENT_SCRIPT = `
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
      header.className = 'sticky top-0 z-10 bg-[var(--bg-card)] px-3 py-2 border-b-2 border-[var(--border-color)] text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-wider flex justify-between items-center select-none';
      const headerLabel = document.createElement('span');
      headerLabel.textContent = query ? 'Matching Models' : 'All Available Models';
      const headerCount = document.createElement('span');
      headerCount.textContent = String(filtered.length);
      header.appendChild(headerLabel);
      header.appendChild(headerCount);
      modelDropdown.appendChild(header);

      const listContainer = document.createElement('div');
      listContainer.className = 'p-1';
      modelDropdown.appendChild(listContainer);

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
        listContainer.appendChild(option);
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
    /eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\./,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/
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

        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent || '0', 10);
          countSpan.textContent = String(currentCount + 1);
        }

        try {
          const res = await fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' } });
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.count === 'number' && countSpan) {
              countSpan.textContent = String(data.count);
            }
          }
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
          label.textContent = '✓ Copied!';
          btn.classList.add('text-emerald-400', 'border-emerald-500');
          setTimeout(() => {
            label.textContent = orig;
            btn.classList.remove('text-emerald-400', 'border-emerald-500');
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy permalink', err);
      }
    });
  });

  // Tab Key Indentation Support in Textareas
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + '  ' + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
    });
  });

  // Markdown Quick Format Toolbar
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetName = btn.getAttribute('data-target');
      const format = btn.getAttribute('data-format');
      const textarea = document.querySelector('textarea[name="' + targetName + '"]');
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const selected = val.substring(start, end);

      let replacement = '';
      let cursorOffset = 0;
      const b3 = String.fromCharCode(96, 96, 96);
      const b1 = String.fromCharCode(96);
      const nl = String.fromCharCode(10);

      if (format === 'code-block') {
        if (selected) {
          replacement = b3 + nl + selected + nl + b3;
          cursorOffset = replacement.length;
        } else {
          replacement = b3 + nl + '// paste code here' + nl + b3;
          cursorOffset = 4;
        }
      } else if (format === 'inline-code') {
        if (selected) {
          replacement = b1 + selected + b1;
          cursorOffset = replacement.length;
        } else {
          replacement = b1 + 'code' + b1;
          cursorOffset = 1;
        }
      }

      textarea.value = val.substring(0, start) + replacement + val.substring(end);
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    });
  });

  // Copy Code Block Handler
  document.querySelectorAll('.copy-code-block-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.rounded-md');
      const codeEl = card ? card.querySelector('pre code') : null;
      if (!codeEl) return;
      const codeText = codeEl.textContent || '';
      try {
        await navigator.clipboard.writeText(codeText);
        const span = btn.querySelector('span');
        if (span) {
          const orig = span.textContent;
          span.textContent = 'Copied!';
          setTimeout(() => { span.textContent = orig; }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy code', err);
      }
    });
  });
});
`;
