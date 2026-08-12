-- Migrations for Cloudflare D1 Database

CREATE TABLE IF NOT EXISTS confessions (
  id TEXT PRIMARY KEY,
  prompt_used TEXT NOT NULL,
  what_it_did_instead TEXT NOT NULL,
  how_it_made_them_feel TEXT NOT NULL,
  mood TEXT NOT NULL,
  solidarity_count INTEGER NOT NULL DEFAULT 0,
  model_provider TEXT,
  model_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);

CREATE TABLE IF NOT EXISTS confession_suggestions (
  id TEXT PRIMARY KEY,
  confession_id TEXT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('prompt', 'model')),
  body TEXT NOT NULL,
  author_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_suggestions_confession_id ON confession_suggestions(confession_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_identifier TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
