export type MockConfession = {
  id: string;
  prompt_used: string;
  what_it_did_instead: string;
  how_it_made_them_feel: string;
  mood: string;
  model_provider: string | null;
  model_name: string | null;
  solidarity_count: number;
  is_hidden: number;
  created_at: string;
};

export type MockSuggestion = {
  id: string;
  confession_id: string;
  suggestion_type: 'prompt' | 'model';
  body: string;
  author_name: string | null;
  created_at: string;
};

// Hermetic in-memory D1 Database mock
export function createMockD1() {
  const confessions: MockConfession[] = [];
  const suggestions: MockSuggestion[] = [];
  const solidarityVotes = new Set<string>();

  return {
    confessions,
    suggestions,
    prepare(sql: string) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      return {
        bind(...params: unknown[]) {
          return {
            async first<T = Record<string, unknown>>(): Promise<T | null> {
              if (normalizedSql.includes('COUNT(*)')) {
                return { count: confessions.length } as unknown as T;
              }
              if (normalizedSql.includes('SELECT id FROM confessions')) {
                return (confessions.length > 0 ? { id: confessions[0].id } : null) as unknown as T;
              }
              if (normalizedSql.includes('FROM confessions') && normalizedSql.includes('WHERE id = ?')) {
                const id = params[0] as string;
                const found = confessions.find((c) => c.id === id);
                return (found || null) as unknown as T;
              }
              return null;
            },
            async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
              if (normalizedSql.includes('FROM confessions')) {
                return { results: confessions as unknown as T[] };
              }
              if (normalizedSql.includes('FROM confession_suggestions')) {
                return { results: suggestions as unknown as T[] };
              }
              return { results: [] };
            },
            async run(): Promise<{ success: boolean; meta: { changes: number } }> {
              if (normalizedSql.includes('INSERT INTO confessions')) {
                const [id, prompt, fail, feel, mood, provider, model] = params as string[];
                confessions.unshift({
                  id,
                  prompt_used: prompt,
                  what_it_did_instead: fail,
                  how_it_made_them_feel: feel,
                  mood,
                  model_provider: provider || null,
                  model_name: model || null,
                  solidarity_count: 0,
                  is_hidden: 0,
                  created_at: new Date().toISOString(),
                });
                return { success: true, meta: { changes: 1 } };
              }
              if (normalizedSql.includes('INSERT INTO confession_suggestions')) {
                const [id, confessionId, type, body, author] = params as string[];
                suggestions.push({
                  id,
                  confession_id: confessionId,
                  suggestion_type: type as 'prompt' | 'model',
                  body,
                  author_name: author || null,
                  created_at: new Date().toISOString(),
                });
                return { success: true, meta: { changes: 1 } };
              }
              if (normalizedSql.includes('INSERT OR IGNORE INTO confession_solidarity')) {
                const [confId, sessId] = params as string[];
                const key = `${confId}:${sessId}`;
                if (solidarityVotes.has(key)) {
                  return { success: true, meta: { changes: 0 } };
                }
                solidarityVotes.add(key);
                const conf = confessions.find((c) => c.id === confId);
                if (conf) conf.solidarity_count += 1;
                return { success: true, meta: { changes: 1 } };
              }
              return { success: true, meta: { changes: 1 } };
            },
          };
        },
      };
    },
    async batch(statements: Array<{ run: () => Promise<any> }>) {
      const results: unknown[] = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

// Hermetic mock KV with pre-seeded models
export function createMockKV() {
  const store = new Map<string, string>();
  store.set(
    'openrouter_models_v1',
    JSON.stringify([
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
    ])
  );

  return {
    async get(key: string, type?: string): Promise<any> {
      const val = store.get(key);
      if (!val) return null;
      if (type === 'json') return JSON.parse(val);
      return val;
    },
    async put(key: string, value: string): Promise<void> {
      store.set(key, value);
    },
  };
}
