import type { Confession, NewConfession, ConfessionSuggestion, NewSuggestion } from '../core/types';

export type ConfessionFilterOptions = {
  query?: string;
  mood?: string;
  model?: string;
  cursor?: string;
  limit?: number;
};

export type ConfessionQueryResult = {
  confessions: Confession[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getConfessions(
  db: D1Database,
  options: ConfessionFilterOptions = {}
): Promise<ConfessionQueryResult> {
  const limit = Math.min(options.limit ?? 20, 50);
  const fetchLimit = limit + 1;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.query && options.query.trim()) {
    const searchTerm = `%${options.query.trim()}%`;
    conditions.push(
      `(prompt_used LIKE ? OR what_it_did_instead LIKE ? OR how_it_made_them_feel LIKE ?)`
    );
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (options.mood && options.mood.trim() && options.mood !== 'all') {
    conditions.push(`mood = ?`);
    params.push(options.mood.trim().toLowerCase());
  }

  if (options.model && options.model.trim() && options.model !== 'all') {
    const modelStr = options.model.trim();
    conditions.push(`(model_name LIKE ? OR model_provider LIKE ?)`);
    params.push(`%${modelStr}%`, `%${modelStr}%`);
  }

  if (options.cursor) {
    conditions.push(`created_at < ?`);
    params.push(options.cursor);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT id, prompt_used, what_it_did_instead, how_it_made_them_feel, mood, solidarity_count, model_provider, model_name, created_at 
    FROM confessions 
    ${whereClause} 
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  params.push(fetchLimit);

  const { results } = await db.prepare(sql).bind(...params).all<Confession>();
  const items = results ?? [];

  const hasMore = items.length > limit;
  const confessions = hasMore ? items.slice(0, limit) : items;
  const nextCursor = confessions.length > 0 ? confessions[confessions.length - 1].created_at : null;

  return {
    confessions,
    nextCursor: hasMore ? nextCursor : null,
    hasMore,
  };
}

export async function getConfessionById(db: D1Database, id: string): Promise<Confession | null> {
  const result = await db
    .prepare(
      `SELECT id, prompt_used, what_it_did_instead, how_it_made_them_feel, mood, solidarity_count, model_provider, model_name, created_at 
       FROM confessions 
       WHERE id = ?`
    )
    .bind(id)
    .first<Confession>();

  return result ?? null;
}

export async function createConfession(db: D1Database, input: NewConfession): Promise<Confession> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO confessions (id, prompt_used, what_it_did_instead, how_it_made_them_feel, mood, solidarity_count, model_provider, model_name, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .bind(
      id,
      input.prompt_used,
      input.what_it_did_instead,
      input.how_it_made_them_feel,
      input.mood,
      input.model_provider ?? null,
      input.model_name ?? null,
      createdAt
    )
    .run();

  return {
    id,
    prompt_used: input.prompt_used,
    what_it_did_instead: input.what_it_did_instead,
    how_it_made_them_feel: input.how_it_made_them_feel,
    mood: input.mood,
    solidarity_count: 0,
    model_provider: input.model_provider ?? null,
    model_name: input.model_name ?? null,
    created_at: createdAt,
  };
}

export async function incrementSolidarity(
  db: D1Database,
  id: string,
  sessionId?: string
): Promise<{ count: number; added: boolean; alreadyVoted?: boolean }> {
  if (sessionId) {
    // 1. Try atomic insert to enforce 1 vote per session
    const insertResult = await db
      .prepare(
        `INSERT OR IGNORE INTO confession_solidarity (confession_id, session_id, created_at) VALUES (?, ?, ?)`
      )
      .bind(id, sessionId, new Date().toISOString())
      .run();

    // If no rows were inserted, user already voted for this confession
    if (!insertResult.meta.changes) {
      const current = await db
        .prepare(`SELECT solidarity_count FROM confessions WHERE id = ?`)
        .bind(id)
        .first<{ solidarity_count: number }>();
      return { count: current?.solidarity_count ?? 0, added: false, alreadyVoted: true };
    }
  }

  // 2. Increment solidarity count
  await db
    .prepare(`UPDATE confessions SET solidarity_count = solidarity_count + 1 WHERE id = ?`)
    .bind(id)
    .run();

  const updated = await db
    .prepare(`SELECT solidarity_count FROM confessions WHERE id = ?`)
    .bind(id)
    .first<{ solidarity_count: number }>();

  return { count: updated?.solidarity_count ?? 0, added: true };
}

export async function createReport(
  db: D1Database,
  input: { confessionId: string; reason: string; sessionId: string }
): Promise<{ id: string; success: boolean }> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO confession_reports (id, confession_id, reason, session_id, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, input.confessionId, input.reason, input.sessionId, new Date().toISOString())
    .run();

  return { id, success: true };
}

export async function createSuggestion(
  db: D1Database,
  input: NewSuggestion
): Promise<ConfessionSuggestion> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO confession_suggestions (id, confession_id, suggestion_type, body, author_name, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.confession_id,
      input.suggestion_type,
      input.body,
      input.author_name ?? null,
      createdAt
    )
    .run();

  return {
    id,
    confession_id: input.confession_id,
    suggestion_type: input.suggestion_type,
    body: input.body,
    author_name: input.author_name ?? null,
    created_at: createdAt,
  };
}

export async function getSuggestionsForConfession(
  db: D1Database,
  confessionId: string
): Promise<ConfessionSuggestion[]> {
  const { results } = await db
    .prepare(
      `SELECT id, confession_id, suggestion_type, body, author_name, created_at 
       FROM confession_suggestions 
       WHERE confession_id = ? 
       ORDER BY created_at ASC`
    )
    .bind(confessionId)
    .all<ConfessionSuggestion>();

  return results ?? [];
}
