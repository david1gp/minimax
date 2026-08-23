#!/usr/bin/env bash
set -euo pipefail

PACKAGE_JSON="package.json"

if [[ $# -gt 1 ]]; then
  echo "Error: Provide 0 or 1 argument (the next version)." >&2
  exit 1
fi

for command in bun gh jq; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Error: $command is not installed or not available in PATH." >&2
    exit 1
  fi
done

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo "Error: GitHub CLI is not authenticated for github.com." >&2
  echo "Run: gh auth login" >&2
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "Error: Working tree must be clean before releasing." >&2
  exit 1
fi

CURRENT_VERSION=$(jq -er '.version' "$PACKAGE_JSON")
if [[ $# -eq 1 ]]; then
  NEW_VERSION=$1
else
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
  NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
fi

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in MAJOR.MINOR.PATCH form." >&2
  exit 1
fi

echo "Running deterministic release checks..."
bun run build
bun test test/minimaxCliVersion.test.ts

echo "Updating $PACKAGE_JSON from v$CURRENT_VERSION to v$NEW_VERSION..."
jq --arg version "$NEW_VERSION" '.version = $version' "$PACKAGE_JSON" >"$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"

TAG="v$NEW_VERSION"
git add "$PACKAGE_JSON"
git commit -m "chore(release): $TAG"
git tag -a "$TAG" -m "Release $TAG"
git push origin main
git push origin --tags

gh release create "$TAG" --title "$TAG" --generate-notes
git branch -f released

echo "Release $TAG complete."
