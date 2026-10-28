import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { options } from "../bin/options.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rows = options.map(option => `| \`${option.key}\` | \`${option.type}\` | \`${JSON.stringify(option.default)}\` | ${option.description} |`).join("\n");
const content = `# Configuração

A skill lê \`config.json\` no diretório onde o próprio \`SKILL.md\` está. Opções são mantidas e novas opções recebem seus padrões automaticamente.

## Opções

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
${rows}

Os tipos de commit permanecem em inglês e não são uma opção de configuração.
`;
fs.writeFileSync(path.join(root, "docs", "CONFIG.md"), content);
