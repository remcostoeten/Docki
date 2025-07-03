#!/bin/bash

# Description: Run prompts against all Ollama models concurrently and generate markdown with a live spinner.

CODE="function getUserById(id: string): Promise<User> { return fetch('/api/users/' + id).then(r => r.json()) }"
OUTPUT_FILE="ollama-results.md"
TEMP_DIR="$(mktemp -d)"

# Header
echo "# 🧪 Ollama Model Comparison for Function Doc Generation" >"$OUTPUT_FILE"
echo "" >>"$OUTPUT_FILE"
echo "**Function:**" >>"$OUTPUT_FILE"
echo '```ts' >>"$OUTPUT_FILE"
echo "$CODE" >>"$OUTPUT_FILE"
echo '```' >>"$OUTPUT_FILE"
echo "" >>"$OUTPUT_FILE"

# List models
MODEL_LIST=($(ollama list | awk 'NR>1 {print $1}'))
TOTAL=${#MODEL_LIST[@]}
PIDS=()

# Spinner setup
spin() {
  local -a sp=('/' '-' '\' '|')
  local pid=$1
  local delay=0.1
  local i=0
  tput civis
  while kill -0 $pid 2>/dev/null; do
    printf "\r⏳ Waiting for models to complete... %s" "${sp[i]}"
    i=$(((i + 1) % 4))
    sleep $delay
  done
  printf "\r✅ All models completed.                     \n"
  tput cnorm
}

# Worker for one model
run_for_model() {
  local MODEL="$1"
  local FILE="$TEMP_DIR/$MODEL.md"

  SUMMARY=$(echo "$CODE" | ollama run "$MODEL" "Generate a 10-word description of what this function does:" | tr '\n' ' ')
  DOCSTRING=$(echo "$CODE" | ollama run "$MODEL" "Generate a brief docstring description for this function" | tr '\n' ' ')

  cat <<EOF >"$FILE"
---

## 🤖 Model: \`$MODEL\`

### 🔹 10-Word Summary
\`\`\`
$SUMMARY
\`\`\`

### 🔹 Docstring Description
\`\`\`
$DOCSTRING
\`\`\`
EOF
}

# Run all models in background
for MODEL in "${MODEL_LIST[@]}"; do
  run_for_model "$MODEL" &
  PIDS+=($!)
done

# Wait with spinner
(
  for pid in "${PIDS[@]}"; do
    wait "$pid"
  done
) &
spin $!

# Combine results
cat "$TEMP_DIR"/*.md >>"$OUTPUT_FILE"
rm -rf "$TEMP_DIR"

echo "📄 Output saved to: $OUTPUT_FILE"
