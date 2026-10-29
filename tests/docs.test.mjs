import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
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

test("release metadata uses one version across all manifests", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repo, "package.json"), "utf8"));
  assert.ok(packageJson.files.includes("bin"), "the resolver module must be included with the bin directory");
  const files = [
    "package.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    ".codex-marketplace/git-commit-suggest/plugin.json",
    ".agents/plugins/git-commit-suggest/plugin.json"
  ];
  const versions = files.map(relative => {
    const data = JSON.parse(fs.readFileSync(path.join(repo, relative), "utf8"));
    return relative === ".claude-plugin/marketplace.json" ? data.plugins[0].version : data.version;
  });
  assert.deepEqual(versions, Array(files.length).fill("1.2.1"));
});

test("tracked text files have no BOM or known mojibake sequences", () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: repo }).toString("utf8").split("\0").filter(Boolean);
  const markers = [
    String.fromCharCode(0x00c3, 0x0192),
    String.fromCharCode(0x00c3, 0x00a2, 0x00e2, 0x20ac, 0x00ac)
  ];
  const failures = [];
  for (const relative of tracked) {
    const bytes = fs.readFileSync(path.join(repo, relative));
    if (bytes.includes(0)) continue;
    const content = bytes.toString("utf8");
    if (content.includes("\uFEFF")) failures.push(`${relative}: BOM`);
    for (const marker of markers) if (content.includes(marker)) failures.push(`${relative}: mojibake`);
  }
  assert.deepEqual(failures, []);
});

test("localized preview samples provide at least four detail bullets without changing defaults", () => {
  const html = fs.readFileSync(path.join(repo, "skills", "git-commit-suggest", "scripts", "ui", "index.html"), "utf8");
  const match = html.match(/const samples=(\{[\s\S]*?\});const language=get\(state\.config/);
  assert.ok(match, "could not extract preview samples");
  const samples = new Function(`return (${match[1]})`)();
  const originalDefaults = {
    es: ["feat(ui): mejora el panel de configuración", "Añade controles claros para preferencias", "Mantiene la vista previa actualizada"],
    fr: ["feat(ui): améliore le panneau de configuration", "Ajoute des contrôles clairs pour les préférences", "Garde l’aperçu synchronisé"],
    it: ["feat(ui): migliora il pannello delle impostazioni", "Aggiunge controlli chiari per le preferenze", "Mantiene l’anteprima aggiornata"],
    de: ["feat(ui): verbessert die Einstellungsansicht", "Ergänzt klare Steuerelemente für Einstellungen", "Hält die Vorschau aktuell"]
  };
  for (const [language, initial] of Object.entries(originalDefaults)) {
    assert.ok(samples[language].length >= 5, `${language} needs a subject and at least four bullets`);
    assert.deepEqual(samples[language].slice(0, 3), initial, `${language} preview for min=2 must remain unchanged`);
  }
});
