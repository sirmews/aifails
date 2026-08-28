import { describe, expect, it } from 'bun:test';
import { PDF_BUILDER_SCRIPT } from '../src/views/share/pdf-builder';
import { CANVAS_CAROUSEL_SCRIPT } from '../src/views/share/canvas-carousel';
import { getShareModalScript, type ShareModalCardData } from '../src/views/share/modal-script';

type MockJpegImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

describe('LinkedIn Carousel PDF & 4:5 Portrait Export', () => {
  describe('PDF Builder script logic', () => {
    it('generates valid %PDF-1.4 with 4:5 portrait MediaBox [0 0 1080 1350] and 2160x2700 XObject', () => {
      // Isolate buildCarouselPdf function directly from script string
      const evalScope = new Function(PDF_BUILDER_SCRIPT + '\nreturn buildCarouselPdf;');
      const buildPdf = evalScope() as (images: MockJpegImage[]) => Uint8Array;

      const mockJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const mockSlides: MockJpegImage[] = [
        { bytes: mockJpegBytes, width: 2160, height: 2700 },
        { bytes: mockJpegBytes, width: 2160, height: 2700 },
        { bytes: mockJpegBytes, width: 2160, height: 2700 },
      ];

      const pdfBytes = buildPdf(mockSlides);
      const pdfText = new TextDecoder('latin1').decode(pdfBytes);

      // Verify PDF Header
      expect(pdfText.startsWith('%PDF-1.4\n')).toBe(true);

      // Verify Page Count
      expect(pdfText).toContain('/Type /Pages /Kids [3 0 R 6 0 R 9 0 R] /Count 3');

      // Verify 4:5 Portrait MediaBox (1080 x 1350 points)
      expect(pdfText).toContain('/MediaBox [0 0 1080 1350]');

      // Verify Content Stream scaling to 1080 x 1350 points
      expect(pdfText).toContain('1080 0 0 1350 0 0 cm');

      // Verify 2x Retina XObject dimensions (2160 x 2700 pixels)
      expect(pdfText).toContain('/Type /XObject /Subtype /Image /Width 2160 /Height 2700');

      // Verify EOF trailer
      expect(pdfText).toContain('%%EOF');
    });
  });

  describe('Canvas Carousel 4:5 Portrait Rendering Constants', () => {
    it('uses 1080x1350 canvas bounds and expanded content heights', () => {
      expect(CANVAS_CAROUSEL_SCRIPT).toContain('var W = 1080;');
      expect(CANVAS_CAROUSEL_SCRIPT).toContain('var H = 1350;');
      expect(CANVAS_CAROUSEL_SCRIPT).toContain('var contentH = 960;');
      expect(CANVAS_CAROUSEL_SCRIPT).toContain('var upperH = 540;');
    });
  });

  describe('Modal Script Carousel Mode Dimensions', () => {
    it('sets 1080x1350 preview and 2160x2700 hi-res download dimensions', () => {
      const sampleCard: ShareModalCardData = {
        model: 'Anthropic / Claude 3.5 Sonnet',
        prompt: 'Refactor this module',
        fail: 'Deleted the database',
        feeling: 'Stunned',
        mood: '🤯',
        url: 'https://aifails.wtf/confessions/test-123',
        id: 'test-123',
      };

      const script = getShareModalScript(sampleCard);

      // Carousel preview dimensions
      expect(script).toContain('canvas.width = 1080;');
      expect(script).toContain('canvas.height = 1350;');

      // Single slide 2x HiDPI download dimensions
      expect(script).toContain('hiCanvas.width = 2160;');
      expect(script).toContain('hiCanvas.height = 2700;');
    });
  });
});
