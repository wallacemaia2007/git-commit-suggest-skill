# Configuração

A skill lê `config.json` no diretório onde o próprio `SKILL.md` está. Opções são mantidas e novas opções recebem seus padrões automaticamente.

## Opções

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `language` | `select` | `"en"` | Idioma do assunto e dos detalhes. |
| `maxSubjectLength` | `number` | `72` | Limite de caracteres da primeira linha. |
| `detailCount.min` | `number` | `2` | Quantidade mínima de bullets. |
| `detailCount.max` | `number` | `4` | Quantidade máxima de bullets. |
| `bodySeparator` | `select` | `"blank"` | Separação entre assunto e detalhes. |
| `scope.allow` | `confirm` | `true` | Permite um scope no assunto. |
| `scope.autoDetect` | `confirm` | `true` | Infere o scope a partir dos arquivos alterados. |
| `imperativeMood` | `confirm` | `true` | Prefere verbos no modo imperativo. |

Os tipos de commit permanecem em inglês e não são uma opção de configuração.
