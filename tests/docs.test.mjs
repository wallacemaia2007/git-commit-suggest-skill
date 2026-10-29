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
  assert.match(readme, /configuration page opens when the local environment can access a browser/i);
  assert.match(config, /página de configuração abre na primeira ativação da skill/i);
  assert.doesNotMatch(readme, /npx git-commit-suggest(?!-skill)/);
  assert.doesNotMatch(config, /npx git-commit-suggest(?!-skill)/);
});

test("Claude.ai setup instructions use the chat fallback instead of promising a page", () => {
  const readme = fs.readFileSync(path.join(repo, "README.md"), "utf8");
  const section = readme.match(/### Claude\.ai \(web\)[\s\S]*?(?=\n### )/)?.[0];
  assert.ok(section, "README must have a Claude.ai section");
  assert.match(section, /asks which language to use in chat/i);
  assert.match(section, /--set/);
  assert.match(section, /without opening a configuration page/i);
  assert.doesNotMatch(section, /first use, it opens the required configuration page/i);

  for (const relative of ["README.md", "docs/CONFIG.md", "docs/USAGE.md"]) {
    const content = fs.readFileSync(path.join(repo, relative), "utf8");
    assert.match(content, /without (an )?accessible browser|without browser access|sem navegador acessível/);
    assert.match(content, /SKILL\.md/);
  }
});

test("skill instructions document setup fallback and both body separators", () => {
  const skill = fs.readFileSync(path.join(repo, "skills", "git-commit-suggest", "SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter, "SKILL.md must have YAML frontmatter");
  assert.match(frontmatter[1], /^name:\s*git-commit-suggest$/m);
  assert.match(frontmatter[1], /^description:\s*".+"$/m);
  assert.match(skill, /--set chave=valor/);
  assert.match(skill, /`blank`[\s\S]*?`dash`/);
  assert.match(skill, /assunto nunca fica colado ao separador nem aos bullets/);
  assert.match(skill, /detailCount\.min[\s\S]*?detailCount\.max/);

  for (const relative of ["skills/git-commit-suggest/references/examples.md", "docs/EXAMPLES.md"]) {
    const examples = fs.readFileSync(path.join(repo, relative), "utf8");
    assert.match(examples, /^[^\r\n]+\r?\n\r?\n-\r?\n- /m, `${relative} dash example must separate the subject from the dash line`);
  }
});
