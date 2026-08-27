const MOODS = [
  { value: 'furious', label: 'Furious', emoji: '😡' },
  { value: 'defeated', label: 'Defeated', emoji: '😩' },
  { value: 'bewildered', label: 'Bewildered', emoji: '🤯' },
  { value: 'baffled', label: 'Baffled', emoji: '🤔' },
  { value: 'embarrassed', label: 'Embarrassed', emoji: '😳' },
  { value: 'amused', label: 'Darkly Amused', emoji: '😏' },
  { value: 'numb', label: 'Numb', emoji: '😐' },
  { value: 'vengeful', label: 'Vengeful', emoji: '🔥' },
];

/**
 * Normalizes timestamp strings (including SQLite 'YYYY-MM-DD HH:MM:SS')
 * into an ISO 8601 UTC date-time string with explicit 'Z' timezone.
 */
export function toIso8601(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  let normalized = dateStr.trim();
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T') + 'Z';
  } else if (!normalized.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(normalized)) {
    normalized = normalized + 'Z';
  }
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(toIso8601(iso)).getTime()) / 1000);
  if (isNaN(seconds) || seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function moodEmoji(mood: string): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? '😐';
}

export function moodLabel(mood: string): string {
  return MOODS.find((m) => m.value === mood)?.label ?? 'Unknown';
}
