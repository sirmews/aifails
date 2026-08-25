import { describe, expect, it } from 'bun:test';
import { app } from '../src/api/router';
import { generateSiteOgImageSvg, generateOgImageSvg } from '../src/services/seo';
import { OG_DEFAULT_PNG_BYTES } from '../src/assets/og-default';
import type { Confession } from '../src/core/types';

const sampleConfession: Confession = {
  id: 'test-confession-123',
  prompt_used: 'Write a quick function to sort an array of objects by timestamp descending',
  what_it_did_instead: 'Reversed the array three times, dropped the first element, and claimed time is a flat circle.',
  how_it_made_them_feel: 'Questioned my life choices as a software engineer',
  mood: 'furious',
  model_provider: 'anthropic',
  model_name: 'claude-3-5-sonnet',
  solidarity_count: 42,
  created_at: '2026-08-20T12:00:00Z',
};

describe('SEO OG Image Generator', () => {
  it('generates site OG SVG with 1200x630 dimensions, 3-part layout, and no busy action buttons', () => {
    const svg = generateSiteOgImageSvg();
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain('Prompt Confessional');
    expect(svg).toContain('WHAT I ASKED FOR');
    expect(svg).toContain('WHAT IT DID INSTEAD');
    expect(svg).toContain('HOW IT MADE THEM FEEL');
    expect(svg).toContain('https://aifails.wtf');

    // Verify noisy buttons are removed
    expect(svg).not.toContain('in Solidarity');
    expect(svg).not.toContain('Confessions</text>');
    expect(svg).not.toContain('&quot;Ackchyually...&quot; Fixes');
  });

  it('generates individual confession OG SVG with large typography and streamlined footer', () => {
    const svg = generateOgImageSvg(sampleConfession);
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg).toContain('WHAT I ASKED FOR');
    expect(svg).toContain('WHAT IT DID INSTEAD');
    expect(svg).toContain('HOW IT MADE THEM FEEL');
    expect(svg).toContain('ANTHROPIC / CLAUDE-3-5-SONNET');
    expect(svg).toContain('font-size="28"'); // Prompt font size
    expect(svg).toContain('font-size="30"'); // Fail font size
    expect(svg).toContain('font-size="26"'); // Feeling font size
    expect(svg).toContain('https://aifails.wtf/confessions/test-confession-123');

    // Verify noisy solidarity button is removed from footer
    expect(svg).not.toContain('in solidarity');
    expect(svg).not.toContain('Submit &quot;Ackchyually...&quot; fixes');
  });

  it('validates pre-rendered OG PNG header signature and dimensions', () => {
    expect(OG_DEFAULT_PNG_BYTES).toBeInstanceOf(Uint8Array);
    expect(OG_DEFAULT_PNG_BYTES.length).toBeGreaterThan(1000);

    // PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
    expect(OG_DEFAULT_PNG_BYTES[0]).toBe(0x89);
    expect(OG_DEFAULT_PNG_BYTES[1]).toBe(0x50); // P
    expect(OG_DEFAULT_PNG_BYTES[2]).toBe(0x4e); // N
    expect(OG_DEFAULT_PNG_BYTES[3]).toBe(0x47); // G
    expect(OG_DEFAULT_PNG_BYTES[4]).toBe(0x0d);
    expect(OG_DEFAULT_PNG_BYTES[5]).toBe(0x0a);
    expect(OG_DEFAULT_PNG_BYTES[6]).toBe(0x1a);
    expect(OG_DEFAULT_PNG_BYTES[7]).toBe(0x0a);

    // IHDR dimensions at byte offset 16 (width) and 20 (height) in Big Endian
    const width = (OG_DEFAULT_PNG_BYTES[16] << 24) | (OG_DEFAULT_PNG_BYTES[17] << 16) | (OG_DEFAULT_PNG_BYTES[18] << 8) | OG_DEFAULT_PNG_BYTES[19];
    const height = (OG_DEFAULT_PNG_BYTES[20] << 24) | (OG_DEFAULT_PNG_BYTES[21] << 16) | (OG_DEFAULT_PNG_BYTES[22] << 8) | OG_DEFAULT_PNG_BYTES[23];

    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});

describe('OG Image HTTP Endpoints', () => {
  const mockEnv = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => sampleConfession,
          all: async () => ({ results: [sampleConfession] }),
        }),
      }),
    },
    CACHE_KV: {
      get: async () => null,
      put: async () => {},
    },
  };

  it('GET /og.png returns 200 image/png with valid PNG bytes', async () => {
    const res = await app.request('https://aifails.wtf/og.png', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('public');

    const buffer = await res.arrayBuffer();
    expect(buffer.byteLength).toBe(OG_DEFAULT_PNG_BYTES.length);
  });
  it('GET /og.svg returns 200 image/svg+xml with simplified layout', async () => {
    const res = await app.request('https://aifails.wtf/og.svg', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

    const text = await res.text();
    expect(text).toContain('Prompt Confessional');
    expect(text).not.toContain('in Solidarity');
  });

  it('GET /confessions/:id/og.png returns 200 image/png for social crawlers', async () => {
    const res = await app.request('https://aifails.wtf/confessions/test-confession-123/og.png', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
  });

  it('GET /confessions/:id/og.svg returns 200 image/svg+xml for single confession', async () => {
    const res = await app.request('https://aifails.wtf/confessions/test-confession-123/og.svg', {}, mockEnv as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

    const text = await res.text();
    expect(text).toContain('ANTHROPIC / CLAUDE-3-5-SONNET');
    expect(text).not.toContain('in solidarity');
  });
});
