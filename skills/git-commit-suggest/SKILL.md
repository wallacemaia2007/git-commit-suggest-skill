---
name: git-commit-suggest
description: "Sugere mensagem de commit no padrão Conventional Commits a partir do git diff (staged ou não). Use quando o usuário pedir uma mensagem de commit, \"sugira um commit\", \"suggest a commit message\", \"mensaje de commit\", ou perguntar como descrever suas alterações. Tipos em inglês; resumo e detalhes no idioma configurado."
---

# Git Commit Suggest

Use esta skill quando o usuário pedir uma sugestão de mensagem de commit a partir das alterações do Git.

## Configuração

Leia a configuração a partir do diretório desta própria skill, nunca do diretório de trabalho:

1. Leia `config.json` no mesmo diretório deste `SKILL.md`.
2. Se ele não existir, leia `config.example.json` no mesmo diretório.
3. Se nenhum arquivo existir, use o idioma do pedido do usuário e os padrões desta skill.

Opções:

- `language`: idioma do assunto e dos detalhes (`en`, `pt-BR`, `es`, `fr`, `it`, `de`).
- `maxSubjectLength`: limite do assunto, por padrão 72 caracteres.
- `detailCount.min` e `detailCount.max`: quantidade de bullets, por padrão de 2 a 4.
- `bodySeparator`: `"blank"` para uma linha em branco ou `"dash"` para uma linha contendo apenas `-`.
- `scope.allow`: quando `false`, não use `(scope)` no assunto.
- `scope.autoDetect`: infira o scope a partir dos arquivos alterados quando ele for óbvio.
- `imperativeMood`: use o modo imperativo quando possível.

Os tipos (`feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `build`, `ci`, `chore`, `revert`) permanecem em inglês e não são configuráveis.

## Workflow

1. Rode `git status --short` e também `git ls-files --others --exclude-standard` para listar arquivos novos (untracked), que não aparecem no `git diff`.
2. Prefira `git diff --cached`. Se não houver conteúdo staged, use `git diff`.
3. Para arquivo novo, leia o início do conteúdo para entender a alteração.
4. Em diffs grandes, comece com `git diff --stat`, ignore `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `dist/`, `build/` e `*.min.*`, e trunque o restante, resumindo o que foi cortado.
5. Rode `git log -n 20 --oneline` para aproveitar o vocabulário de scopes e o estilo do repositório.
6. Se não houver mudanças, responda em uma frase que não há alterações e não invente um commit.
7. Se houver assuntos não relacionados, sugira dividir em commits separados e entregue uma mensagem para cada um, indicando os arquivos de cada commit. Não descarte mudanças secundárias.
8. Se não for possível executar comandos, peça a saída de `git diff --cached` ou `git diff` e prossiga a partir dela.
9. Procure indícios de segredo (chave, token ou senha) e avise antes de sugerir o commit.

## Regras

- Use tipos em inglês, mas assunto e detalhes no idioma configurado.
- Escreva no imperativo e mantenha o assunto em até `maxSubjectLength` caracteres.
- Use `(scope)` somente quando for claro e significativo.
- Gere de 2 a 4 bullets, conforme `detailCount`, explicando o que mudou.
- Para breaking changes, use `!` após tipo/scope e inclua `BREAKING CHANGE: ...` no rodapé.
- Se o nome da branch contiver número de issue, como `feat/123-login`, inclua `Refs #123`.
- Nunca execute `git commit`, `git add` ou `git push`; apenas sugira.
- Entregue uma saída pronta para colar.

### Guia de tipos

- `feat`: funcionalidade nova; `refactor`: reorganização sem mudança de comportamento; `chore`: manutenção.
- `fix`: correção de comportamento; `perf`: melhoria de desempenho.
- `docs`: documentação; `style`: formatação sem lógica; `test`: testes.
- `build`: build/dependências; `ci`: automação de CI; `revert`: desfaz uma mudança.

## Formato de saída

Com `bodySeparator: "blank"`:

```text
<type>[(!)]([scope]): <assunto>

- <detalhe 1>
- <detalhe 2>
```

Com `bodySeparator: "dash"`, insira uma linha contendo apenas `-` entre o assunto e os bullets. Consulte [references/examples.md](references/examples.md) para exemplos por idioma.
