import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { findConfigureScript } from "../bin/resolve-skill.mjs";

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cwd = path.resolve("skill-resolver-project");
const home = path.resolve("skill-resolver-home");
const directoryNames = [".claude/skills", ".agents/skills", ".cursor/skills", ".codex/skills"];
const scriptAt = (base, directory) => path.join(base, directory, "git-commit-suggest", "scripts", "configure.mjs");

function resolverWithAllCopies(options = {}) {
  const found = new Set([
    ...directoryNames.map(directory => scriptAt(cwd, directory)),
    ...directoryNames.map(directory => scriptAt(home, directory))
  ]);
  return findConfigureScript({ cwd, home, ...options, exists: candidate => found.has(candidate) });
}

test("agent mappings prioritize Claude Code, Codex, and Cursor paths", () => {
  assert.equal(resolverWithAllCopies({ agent: "claude-code" })[0], scriptAt(cwd, ".claude/skills"));
  assert.equal(resolverWithAllCopies({ agent: "codex" })[0], scriptAt(cwd, ".agents/skills"));
  assert.equal(resolverWithAllCopies({ agent: "cursor" })[0], scriptAt(cwd, ".agents/skills"));
  assert.equal(resolverWithAllCopies({ agent: "unknown-agent" })[0], scriptAt(cwd, ".claude/skills"));
});

test("global mode puts global copies first and prioritizes the selected agent", () => {
  assert.equal(resolverWithAllCopies({ agent: "codex", global: true })[0], scriptAt(home, ".agents/skills"));
  assert.equal(resolverWithAllCopies({ global: true })[0], scriptAt(home, ".claude/skills"));
});

test("no flags preserves the previous project then global order and returns every copy", () => {
  const scripts = resolverWithAllCopies();
  assert.equal(scripts[0], scriptAt(cwd, ".claude/skills"));
  assert.equal(scripts[1], scriptAt(cwd, ".agents/skills"));
  assert.equal(scripts[4], scriptAt(home, ".claude/skills"));
  assert.equal(scripts.length, 8);
});

test("CLI warns which copy it configures and how to configure the other copies", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "git-commit-suggest-cli-"));
  const project = path.join(root, "project");
  const homeDirectory = path.join(root, "home");
  fs.mkdirSync(project, { recursive: true });
  fs.mkdirSync(homeDirectory, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const claude = scriptAt(project, ".claude/skills");
  const codex = scriptAt(project, ".agents/skills");
  for (const [script, name] of [[claude, "claude"], [codex, "codex"]]) {
    fs.mkdirSync(path.dirname(script), { recursive: true });
    fs.writeFileSync(script, `console.log("configured-${name}");\n`);
  }

  for (const args of [["config", "-a", "codex"], ["config", "-a=codex"]]) {
    const result = spawnSync(process.execPath, [path.join(repo, "bin", "cli.js"), ...args], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, HOME: homeDirectory, USERPROFILE: homeDirectory }
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /configured-codex/);
    assert.ok(result.stderr.includes(`vou configurar a cópia em "${codex}"`), result.stderr);
    assert.ok(result.stderr.includes(`node ${claude}`), result.stderr);
  }
});
