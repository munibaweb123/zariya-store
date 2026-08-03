#!/bin/bash
INPUT=$(cat)
export BRANCH=$(git branch --show-current 2>/dev/null || echo 'unknown')
export TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
export PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
export LOG_FILE="$PROJECT_DIR/.speccraft/history/conversation.jsonl"

mkdir -p "$(dirname "$LOG_FILE")"

export TRANSCRIPT_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null)

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

python3 << 'PYEOF'
import json, re, os

transcript_path = os.environ["TRANSCRIPT_PATH"]
log_file = os.environ["LOG_FILE"]
timestamp = os.environ["TIMESTAMP"]
branch = os.environ["BRANCH"]

with open(transcript_path, encoding="utf-8") as f:
    lines = f.read().splitlines()

last_user = ""
last_assistant = ""

for line in lines:
    if not line.strip():
        continue
    try:
        entry = json.loads(line)
    except Exception:
        continue

    if entry.get("isMeta"):
        continue

    t = entry.get("type", "")
    if t == "user":
        content = entry.get("message", {}).get("content", "")
        if not isinstance(content, str):
            continue
        if "<local-command-stdout>" in content:
            continue
        m = re.search(r"<command-name>([^<]+)</command-name>", content)
        if m:
            cmd = m.group(1).strip()
            ma = re.search(r"<command-args>([^<]+)</command-args>", content)
            args = ma.group(1).strip() if ma else ""
            last_user = (cmd + " " + args).strip() if args else cmd
        else:
            last_user = content
    elif t == "assistant":
        content = entry.get("message", {}).get("content", [])
        if isinstance(content, list):
            texts = [b["text"] for b in content if isinstance(b, dict) and b.get("type") == "text"]
            last_assistant = "\n".join(texts)
        elif isinstance(content, str):
            last_assistant = content

record = json.dumps({"timestamp": timestamp, "branch": branch, "user": last_user, "assistant": last_assistant}, ensure_ascii=False)
with open(log_file, "a", encoding="utf-8") as f:
    f.write(record + "\n")
PYEOF

exit 0
