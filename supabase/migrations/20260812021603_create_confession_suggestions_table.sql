/*
# Create confession_suggestions table

1. New Tables
- `confession_suggestions`
  - `id` (uuid, primary key)
  - `confession_id` (uuid, foreign key to confessions.id, ON DELETE CASCADE)
  - `suggestion_type` (text, not null) — either "prompt" or "model"
  - `body` (text, not null) — the suggestion text
  - `author_name` (text, nullable) — optional name of the person making the suggestion
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `confession_suggestions`.
- Allow anon + authenticated CRUD because the app is intentionally public/shared (no sign-in).

3. Notes
- Each suggestion is linked to a confession via foreign key.
- `suggestion_type` distinguishes between a prompt fix and a model recommendation.
- When a confession is deleted, its suggestions are automatically removed (CASCADE).
*/

CREATE TABLE IF NOT EXISTS confession_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('prompt', 'model')),
  body text NOT NULL,
  author_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE confession_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_suggestions" ON confession_suggestions;
CREATE POLICY "anon_select_suggestions" ON confession_suggestions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_suggestions" ON confession_suggestions;
CREATE POLICY "anon_insert_suggestions" ON confession_suggestions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_suggestions" ON confession_suggestions;
CREATE POLICY "anon_update_suggestions" ON confession_suggestions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_suggestions" ON confession_suggestions;
CREATE POLICY "anon_delete_suggestions" ON confession_suggestions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_confession_suggestions_confession_id
  ON confession_suggestions(confession_id);
