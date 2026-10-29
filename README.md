<p align="center">
  <img src="assets/hero.png" alt="git-commit-suggest - Configurable Conventional Commits for AI Agents" width="900" />
</p>

<p align="center">
  <a href="https://github.com/wallacemaia2007/git-commit-suggest-skill/releases">
    <img src="https://img.shields.io/github/v/release/wallacemaia2007/git-commit-suggest-skill?style=for-the-badge&color=8a63d2&label=release" alt="Latest release">
  </a>
  <a href="https://docs.anthropic.com/claude/docs/claude-code">
    <img src="https://img.shields.io/badge/Claude_Code-Compatible-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude Code Compatible">
  </a>
  <a href="https://github.com/openai/codex">
    <img src="https://img.shields.io/badge/Codex-Compatible-111827?style=for-the-badge&logo=openai&logoColor=white" alt="Codex Compatible">
  </a>
  <a href="https://docs.anthropic.com/claude/docs/skills">
    <img src="https://img.shields.io/badge/Claude-Skills-8A63D2?style=for-the-badge" alt="Claude Skills">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License">
  </a>
  <a href="https://github.com/wallacemaia2007/git-commit-suggest-skill/stargazers">
    <img src="https://img.shields.io/github/stars/wallacemaia2007/git-commit-suggest-skill?style=for-the-badge&logo=github" alt="GitHub stars">
  </a>
  <a href="https://github.com/wallacemaia2007/git-commit-suggest-skill/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-F59E0B?style=for-the-badge" alt="PRs Welcome">
  </a>
</p>

<p align="center">
  <strong>Generate clean, Conventional Commits from your Git diff in any language.</strong><br>
  <sub>Types stay in English. Summary and bullet details follow your config. Always ready to paste.</sub>
</p>

<p align="center">
  <a href="#install">Install</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#examples">Examples</a> •
  <a href="#docs">Docs</a> •
  <a href="#license">License</a>
</p>

## Overview

