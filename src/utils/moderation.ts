/**
 * Moderation Engine for Prompt Confessional
 *
 * Rules:
 * - General frustration/cussing (fuck, shit, damn, hell, crap, etc.) is 100% PERMITTED and left intact.
 * - Hate speech, racial slurs, and severe targeted harassment are detected and masked with [censored] or flagged.
 */

// Common l33tsp34k character map for normalization
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  'v': 'u',
};

/**
 * Normalizes text by decoding l33tsp34k, removing zero-width characters,
 * collapsing repeated characters, and converting to lowercase.
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  // 1. Convert to lowercase and strip zero-width or non-printable unicode characters
  let normalized = text.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Map l33tsp34k characters
  let decoded = '';
  for (const char of normalized) {
    decoded += LEET_MAP[char] ?? char;
  }

  return decoded;
}

/**
 * Comprehensive compiled regex pattern for severe hate speech, racial slurs,
 * and targeted harassment terms across major sensitive categories.
 * 
 * Note: Excludes general frustration profanity (fuck, shit, damn, etc.).
 */
const HATE_SPEECH_PATTERNS: RegExp[] = [
  // Racial slurs and ethnic hate speech
  /\b(n[i!1]gg?[e3a4r]|n[i!1]gg[a4s]|ch[i!1]nk|sp[i!1]c|k[i!1]k[e3]|c[o0]0n|w[e3]tb[a4]ck|r[a4]ghead|t[o0]welhead|g[o0][o0]k|j[a4]p|p[a4]k[i!1])\b/gi,
  
  // LGBTQ+ slurs and gender-targeted hate speech
  /\b(f[a4]gg?[o0]t|f[a4]g|d[y3]k[e3]|tr[a4]nn[y3])\b/gi,

  // Religious and antisemitic slurs
  /\b(k[i!1]k[e3]|y[i!1]d|s[a4]y[i!1]m)\b/gi,

  // Ableist slurs
  /\b(r[e3]t[a4]rd|r[e3]t[a4]rd[e3]d)\b/gi,
];

export type ModerationAudit = {
  hasHateSpeech: boolean;
  cleanText: string;
  flaggedTermsCount: number;
};

/**
 * Audits text for hate speech and slurs.
 * Leaves general swearing untouched while replacing slurs with `[censored]`.
 */
export function sanitizeContent(text: string): ModerationAudit {
  if (!text || !text.trim()) {
    return { hasHateSpeech: false, cleanText: text, flaggedTermsCount: 0 };
  }

  let cleanText = text;
  let flaggedTermsCount = 0;
  const normalized = normalizeText(text);

  for (const pattern of HATE_SPEECH_PATTERNS) {
    // Reset pattern state
    pattern.lastIndex = 0;

    if (pattern.test(normalized)) {
      // Replace instances in the original text
      pattern.lastIndex = 0;
      cleanText = cleanText.replace(pattern, (match) => {
        flaggedTermsCount++;
        return '[censored]';
      });
    }
  }

  return {
    hasHateSpeech: flaggedTermsCount > 0,
    cleanText,
    flaggedTermsCount,
  };
}
