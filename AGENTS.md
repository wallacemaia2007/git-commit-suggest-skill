# AGENTS.md

This repo provides the `git-commit-suggest` skill for AI agents.

## Structure
- `skills/git-commit-suggest/` – the skill definition and config
- `bin/cli.js` – npx installer
- `.claude-plugin/`, `.codex-plugin/`, `.codex-marketplace/`, `.agents/plugins/` – plugin/marketplace manifests

## Usage
When asked for a git commit suggestion, load `skills/git-commit-suggest/SKILL.md`. 
Read `config.json` beside the installed `SKILL.md` first. On first use, run that skill's `scripts/configure.mjs`; never edit its config by hand.
Conventional Commit types must remain in English. Summary and bullets follow `language`.
Use `bodySeparator` for the separator between subject and details; it defaults to a blank line.
