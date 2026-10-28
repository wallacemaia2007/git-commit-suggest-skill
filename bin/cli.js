#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { detectDestinations, installSkill } from "./installer.js";
import { setValue, validateConfig } from "./options.js";
import { loadConfig, saveConfig } from "./config-store.js";
import { promptConfig } from "./terminal.js";
import { startServer } from "./server.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "skills", "git-commit-suggest");
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;

function help() {
  console.log(`git-commit-suggest ${version}

Usage: npx git-commit-suggest [config] [options]
  --yes       install/configure with the current values without opening the interface
  --lang CODE set language (en, pt-BR, es, fr, it, de)
  --global / --project choose installation scope
  --no-open   print the URL without opening a browser
  --terminal  configure with terminal prompts
  --port N    use a specific port`);
}

function parse(argv) {
  const result = { mode: argv[0] === "config" ? "config" : "install", flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help") { help(); process.exit(0); }
    if (arg === "--version") { console.log(version); process.exit(0); }
    if (["--yes", "--no-open", "--terminal", "--global", "--project"].includes(arg)) result.flags[arg.slice(2)] = true;
    else if (arg === "--lang" || arg === "--port") {
      const value = argv[++i];
      if (value === undefined || value.startsWith("--")) throw new Error(`Valor ausente para ${arg}`);
      result.flags[arg.slice(2)] = value;
    }
  }
  return result;
}

function scopedDestinations(all, flags) {
  const scope = flags.global ? "global" : flags.project ? "project" : null;
  return scope ? all.filter(destination => destination.scope === scope) : all;
}

function primaryDestination(destinations) {
  return destinations.find(destination => destination.exists) || destinations[0];
}

function includeRepositorySource(destinations, mode) {
  if (mode !== "config" || path.resolve(process.cwd()) !== path.resolve(root)) return destinations;
  const source = { id: "source", scope: "project", label: "Repositório (skills/git-commit-suggest)", skillDir: skillRoot, exists: true };
  if (destinations.some(destination => path.resolve(destination.skillDir) === path.resolve(source.skillDir))) return destinations;
  return [source, ...destinations];
}

function forInterface(destinations, mode, primary) {
  if (mode === "config") return destinations.map(destination => ({ ...destination, selected: destination.id === primary.id }));
  const hasInstalled = destinations.some(destination => destination.exists);
  return destinations.map(destination => ({ ...destination, selected: hasInstalled ? destination.exists : destination.id === primary.id }));
}

function persist(config, destinations, mode) {
  const installed = mode === "install" ? installSkill(skillRoot, destinations) : destinations;
  for (const destination of installed) saveConfig(destination.skillDir, config);
  return installed;
}

function parsePort(value) {
  if (value === undefined) return 0;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`Porta inválida: ${value}`);
  return port;
}

function openBrowser(url) {
  if (process.env.CI === "true" || process.env.SSH_CONNECTION || !process.stdout.isTTY) return;
  if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) return;
  const [command, args] = process.platform === "win32"
    ? ["cmd", ["/c", "start", "", url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  child.on("error", () => {});
  child.unref();
}

async function main() {
  const parsed = parse(process.argv.slice(2));
  const flags = parsed.mode === "install" ? { ...parsed.flags, project: Boolean(parsed.flags.project || !parsed.flags.global) } : parsed.flags;
  const allDestinations = includeRepositorySource(detectDestinations(), parsed.mode);
  const destinations = scopedDestinations(allDestinations, flags);
  const primary = primaryDestination(destinations);
  let config = loadConfig(primary.skillDir);

  if (parsed.flags.lang) {
    setValue(config, "language", parsed.flags.lang);
    const checked = validateConfig(config);
    if (checked.errors.some(error => error.key === "language")) throw new Error(`Idioma inválido: ${parsed.flags.lang}`);
    config = checked.config;
  }

  if (parsed.flags.yes) {
    const installed = persist(config, [primary], parsed.mode);
    const label = parsed.mode === "install" ? "Instalada em" : "Configuração salva em";
    console.log(`${label}: ${installed.map(destination => destination.skillDir).join(", ")}`);
    return;
  }

  if (parsed.flags.terminal) {
    config = await promptConfig(config);
    const installed = persist(config, [primary], parsed.mode);
    const label = parsed.mode === "install" ? "Instalada em" : "Configuração salva em";
    console.log(`${label}: ${installed.map(destination => destination.skillDir).join(", ")}`);
    return;
  }

  const server = startServer({
    root,
    mode: parsed.mode,
    destinations: forInterface(destinations, parsed.mode, primary),
    initialConfig: config,
    port: parsePort(parsed.flags.port)
  });
  server.on("error", error => {
    console.error(`Não foi possível iniciar a interface: ${error.message}`);
    process.exitCode = 1;
  });
  server.on("listening", () => {
    console.log(`Interface de configuração: ${server.url}`);
    console.log("Aguardando configuração...");
    if (!parsed.flags["no-open"]) openBrowser(server.url);
  });
  process.once("SIGINT", () => server.close());
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
