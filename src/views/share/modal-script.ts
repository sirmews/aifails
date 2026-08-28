import { CANVAS_RENDER_SCRIPT } from './canvas-render';
import { PDF_BUILDER_SCRIPT } from './pdf-builder';

export type ShareModalCardData = {
  model: string;
  prompt: string;
  fail: string;
  feeling: string;
  mood: string;
  url: string;
  id: string;
};

export function getShareModalScript(cardData: ShareModalCardData): string {
  return `
(function() {
  var b3 = String.fromCharCode(96, 96, 96);
  var cardData = ${JSON.stringify(cardData)};

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
      canvas.height = 1350;
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

  ${CANVAS_RENDER_SCRIPT}

  ${PDF_BUILDER_SCRIPT}

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

  // Download Carousel Slide PNG (2x HiDPI 2160x2700)
  if (downloadSlideBtn) {
    downloadSlideBtn.addEventListener('click', function() {
      var hiCanvas = document.createElement('canvas');
      hiCanvas.width = 2160;
      hiCanvas.height = 2700;
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
    copyUrlBtn.addEventListener('click', function() {
      handleCopyLink(copyUrlBtn, copyUrlText);
    });
  }

  if (copyCarouselUrlBtn && copyCarouselUrlText) {
    copyCarouselUrlBtn.addEventListener('click', function() {
      handleCopyLink(copyCarouselUrlBtn, copyCarouselUrlText);
    });
  }
})();
`;
}
