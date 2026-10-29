---
name: git-commit-suggest
description: "Sugere mensagens Conventional Commits a partir do git diff. Tipos em inglês; assunto e detalhes no idioma configurado."
---

# Git Commit Suggest

Use esta skill quando o usuário pedir uma sugestão de mensagem de commit com base nas alterações do Git.

## Configuração

### Primeiro uso obrigatório

Antes de analisar qualquer diff, execute `node <pasta-da-skill>/scripts/configure.mjs --print` e confira `setupCompleted` em `config.json`, no mesmo diretório deste `SKILL.md`.

- Se `setupCompleted` for `true`, carregue as opções configuradas e continue.
- Se o arquivo não existir ou `setupCompleted` não for `true`, execute `node <pasta-da-skill>/scripts/configure.mjs`. Avise o usuário, no idioma dele, que a página de configuração foi aberta e inclua a URL impressa se o navegador não abrir. Pare aqui: não leia o diff nem sugira uma mensagem até o usuário salvar a configuração.
- Se não houver shell para abrir a página, explique que a configuração é obrigatória e não use a skill. Peça para o usuário executar o script na pasta instalada e tentar novamente depois de salvar.

Cancelar a página não conclui a configuração. Restaurar os padrões só conta como configuração depois de clicar em Salvar.

### Reconfigurar

Se o usuário pedir para mudar o idioma ou ajustar a skill, execute `node <pasta-da-skill>/scripts/configure.mjs` para abrir a interface. Para uma alteração simples, use `--set`, por exemplo `--set language=pt-BR`.

O agente nunca edita `config.json` manualmente; use sempre o script, que valida e grava o arquivo.

## Workflow

1. Rode `git status --short` e `git ls-files --others --exclude-standard` para identificar mudanças e arquivos novos.
2. Prefira `git diff --cached`; se estiver vazio, use `git diff`.
3. Leia o início dos arquivos novos relevantes. Em diffs grandes, comece por `git diff --stat` e ignore arquivos de lock, `dist/`, `build/` e `*.min.*` ao resumir.
4. Classifique a mudança e escolha um scope apenas quando for claro. Tipos como `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `build`, `ci`, `chore` e `revert` permanecem em inglês.
5. Escreva assunto e detalhes no idioma configurado, respeitando `maxSubjectLength`, `detailCount`, `bodySeparator`, `scope` e `imperativeMood` em `config.json`.
6. Procure indícios de segredos e avise antes de sugerir a mensagem.

Nunca execute `git add`, `git commit` ou `git push`. Entregue uma mensagem pronta para colar, com a quantidade de bullets configurada. Consulte [references/examples.md](references/examples.md) para exemplos.
