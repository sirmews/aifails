import type { Confession } from '../core/types';
import { getShareModalScript } from './share/modal-script';

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

  const scriptContent = getShareModalScript({
    model: modelDisplay,
    prompt: promptText,
    fail: failText,
    feeling: feelingText,
    mood: moodEmoji,
    url: url,
    id: confession.id,
  });

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
          __html: scriptContent,
        }}
      />
    </div>
  );
}
