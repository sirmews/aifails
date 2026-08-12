-- Migration 0002: Add confession_solidarity table for duplicate vote prevention and confession_reports for moderation

CREATE TABLE IF NOT EXISTS confession_solidarity (
  confession_id TEXT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (confession_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_solidarity_session ON confession_solidarity(session_id);

CREATE TABLE IF NOT EXISTS confession_reports (
  id TEXT PRIMARY KEY,
  confession_id TEXT NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_confession ON confession_reports(confession_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON confession_reports(status);
