import type { Confession, NewConfession, ConfessionSuggestion, NewSuggestion } from '../core/types';

export async function getConfessions(db: D1Database): Promise<Confession[]> {
  const { results } = await db
    .prepare(
      `SELECT id, prompt_used, what_it_did_instead, how_it_made_them_feel, mood, solidarity_count, model_provider, model_name, created_at 
       FROM confessions 
       ORDER BY created_at DESC`
    )
    .all<Confession>();

  return results ?? [];
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

export async function incrementSolidarity(db: D1Database, id: string): Promise<number> {
  await db
    .prepare(`UPDATE confessions SET solidarity_count = solidarity_count + 1 WHERE id = ?`)
    .bind(id)
    .run();

  const updated = await db
    .prepare(`SELECT solidarity_count FROM confessions WHERE id = ?`)
    .bind(id)
    .first<{ solidarity_count: number }>();

  return updated?.solidarity_count ?? 0;
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
