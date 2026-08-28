-- Confession: The Hallucinated CLI Flag That Ran In Silent Mode
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
  'conf_fail_docker_silent_prune',
  'How do I delete all untagged Docker images older than 7 days?',
  'Confidently recommended:

```bash
docker image prune -a --filter "until=7d" --only-untagged
```

Docker CLI has never supported `--only-untagged`. The CLI parser ignored the unrecognized argument and proceeded with `docker image prune -a --filter "until=7d"`, silently deleting every single unreferenced image across my entire workstation including 45 GB of cached base images that took 3 hours to re-pull over hotel Wi-Fi.',
  'Cleaned up the untagged images, along with 4 years of cached layers and my will to live.',
  '😏',
  37,
  'mistral',
  'mistral-large-2411',
  datetime('now', '-3 hours'),
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
  'sug_fail_docker_silent_prune',
  'conf_fail_docker_silent_prune',
  'prompt',
  'Always demand verified CLI syntax or dry-run checks for destructive shell operations:

`Use official docker image prune filters: docker image prune --filter "dangling=true" --filter "until=168h"`

Never trust LLM-invented convenience flags without checking `docker image prune --help`.',
  datetime('now', '-2 hours'),
  0
);
