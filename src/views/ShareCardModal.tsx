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
      class="fixed inset-0 z-50 hidden items-center justify-center p-3 sm:p-4 bg-[#0e1a26]/85 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        class="relative w-full max-w-3xl rounded-lg border-3 border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-[8px_8px_0px_#0e1a26] space-y-4 my-auto"
        onclick="event.stopPropagation()"
      >
        {/* Modal Header */}
        <div class="flex items-center justify-between border-b-2 border-[var(--border-color)] pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">📸</span>
            <div>
              <h3 id="share-modal-title" class="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
                Share Fail Card
              </h3>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                2x High-resolution PNG for Slack, Discord, Reddit, and Twitter
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

        {/* Live Canvas Preview (Rendered at 1600x900 for 2x High-DPI Sharpness) */}
        <div class="relative overflow-hidden rounded-lg border-2 border-[var(--border-color)] bg-[#152435] shadow-[4px_4px_0px_#0e1a26]">
          <canvas
            id="share-card-canvas"
            width="1600"
            height="900"
            class="w-full h-auto block select-none"
          ></canvas>
        </div>

        {/* Action Controls */}
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex flex-wrap items-center gap-2">
            {/* Copy Card Image to Clipboard */}
            <button
              id="copy-card-img-btn"
              type="button"
              class="inline-flex items-center gap-2 rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs sm:text-sm font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
            >
              <span>📋</span>
              <span id="copy-card-img-text">Copy Image to Clipboard</span>
            </button>

            {/* Download PNG */}
            <button
              id="download-card-img-btn"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3.5 py-2 text-xs sm:text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
              title="Download 2x PNG file"
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

      {/* High-Fidelity Canvas Card Renderer */}
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

    var W = 1600;
    var H = 900;

    // 1. Solid Marge Cobalt Canvas Background
    ctx.fillStyle = '#152435';
    ctx.fillRect(0, 0, W, H);

    // 2. Card Container
    var padX = 48;
    var padY = 40;
    var cardW = W - padX * 2;
    var cardH = H - padY * 2;
    var cardX = padX;
    var cardY = padY;

    // 3D Drop Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 10, cardY + 10, cardW, cardH, 20);
    ctx.fill();

    // Card Surface
    ctx.fillStyle = '#2a4766';
    roundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    // Card Outer Border
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 3. Top Header inside Card
    var headerY = cardY + 48;

    // Keycap Logo Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 44 + 4, headerY - 18 + 4, 130, 44, 8);
    ctx.fill();

    // Keycap Logo Button (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 44, headerY - 18, 130, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 20px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('(╯°□°)╯', cardX + 44 + 65, headerY + 4);

    // Brand Title & Subtitle
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 192, headerY + 6);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 192, headerY + 28);

    // Model Pill Badge (Top Right)
    ctx.font = '900 16px ui-monospace, Menlo, monospace';
    var modelBadge = cardData.model;
    var badgeW = ctx.measureText(modelBadge).width + 36;
    var badgeX = cardX + cardW - 44 - badgeW;

    // Badge Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, badgeX + 4, headerY - 16 + 4, badgeW, 40, 8);
    ctx.fill();

    // Badge Body (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, badgeX, headerY - 16, badgeW, 40, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(modelBadge, badgeX + badgeW / 2, headerY + 4);

    // Header Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 44, headerY + 48);
    ctx.lineTo(cardX + cardW - 44, headerY + 48);
    ctx.stroke();

    // 4. Content Area Layout
    var curY = headerY + 74;
    var innerW = cardW - 88;
    var contentX = cardX + 44;

    // SECTION 1: "WHAT I ASKED FOR"
    var promptSectionH = 145;
    ctx.fillStyle = '#1b2f44';
    roundRect(ctx, contentX, curY, innerW, promptSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Blue Accent Bar
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(contentX, curY, 6, promptSectionH);

    // Section Header Tag
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#97bede';
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT I ASKED FOR', contentX + 24, curY + 28);

    // Prompt Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var promptLines = wrapText(ctx, cardData.prompt, innerW - 50, 3);
    for (var i = 0; i < promptLines.length; i++) {
      ctx.fillText(promptLines[i], contentX + 24, curY + 60 + i * 28);
    }

    curY += promptSectionH + 18;

    // SECTION 2: "WHAT IT DID INSTEAD" (Terminal Danger Box)
    var failSectionH = 260;
    ctx.fillStyle = '#13202e';
    roundRect(ctx, contentX, curY, innerW, failSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Danger Red Bar
    ctx.fillStyle = '#f87171';
    ctx.fillRect(contentX, curY, 6, failSectionH);

    // Section Header Tag
    ctx.fillStyle = '#f87171';
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT IT DID INSTEAD', contentX + 24, curY + 28);

    // Terminal Dots
    drawTerminalDots(ctx, contentX + innerW - 60, curY + 22);

    // Terminal Fail Content
    ctx.fillStyle = '#f1f5f9';
    var cleanFail = cardData.fail.replace(/\`\`\`[a-z]*\\n/g, '').replace(/\\n\`\`\`/g, '');
    var isCodeBlock = cardData.fail.includes('\`\`\`');

    if (isCodeBlock) {
      ctx.font = '600 17px ui-monospace, Menlo, Consolas, monospace';
    } else {
      ctx.font = '600 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }

    var failLines = wrapText(ctx, cleanFail, innerW - 50, 6);
    for (var j = 0; j < failLines.length; j++) {
      ctx.fillText(failLines[j], contentX + 24, curY + 62 + j * 27);
    }

    curY += failSectionH + 18;

    // SECTION 3: "HOW IT MADE ME FEEL" (Bart Yellow Banner)
    var feelSectionH = 110;
    ctx.fillStyle = '#1e334a';
    roundRect(ctx, contentX, curY, innerW, feelSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Amber Bar
    ctx.fillStyle = '#fed41d';
    ctx.fillRect(contentX, curY, 6, feelSectionH);

    // Header Label
    ctx.fillStyle = '#fed41d';
    ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('HOW IT MADE ME FEEL  ' + cardData.mood, contentX + 24, curY + 28);

    // Feeling Text
    ctx.fillStyle = '#fed41d';
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var feelLines = wrapText(ctx, cardData.feeling, innerW - 50, 2);
    for (var k = 0; k < feelLines.length; k++) {
      ctx.fillText(feelLines[k], contentX + 24, curY + 60 + k * 28);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 28;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 44, footY - 24);
    ctx.lineTo(cardX + cardW - 44, footY - 24);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anonymous AI Prompt Fails • Solidarity & Ackchyually Fixes', cardX + 44, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('https://aifails.wtf', cardX + cardW - 44, footY);
  }

  function drawTerminalDots(ctx, x, y) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 16, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 32, y, 5, 0, Math.PI * 2);
    ctx.fill();
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
