CODE="function getUserById(id: string): Promise<User> { return fetch('/api/users/' + id).then(r => r.json()) }"
>results.md
for MODEL in $(ollama list | awk 'NR>1 {print $1}'); do
  echo -e "\n## $MODEL\n" >>results.md
  echo "$CODE" | ollama run "$MODEL" "Generate a 10-word description of what this function does:" | sed 's/^/SUMMARY: /' >>results.md
  echo "$CODE" | ollama run "$MODEL" "Generate a brief docstring description for this function" | sed 's/^/DOCSTRING: /' >>results.md
done
