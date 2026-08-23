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

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
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
