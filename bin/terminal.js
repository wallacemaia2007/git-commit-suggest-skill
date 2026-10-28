import readline from "node:readline";
import { options, getDefaultConfig, getValue, setValue, validateConfig } from "./options.js";

export async function promptConfig(initial = getDefaultConfig(), input = process.stdin, output = process.stdout) {
  const rl = readline.createInterface({ input, output });
  const result = { ...initial };
  try {
    for (const option of options) {
      const current = getValue(result, option.key);
      const suffix = option.choices ? ` (${option.choices.join(", ")})` : option.type === "confirm" ? " (s/n)" : "";
      const answer = await new Promise(resolve => rl.question(`${option.label}${suffix} [${current}]: `, resolve));
      if (!answer.trim()) continue;
      let value = answer.trim();
      if (option.type === "number") value = Number(value);
      if (option.type === "confirm") value = ["s", "sim", "y", "yes", "true"].includes(value.toLowerCase());
      setValue(result, option.key, value);
    }
  } finally { rl.close(); }
  return validateConfig(result).config;
}
