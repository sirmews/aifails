-- Migration 0006: Add composite indexes for high-performance zero-scan reads
CREATE INDEX IF NOT EXISTS idx_confessions_visible_created ON confessions(is_hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_mood_created ON confessions(is_hidden, mood, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_confession_visible_created ON confession_suggestions(confession_id, is_hidden, created_at ASC);
