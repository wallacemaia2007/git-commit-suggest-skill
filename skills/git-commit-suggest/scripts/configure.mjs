#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import http from "node:http";
import { spawn } from "node:child_process";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { options, getDefaultConfig, getValue, setValue, validateConfig } from "./options.mjs";

const scriptPath = fs.realpathSync(fileURLToPath(import.meta.url));
export const skillDir = path.dirname(path.dirname(scriptPath));
export const configFile = path.join(skillDir, "config.json");

export function loadConfig(warn = console.warn, directory = skillDir) {
  const target = path.join(directory, "config.json");
  let existing = {};
  if (fs.existsSync(target)) {
    try { existing = JSON.parse(fs.readFileSync(target, "utf8")); }
    catch (error) { warn(`Não foi possível ler ${target}: ${error.message}`); }
  }
  const result = validateConfig(existing);
  for (const error of result.errors) warn(`Valor inválido descartado: ${error.key}`);
  return { ...result.config, setupCompleted: existing.setupCompleted === true };
}

export function saveConfig(input, warn = console.warn, directory = skillDir) {
  const checked = validateConfig(input);
  for (const error of checked.errors) warn(`Valor inválido descartado: ${error.key}`);
  const config = { ...checked.config, setupCompleted: input?.setupCompleted === true };
  fs.mkdirSync(directory, { recursive: true });
  const target = path.join(directory, "config.json");
  const temp = path.join(directory, `.config-${process.pid}-${crypto.randomBytes(6).toString("hex")}.tmp`);
  fs.writeFileSync(temp, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temp, target);
  return { config, path: target, errors: checked.errors };
}

function parseValue(option, raw) {
  if (option.type === "number") return Number(raw);
  if (option.type === "confirm") {
    if (["true", "1", "yes", "y", "sim", "s"].includes(raw.toLowerCase())) return true;
    if (["false", "0", "no", "n", "não", "nao"].includes(raw.toLowerCase())) return false;
    return raw;
  }
  return raw;
}

export function applySets(config, assignments) {
  const next = structuredClone(config);
  for (const assignment of assignments) {
    const separator = assignment.indexOf("=");
    if (separator < 1) throw new Error(`Formato inválido para --set: ${assignment}`);
    const key = assignment.slice(0, separator);
    const option = options.find(item => item.key === key);
    if (!option) throw new Error(`Opção desconhecida: ${key}`);
    setValue(next, key, parseValue(option, assignment.slice(separator + 1)));
  }
  const checked = validateConfig(next);
  if (checked.errors.length) throw new Error(`Valor inválido: ${checked.errors.map(error => error.key).join(", ")}`);
  return checked.config;
}

async function terminal() {
  const config = loadConfig();
  const interfaceRl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const option of options) {
      const current = getValue(config, option.key);
      const hint = option.choices ? ` (${option.choices.join(", ")})` : option.type === "confirm" ? " (true/false)" : ` (${option.min}-${option.max})`;
      const answer = await new Promise(resolve => interfaceRl.question(`${option.label}${hint} [${current}]: `, resolve));
      if (answer.trim()) setValue(config, option.key, parseValue(option, answer.trim()));
    }
  } finally { interfaceRl.close(); }
  saveConfig({ ...applySets(getDefaultConfig(), options.map(option => `${option.key}=${String(getValue(config, option.key))}`)), setupCompleted: true });
  console.log(`Configuração salva em: ${configFile}`);
}

