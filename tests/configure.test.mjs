import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { options, getDefaultConfig, getValue, validateConfig } from "../skills/git-commit-suggest/scripts/options.mjs";
import { createServer, loadConfig, saveConfig, skillDir } from "../skills/git-commit-suggest/scripts/configure.mjs";

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceSkill = path.join(repo, "skills", "git-commit-suggest");
function temporarySkill(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "git-commit-suggest-"));
  const skill = path.join(root, "skill");
  fs.cpSync(sourceSkill, skill, { recursive: true });
  fs.rmSync(path.join(skill, "config.json"), { force: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return skill;
}
const configure = dir => path.join(dir, "scripts", "configure.mjs");
function rawRequest(port, requestPath, headers = {}, body) {
  return new Promise((resolve, reject) => {
    const request = http.request({ hostname: "127.0.0.1", port, path: requestPath, headers }, response => {
      let text = ""; response.setEncoding("utf8"); response.on("data", chunk => text += chunk);
      response.on("end", () => resolve({ status: response.statusCode, text }));
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}
async function freePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

test("each option has a valid default", () => {
  const defaults = getDefaultConfig();
  for (const option of options) {
    const value = getValue(defaults, option.key);
    if (option.choices) assert.ok(option.choices.includes(value), option.key);
    if (option.type === "number") assert.ok(value >= option.min && value <= option.max, option.key);
    if (option.type === "confirm") assert.equal(typeof value, "boolean", option.key);
  }
  assert.deepEqual(validateConfig(defaults).errors, []);
});

test("configuration merge preserves choices, adds defaults, and replaces invalid values", t => {
  const dir = temporarySkill(t);
  saveConfig({ ...getDefaultConfig(), language: "fr", maxSubjectLength: 80 }, () => {}, dir);
  const merged = loadConfig(() => {}, dir);
  assert.equal(merged.language, "fr");
  assert.equal(merged.maxSubjectLength, 80);
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify({ language: "xx", imperativeMood: false }));
  const invalid = loadConfig(() => {}, dir);
  assert.equal(invalid.language, "en");
  assert.equal(invalid.imperativeMood, false);
  assert.equal(invalid.detailCount.min, 2);
});

test("API rejects missing token and invalid Host, then saves valid config and closes", async t => {
  const dir = temporarySkill(t);
  const token = "test-token";
  const server = createServer({ port: 0, token, directory: dir });
  t.after(() => { if (server.listening) server.close(); });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(`${base}/api/options`)).status, 403);
  assert.equal((await rawRequest(port, "/api/options", { host: `example.com:${port}`, "x-token": token })).status, 403);
  const headers = { "X-Token": token, "Content-Type": "application/json" };
  const invalid = await fetch(`${base}/api/save`, { method: "POST", headers, body: JSON.stringify({ config: { language: "xx" } }) });
  assert.equal(invalid.status, 400);
  assert.equal(fs.existsSync(path.join(dir, "config.json")), false);
  const closed = once(server, "close");
  const saved = await fetch(`${base}/api/save`, { method: "POST", headers, body: JSON.stringify({ config: { ...getDefaultConfig(), language: "pt-BR" } }) });
  assert.equal(saved.status, 200);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8")).language, "pt-BR");
  await closed;
});

test("--serve reads its token from the environment instead of process arguments", async t => {
  const port = await freePort();
  const token = "environment-token";
  const child = spawn(process.execPath, [configure(sourceSkill), "--serve", String(port)], {
    env: { ...process.env, GIT_COMMIT_SUGGEST_TOKEN: token },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  child.stdout.setEncoding("utf8").on("data", chunk => output += chunk);
  child.stderr.setEncoding("utf8").on("data", chunk => output += chunk);
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
  });

  assert.equal(child.spawnargs.includes(token), false);
  assert.deepEqual(child.spawnargs.slice(-2), ["--serve", String(port)]);
  let authorized;
  const deadline = Date.now() + 5000;
  while (!authorized && Date.now() < deadline && child.exitCode === null) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/options`, { headers: { "X-Token": token } });
      if (response.status === 200) authorized = true;
      else await response.arrayBuffer();
    } catch {
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }
  assert.equal(authorized, true, output);
  assert.equal((await fetch(`http://127.0.0.1:${port}/api/options`, { headers: { "X-Token": "wrong-token" } })).status, 403);
});

test("--serve rejects a token argument and reports a missing environment token", async () => {
  const port = await freePort();
  const env = { ...process.env };
  delete env.GIT_COMMIT_SUGGEST_TOKEN;

  const missing = spawnSync(process.execPath, [configure(sourceSkill), "--serve", String(port)], { encoding: "utf8", env });
  assert.equal(missing.status, 1);
  assert.match(`${missing.stdout}${missing.stderr}`, /GIT_COMMIT_SUGGEST_TOKEN/);

  const argument = spawnSync(process.execPath, [configure(sourceSkill), "--serve", String(port), "argument-token"], { encoding: "utf8", env: { ...env, GIT_COMMIT_SUGGEST_TOKEN: "environment-token" } });
  assert.equal(argument.status, 1);
  assert.match(`${argument.stdout}${argument.stderr}`, /aceita apenas a porta/);
});

test("--set validates, writes, and leaves config untouched on invalid values", t => {
  const dir = temporarySkill(t);
  const script = configure(dir);
  const good = spawnSync(process.execPath, [script, "--set", "language=es", "--set", "maxSubjectLength=60"], { encoding: "utf8" });
  assert.equal(good.status, 0, good.stderr);
  const configFile = path.join(dir, "config.json");
  const before = fs.readFileSync(configFile, "utf8");
  assert.equal(JSON.parse(before).language, "es");
  const bad = spawnSync(process.execPath, [script, "--set", "language=xx"], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.equal(fs.readFileSync(configFile, "utf8"), before);
});

test("--terminal saves complete answers supplied through a pipe", t => {
  const dir = temporarySkill(t);
  const result = spawnSync(process.execPath, [configure(dir), "--terminal"], {
    input: "pt-BR\n88\n1\n3\ndash\nfalse\ntrue\nfalse\n",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  const saved = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
  assert.equal(saved.language, "pt-BR");
  assert.equal(saved.maxSubjectLength, 88);
  assert.deepEqual(saved.detailCount, { min: 1, max: 3 });
  assert.equal(saved.bodySeparator, "dash");
  assert.equal(saved.scope.allow, false);
  assert.equal(saved.scope.autoDetect, true);
  assert.equal(saved.imperativeMood, false);
  assert.equal(saved.setupCompleted, true);
});

test("--terminal keeps current values when pipe input is partial", t => {
  const dir = temporarySkill(t);
  const script = configure(dir);
  const preset = spawnSync(process.execPath, [script, "--set", "maxSubjectLength=80", "--set", "language=es"], { encoding: "utf8" });
  assert.equal(preset.status, 0, preset.stderr);

  const partial = spawnSync(process.execPath, [script, "--terminal"], { input: "fr\n", encoding: "utf8" });
  assert.equal(partial.status, 0, partial.stderr);
  let saved = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
  assert.equal(saved.language, "fr");
  assert.equal(saved.maxSubjectLength, 80);
  assert.equal(saved.setupCompleted, true);

});

test("--terminal rejects EOF before any response without writing config", t => {
  const dir = temporarySkill(t);
  const result = spawnSync(process.execPath, [configure(dir), "--terminal"], { input: "", encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(`${result.stdout}${result.stderr}`, /Nenhuma entrada foi recebida/);
  assert.match(`${result.stdout}${result.stderr}`, /--set chave=valor ou --defaults/);
  assert.equal(fs.existsSync(path.join(dir, "config.json")), false);
});

test("--terminal treats an empty line as a response and saves current values", t => {
  const dir = temporarySkill(t);
  const result = spawnSync(process.execPath, [configure(dir), "--terminal"], { input: "\n", encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const saved = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
  assert.equal(saved.setupCompleted, true);
  assert.equal(saved.language, "en");
});

test("--terminal rejects invalid pipe input without writing config", t => {
  const dir = temporarySkill(t);
  const result = spawnSync(process.execPath, [configure(dir), "--terminal"], { input: "xx\n", encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(`${result.stdout}${result.stderr}`, /Valor inválido para Idioma/);
  assert.equal(fs.existsSync(path.join(dir, "config.json")), false);
});

test("configure resolves its skill through a symlink", async t => {
  const dir = temporarySkill(t);
  const link = path.join(path.dirname(dir), "configure-link.mjs");
  try { fs.symlinkSync(configure(dir), link, "file"); }
  catch (error) { if (["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) return t.skip(`symlink unavailable: ${error.code}`); throw error; }
  const result = spawnSync(process.execPath, [link, "--defaults"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8")).setupCompleted, true);
  assert.equal(fs.existsSync(path.join(skillDir, "config.json")), false);
});
