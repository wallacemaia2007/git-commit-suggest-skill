import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateConfig } from "../bin/options.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultFixtureDir = path.join(root, "tests", "fixtures");
const exampleConfig = path.join(root, "skills", "git-commit-suggest", "config.example.json");
const allowedTypes = new Set(["feat", "fix", "refactor", "perf", "docs", "style", "test", "build", "ci", "chore", "revert"]);

export function validateFixtures({ fixtureDir = defaultFixtureDir, config } = {}) {
  const input = config ?? JSON.parse(fs.readFileSync(exampleConfig, "utf8"));
  const settings = validateConfig(input).config;
  const fixtures = fs.readdirSync(fixtureDir).filter((file) => file.endsWith(".expected.md"));

  if (fixtures.length < 5) {
    throw new Error(`Expected at least 5 fixtures, found ${fixtures.length}`);
  }

  for (const expectedFile of fixtures) {
    const expected = fs.readFileSync(path.join(fixtureDir, expectedFile), "utf8").trim();
    if (expectedFile === "empty.expected.md") {
      if (!expected.toLowerCase().includes("no changes")) {
        throw new Error(`${expectedFile}: empty diff must report no changes`);
      }
      continue;
    }

    const lines = expected.split(/\r?\n/);
    const headers = lines.filter((line) => /^[a-z]+(?:\([^)]+\))?!?: /.test(line));
    if (headers.length === 0) {
      throw new Error(`${expectedFile}: missing Conventional Commit subject`);
    }

    for (const header of headers) {
      const match = header.match(/^([a-z]+)(?:\([^)]+\))?!?: (.+)$/);
      if (!match || !allowedTypes.has(match[1])) {
        throw new Error(`${expectedFile}: invalid subject "${header}"`);
      }
      if (match[2].length > settings.maxSubjectLength) {
        throw new Error(`${expectedFile}: subject exceeds ${settings.maxSubjectLength} characters`);
      }
    }

    const bullets = lines.filter((line) => line.startsWith("- ") && line !== "-");
    if (bullets.length < settings.detailCount.min || bullets.length > settings.detailCount.max * headers.length) {
      throw new Error(`${expectedFile}: invalid bullet count`);
    }

    if (settings.bodySeparator === "dash" && !lines.includes("-")) {
      throw new Error(`${expectedFile}: expected dash separator`);
    }
    if (settings.bodySeparator === "blank" && lines.includes("-")) {
      throw new Error(`${expectedFile}: expected blank separator`);
    }
  }

  return fixtures.length;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  console.log(`Validated ${validateFixtures()} fixtures.`);
}
