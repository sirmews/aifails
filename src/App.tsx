import { useCallback, useEffect, useState } from 'react';
import { Flame, Heart, Send, Quote, MessageSquareWarning, Cpu, Loader2, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ModelAutocomplete from '@/components/ModelAutocomplete';
import SuggestionForm from '@/components/SuggestionForm';

type Confession = {
  id: string;
  prompt_used: string;
  what_it_did_instead: string;
  how_it_made_them_feel: string;
  mood: string;
  solidarity_count: number;
  model_provider: string | null;
  model_name: string | null;
  created_at: string;
};

const MOODS = [
  { value: 'furious', label: 'Furious', emoji: '😡' },
  { value: 'defeated', label: 'Defeated', emoji: '😩' },
  { value: 'bewildered', label: 'Bewildered', emoji: '🤯' },
  { value: 'amused', label: 'Darkly Amused', emoji: '😏' },
  { value: 'numb', label: 'Numb', emoji: '😐' },
  { value: 'vengeful', label: 'Vengeful', emoji: '🔥' },
] as const;

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function moodEmoji(mood: string): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? '😐';
}

function moodLabel(mood: string): string {
  return MOODS.find((m) => m.value === mood)?.label ?? 'Unknown';
}

function App() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [feeling, setFeeling] = useState('');
  const [mood, setMood] = useState<string>('furious');
  const [showForm, setShowForm] = useState(false);
  const [solidaritySet, setSolidaritySet] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<{ provider: string; name: string } | null>(null);
  const [suggestionFor, setSuggestionFor] = useState<string | null>(null);
  const [suggestionNotice, setSuggestionNotice] = useState<string | null>(null);

  const fetchConfessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('confessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setConfessions(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfessions();
  }, [fetchConfessions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !whatHappened.trim() || !feeling.trim()) return;

    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from('confessions')
      .insert({
        prompt_used: prompt.trim(),
        what_it_did_instead: whatHappened.trim(),
        how_it_made_them_feel: feeling.trim(),
        mood,
        model_provider: model?.provider ?? null,
        model_name: model?.name ?? null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setConfessions((prev) => [data, ...prev]);
    }
    setPrompt('');
    setWhatHappened('');
    setFeeling('');
    setMood('furious');
    setModel(null);
    setShowForm(false);
  }

  async function showSolidarity(id: string) {
    if (solidaritySet.has(id)) return;
    setSolidaritySet((prev) => new Set(prev).add(id));

    setConfessions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, solidarity_count: c.solidarity_count + 1 } : c))
    );

    const target = confessions.find((c) => c.id === id);
    if (!target) return;

    await supabase
      .from('confessions')
      .update({ solidarity_count: target.solidarity_count + 1 })
      .eq('id', id);
  }

  const totalSolidarity = confessions.reduce((sum, c) => sum + c.solidarity_count, 0);

  function handleSuggestionSubmitted(id: string) {
    setSuggestionFor(null);
    setSuggestionNotice(id);
    window.setTimeout(() => setSuggestionNotice((current) => (current === id ? null : current)), 3500);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-white">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight text-stone-900">
                Prompt Confessional
              </h1>
              <p className="text-xs text-stone-500">a safe space for AI frustration</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 active:scale-95"
          >
            {showForm ? 'Close' : 'Confess'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            You are not alone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600">
            Working with large language models is one of the most maddening experiences
            in modern technology. They don't listen. They do too much. They do too little.
            They ignore you when you change direction. This is a place to vent — share what
            you asked for, what it did instead, and how it made you feel.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <MessageSquareWarning className="h-4 w-4" />
              {confessions.length} confessions
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {totalSolidarity} in solidarity
            </span>
          </div>
        </div>
      </section>

      {/* Submit Form */}
      {showForm && (
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                What did you ask for?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write a simple function that returns the current date. Just the date. Nothing else."
                rows={3}
                className="w-full resize-none rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                What did it do instead?
              </label>
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="It wrote a 200-line class with timezone conversion, a full DateUtils library, and a 3-paragraph explanation of ISO 8601."
                rows={3}
                className="w-full resize-none rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                How did it make you feel?
              </label>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="I asked for ONE LINE. One. I got a dissertation."
                rows={2}
                className="w-full resize-none rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800">
                Your mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                      mood === m.value
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    <span className="mr-1">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-800">
                <Cpu className="h-4 w-4 text-stone-500" />
                Which model betrayed you? (optional)
              </label>
              <ModelAutocomplete value={model} onChange={setModel} />
              <p className="mt-1.5 text-xs text-stone-400">
                Search from a live list of AI models via OpenRouter
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !prompt.trim() || !whatHappened.trim() || !feeling.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Confession
                </>
              )}
            </button>
          </form>
        </section>
      )}

      {/* Error banner */}
      {error && !showForm && (
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Feed */}
      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16">
        {loading && (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!loading &&
          confessions.map((c) => {
            const hasReacted = solidaritySet.has(c.id);
            return (
              <article
                key={c.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Mood badge + model */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                      <span>{moodEmoji(c.mood)}</span>
                      {moodLabel(c.mood)}
                    </span>
                    {c.model_name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                        <Cpu className="h-3 w-3" />
                        {c.model_provider ? `${c.model_provider} / ` : ''}
                        {c.model_name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">{timeAgo(c.created_at)}</span>
                </div>

                {/* Prompt */}
                <div className="mb-3 border-l-2 border-stone-300 pl-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    What I asked for
                  </p>
                  <p className="text-sm leading-relaxed text-stone-800">{c.prompt_used}</p>
                </div>

                {/* What happened */}
                <div className="mb-3 border-l-2 border-red-300 pl-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    What it did instead
                  </p>
                  <p className="text-sm leading-relaxed text-stone-800">{c.what_it_did_instead}</p>
                </div>

                {/* Feeling */}
                <div className="mb-4 flex gap-2 rounded-lg bg-stone-50 p-3">
                  <Quote className="h-4 w-4 shrink-0 text-stone-400" />
                  <p className="text-sm italic leading-relaxed text-stone-700">{c.how_it_made_them_feel}</p>
                </div>

                {/* Reactions and suggestions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => showSolidarity(c.id)}
                    disabled={hasReacted}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
                      hasReacted
                        ? 'cursor-default bg-rose-50 text-rose-600'
                        : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${hasReacted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    {hasReacted ? 'In solidarity' : 'Show solidarity'}
                    <span className="ml-1 font-semibold">{c.solidarity_count}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSuggestionFor((current) => (current === c.id ? null : c.id));
                      setSuggestionNotice(null);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-amber-50 hover:text-amber-700 active:scale-95"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Ackchyually...
                  </button>
                </div>
                {suggestionFor === c.id && (
                  <SuggestionForm
                    confessionId={c.id}
                    onClose={() => setSuggestionFor(null)}
                    onSubmitted={() => handleSuggestionSubmitted(c.id)}
                  />
                )}
                {suggestionNotice === c.id && (
                  <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    Suggestion received. The correction department has been notified.
                  </p>
                )}
              </article>
            );
          })}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 text-center">
        <p className="text-sm text-stone-400">
          Prompt Confessional — because talking to machines shouldn't feel this lonely.
        </p>
      </footer>
    </div>
  );
}

export default App;
