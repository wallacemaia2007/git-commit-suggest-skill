---
name: git-commit-suggest
description: "Sugere mensagens Conventional Commits a partir do git diff. Tipos em inglês; assunto e detalhes no idioma configurado."
---

# Git Commit Suggest

Use esta skill quando o usuário pedir uma sugestão de mensagem de commit com base nas alterações do Git.

## Configuração

### Primeiro uso

Procure `config.json` no mesmo diretório deste `SKILL.md`. Se não existir e houver shell disponível, execute `node <pasta-da-skill>/scripts/configure.mjs`. Avise em uma frase, no idioma do usuário, que abriu a página de configuração; inclua a URL impressa pelo comando se o navegador não abrir. Enquanto isso, entregue a sugestão normalmente usando os padrões e o idioma do pedido. Não repita o aviso quando `config.json` já existir.

### Sem navegador ou sem shell

Se não houver navegador, pergunte no chat qual idioma o usuário prefere e, se houver shell, grave a escolha com `node <pasta-da-skill>/scripts/configure.mjs --set language=<código>`. Sem shell, use o idioma do pedido e continue.

### Reconfigurar

Se o usuário pedir para mudar o idioma ou ajustar a skill, execute `node <pasta-da-skill>/scripts/configure.mjs` para abrir a interface. Para uma alteração simples, use `--set`, por exemplo `--set language=pt-BR`.

O agente nunca edita `config.json` manualmente; use sempre o script, que valida e grava o arquivo.

## Workflow

1. Rode `git status --short` e `git ls-files --others --exclude-standard` para identificar mudanças e arquivos novos.
2. Prefira `git diff --cached`; se estiver vazio, use `git diff`.
3. Leia o início dos arquivos novos relevantes. Em diffs grandes, comece por `git diff --stat` e ignore arquivos de lock, `dist/`, `build/` e `*.min.*` ao resumir.
4. Classifique a mudança e escolha um scope apenas quando for claro. Tipos como `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `build`, `ci`, `chore` e `revert` permanecem em inglês.
5. Escreva assunto e detalhes no idioma configurado, respeitando `maxSubjectLength`, `detailCount`, `bodySeparator`, `scope` e `imperativeMood` em `config.json`. Se ainda não houver configuração, use os padrões e o idioma do pedido.
6. Procure indícios de segredos e avise antes de sugerir a mensagem.

Nunca execute `git add`, `git commit` ou `git push`. Entregue uma mensagem pronta para colar, com a quantidade de bullets configurada. Consulte [references/examples.md](references/examples.md) para exemplos.
