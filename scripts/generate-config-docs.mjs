import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { options } from "../skills/git-commit-suggest/scripts/options.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rows = options.map(option => {
  const type = option.type === "confirm" ? "confirm" : option.type;
  return `| \`${option.key}\` | \`${type}\` | \`${JSON.stringify(option.default)}\` | ${option.description}${option.choices ? ` Choices: ${option.choices.map(value => `\`${value}\``).join(", ")}.` : option.min !== undefined ? ` Range: ${option.min}–${option.max}.` : ""} |`;
});
const document = `# Configuração\n\nInstale com \`npx git-commit-suggest\` para instalar apenas a skill e abrir a página de configuração assim que a instalação terminar. Para instalar diretamente, use \`npx skills add wallacemaia2007/git-commit-suggest-skill --skill git-commit-suggest\`; a página abre quando a skill for ativada pela primeira vez. É obrigatório salvar as configurações antes de usar a skill. Se não houver navegador, abra a URL impressa pelo script; sem shell, execute o script na pasta instalada e tente novamente depois de salvar. Cancelar não conclui a configuração.\n\nReconfigure com \`node <pasta-da-skill>/scripts/configure.mjs\`, pedindo ao agente, ou com \`npx git-commit-suggest config\`.\n\n## Opções\n\n| Opção | Tipo | Padrão | Descrição |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n\nOs tipos Conventional Commits permanecem em inglês.\n`;
fs.writeFileSync(path.join(root, "docs", "CONFIG.md"), document);
