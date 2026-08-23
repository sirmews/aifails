import type { Confession } from '../core/types';

type ShareCardModalProps = {
  confession: Confession;
  url: string;
};

export function ShareCardModal({ confession, url }: ShareCardModalProps) {
  const modelDisplay = confession.model_name
    ? `${confession.model_provider ? confession.model_provider + ' / ' : ''}${confession.model_name}`
    : 'Unknown Model';

  const promptText = confession.prompt_used;
  const failText = confession.what_it_did_instead;
  const feelingText = confession.how_it_made_them_feel;
  const moodEmoji = confession.mood || '🤡';

  return (
    <div
      id="share-card-modal"
      class="fixed inset-0 z-50 hidden items-center justify-center p-3 sm:p-4 bg-[#0e1a26]/80 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        class="relative w-full max-w-2xl rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-[6px_6px_0px_#0e1a26] space-y-4 my-auto"
        onclick="event.stopPropagation()"
      >
        {/* Modal Header */}
        <div class="flex items-center justify-between border-b-2 border-[var(--border-color)] pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">📸</span>
            <div>
              <h3 id="share-modal-title" class="text-base font-black text-[var(--text-primary)] leading-tight">
                Share Fail Card
              </h3>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                2x High-resolution PNG for Slack, Discord, and Twitter
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            type="button"
            class="rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-black text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div class="relative overflow-hidden rounded-md border-2 border-[var(--border-color)] bg-[#1e334a] shadow-[3px_3px_0px_#0e1a26]">
          <canvas
            id="share-card-canvas"
            width="1200"
            height="630"
            class="w-full h-auto block select-none"
          ></canvas>
        </div>

        {/* Action Controls */}
        <div class="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div class="flex items-center gap-2">
            {/* Copy Card Image to Clipboard */}
            <button
              id="copy-card-img-btn"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs sm:text-sm font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
            >
              <span>📋</span>
              <span id="copy-card-img-text">Copy Image to Clipboard</span>
            </button>

            {/* Download PNG */}
            <button
              id="download-card-img-btn"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-xs sm:text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
              title="Download PNG file"
            >
              <span>💾</span>
              <span>Download PNG</span>
            </button>
          </div>

          {/* Copy Link */}
          <button
            id="copy-card-url-btn"
            type="button"
            class="inline-flex items-center gap-1 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
          >
            <span>🔗</span>
            <span id="copy-card-url-text">Copy Link</span>
          </button>
        </div>
      </div>

      {/* Embedded Data for Canvas Renderer */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var cardData = {
    model: ${JSON.stringify(modelDisplay)},
    prompt: ${JSON.stringify(promptText)},
    fail: ${JSON.stringify(failText)},
    feeling: ${JSON.stringify(feelingText)},
    mood: ${JSON.stringify(moodEmoji)},
    url: ${JSON.stringify(url)},
    id: ${JSON.stringify(confession.id)}
  };

  var modal = document.getElementById('share-card-modal');
  var openBtn = document.getElementById('open-share-modal-btn');
  var closeBtn = document.getElementById('close-share-modal-btn');
  var copyImgBtn = document.getElementById('copy-card-img-btn');
  var copyImgText = document.getElementById('copy-card-img-text');
  var downloadBtn = document.getElementById('download-card-img-btn');
  var copyUrlBtn = document.getElementById('copy-card-url-btn');
  var copyUrlText = document.getElementById('copy-card-url-text');
  var canvas = document.getElementById('share-card-canvas');

  if (!modal || !canvas) return;

  function renderCardCanvas() {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W = 1200;
    var H = 630;

    // 1. Solid Marge Cobalt Canvas Background
    ctx.fillStyle = '#1e334a';
    ctx.fillRect(0, 0, W, H);

    // 2. Card Container with 3D Drop Shadow
    var pad = 36;
    var cardW = W - pad * 2;
    var cardH = H - pad * 2;
    var cardX = pad;
    var cardY = pad;

    // Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 8, cardY + 8, cardW, cardH, 16);
    ctx.fill();

    // Card Body
    ctx.fillStyle = '#2a4766';
    roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Header Bar inside Card
    var topY = cardY + 40;

    // Yellow Keycap
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 38 + 4, topY - 14 + 4, 110, 36, 6);
    ctx.fill();

    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 38, topY - 14, 110, 36, 6);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('(╯°□°)╯', cardX + 38 + 55, topY + 10);

    // Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 162, topY + 4);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 162, topY + 22);

    // Model Pill (Top Right)
    ctx.textAlign = 'right';
    var modelBadge = cardData.model;
    ctx.font = '900 14px ui-monospace, Menlo, monospace';
    var badgeW = ctx.measureText(modelBadge).width + 24;
    var badgeX = cardX + cardW - 38 - badgeW;

    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, badgeX + 3, topY - 12 + 3, badgeW, 32, 6);
    ctx.fill();

    ctx.fillStyle = '#fed41d';
    roundRect(ctx, badgeX, topY - 12, badgeW, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(modelBadge, badgeX + badgeW / 2, topY + 9);

    // Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 38, topY + 40);
    ctx.lineTo(cardX + cardW - 38, topY + 40);
    ctx.stroke();

    // 4. Content Area
    var curY = topY + 68;

    // Section 1: "WHAT I ASKED FOR"
    ctx.textAlign = 'left';
    ctx.fillStyle = '#97bede';
    ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT I ASKED FOR', cardX + 54, curY);

    // Left line indicator
    ctx.fillStyle = '#97bede';
    ctx.fillRect(cardX + 38, curY - 10, 4, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var promptLines = wrapText(ctx, cardData.prompt, cardW - 110, 2);
    for (var i = 0; i < promptLines.length; i++) {
      ctx.fillText(promptLines[i], cardX + 54, curY + 20 + i * 22);
    }
    curY += 20 + promptLines.length * 22 + 20;

    // Section 2: "WHAT IT DID INSTEAD" (Danger border)
    ctx.fillStyle = '#f87171';
    ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT IT DID INSTEAD', cardX + 54, curY);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cardX + 38, curY - 10, 4, 76);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var cleanFail = cardData.fail.replace(/\`\`\`[a-z]*\\n/g, '').replace(/\\n\`\`\`/g, '');
    var failLines = wrapText(ctx, cleanFail, cardW - 110, 3);
    for (var j = 0; j < failLines.length; j++) {
      ctx.fillText(failLines[j], cardX + 54, curY + 20 + j * 21);
    }
    curY += 20 + failLines.length * 21 + 20;

    // Section 3: "HOW IT MADE ME FEEL"
    ctx.fillStyle = '#fed41d';
    ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('HOW IT MADE ME FEEL ' + cardData.mood, cardX + 54, curY);

    ctx.fillStyle = '#fed41d';
    ctx.fillRect(cardX + 38, curY - 10, 4, 38);

    ctx.fillStyle = '#fed41d';
    ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var feelingLines = wrapText(ctx, cardData.feeling, cardW - 110, 2);
    for (var k = 0; k < feelingLines.length; k++) {
      ctx.fillText(feelingLines[k], cardX + 54, curY + 20 + k * 21);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 26;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 38, footY - 20);
    ctx.lineTo(cardX + cardW - 38, footY - 20);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Anonymous AI Prompt Fails • Solidarity & Ackchyually Fixes', cardX + 38, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 14px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('https://aifails.wtf', cardX + cardW - 38, footY);
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth, maxLines) {
    var words = text.split(/\\s+/);
    var lines = [];
    var currentLine = words[0] || '';

    for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        if (lines.length >= maxLines) {
          lines[lines.length - 1] += '...';
          return lines;
        }
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, maxLines);
  }

  // Open Modal
  if (openBtn) {
    openBtn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      renderCardCanvas();
    });
  }

  // Close Modal
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });

  // Copy Image Button
  if (copyImgBtn && copyImgText) {
    copyImgBtn.addEventListener('click', function() {
      try {
        canvas.toBlob(function(blob) {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(function() {
              copyImgText.textContent = '✓ Copied Image!';
              copyImgBtn.classList.remove('bg-[var(--accent-primary)]');
              copyImgBtn.classList.add('bg-emerald-500', 'text-white');
              setTimeout(function() {
                copyImgText.textContent = 'Copy Image to Clipboard';
                copyImgBtn.classList.remove('bg-emerald-500', 'text-white');
                copyImgBtn.classList.add('bg-[var(--accent-primary)]');
              }, 2500);
            }).catch(function() {
              downloadCardImage();
            });
          } else {
            downloadCardImage();
          }
        }, 'image/png');
      } catch (err) {
        downloadCardImage();
      }
    });
  }

  // Download Image Button
  function downloadCardImage() {
    var a = document.createElement('a');
    a.download = 'aifails-' + cardData.id + '.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCardImage);
  }

  // Copy Link Button
  if (copyUrlBtn && copyUrlText) {
    copyUrlBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(cardData.url).then(function() {
        copyUrlText.textContent = '✓ Link Copied!';
        setTimeout(function() {
          copyUrlText.textContent = 'Copy Link';
        }, 2000);
      });
    });
  }
})();
          `,
        }}
      />
    </div>
  );
}
