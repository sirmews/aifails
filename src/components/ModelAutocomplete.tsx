import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
};

type ModelAutocompleteProps = {
  value: { provider: string; name: string } | null;
  onChange: (model: { provider: string; name: string } | null) => void;
};

export default function ModelAutocomplete({ value, onChange }: ModelAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/models`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setModels(data.models ?? []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? models.filter((m) => {
        const q = query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
        );
      })
    : models;

  const displayValue = value ? `${value.provider} / ${value.name}` : '';

  function selectModel(model: ModelOption) {
    onChange({ provider: model.provider, name: model.name });
    setQuery('');
    setOpen(false);
    setHighlightIndex(-1);
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        selectModel(filtered[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5">
          <span className="text-sm text-stone-900">{displayValue}</span>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-2 rounded p-0.5 text-stone-400 transition-colors hover:text-stone-700"
            aria-label="Clear model selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? 'Loading models...' : 'Search AI models...'}
            disabled={loading}
            className="w-full rounded-lg border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 disabled:opacity-50"
          />
        </div>
      )}

      {open && !value && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow-lg"
        >
          {error && (
            <div className="px-3 py-2 text-sm text-red-600">Couldn't load models: {error}</div>
          )}
          {!error && !loading && filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-stone-400">No models found</div>
          )}
          {filtered.map((model, i) => (
            <button
              key={model.id}
              type="button"
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => selectModel(model)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                i === highlightIndex ? 'bg-stone-100' : 'hover:bg-stone-50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-stone-900">{model.name}</div>
                <div className="truncate text-xs text-stone-500">{model.provider}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
