# Contribuindo

1. Instale o projeto com `npm install` se necessário.
2. Execute `npm test` para rodar os testes e validar os fixtures.
3. Confira os JSONs com `node -e "for (const f of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(f));" ...`.
4. Use tipos Conventional Commits em inglês e escreva resumo/detalhes no idioma configurado.

## Como adicionar uma opção

1. Adicione uma linha com os metadados da opção em [bin/options.js](../bin/options.js).
2. Rode `node scripts/generate-config-docs.js` para atualizar a documentação.
3. Adicione um teste em `tests/` cobrindo o padrão e a validação.

Não execute `git commit`, `git add` ou `git push` como parte da skill.
