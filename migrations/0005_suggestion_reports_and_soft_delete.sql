-- Migration 0005: Add suggestion_reports table and is_hidden flag to confession_suggestions for moderation

ALTER TABLE confession_suggestions ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_suggestions_is_hidden ON confession_suggestions(is_hidden);

CREATE TABLE IF NOT EXISTS suggestion_reports (
  id TEXT PRIMARY KEY,
  suggestion_id TEXT NOT NULL REFERENCES confession_suggestions(id) ON DELETE CASCADE,
  confession_id TEXT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_suggestion_id ON suggestion_reports(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_reports_suggestion_status ON suggestion_reports(status);
