/**
 * Moderation Engine for Prompt Confessional
 *
 * Rules:
 * - General frustration/cussing (fuck, shit, damn, hell, crap, etc.) is 100% PERMITTED and left intact.
 * - Racial slurs, hate speech, and severe targeted harassment are detected and masked with [censored].
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
 * and converting to lowercase.
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');

  let decoded = '';
  for (const char of normalized) {
    decoded += LEET_MAP[char] ?? char;
  }

  return decoded;
}

/**
 * Comprehensive regex patterns matching severe racial slurs, hate speech,
 * and harassment terms (evaluated against normalized text).
 * 
 * Note: Excludes general frustration profanity (fuck, shit, damn, etc.).
 */
const HATE_SPEECH_PATTERNS: RegExp[] = [
  // Racial slurs & ethnic hate speech
  /\b(nigg|nigga|nigger|niggah|nigg3r|nigg3rah|chink|spic|spick|kike|coon|wetback|raghead|towelhead|gook|jap|paki)\b/gi,

  // LGBTQ+ slurs
  /\b(fag|faggot|dyke|tranny)\b/gi,

  // Religious slurs
  /\b(kike|yid)\b/gi,

  // Ableist slurs
  /\b(retard|retarded)\b/gi,
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

  const words = text.split(/(\s+|[.,!?;:()"'])/);
  let flaggedTermsCount = 0;

  const sanitizedWords = words.map((word) => {
    if (!word.trim()) return word;

    const normalized = normalizeText(word);
    let isMatch = false;

    for (const pattern of HATE_SPEECH_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(normalized)) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      flaggedTermsCount++;
      return '[censored]';
    }

    return word;
  });

  return {
    hasHateSpeech: flaggedTermsCount > 0,
    cleanText: sanitizedWords.join(''),
    flaggedTermsCount,
  };
}
