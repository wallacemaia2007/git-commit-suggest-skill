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
- Se o arquivo não existir ou `setupCompleted` não for `true`, execute `node <pasta-da-skill>/scripts/configure.mjs`. Se a página abrir, avise o usuário, no idioma dele, e pare até que ele salve a configuração.
- Se o usuário disser que a página não abre, ou se o ambiente não puder acessar o servidor local (como Claude.ai web, SSH, remoto ou WSL sem navegador), pergunte no chat qual idioma usar (`en`, `pt-BR`, `es`, `fr`, `it` ou `de`). Pergunte se também quer ajustar outros campos; só altere os campos que ele escolher. Os campos opcionais são `maxSubjectLength` (40–100), `detailCount.min` e `detailCount.max` (1–10), `bodySeparator` (`blank` ou `dash`), `scope.allow`, `scope.autoDetect` e `imperativeMood` (booleanos). Use um `--set chave=valor` para cada campo, por exemplo: `node <pasta-da-skill>/scripts/configure.mjs --set language=pt-BR --set bodySeparator=dash`. O script valida os valores e marca `setupCompleted`; em seguida, confira com `node <pasta-da-skill>/scripts/configure.mjs --print` e continue a sugestão no mesmo turno.
- Se não houver shell, explique que a configuração é obrigatória e não use a skill. Peça para o usuário executar o script na pasta instalada e tentar novamente depois de salvar.

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

## Formato da mensagem

`bodySeparator` controla a separação entre o assunto e os detalhes. O assunto nunca fica colado ao separador nem aos bullets. A quantidade de bullets deve ficar entre `detailCount.min` e `detailCount.max`.

- `blank`: assunto, uma linha em branco e bullets `- ...`.

  ```text
  fix(api): handle empty responses

  - Return an empty result
  - Add a regression check
  ```

- `dash`: assunto, uma linha em branco, uma linha contendo apenas `-`, e então os bullets `- ...`.

  ```text
  fix(api): handle empty responses

  -
  - Return an empty result
  - Add a regression check
  ```
