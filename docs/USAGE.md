# Usage Guide

## How it works

1. Requires a saved `config.json` with `setupCompleted: true` in the skill directory
2. Checks for **staged** changes with `git diff --cached`
3. If none, checks **unstaged** changes with `git diff`
4. Classifies the change using Conventional Commits (type stays English)
5. Writes subject + details in the configured language with the configured `bodySeparator`

## Tips

- **Stage what matters**: `git add` the files you want to commit to get a more focused suggestion.
- **Keep it atomic**: Works best with one logical change.
- **Let scope be smart**: It'll only add `(scope)` if it makes sense.
- **Edit freely**: The suggestion is meant to be pasted and tweaked if needed.

## Invocation

- `@git-commit-suggest`
- `sugira um commit para essas alterações`
- `suggest a commit message for these git changes`

On first use in a local environment with an accessible browser, the skill opens the configuration page and stops. In environments without browser access, such as Claude.ai web, it asks for the language in chat and saves the setting with `--set` as described in [SKILL.md](../skills/git-commit-suggest/SKILL.md). Setup must be saved before the skill inspects diffs or suggests a commit. Cancelling the page does not complete setup. The skill never runs `git add`, `git commit`, or `git push`.
