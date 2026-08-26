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
                Share on Socials
              </h3>
              <p class="text-xs font-semibold text-[var(--text-secondary)]">
                Single card for Twitter/Slack, or 3-slide swipeable carousel for LinkedIn
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

        {/* Format Selector Tabs */}
        <div class="flex items-center gap-2 border-b-2 border-[var(--border-color)] pb-3">
          <button
            id="tab-format-single"
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--accent-text)] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all cursor-pointer"
          >
            <span>🖼️</span>
            <span>Single Card (16:9)</span>
          </button>
          <button
            id="tab-format-carousel"
            type="button"
            class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer"
          >
            <span>📄</span>
            <span>LinkedIn Carousel (PDF)</span>
          </button>
        </div>

        {/* Carousel Slide Navigation Toolbar (Only in Carousel Mode) */}
        <div
          id="carousel-nav-bar"
          class="hidden items-center justify-center gap-2.5 sm:gap-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] py-1.5 px-3"
        >
          <button
            id="slide-prev-btn"
            type="button"
            class="flex items-center gap-1 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-black text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[2.5px_2.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            title="Previous slide"
          >
            <span>◀</span>
            <span class="text-[11px] font-bold hidden sm:inline">Prev</span>
          </button>

          <div class="flex items-center gap-1.5 select-none">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Slide</span>
            <span
              id="slide-indicator"
              class="rounded border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-0.5 text-xs font-black text-[var(--text-primary)] shadow-[1px_1px_0px_#0e1a26]"
            >
              1 / 3
            </span>
          </div>

          <button
            id="slide-next-btn"
            type="button"
            class="flex items-center gap-1 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-black text-[var(--text-secondary)] shadow-[1.5px_1.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[2.5px_2.5px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            title="Next slide"
          >
            <span class="text-[11px] font-bold hidden sm:inline">Next</span>
            <span>▶</span>
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div class="relative overflow-hidden rounded-lg border-2 border-[var(--border-color)] bg-[#152435] shadow-[4px_4px_0px_#0e1a26]">
          <canvas
            id="share-card-canvas"
            width="1600"
            height="900"
            class="w-full h-auto block select-none"
          ></canvas>
        </div>

        {/* Single Mode Controls */}
        <div id="controls-single" class="flex flex-wrap items-center justify-between gap-3 pt-1">
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

        {/* Carousel Mode Controls */}
        <div id="controls-carousel" class="hidden flex-col gap-3 pt-1">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              {/* Download Carousel PDF (Primary Action) */}
              <button
                id="download-carousel-pdf-btn"
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-[var(--accent-primary)] px-4 py-2 text-xs sm:text-sm font-black text-[var(--accent-text)] border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[4px_4px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0e1a26] cursor-pointer"
              >
                <span>📄</span>
                <span id="download-carousel-pdf-text">Download Carousel (PDF)</span>
              </button>

              {/* Download Current Slide PNG */}
              <button
                id="download-carousel-slide-btn"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3.5 py-2 text-xs sm:text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
                title="Download this slide as a PNG"
              >
                <span>💾</span>
                <span>Download Slide PNG</span>
              </button>
            </div>

            {/* Copy Link */}
            <button
              id="copy-carousel-url-btn"
              type="button"
              class="inline-flex items-center gap-1 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-[2px_2px_0px_#0e1a26] transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[var(--text-primary)] hover:shadow-[3px_3px_0px_#0e1a26] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#0e1a26] cursor-pointer"
            >
              <span>🔗</span>
              <span id="copy-carousel-url-text">Copy Link</span>
            </button>
          </div>

          {/* LinkedIn Usage Tip */}
          <div class="rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)] flex items-start gap-2">
            <span class="text-sm">💡</span>
            <span>
              <strong>LinkedIn tip:</strong> In the LinkedIn post composer, click the <span class="font-bold text-[var(--text-primary)]">"Add a document" (📄)</span> icon and upload this PDF. LinkedIn will automatically render it as a swipeable multi-page carousel!
            </span>
          </div>
        </div>
      </div>

      {/* High-Fidelity Canvas Card & PDF Generator */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var b3 = String.fromCharCode(96, 96, 96);
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

  var tabSingle = document.getElementById('tab-format-single');
  var tabCarousel = document.getElementById('tab-format-carousel');
  var carouselNavBar = document.getElementById('carousel-nav-bar');
  var controlsSingle = document.getElementById('controls-single');
  var controlsCarousel = document.getElementById('controls-carousel');

  var slidePrevBtn = document.getElementById('slide-prev-btn');
  var slideNextBtn = document.getElementById('slide-next-btn');
  var slideIndicator = document.getElementById('slide-indicator');

  var copyImgBtn = document.getElementById('copy-card-img-btn');
  var copyImgText = document.getElementById('copy-card-img-text');
  var downloadBtn = document.getElementById('download-card-img-btn');
  var copyUrlBtn = document.getElementById('copy-card-url-btn');
  var copyUrlText = document.getElementById('copy-card-url-text');

  var downloadPdfBtn = document.getElementById('download-carousel-pdf-btn');
  var downloadPdfText = document.getElementById('download-carousel-pdf-text');
  var downloadSlideBtn = document.getElementById('download-carousel-slide-btn');
  var copyCarouselUrlBtn = document.getElementById('copy-carousel-url-btn');
  var copyCarouselUrlText = document.getElementById('copy-carousel-url-text');

  var canvas = document.getElementById('share-card-canvas');

  if (!modal || !canvas) return;

  var currentMode = 'single';
  var currentSlide = 1;

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'single') {
      tabSingle.className = 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--accent-text)] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all cursor-pointer';
      tabCarousel.className = 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer';
      carouselNavBar.classList.add('hidden');
      carouselNavBar.classList.remove('flex');
      controlsSingle.classList.remove('hidden');
      controlsSingle.classList.add('flex');
      controlsCarousel.classList.add('hidden');
      controlsCarousel.classList.remove('flex');
      canvas.width = 1600;
      canvas.height = 900;
      renderSingleCard(canvas);
    } else {
      tabCarousel.className = 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--accent-text)] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all cursor-pointer';
      tabSingle.className = 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#0e1a26] transition-all hover:text-[var(--text-primary)] cursor-pointer';
      carouselNavBar.classList.remove('hidden');
      carouselNavBar.classList.add('flex');
      controlsSingle.classList.add('hidden');
      controlsSingle.classList.remove('flex');
      controlsCarousel.classList.remove('hidden');
      controlsCarousel.classList.add('flex');
      canvas.width = 1080;
      canvas.height = 1080;
      updateSlideUI();
      renderCarouselSlide(canvas, currentSlide);
    }
  }

  function updateSlideUI() {
    if (slideIndicator) {
      slideIndicator.textContent = currentSlide + ' / 3';
    }
  }

  function setSlide(slideNum) {
    currentSlide = slideNum;
    updateSlideUI();
    renderCarouselSlide(canvas, currentSlide);
  }

  if (tabSingle) tabSingle.addEventListener('click', function() { setMode('single'); });
  if (tabCarousel) tabCarousel.addEventListener('click', function() { setMode('carousel'); });


  if (slidePrevBtn) {
    slidePrevBtn.addEventListener('click', function() {
      var next = currentSlide === 1 ? 3 : currentSlide - 1;
      setSlide(next);
    });
  }

  if (slideNextBtn) {
    slideNextBtn.addEventListener('click', function() {
      var next = currentSlide === 3 ? 1 : currentSlide + 1;
      setSlide(next);
    });
  }

  // --- RENDER SINGLE CARD (1600x900) ---
  function renderSingleCard(targetCanvas) {
    var ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    var scale = targetCanvas.width ? targetCanvas.width / 1600 : 1;
    ctx.save();
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = true;

    var W = 1600;
    var H = 900;

    // 1. Solid Marge Cobalt Canvas Background
    ctx.fillStyle = '#152435';
    ctx.fillRect(0, 0, W, H);

    // 2. Card Container
    var padX = 40;
    var padY = 36;
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
    var headerY = cardY + 44;

    // Keycap Logo Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 40 + 4, headerY - 20 + 4, 140, 48, 8);
    ctx.fill();

    // Keycap Logo Button (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 40, headerY - 20, 140, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 24px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('(╯°□°)╯', cardX + 40 + 70, headerY + 4);

    // Brand Title & Subtitle
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 200, headerY + 5);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 200, headerY + 29);

    // Model Pill Badge (Top Right)
    ctx.font = '900 20px ui-monospace, Menlo, monospace';
    var modelBadge = cardData.model;
    var badgeW = ctx.measureText(modelBadge).width + 40;
    var badgeX = cardX + cardW - 40 - badgeW;

    // Badge Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, badgeX + 4, headerY - 18 + 4, badgeW, 46, 8);
    ctx.fill();

    // Badge Body (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, badgeX, headerY - 18, badgeW, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(modelBadge, badgeX + badgeW / 2, headerY + 5);

    // Header Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, headerY + 44);
    ctx.lineTo(cardX + cardW - 40, headerY + 44);
    ctx.stroke();

    // 4. Content Area Layout
    var curY = headerY + 64;
    var innerW = cardW - 80;
    var contentX = cardX + 40;

    // SECTION 1: "WHAT I ASKED FOR"
    var promptSectionH = 165;
    ctx.fillStyle = '#1b2f44';
    roundRect(ctx, contentX, curY, innerW, promptSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Blue Accent Bar
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(contentX, curY, 8, promptSectionH);

    // Section Header Tag
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#97bede';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT I ASKED FOR', contentX + 28, curY + 32);

    // Prompt Text (Large & Legible)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var promptLines = wrapText(ctx, cardData.prompt, innerW - 60, 2);
    for (var i = 0; i < promptLines.length; i++) {
      ctx.fillText(promptLines[i], contentX + 28, curY + 74 + i * 42);
    }

    curY += promptSectionH + 16;

    // SECTION 2: "WHAT IT DID INSTEAD" (Terminal Danger Box)
    var failSectionH = 280;
    ctx.fillStyle = '#13202e';
    roundRect(ctx, contentX, curY, innerW, failSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Danger Red Bar
    ctx.fillStyle = '#f87171';
    ctx.fillRect(contentX, curY, 8, failSectionH);

    // Section Header Tag
    ctx.fillStyle = '#f87171';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT IT DID INSTEAD', contentX + 28, curY + 32);

    // Terminal Dots
    drawTerminalDots(ctx, contentX + innerW - 70, curY + 24);

    // Terminal Fail Content
    ctx.fillStyle = '#f1f5f9';
    var cleanFail = cardData.fail.split('\\n').filter(function(l) { return l.indexOf(b3) === -1; }).join(' ');
    var isCodeBlock = cardData.fail.indexOf(b3) !== -1;

    if (isCodeBlock) {
      ctx.font = '600 26px ui-monospace, Menlo, Consolas, monospace';
      var failLines = wrapText(ctx, cleanFail, innerW - 60, 5);
      for (var j = 0; j < failLines.length; j++) {
        ctx.fillText(failLines[j], contentX + 28, curY + 74 + j * 36);
      }
    } else {
      ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var failLines = wrapText(ctx, cleanFail, innerW - 60, 4);
      for (var j = 0; j < failLines.length; j++) {
        ctx.fillText(failLines[j], contentX + 28, curY + 76 + j * 42);
      }
    }

    curY += failSectionH + 16;

    // SECTION 3: "HOW IT MADE ME FEEL" (Bart Yellow Banner)
    var feelSectionH = 135;
    ctx.fillStyle = '#1e334a';
    roundRect(ctx, contentX, curY, innerW, feelSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Amber Bar
    ctx.fillStyle = '#fed41d';
    ctx.fillRect(contentX, curY, 8, feelSectionH);

    // Header Label
    ctx.fillStyle = '#fed41d';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('HOW IT MADE ME FEEL  ' + cardData.mood, contentX + 28, curY + 32);

    // Feeling Text
    ctx.fillStyle = '#fed41d';
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var feelLines = wrapText(ctx, cardData.feeling, innerW - 60, 2);
    for (var k = 0; k < feelLines.length; k++) {
      ctx.fillText(feelLines[k], contentX + 28, curY + 74 + k * 42);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 26;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, footY - 24);
    ctx.lineTo(cardX + cardW - 40, footY - 24);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anonymous AI Prompt Fails • aifails.wtf', cardX + 40, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 22px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('https://aifails.wtf', cardX + cardW - 40, footY);
    ctx.restore();
  }

  // --- RENDER CAROUSEL SLIDES (1080x1080 Base) ---
  function renderCarouselSlide(targetCanvas, slideNum) {
    var ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    var scale = targetCanvas.width ? targetCanvas.width / 1080 : 1;
    ctx.save();
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = true;

    var S = 1080;
    // 1. Canvas Background
    ctx.fillStyle = '#152435';
    ctx.fillRect(0, 0, S, S);

    // 2. Card Container
    var pad = 44;
    var cardW = S - pad * 2;
    var cardH = S - pad * 2;
    var cardX = pad;
    var cardY = pad;

    // Drop Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 10, cardY + 10, cardW, cardH, 24);
    ctx.fill();

    // Card Surface
    ctx.fillStyle = '#2a4766';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    // Outer Border
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 3. Top Header Bar
    var headerY = cardY + 46;

    // Keycap Logo
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 36 + 4, headerY - 18 + 4, 120, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 36, headerY - 18, 120, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 20px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('(╯°□°)╯', cardX + 36 + 60, headerY + 4);

    // Brand Title
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 172, headerY + 6);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 172, headerY + 28);

    // Slide Badge (Top Right)
    var slideBadgeText = 'Slide ' + slideNum + ' / 3';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    var slideBadgeW = ctx.measureText(slideBadgeText).width + 32;
    var slideBadgeX = cardX + cardW - 36 - slideBadgeW;

    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, slideBadgeX + 3, headerY - 18 + 3, slideBadgeW, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, slideBadgeX, headerY - 18, slideBadgeW, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slideBadgeText, slideBadgeX + slideBadgeW / 2, headerY + 4);

    // Header Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, headerY + 42);
    ctx.lineTo(cardX + cardW - 36, headerY + 42);
    ctx.stroke();

    // 4. Slide Content
    var contentX = cardX + 36;
    var contentY = headerY + 64;
    var contentW = cardW - 72;
    var contentH = 680;

    if (slideNum === 1) {
      // --- SLIDE 1: PROMPT ---
      ctx.fillStyle = '#1b2f44';
      roundRect(ctx, contentX, contentY, contentW, contentH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Blue Accent
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(contentX, contentY, 10, contentH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#97bede';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('WHAT I ASKED FOR', contentX + 36, contentY + 44);

      // Prompt Body
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var pLines = wrapText(ctx, cardData.prompt, contentW - 72, 9);
      for (var l = 0; l < pLines.length; l++) {
        ctx.fillText(pLines[l], contentX + 36, contentY + 104 + l * 54);
      }

      // Swipe Cue
      var swipeY = contentY + contentH - 40;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#60a5fa';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Swipe to see what happened ➔', contentX + contentW - 36, swipeY);
    } else if (slideNum === 2) {
      // --- SLIDE 2: THE FAILURE ---
      ctx.fillStyle = '#13202e';
      roundRect(ctx, contentX, contentY, contentW, contentH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Red Danger Accent
      ctx.fillStyle = '#f87171';
      ctx.fillRect(contentX, contentY, 10, contentH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f87171';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('WHAT IT DID INSTEAD', contentX + 36, contentY + 44);

      // Terminal Dots
      drawTerminalDots(ctx, contentX + contentW - 80, contentY + 34);

      // Failure Body
      var cleanF = cardData.fail.split('\\n').filter(function(l) { return l.indexOf(b3) === -1; }).join(' ');
      var isCode = cardData.fail.indexOf(b3) !== -1;
      ctx.fillStyle = '#f1f5f9';

      if (isCode) {
        ctx.font = '600 30px ui-monospace, Menlo, Consolas, monospace';
        var fLines = wrapText(ctx, cleanF, contentW - 72, 10);
        for (var m = 0; m < fLines.length; m++) {
          ctx.fillText(fLines[m], contentX + 36, contentY + 104 + m * 44);
        }
      } else {
        ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        var fLines = wrapText(ctx, cleanF, contentW - 72, 9);
        for (var m = 0; m < fLines.length; m++) {
          ctx.fillText(fLines[m], contentX + 36, contentY + 106 + m * 50);
        }
      }

      // Swipe Cue
      var swipeY = contentY + contentH - 40;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#f87171';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Swipe for the reaction ➔', contentX + contentW - 36, swipeY);

    } else if (slideNum === 3) {
      // --- SLIDE 3: REACTION & CTA ---
      var upperH = 400;
      ctx.fillStyle = '#1e334a';
      roundRect(ctx, contentX, contentY, contentW, upperH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Amber Accent
      ctx.fillStyle = '#fed41d';
      ctx.fillRect(contentX, contentY, 10, upperH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#fed41d';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('HOW IT MADE ME FEEL  ' + cardData.mood, contentX + 36, contentY + 44);

      // Feeling Quote
      ctx.fillStyle = '#fed41d';
      ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var feelL = wrapText(ctx, cardData.feeling, contentW - 72, 4);
      for (var n = 0; n < feelL.length; n++) {
        ctx.fillText(feelL[n], contentX + 36, contentY + 104 + n * 52);
      }

      // Model Attribution
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#97bede';
      ctx.fillText('Model: ' + cardData.model, contentX + 36, contentY + upperH - 32);

      // Lower CTA Box
      var ctaY = contentY + upperH + 20;
      var ctaH = contentH - upperH - 20;
      ctx.fillStyle = '#152435';
      roundRect(ctx, contentX, ctaY, contentW, ctaH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Have an AI fail of your own?', contentX + contentW / 2, ctaY + 64);

      ctx.fillStyle = '#97bede';
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Confess anonymously or vote solidarity:', contentX + contentW / 2, ctaY + 110);

      // URL Highlight Box
      ctx.fillStyle = '#fed41d';
      ctx.font = '900 32px ui-monospace, Menlo, monospace';
      ctx.fillText('https://aifails.wtf', contentX + contentW / 2, ctaY + 172);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 28;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, footY - 24);
    ctx.lineTo(cardX + cardW - 36, footY - 24);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anonymous AI Prompt Fails • aifails.wtf', cardX + 36, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Confession #' + cardData.id.slice(0, 8), cardX + cardW - 36, footY);
    ctx.restore();
  }

  function drawTerminalDots(ctx, x, y) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 20, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 40, y, 7, 0, Math.PI * 2);
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
    var words = text.split(' ');
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

  // --- CLIENT-SIDE HIGH-DPI PDF BUILDER (2X RETINA EMBED) ---
  function buildCarouselPdf(jpegImages) {
    var encoder = new TextEncoder();
    var chunks = [];
    var offsets = [];
    var currentOffset = 0;

    function writeStr(str) {
      var b = encoder.encode(str);
      chunks.push(b);
      currentOffset += b.length;
    }

    function writeBytes(bytes) {
      chunks.push(bytes);
      currentOffset += bytes.length;
    }

    writeStr("%PDF-1.4\\n");
    writeBytes(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));

    var numPages = jpegImages.length;
    var numObjects = 2 + numPages * 3;

    // Object 1: Catalog
    offsets[1] = currentOffset;
    writeStr("1 0 obj\\n<< /Type /Catalog /Pages 2 0 R >>\\nendobj\\n");

    // Object 2: Pages
    var pageRefs = [];
    for (var p = 0; p < numPages; p++) {
      pageRefs.push((3 + p * 3) + " 0 R");
    }
    offsets[2] = currentOffset;
    writeStr("2 0 obj\\n<< /Type /Pages /Kids [" + pageRefs.join(" ") + "] /Count " + numPages + " >>\\nendobj\\n");

    // Standard square presentation points (1080x1080 points)
    var pageWidth = 1080;
    var pageHeight = 1080;

    for (var i = 0; i < numPages; i++) {
      var img = jpegImages[i];
      var pageObjId = 3 + i * 3;
      var contentsObjId = 4 + i * 3;
      var imageObjId = 5 + i * 3;
      var imgName = "Im" + (i + 1);

      // Page Object (1080x1080 MediaBox)
      offsets[pageObjId] = currentOffset;
      writeStr(pageObjId + " 0 obj\\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageWidth + " " + pageHeight + "] /Resources << /XObject << /" + imgName + " " + imageObjId + " 0 R >> >> /Contents " + contentsObjId + " 0 R >>\\nendobj\\n");

      // Content Stream maps image to page
      var streamContent = "q\\n" + pageWidth + " 0 0 " + pageHeight + " 0 0 cm\\n/" + imgName + " Do\\nQ\\n";
      var streamBytes = encoder.encode(streamContent);
      offsets[contentsObjId] = currentOffset;
      writeStr(contentsObjId + " 0 obj\\n<< /Length " + streamBytes.length + " >>\\nstream\\n");
      writeBytes(streamBytes);
      writeStr("\\nendstream\\nendobj\\n");

      // Image XObject with full supersampled pixel dimensions (2160x2160)
      offsets[imageObjId] = currentOffset;
      writeStr(imageObjId + " 0 obj\\n<< /Type /XObject /Subtype /Image /Width " + img.width + " /Height " + img.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + img.bytes.length + " >>\\nstream\\n");
      writeBytes(img.bytes);
      writeStr("\\nendstream\\nendobj\\n");
    }

    // Cross-Reference Table
    var startXref = currentOffset;
    writeStr("xref\\n0 " + (numObjects + 1) + "\\n");
    writeStr("0000000000 65535 f \\n");
    for (var obj = 1; obj <= numObjects; obj++) {
      var offStr = String(offsets[obj]).padStart(10, "0");
      writeStr(offStr + " 00000 n \\n");
    }

    // Trailer
    writeStr("trailer\\n<< /Size " + (numObjects + 1) + " /Root 1 0 R >>\\nstartxref\\n" + startXref + "\\n%%EOF\\n");

    var totalLen = 0;
    for (var k = 0; k < chunks.length; k++) totalLen += chunks[k].length;
    var result = new Uint8Array(totalLen);
    var pos = 0;
    for (var m = 0; m < chunks.length; m++) {
      result.set(chunks[m], pos);
      pos += chunks[m].length;
    }
    return result;
  }

  function getSlideJpegBytes(slideNum) {
    var offCanvas = document.createElement('canvas');
    // 2x Retina supersampling (2160x2160) for razor-sharp vector-grade text in PDF viewers
    offCanvas.width = 2160;
    offCanvas.height = 2160;
    renderCarouselSlide(offCanvas, slideNum);
    return new Promise(function(resolve, reject) {
      offCanvas.toBlob(function(blob) {
        if (!blob) return reject(new Error('Canvas blob generation failed'));
        var reader = new FileReader();
        reader.onload = function() {
          resolve({
            bytes: new Uint8Array(reader.result),
            width: 2160,
            height: 2160
          });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      }, 'image/jpeg', 0.98);
    });
  }

  // Open Modal
  if (openBtn) {
    openBtn.addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setMode(currentMode);
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

  // Copy Image Button (Single mode - 2x HiDPI 3200x1800)
  if (copyImgBtn && copyImgText) {
    copyImgBtn.addEventListener('click', function() {
      try {
        var hiCanvas = document.createElement('canvas');
        hiCanvas.width = 3200;
        hiCanvas.height = 1800;
        renderSingleCard(hiCanvas);
        hiCanvas.toBlob(function(blob) {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(function() {
              copyImgText.textContent = '✓ Copied Hi-Res Image!';
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

  // Download Single Card PNG (2x HiDPI 3200x1800)
  function downloadCardImage() {
    var hiCanvas = document.createElement('canvas');
    hiCanvas.width = 3200;
    hiCanvas.height = 1800;
    renderSingleCard(hiCanvas);
    var a = document.createElement('a');
    a.download = 'aifails-' + cardData.id + '.png';
    a.href = hiCanvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (downloadBtn) downloadBtn.addEventListener('click', downloadCardImage);

  // Download Carousel Slide PNG (2x HiDPI 2160x2160)
  if (downloadSlideBtn) {
    downloadSlideBtn.addEventListener('click', function() {
      var hiCanvas = document.createElement('canvas');
      hiCanvas.width = 2160;
      hiCanvas.height = 2160;
      renderCarouselSlide(hiCanvas, currentSlide);
      var a = document.createElement('a');
      a.download = 'aifails-' + cardData.id + '-slide-' + currentSlide + '.png';
      a.href = hiCanvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  // Download LinkedIn Carousel PDF
  if (downloadPdfBtn && downloadPdfText) {
    downloadPdfBtn.addEventListener('click', function() {
      downloadPdfText.textContent = '⏳ Building PDF...';
      downloadPdfBtn.disabled = true;

      Promise.all([
        getSlideJpegBytes(1),
        getSlideJpegBytes(2),
        getSlideJpegBytes(3)
      ]).then(function(images) {
        var pdfBytes = buildCarouselPdf(images);
        var blob = new Blob([pdfBytes], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download = 'aifails-' + cardData.id + '-linkedin-carousel.pdf';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);

        downloadPdfText.textContent = '✓ Carousel PDF Downloaded!';
        downloadPdfBtn.classList.remove('bg-[var(--accent-primary)]');
        downloadPdfBtn.classList.add('bg-emerald-500', 'text-white');
        setTimeout(function() {
          downloadPdfText.textContent = 'Download Carousel (PDF)';
          downloadPdfBtn.classList.remove('bg-emerald-500', 'text-white');
          downloadPdfBtn.classList.add('bg-[var(--accent-primary)]');
          downloadPdfBtn.disabled = false;
        }, 3000);
      }).catch(function(err) {
        console.error('PDF generation error:', err);
        downloadPdfText.textContent = '❌ Failed to build PDF';
        setTimeout(function() {
          downloadPdfText.textContent = 'Download Carousel (PDF)';
          downloadPdfBtn.disabled = false;
        }, 3000);
      });
    });
  }

  // Copy Link Buttons
  function handleCopyLink(btn, textSpan) {
    navigator.clipboard.writeText(cardData.url).then(function() {
      textSpan.textContent = '✓ Link Copied!';
      setTimeout(function() {
        textSpan.textContent = 'Copy Link';
      }, 2000);
    });
  }

  if (copyUrlBtn && copyUrlText) {
    copyUrlBtn.addEventListener('click', function() { handleCopyLink(copyUrlBtn, copyUrlText); });
  }

  if (copyCarouselUrlBtn && copyCarouselUrlText) {
    copyCarouselUrlBtn.addEventListener('click', function() { handleCopyLink(copyCarouselUrlBtn, copyCarouselUrlText); });
  }
})();
          `,
        }}
      />
    </div>
  );
}
