import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadConfig, saveConfig } from "./config-store.js";

export function detectDestinations(cwd = process.cwd(), home = os.homedir()) {
  return [
    { id: "project-claude", scope: "project", label: "Projeto (.claude)", skillDir: path.join(cwd, ".claude", "skills", "git-commit-suggest") },
    { id: "project-agents", scope: "project", label: "Projeto (.agents)", skillDir: path.join(cwd, ".agents", "skills", "git-commit-suggest") },
    { id: "global-claude", scope: "global", label: "Global (~/.claude)", skillDir: path.join(home, ".claude", "skills", "git-commit-suggest") },
    { id: "global-agents", scope: "global", label: "Global (~/.agents)", skillDir: path.join(home, ".agents", "skills", "git-commit-suggest") }
  ].map(destination => ({ ...destination, exists: fs.existsSync(destination.skillDir) }));
}

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) copyRecursive(path.join(source, entry), path.join(target, entry));
  } else fs.copyFileSync(source, target);
}

export function installSkill(sourceRoot, destinations) {
  const files = ["SKILL.md", "config.example.json", "references"];
  return destinations.map(destination => {
    fs.mkdirSync(destination.skillDir, { recursive: true });
    for (const file of files) copyRecursive(path.join(sourceRoot, file), path.join(destination.skillDir, file));
    const config = loadConfig(destination.skillDir);
    saveConfig(destination.skillDir, config);
    return { ...destination, configPath: path.join(destination.skillDir, "config.json") };
  });
}
