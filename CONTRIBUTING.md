# Contribuindo

1. Não há dependências de instalação: use Node.js 18 ou superior.
2. Execute `npm test` para rodar os testes nativos do Node.
3. Execute `npm run generate:config-docs` para atualizar a tabela de configuração.
4. Use tipos Conventional Commits em inglês e escreva resumo/detalhes no idioma configurado.

## Como adicionar uma opção

1. Adicione uma linha com os metadados em [options.mjs](skills/git-commit-suggest/scripts/options.mjs).
2. Rode `npm run generate:config-docs` para atualizar a documentação.
3. Adicione um teste em `tests/` cobrindo o padrão e a validação.

Não execute `git commit`, `git add` ou `git push` como parte da skill.
