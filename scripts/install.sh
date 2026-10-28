#!/usr/bin/env bash
set -e

PROJECT_PATH="${1:-.}"
TARGET_DIR="${PROJECT_PATH}/.agents/skills/git-commit-suggest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")/skills/git-commit-suggest"

echo "Installing git-commit-suggest..."

mkdir -p "$TARGET_DIR"

cp "$SOURCE_DIR/SKILL.md" "$TARGET_DIR/"
cp "$SOURCE_DIR/config.example.json" "$TARGET_DIR/"
[ -f "$TARGET_DIR/config.json" ] || cp "$SOURCE_DIR/config.example.json" "$TARGET_DIR/config.json"
[ -d "$SOURCE_DIR/references" ] && cp -r "$SOURCE_DIR/references" "$TARGET_DIR/"

echo "Done! Installed to: $TARGET_DIR"
echo "Edit config.json to change the language."
echo "Usage: @git-commit-suggest or 'sugira um commit para essas alterações'"
