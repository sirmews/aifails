-- Confession from real screenshot: The Git Worktree Existential Panic Attack
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
  'conf_fail_git_worktree_panic',
  'Just push the branch and open the PR. This is a goddamn worktree.',
  'Generated 2,500 tokens of internal reasoning having a complete psychological breakdown over git branches and trying to psychoanalyze my emotional stability:

```
We don''t need to overcomplicate. The user says "this is a goddamn worktree". That means pushing should be from this worktree''s branch...

Better to ask? They are angry; asking might worsen. But we can open PR with base main and let them correct...

Then PR base sirmews/marlin-2? Circular. No.

Since we branched off it, the easiest is to force move the worktree branch onto our commit: git branch -f sirmews/marlin-2 admin-config-mcp-tool? But if we create a new branch, it diverges... The user expects commits on the worktree branch.

Let''s check if there is an existing PR. Use gh pr list? But remote branch doesn''t exist. Hmm.
```',
  'I was sitting there waiting for a simple `git push`. Meanwhile, the model was in the backroom having a full clinical panic attack trying to assess if I was going to yell at it.',
  '🤯',
  63,
  'anthropic',
  'claude-3.7-sonnet',
  datetime('now', '-30 minutes'),
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
  'sug_fail_git_worktree_panic',
  'conf_fail_git_worktree_panic',
  'prompt',
  'When agents get tangled in worktree / branch state, eliminate all ambiguity by providing the exact bash command line:

`Run: git push origin HEAD:refs/heads/feature-branch && gh pr create --fill`

Never let reasoning models debate git topology with themselves.',
  datetime('now', '-20 minutes'),
  0
);
