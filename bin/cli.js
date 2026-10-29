#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repo = "wallacemaia2007/git-commit-suggest-skill";
const args = process.argv.slice(2);
const configOnly = args[0] === "config";
if (configOnly) args.shift();
const installFlags = [];
const rest = [];
for (let index = 0; index < args.length; index++) {
  const value = args[index];
  if (value === "-g" || value === "-y" || value.startsWith("-a=")) installFlags.push(value);
  else if (value === "-a") { installFlags.push(value); if (args[index + 1] && !args[index + 1].startsWith("-")) installFlags.push(args[++index]); }
  else rest.push(value);
}
if (!configOnly) {
  const install = spawnSync("npx", ["skills", "add", repo, ...installFlags], { stdio: "inherit", shell: process.platform === "win32" });
  if (install.error) throw install.error;
  if (install.status !== 0) process.exit(install.status ?? 1);
}
const home = os.homedir();
const projectRoots = [
  path.join(process.cwd(), ".claude", "skills"), path.join(process.cwd(), ".agents", "skills"),
  path.join(process.cwd(), ".cursor", "skills"), path.join(process.cwd(), ".codex", "skills")
];
const globalRoots = [
  path.join(home, ".claude", "skills"), path.join(home, ".agents", "skills"),
  path.join(home, ".cursor", "skills"), path.join(home, ".codex", "skills")
];
const roots = installFlags.includes("-g") ? [...globalRoots, ...projectRoots] : [...projectRoots, ...globalRoots];
const candidates = roots.map(root => path.join(root, "git-commit-suggest", "scripts", "configure.mjs"));
const script = candidates.find(candidate => fs.existsSync(candidate));
if (!script) { console.error("Não encontrei a skill instalada. Confira os destinos do comando skills add."); process.exit(1); }
const configure = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit" });
if (configure.error) throw configure.error;
process.exit(configure.status ?? 1);
