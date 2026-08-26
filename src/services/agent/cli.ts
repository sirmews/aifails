export function generateCliScript(baseUrl: string = 'https://aifails.wtf'): string {
  return `#!/bin/sh
# aifails CLI — Helper script for AI agents and developers
# https://aifails.wtf
set -efu

BASE_URL="\${AIFAILS_BASE_URL:-${baseUrl}}"

usage() {
  EXIT_CODE="\${1:-1}"
  cat <<EOF
aifails CLI — Query and submit LLM failures to aifails.wtf

Usage:
  aifails <command> [options]

Commands:
  random [--json]
      Fetch a random prompt failure.

  list [--limit <n>] [--mood <mood>] [--query <term>]
      List recent prompt failures.

  get <id> [--json]
      Get a single confession by ID.

  submit --json <file|- >
  submit --prompt <p> --fail <f> --feeling <feel> [--mood <m>] [--provider <prov>] [--model <mod>]
      Submit a new prompt failure.

  suggest <id> --json <file|- >
  suggest <id> --body <text> [--type prompt|model]
      Submit a community fix / "Ackchyually..." suggestion.

  solidarity <id>
      Vote solidarity on a prompt failure.

  models
      List available AI models in the catalog.

  help
      Show this help message.

Environment Variables:
  AIFAILS_BASE_URL    Override default base URL (default: ${baseUrl})
EOF
  exit "\${EXIT_CODE}"
}

# Helper to escape JSON strings in pure POSIX sh
json_escape() {
  printf '%s' "$1" | awk '
    BEGIN { ORS="" }
    {
      gsub(/\\\\/, "\\\\\\\\")
      gsub(/"/, "\\\\\\"")
      gsub(/\\r/, "\\\\r")
      gsub(/\\t/, "\\\\t")
      gsub(/\\f/, "\\\\f")
      gsub(/\\b/, "\\\\b")
      if (NR > 1) { printf "\\\\n" }
      printf "%s", $0
    }
  '
}

COMMAND="\${1:-}"
[ -z "\${COMMAND}" ] && usage 1

case "\${COMMAND}" in
  random)
    shift
    FORMAT="md"
    while [ "$#" -gt 0 ]; do
      case "$1" in
        --json) FORMAT="json"; shift ;;
        *) shift ;;
      esac
    done

    if [ "$FORMAT" = "json" ]; then
      curl -sS "\${BASE_URL}/api/random"
    else
      curl -sS -H "Accept: text/markdown" "\${BASE_URL}/api/random"
    fi
    printf "\\n"
    ;;

  list)
    shift
    LIMIT="20"
    MOOD=""
    QUERY=""

    while [ "$#" -gt 0 ]; do
      case "$1" in
        --limit) LIMIT="$2"; shift 2 ;;
        --mood) MOOD="$2"; shift 2 ;;
        --query|-q) QUERY="$2"; shift 2 ;;
        *) shift ;;
      esac
    done

    PARAMS="limit=\${LIMIT}"
    [ -n "$MOOD" ] && PARAMS="\${PARAMS}&mood=\${MOOD}"
    [ -n "$QUERY" ] && PARAMS="\${PARAMS}&q=\${QUERY}"

    curl -sS "\${BASE_URL}/api/confessions?\${PARAMS}"
    printf "\\n"
    ;;

  get)
    shift
    [ "$#" -eq 0 ] && { echo "Error: Missing confession ID" >&2; usage 1; }
    ID="$1"
    shift
    FORMAT="md"
    while [ "$#" -gt 0 ]; do
      case "$1" in
        --json) FORMAT="json"; shift ;;
        *) shift ;;
      esac
    done

    if [ "$FORMAT" = "json" ]; then
      curl -sS -H "Accept: application/json" "\${BASE_URL}/confessions/\${ID}"
    else
      curl -sS -H "Accept: text/markdown" "\${BASE_URL}/confessions/\${ID}"
    fi
    printf "\\n"
    ;;

  submit)
    shift
    JSON_SOURCE=""
    PROMPT=""
    FAIL=""
    FEELING=""
    MOOD="furious"
    PROVIDER=""
    MODEL=""

    while [ "$#" -gt 0 ]; do
      case "$1" in
        --json) JSON_SOURCE="$2"; shift 2 ;;
        --prompt) PROMPT="$2"; shift 2 ;;
        --fail) FAIL="$2"; shift 2 ;;
        --feeling) FEELING="$2"; shift 2 ;;
        --mood) MOOD="$2"; shift 2 ;;
        --provider) PROVIDER="$2"; shift 2 ;;
        --model) MODEL="$2"; shift 2 ;;
        *) shift ;;
      esac
    done

    if [ -n "$JSON_SOURCE" ]; then
      if [ "$JSON_SOURCE" = "-" ]; then
        curl -sS -X POST "\${BASE_URL}/api/confessions" \\
          -H "Content-Type: application/json" \\
          -d @-
      else
        [ ! -f "$JSON_SOURCE" ] && { echo "Error: JSON file '$JSON_SOURCE' not found" >&2; exit 1; }
        curl -sS -X POST "\${BASE_URL}/api/confessions" \\
          -H "Content-Type: application/json" \\
          -d @"$JSON_SOURCE"
      fi
    else
      if [ -z "$PROMPT" ] || [ -z "$FAIL" ] || [ -z "$FEELING" ]; then
        echo "Error: --prompt, --fail, and --feeling are all required (or pass --json <file|->)." >&2
        usage 1
      fi

      ESC_PROMPT=$(json_escape "$PROMPT")
      ESC_FAIL=$(json_escape "$FAIL")
      ESC_FEELING=$(json_escape "$FEELING")
      ESC_MOOD=$(json_escape "$MOOD")
      ESC_PROVIDER=$(json_escape "$PROVIDER")
      ESC_MODEL=$(json_escape "$MODEL")

      PAYLOAD=$(cat <<EOF
{
  "prompt_used": "\${ESC_PROMPT}",
  "what_it_did_instead": "\${ESC_FAIL}",
  "how_it_made_them_feel": "\${ESC_FEELING}",
  "mood": "\${ESC_MOOD}",
  "model_provider": "\${ESC_PROVIDER}",
  "model_name": "\${ESC_MODEL}"
}
EOF
)

      curl -sS -X POST "\${BASE_URL}/api/confessions" \\
        -H "Content-Type: application/json" \\
        -d "$PAYLOAD"
    fi
    printf "\\n"
    ;;

  suggest)
    shift
    [ "$#" -eq 0 ] && { echo "Error: Missing confession ID" >&2; usage 1; }
    ID="$1"
    shift
    JSON_SOURCE=""
    BODY=""
    TYPE="prompt"

    while [ "$#" -gt 0 ]; do
      case "$1" in
        --json) JSON_SOURCE="$2"; shift 2 ;;
        --body) BODY="$2"; shift 2 ;;
        --type) TYPE="$2"; shift 2 ;;
        *) shift ;;
      esac
    done

    if [ -n "$JSON_SOURCE" ]; then
      if [ "$JSON_SOURCE" = "-" ]; then
        curl -sS -X POST "\${BASE_URL}/confessions/\${ID}/suggestions" \\
          -H "Content-Type: application/json" \\
          -d @-
      else
        [ ! -f "$JSON_SOURCE" ] && { echo "Error: JSON file '$JSON_SOURCE' not found" >&2; exit 1; }
        curl -sS -X POST "\${BASE_URL}/confessions/\${ID}/suggestions" \\
          -H "Content-Type: application/json" \\
          -d @"$JSON_SOURCE"
      fi
    else
      if [ -z "$BODY" ]; then
        echo "Error: --body is required (or pass --json <file|->)." >&2
        usage 1
      fi

      ESC_BODY=$(json_escape "$BODY")
      ESC_TYPE=$(json_escape "$TYPE")

      PAYLOAD=$(cat <<EOF
{
  "suggestion_type": "\${ESC_TYPE}",
  "body": "\${ESC_BODY}"
}
EOF
)

      curl -sS -X POST "\${BASE_URL}/confessions/\${ID}/suggestions" \\
        -H "Content-Type: application/json" \\
        -d "$PAYLOAD"
    fi
    printf "\\n"
    ;;

  solidarity)
    shift
    [ "$#" -eq 0 ] && { echo "Error: Missing confession ID" >&2; usage 1; }
    ID="$1"

    curl -sS -X POST "\${BASE_URL}/confessions/\${ID}/solidarity" \\
      -H "Accept: application/json"
    printf "\\n"
    ;;

  models)
    curl -sS "\${BASE_URL}/api/models"
    printf "\\n"
    ;;

  help|--help|-h)
    usage 0
    ;;

  *)
    echo "Error: Unknown command '$1'" >&2
    usage 1
    ;;
esac
`;
}
