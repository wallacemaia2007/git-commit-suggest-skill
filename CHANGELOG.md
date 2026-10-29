# Changelog

## 1.2.1 - 2026-10-29

- Aguarda o servidor de configuração ficar pronto antes de abrir a página e mantém o token fora dos argumentos do processo.
- Torna o modo `--terminal` confiável com stdin via pipe e impede concluir o setup sem entrada.
- Corrige o encoding do README e documenta a instalação via `npx skills add`.
- Documenta o fallback sem navegador e os formatos de mensagem no SKILL.md.
- Prioriza a cópia da skill correspondente ao agente selecionado no instalador.
- Adiciona CI multiplataforma.

## 1.2.0 - 2026-10-28

- Adiciona configuração local no primeiro uso, com interface web dentro da skill.
- Permite configurar pelo navegador, terminal, argumentos ou valores padrão, sem dependências.
- Mantém escolhas existentes, valida valores e grava o arquivo de forma atômica.
- Atualiza a documentação e o CLI opcional para usar o comando oficial `skills add`.

## 1.1.0 - 2026-10-28

- Corrige referências ao repositório `wallacemaia2007/git-commit-suggest-skill`.
- Reescreve o workflow da skill e adiciona fallback de idioma sem configuração.
- Adiciona `bodySeparator` com suporte a `blank` e `dash`.
- Inclui exemplos separados, fixtures e validação de formato.
