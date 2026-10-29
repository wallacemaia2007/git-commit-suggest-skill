# Configuração

Instale com `npx git-commit-suggest` para abrir a página de configuração assim que a instalação terminar. O comando oficial direto `npx skills add wallacemaia2007/git-commit-suggest-skill` apenas copia a skill; nesse caso, a página abre quando ela for ativada pela primeira vez. Sem navegador, escolha o idioma no chat; se não houver shell, a skill usa o idioma do pedido.

Reconfigure com `node <pasta-da-skill>/scripts/configure.mjs`, pedindo ao agente, ou com `npx git-commit-suggest config`.

## Opções

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `language` | `select` | `"en"` | Idioma do assunto e dos detalhes. Choices: `en`, `pt-BR`, `es`, `fr`, `it`, `de`. |
| `maxSubjectLength` | `number` | `72` | Limite de caracteres da primeira linha. Range: 40–100. |
| `detailCount.min` | `number` | `2` | Quantidade mínima de bullets. Range: 1–10. |
| `detailCount.max` | `number` | `4` | Quantidade máxima de bullets. Range: 1–10. |
| `bodySeparator` | `select` | `"blank"` | Separação entre assunto e detalhes. Choices: `blank`, `dash`. |
| `scope.allow` | `confirm` | `true` | Permite um scope no assunto. |
| `scope.autoDetect` | `confirm` | `true` | Infere o scope a partir dos arquivos alterados. |
| `imperativeMood` | `confirm` | `true` | Prefere verbos no modo imperativo. |

Os tipos Conventional Commits permanecem em inglês.
