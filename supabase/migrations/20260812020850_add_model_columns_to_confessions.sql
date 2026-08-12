/*
# Add model provider and model name columns to confessions

1. Modified Tables
- `confessions`
  - Add `model_provider` (text, nullable) — e.g. "OpenAI", "Anthropic"
  - Add `model_name` (text, nullable) — e.g. "GPT-4o", "Claude 3.5 Sonnet"

2. Security
- No RLS changes — existing policies remain in place.

3. Notes
- The confessions table already exists. We add two nullable columns so existing rows are unaffected.
*/

ALTER TABLE confessions
  ADD COLUMN IF NOT EXISTS model_provider text,
  ADD COLUMN IF NOT EXISTS model_name text;
