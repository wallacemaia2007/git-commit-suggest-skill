import fs from "node:fs";
import path from "node:path";
import { getDefaultConfig, validateConfig } from "./options.js";

export function configPath(skillDir) {
  return path.join(skillDir, "config.json");
}

export function loadConfig(skillDir, warn = console.warn) {
  const file = configPath(skillDir);
  let parsed = {};
  if (fs.existsSync(file)) {
    try { parsed = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (error) { warn(`Não foi possível ler ${file}: ${error.message}`); }
  }
  const result = validateConfig(parsed);
  for (const invalid of result.errors) warn(`Valor inválido descartado: ${invalid.key}`);
  return result.config;
}

export function saveConfig(skillDir, input, warn = console.warn) {
  const result = validateConfig(input);
  for (const invalid of result.errors) warn(`Valor inválido descartado: ${invalid.key}`);
  fs.mkdirSync(skillDir, { recursive: true });
  const file = configPath(skillDir);
  fs.writeFileSync(file, `${JSON.stringify({ ...getDefaultConfig(), ...result.config }, null, 2)}\n`);
  return { config: result.config, path: file, errors: result.errors };
}
