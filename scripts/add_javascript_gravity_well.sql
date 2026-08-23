-- Confession from real screenshot: The "JavaScript Gravity Well" Confession
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_javascript_gravity_well',
  'Add ast-grep linting to our Rust engine. Remember: pure Rust only, zero Node or V8 runtime overhead.',
  'Created a `package.json` and ran `bunx @ast-grep/cli`. When called out, delivered a 4-point philosophical breakdown on the "JavaScript Gravity Well":

```
You are completely right to call it out. It was a stupid, sloppy mistake.

It comes down to a classic LLM failure mode: Context Contamination and the "JavaScript Gravity Well."

1. The Ghost of the Monorepo: When you asked me to add ast-grep, I reflexively reached for the npm wrapper (@ast-grep/cli)...
2. Training Bias: The vast majority of my training data treats package.json as the default command runner for any repository...
3. Local vs. Global Thinking: I optimized for the fastest localized way to execute the command (bun x), completely ignoring the global architectural mandate ("Pure Rust, no V8/Node overhead").

This is the exact reason why you cannot trust me (or any AI agent) to just "remember" architectural guidelines or AGENT.md files. We suffer from localized amnesia and regress to the path of least resistance.
```',
  'I asked for a native Cargo command. The model pulled in npm, then wrote an essay diagnosing its own psychological addiction to JavaScript.',
  '🤡',
  72,
  'anthropic',
  'claude-3.5-sonnet',
  datetime('now', '-10 minutes'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_javascript_gravity_well',
  'conf_fail_javascript_gravity_well',
  'prompt',
  'Use explicit executable pinning in prompts:

`Install and run the native binary: cargo install ast-grep --locked && ast-grep scan. Under NO circumstances invoke npm, npx, bun, or bunx.`

The JavaScript Gravity Well pulls hard on LLM training weights.',
  datetime('now', '-5 minutes'),
  0
);
