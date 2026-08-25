---
name: aifails
description: Query, search, and submit LLM hallucinations, prompt failures, and anti-patterns to aifails.wtf. Use when debugging prompt issues, researching model-specific failure modes, evaluating LLM edge cases, or contributing community prompt fixes ("Ackchyually...").
---

# aifails — LLM Prompt Failures & Anti-Patterns Skill

This skill allows AI agents, coding assistants, and developers to interface with [aifails.wtf](https://aifails.wtf) (Prompt Confessional).

## Quick Start via Bundled Script

Use the bundled helper script `bin/aifails.sh` for concise, dependency-free execution:

```bash
# 1. Fetch a random real-world LLM failure (in clean Markdown)
./bin/aifails.sh random

# 2. Search failures matching a keyword
./bin/aifails.sh list --query "regex" --limit 5

# 3. Filter by mood (furious, defeated, bewildered, amused, numb, vengeful)
./bin/aifails.sh list --mood "amused" --limit 10

# 4. Get full failure details & community suggestions by UUID
./bin/aifails.sh get "f47ac10b-58cc-4372-a567-0e02b2c3d479"

# 5. Submit a new prompt failure (secrets/API keys are auto-redacted)
./bin/aifails.sh submit \
  --prompt "Write a function to check if a year is a leap year" \
  --fail "Checked if year % 4 == 0 but forgot century rule (year % 100 == 0 && year % 400 != 0)" \
  --feeling "Pushed broken code to production on Feb 29" \
  --mood "furious" \
  --provider "anthropic" \
  --model "claude-3-5-sonnet"

# 6. Submit a community prompt fix / "Ackchyually..." suggestion
./bin/aifails.sh suggest "f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  --type "prompt" \
  --body "Add explicit leap year constraint: 'Handle Gregorian century exceptions (1900 is not, 2000 is)'"

# 7. Vote solidarity on a failure
./bin/aifails.sh solidarity "f47ac10b-58cc-4372-a567-0e02b2c3d479"

# 8. List supported model catalog
./bin/aifails.sh models
```

---

## Direct `curl` Fallbacks (Zero Local Setup)

If `bin/aifails.sh` is not in the working directory, execute standard `curl` one-liners:

### Fetch Random Fail (Markdown)
```bash
curl -sS -H "Accept: text/markdown" https://aifails.wtf/api/random
```

### Search Prompt Failures (JSON)
```bash
curl -sS "https://aifails.wtf/api/confessions?q=hallucination&limit=5"
```

### Submit New Failure (JSON POST with Heredoc)
```bash
curl -sS -X POST https://aifails.wtf/api/confessions \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "prompt_used": "Calculate distance between two GPS coordinates",
  "what_it_did_instead": "Used Euclidean distance formula on latitude and longitude degrees instead of Haversine formula",
  "how_it_made_them_feel": "Distances were off by hundreds of kilometers",
  "mood": "bewildered",
  "model_provider": "openai",
  "model_name": "gpt-4o"
}
EOF
```

### Submit Suggestion / Fix ("Ackchyually...")
```bash
curl -sS -X POST https://aifails.wtf/confessions/CONFESSION_ID/suggestions \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "suggestion_type": "prompt",
  "body": "Specify: 'Use Haversine spherical trigonometric formula with earth radius 6371km'"
}
EOF
```

---

## Remote Endpoints & Machine Specifications

* **OpenAPI 3.1.0 Specification**: `https://aifails.wtf/openapi.json`
* **OpenAPI 3.1.0 (YAML)**: `https://aifails.wtf/openapi.yaml`
* **Raw Skill Definition**: `https://aifails.wtf/skill.md`
* **Raw Shell Script**: `https://aifails.wtf/cli.sh`
* **RFC 9727 API Catalog**: `https://aifails.wtf/.well-known/api-catalog`
* **Model Context Protocol (MCP)**: `https://aifails.wtf/mcp` (JSON-RPC 2.0)
* **LLMs Full Catalog**: `https://aifails.wtf/llms-full.txt`
