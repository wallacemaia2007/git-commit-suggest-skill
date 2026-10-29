# Configuração

Instale com `npx skills add wallacemaia2007/git-commit-suggest-skill --skill git-commit-suggest`. Em instalações locais com navegador acessível, a página de configuração abre na primeira ativação da skill; salve as configurações antes de usá-la. Em ambientes sem navegador acessível, como Claude.ai web, siga o fallback por chat com `--set` descrito em [SKILL.md](../skills/git-commit-suggest/SKILL.md). Cancelar a página não conclui a configuração.

Reconfigure com `node <pasta-da-skill>/scripts/configure.mjs`, pedindo ao agente.

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
