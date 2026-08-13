-- Migration 0003: Add is_hidden column for soft delete moderation
ALTER TABLE confessions ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_confessions_is_hidden ON confessions(is_hidden);
