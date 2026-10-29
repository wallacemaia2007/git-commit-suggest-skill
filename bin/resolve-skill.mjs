import path from "node:path";

const defaultDirectories = [".claude/skills", ".agents/skills", ".cursor/skills", ".codex/skills"];
const agentDirectories = {
  "claude-code": { project: ".claude/skills", global: ".claude/skills" },
  codex: { project: ".agents/skills", global: ".agents/skills" },
  cursor: { project: ".agents/skills", global: ".cursor/skills" }
};

export function findConfigureScript({ agent, global = false, cwd, home, exists }) {
  if (typeof exists !== "function") throw new TypeError("exists must be a function");
  const projectBase = cwd;
  const homeBase = home;
  const projectDirectories = [...defaultDirectories];
  const globalDirectories = [...defaultDirectories];
  const selectedDirectories = agentDirectories[agent];

  if (selectedDirectories) {
    projectDirectories.splice(projectDirectories.indexOf(selectedDirectories.project), 1);
    globalDirectories.splice(globalDirectories.indexOf(selectedDirectories.global), 1);
    projectDirectories.unshift(selectedDirectories.project);
    globalDirectories.unshift(selectedDirectories.global);
  }

  const orderedDirectories = global
    ? [...globalDirectories.map(directory => path.join(homeBase, directory)), ...projectDirectories.map(directory => path.join(projectBase, directory))]
    : [...projectDirectories.map(directory => path.join(projectBase, directory)), ...globalDirectories.map(directory => path.join(homeBase, directory))];

  const seen = new Set();
  const scripts = [];
  for (const directory of orderedDirectories) {
    const script = path.join(directory, "git-commit-suggest", "scripts", "configure.mjs");
    if (seen.has(script)) continue;
    seen.add(script);
    if (exists(script)) scripts.push(script);
  }
  return scripts;
}
