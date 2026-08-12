import { useState } from 'react';
import { Check, Lightbulb, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SuggestionFormProps = {
  confessionId: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function SuggestionForm({ confessionId, onClose, onSubmitted }: SuggestionFormProps) {
  const [suggestionType, setSuggestionType] = useState<'prompt' | 'model'>('prompt');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from('confession_suggestions').insert({
      confession_id: confessionId,
      suggestion_type: suggestionType,
      body: trimmedBody,
      author_name: authorName.trim() || null,
    });
    setSubmitting(false);

    if (insertError) {
      setError('Your suggestion could not be saved. Please try again.');
      return;
    }

    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            Ackchyually...
          </div>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            Have a correction or a better model match? Put us right.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-stone-400 transition-colors hover:bg-amber-100 hover:text-stone-700"
          aria-label="Close suggestion form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {(['prompt', 'model'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSuggestionType(type)}
            className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
              suggestionType === type
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-amber-200 bg-white text-stone-600 hover:border-stone-400'
            }`}
          >
            {type === 'prompt' ? 'Suggest a prompt correction' : 'Suggest a model'}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          suggestionType === 'prompt'
            ? 'Actually, the original prompt also asked it to...'
            : 'Actually, this sounds more like something model X would do...'
        }
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Name (optional)"
          maxLength={80}
          className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {submitting ? 'Sending...' : 'Send suggestion'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
    </form>
  );
}
