import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("installation docs use the available Skills CLI command", () => {
  const readme = fs.readFileSync(path.join(repo, "README.md"), "utf8");
  const config = fs.readFileSync(path.join(repo, "docs", "CONFIG.md"), "utf8");
  const command = "npx skills add wallacemaia2007/git-commit-suggest-skill --skill git-commit-suggest";

  assert.ok(readme.includes(command));
  assert.ok(config.includes(command));
  assert.match(readme, /configuration page opens the first time the skill is activated/i);
  assert.match(config, /página de configuração abre na primeira ativação da skill/i);
  assert.doesNotMatch(readme, /npx git-commit-suggest(?!-skill)/);
  assert.doesNotMatch(config, /npx git-commit-suggest(?!-skill)/);
});