function validHost(request, port) {
  return [`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host);
}

export function createServer({ port, token, directory = skillDir } = {}) {
  let inactivity;
  const resetInactivity = () => { clearTimeout(inactivity); inactivity = setTimeout(() => server.close(), 10 * 60 * 1000); inactivity.unref(); };
  const server = http.createServer((request, response) => {
    resetInactivity();
    if (!validHost(request, server.address()?.port)) { response.writeHead(403); response.end("Forbidden"); return; }
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(fs.readFileSync(path.join(directory, "scripts", "ui", "index.html"))); return;
    }
    if (request.headers["x-token"] !== token) { response.writeHead(403); response.end("Forbidden"); return; }
    if (request.method === "GET" && url.pathname === "/api/options") {
      response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify(options)); return;
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
      response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify({ config: loadConfig(console.warn, directory), defaults: getDefaultConfig(), path: path.join(directory, "config.json") })); return;
    }
    if (request.method === "POST" && ["/api/save", "/api/cancel"].includes(url.pathname)) {
      let body = "";
      request.on("data", chunk => { body += chunk; if (body.length > 100_000) request.destroy(); });
      request.on("end", () => {
        if (url.pathname === "/api/cancel") {
          response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify({ cancelled: true }));
          setTimeout(() => server.close(), 2000).unref(); return;
        }
        let payload;
        try { payload = JSON.parse(body); } catch { response.writeHead(400); response.end("JSON inválido"); return; }
        const checked = validateConfig(payload?.config);
        if (checked.errors.length) { response.writeHead(400, { "Content-Type": "application/json" }); response.end(JSON.stringify({ errors: checked.errors })); return; }
        const saved = saveConfig({ ...checked.config, setupCompleted: true }, console.warn, directory);
        response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify({ path: saved.path }));
        setTimeout(() => server.close(), 2000).unref();
      }); return;
    }
    response.writeHead(404); response.end("Not found");
  });
  server.requestTimeout = 15_000;
  resetInactivity();
  server.on("close", () => clearTimeout(inactivity));
  return server;
}

function shouldOpen() {
  return process.env.CI !== "true" && !process.env.SSH_CONNECTION && !process.env.SSH_CLIENT &&
    !(process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY);
}
function openBrowser(url) {
  const [command, args] = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  child.on("error", () => {}); child.unref();
}

function isServerReady(port) {
  return new Promise(resolve => {
    const request = http.get({ host: "127.0.0.1", port, path: "/", timeout: 500 }, response => { response.resume(); resolve(response.statusCode === 200); });
    request.on("error", () => resolve(false));
    request.on("timeout", () => { request.destroy(); resolve(false); });
  });
}

async function waitForServer(port, child, timeoutMs = 5000) {
  let exited = false;
  child.once("exit", () => { exited = true; });
  const deadline = Date.now() + timeoutMs;
  while (!exited && Date.now() < deadline) {
    if (await isServerReady(port)) return true;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return false;
}

async function launchServer(noOpen) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = crypto.randomBytes(32).toString("hex");
    const port = 20_000 + crypto.randomInt(40_000);
    const child = spawn(process.execPath, [scriptPath, "--serve", String(port), token], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
    if (!(await waitForServer(port, child))) continue;
    const url = `http://127.0.0.1:${port}/?token=${token}`;
    console.log(`Interface de configuração: ${url}`);
    if (!noOpen && shouldOpen()) openBrowser(url);
    return;
  }
  console.error("Não foi possível iniciar a interface de configuração. Use --terminal ou --set language=pt-BR.");
  process.exitCode = 1;
}

function runServer(port, token) {
  const server = createServer({ port: Number(port), token });
  server.on("error", error => { console.error(error.message); process.exitCode = 1; });
  server.listen(Number(port), "127.0.0.1");
}

async function main(args) {
  if (args[0] === "--serve") return runServer(args[1], args[2]);
  if (args[0] === "--print") { console.log(JSON.stringify(loadConfig(), null, 2)); return; }
  if (args[0] === "--defaults") { saveConfig({ ...getDefaultConfig(), setupCompleted: true }); console.log(`Configuração salva em: ${configFile}`); return; }
  const assignments = [];
  let noOpen = false; let useTerminal = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--set") { if (!args[index + 1]) throw new Error("Informe chave=valor após --set"); assignments.push(args[++index]); }
    else if (args[index] === "--no-open") noOpen = true;
    else if (args[index] === "--terminal") useTerminal = true;
    else throw new Error(`Argumento desconhecido: ${args[index]}`);
  }
  if (assignments.length) { saveConfig({ ...applySets(loadConfig(), assignments), setupCompleted: true }); console.log(`Configuração salva em: ${configFile}`); return; }
  if (useTerminal) return terminal();
  return launchServer(noOpen);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === scriptPath) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
