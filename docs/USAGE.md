# Usage Guide

## How it works

1. Checks for **staged** changes first with `git diff --cached`
2. If none, checks **unstaged** changes with `git diff`
3. Reads `config.json` from the skill directory, falling back to `config.example.json`
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

If neither config file exists, the language of the user's request is used. The skill never runs `git add`, `git commit`, or `git push`.