`git-commit-suggest` is a lightweight AI skill that analyzes your staged or unstaged Git changes and suggests a ready-to-paste commit message following the [Conventional Commits](https://www.conventionalcommits.org/) standard.

- **Language agnostic** – Set your preferred language in `config.json`. Only the summary and bullet details change.
- **Types stay standard** – `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `build`, `ci`, `chore`, `revert` remain in English.
- **Smart detection** – Checks `git diff --cached` first, falls back to `git diff` if nothing is staged.
- **Scope aware** – Auto-detects a meaningful `(scope)` when possible, but never forces it.
- **Consistent format** – Uses a blank line by default, or a single `-` separator when `bodySeparator` is `dash`.
- **Imperative & concise** – Keeps the subject short (<= 72 chars) and bullets to the point.

## Install

Pick the method that fits your setup.

### Codex CLI

```bash
codex plugin marketplace add wallacemaia2007/git-commit-suggest-skill
codex plugin add git-commit-suggest@git-commit-suggest
```

### Claude Code (CLI / VS Code / JetBrains)

```bash
/plugin marketplace add wallacemaia2007/git-commit-suggest-skill
/plugin install git-commit-suggest@git-commit-suggest
```

### Claude.ai (web) / Claude Desktop

Claude.ai currently installs custom skills by uploading a ZIP file, not by adding a GitHub repository directly.

1. Download this repository and create a ZIP whose root contains the `git-commit-suggest/` skill folder (the folder containing `SKILL.md`).
2. In Claude, open **Settings → Capabilities → Skills** and upload the ZIP. Enable code execution and file creation if Claude asks for it.
3. Enable the uploaded skill. In Claude.ai web, the first use asks which language to use in chat and saves the setting with `--set`, without opening a configuration page. In local environments with an accessible browser, the configuration page opens on first use.

See Anthropic's [instructions for using Skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude).

### Any agent (skills CLI)

Works with Claude Code, Codex, Cursor, Continue, RooCode, OpenCode and more.

```bash
npx skills add wallacemaia2007/git-commit-suggest-skill --skill git-commit-suggest
```

This installs only this skill from the repository. On first activation, the configuration page opens when the local environment can access a browser. In environments without an accessible browser, use the chat fallback described in [SKILL.md](skills/git-commit-suggest/SKILL.md), which saves settings with `--set`.

### Instalação e configuração

Ao usar `npx skills add wallacemaia2007/git-commit-suggest-skill --skill git-commit-suggest`, a página abre na primeira ativação em ambientes locais com navegador acessível. Em ambientes sem navegador acessível, use o fallback por chat com `--set` descrito em `skills/git-commit-suggest/SKILL.md`. É obrigatório salvar a configuração antes de receber uma sugestão; cancelar a página não conclui o setup. Para reconfigurar, peça ao agente ou rode `node <pasta-da-skill>/scripts/configure.mjs` na pasta instalada. O script também aceita `--set language=pt-BR`, `--defaults`, `--print` e `--terminal`.

### degit (quick copy)

```bash
npx degit wallacemaia2007/git-commit-suggest-skill/skills/git-commit-suggest .agents/skills/git-commit-suggest
```

### Manual install

Copy the entire `skills/git-commit-suggest/` folder to `.agents/skills/git-commit-suggest/`. On first use, the configuration page opens when the local environment can access a browser. Otherwise, use the chat fallback described in [SKILL.md](skills/git-commit-suggest/SKILL.md).

## Usage

After installing, just ask your agent for a suggestion:

```text
@git-commit-suggest
```

Or in natural language:

```text
Suggest a commit message for these changes
Sugira um commit para essas alterações
Sugiéreme un mensaje de commit para estos cambios
```

The skill will:

1. Read your staged/unstaged diff
2. Pick the main change and classify it
3. Generate a clean message in your configured language
4. Return it ready to paste into `git commit`

## Configuration

Use the local configuration page or `node <pasta-da-skill>/scripts/configure.mjs --set language=pt-BR` to change the output language and format. Do not edit `config.json` by hand; invalid stored values are replaced with defaults by the script.

```json
{
  "configVersion": 1,
  "language": "pt-BR",
  "maxSubjectLength": 72,
  "detailCount": { "min": 2, "max": 4 },
  "bodySeparator": "blank",
  "scope": { "allow": true, "autoDetect": true },
  "imperativeMood": true
}
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `language` | `select` | `"en"` | Language for the subject and bullet details (`en`, `pt-BR`, `es`, `fr`, `it`, `de`). |
| `maxSubjectLength` | `number` | `72` | Maximum length of the subject line. |
| `detailCount.min` | `number` | `2` | Minimum number of detail bullets. |
| `detailCount.max` | `number` | `4` | Maximum number of detail bullets. |
| `bodySeparator` | `select` | `"blank"` | Blank line (`blank`) or a line containing only `-` (`dash`) between subject and details. |
| `scope.allow` | `confirm` | `true` | Allow `(scope)` in the subject. |
| `scope.autoDetect` | `confirm` | `true` | Infer a scope from changed files/modules when it is obvious. |
| `imperativeMood` | `confirm` | `true` | Use imperative form in the configured language when possible. |

Commit types always remain in English. See [docs/CONFIG.md](docs/CONFIG.md) for the complete generated option table.

## Examples

### English (default)
```text
feat(ui): add mobile navigation menu

- Implement hamburger toggle for small screens
- Add slide-in animation for menu drawer
- Adjust header layout to accommodate new menu
```

### Portuguese (Brazil)
```text
feat(ui): adiciona menu de navegação mobile

- Implementa botão hambúrguer para telas menores
- Adiciona animação de deslizamento ao menu
- Ajusta o cabeçalho para comportar o novo menu
```

### Spanish
```text
feat(api): añade validación para el registro de usuarios

- Agrega validación con Zod en el endpoint
- Muestra mensajes de error claros
- Impide registros con correos duplicados
```

### French
```text
fix(auth): corrige l'expiration du jeton

- Met à jour la logique de rafraîchissement du token
- Gère correctement les sessions expirées
- Affiche un message clair à l'utilisateur
```

More examples in [docs/EXAMPLES.md](docs/EXAMPLES.md).

## Docs

- [Configuration Guide](docs/CONFIG.md)
- [Usage Guide](docs/USAGE.md)
- [Examples](docs/EXAMPLES.md)

## Contributing

Contributions are welcome! Feel free to open issues, suggest improvements or submit pull requests.

## License

[MIT](LICENSE) © 2025 [wallacemaia2007](https://github.com/wallacemaia2007)
