#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { findConfigureScript } from "./resolve-skill.mjs";

const repo = "wallacemaia2007/git-commit-suggest-skill";
const args = process.argv.slice(2);
const configOnly = args[0] === "config";
if (configOnly) args.shift();
const installFlags = [];
const rest = [];
for (let index = 0; index < args.length; index++) {
  const value = args[index];
  if (value === "-g" || value === "-y" || value.startsWith("-a=") || value.startsWith("--agent=")) installFlags.push(value);
  else if (value === "-a" || value === "--agent") { installFlags.push(value); if (args[index + 1] && !args[index + 1].startsWith("-")) installFlags.push(args[++index]); }
  else rest.push(value);
}
if (!configOnly) {
  const install = spawnSync("npx", ["skills", "add", repo, "--skill", "git-commit-suggest", ...installFlags], { stdio: "inherit", shell: process.platform === "win32" });
  if (install.error) throw install.error;
  if (install.status !== 0) process.exit(install.status ?? 1);
}
const home = os.homedir();
let agent;
for (let index = 0; index < installFlags.length; index++) {
  const value = installFlags[index];
  if (value.startsWith("-a=")) { agent = value.slice(3); break; }
  if (value.startsWith("--agent=")) { agent = value.slice("--agent=".length); break; }
  if ((value === "-a" || value === "--agent") && installFlags[index + 1]) { agent = installFlags[index + 1]; break; }
}
const scripts = findConfigureScript({ agent, global: installFlags.includes("-g"), cwd: process.cwd(), home, exists: fs.existsSync });
const script = scripts[0];
if (!script) { console.error("Não encontrei a skill instalada. Confira os destinos do comando skills add."); process.exit(1); }
if (scripts.length > 1) console.warn(`Aviso: vou configurar a c\u00f3pia em "${script}". Para configurar as outras, execute: ${scripts.slice(1).map(candidate => `node ${candidate}`).join("; ")}`);
const configure = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit" });
if (configure.error) throw configure.error;
process.exit(configure.status ?? 1);
