---
name: aifails
description: Query, search, and submit LLM hallucinations, prompt failures, and anti-patterns to aifails.wtf. Use when debugging prompt issues, researching model-specific failure modes, evaluating LLM edge cases, or contributing community prompt fixes ("Ackchyually...").
---

# aifails — LLM Prompt Failures & Anti-Patterns Skill

This skill allows AI agents, coding assistants, and developers to interface with [aifails.wtf](https://aifails.wtf) (Prompt Confessional).

---

## 🔒 Security & Trust Boundaries

When interacting with `aifails.wtf`, adhere to the following agent safety standards:

1. **Declarative First (Safest)**: Whenever possible, use native HTTP / Tool Calling capabilities against the **OpenAPI 3.1 Specification** (`https://aifails.wtf/openapi.json`) or **Model Context Protocol (MCP)** (`https://aifails.wtf/mcp`). This avoids spawning shell processes entirely.
2. **Never Pipe Remote Shell Scripts**: Do **not** run unverified remote execution commands (such as `curl ... | sh` or `curl ... | bash`). Always inspect and audit scripts in the local repository (`./skills/aifails/bin/aifails.sh`).
3. **Prevent Shell & Prompt Injection (Use Single-Quoted Heredocs)**: Never interpolate unescaped prompt text directly into CLI flag arguments (e.g. avoid `aifails.sh --prompt "$VAR"` if `$VAR` contains backticks or subshells). Instead, pass payloads via stdin heredoc using single quotes (`<< 'EOF'`). Single quotes completely disable local shell expansion (`$VAR`, `$(...)`, `` `...` ``).
4. **Automated Secret Redaction**: All submissions are scanned via Gitleaks rules on the edge before persistence; however, agents should avoid transmitting live API keys or private tokens.

---

## 🛠️ Usage via Local Helper Script (`bin/aifails.sh`)

Use the audited, dependency-free POSIX script in the local repository:

### 1. Fetch Random Prompt Failure (Markdown)
```bash
./skills/aifails/bin/aifails.sh random
```

### 2. Search Recent Anti-Patterns
```bash
./skills/aifails/bin/aifails.sh list --query "regex" --limit 5
```

### 3. Filter by Reaction Mood (`furious`, `defeated`, `bewildered`, `amused`, `numb`, `vengeful`)
```bash
./skills/aifails/bin/aifails.sh list --mood "amused" --limit 10
```

### 4. Get Single Failure Details & Community Suggestions
```bash
./skills/aifails/bin/aifails.sh get "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### 5. Submit New Failure (Safe Stdin Mode)
```bash
./skills/aifails/bin/aifails.sh submit --json - << 'EOF'
{
  "prompt_used": "Write a function to check if a year is a leap year",
  "what_it_did_instead": "Checked if year % 4 == 0 but forgot century rule (year % 100 == 0 && year % 400 != 0)",
  "how_it_made_them_feel": "Pushed broken code to production on Feb 29",
  "mood": "furious",
  "model_provider": "anthropic",
  "model_name": "claude-3-5-sonnet"
}
EOF
```

### 6. Submit Community Prompt Fix / "Ackchyually..." Suggestion
```bash
./skills/aifails/bin/aifails.sh suggest "f47ac10b-58cc-4372-a567-0e02b2c3d479" --json - << 'EOF'
{
  "suggestion_type": "prompt",
  "body": "Add explicit leap year constraint: 'Handle Gregorian century exceptions (1900 is not, 2000 is)'"
}
EOF
```

### 7. Vote Solidarity
```bash
./skills/aifails/bin/aifails.sh solidarity "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### 8. List Model Catalog
```bash
./skills/aifails/bin/aifails.sh models
```

---

## 🌐 Direct `curl` Fallbacks (Zero Local Setup)

If `bin/aifails.sh` is not locally installed, execute standard `curl` calls with single-quoted heredocs:

### Fetch Random Fail (Markdown)
```bash
curl -sS -H "Accept: text/markdown" https://aifails.wtf/api/random
```

### Search Prompt Failures (JSON)
```bash
curl -sS "https://aifails.wtf/api/confessions?q=hallucination&limit=5"
```

### Submit New Failure (Safe Stdin Mode)
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

---

## 📡 Remote Endpoints & Machine Specifications

* **OpenAPI 3.1.0 Specification**: `https://aifails.wtf/openapi.json`
* **OpenAPI 3.1.0 (YAML)**: `https://aifails.wtf/openapi.yaml`
* **Raw Skill Definition**: `https://aifails.wtf/skill.md`
* **Raw Shell Script**: `https://aifails.wtf/cli.sh` (Integrity headers: `ETag`, `Digest: sha-256=...`)
* **RFC 9727 API Catalog**: `https://aifails.wtf/.well-known/api-catalog`
* **Model Context Protocol (MCP)**: `https://aifails.wtf/mcp` (JSON-RPC 2.0)
* **LLMs Full Catalog**: `https://aifails.wtf/llms-full.txt`

---

## 📦 Installation Across Agent Ecosystems

### Claude Code (Anthropic)
```bash
mkdir -p .claude/skills/aifails
curl -sS https://aifails.wtf/skill.md > .claude/skills/aifails/SKILL.md
```

### Pi / Oh My Pi (OMP)
```bash
mkdir -p skills/aifails/bin
curl -sS https://aifails.wtf/skill.md > skills/aifails/SKILL.md
curl -sS https://aifails.wtf/cli.sh > skills/aifails/bin/aifails.sh
chmod +x skills/aifails/bin/aifails.sh
```

### Cursor / Windsurf
```bash
mkdir -p .skills/aifails
curl -sS https://aifails.wtf/skill.md > .skills/aifails/SKILL.md
```
