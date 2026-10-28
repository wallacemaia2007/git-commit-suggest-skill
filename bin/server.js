import http from "node:http";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { options, getDefaultConfig, validateConfig } from "./options.js";
import { installSkill } from "./installer.js";
import { saveConfig } from "./config-store.js";

export function startServer({ root, mode = "install", destinations = [], initialConfig, port = 0, onSave, onCancel } = {}) {
  const token = crypto.randomBytes(24).toString("hex");
  const html = fs.readFileSync(path.join(root, "bin", "ui", "index.html"), "utf8");
  const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
  let timer;
  let server;
  const closeLater = callback => { clearTimeout(timer); setTimeout(() => { if (server.listening) server.close(); callback?.(); }, 2000).unref(); };
  server = http.createServer((request, response) => {
    const address = server.address();
    const allowedHost = address && [`127.0.0.1:${address.port}`, `localhost:${address.port}`].includes(request.headers.host);
    if (!allowedHost) { response.writeHead(403); response.end("Forbidden"); return; }
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/") { response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); response.end(html); return; }
    if (request.headers["x-token"] !== token) { response.writeHead(403); response.end("Forbidden"); return; }
    if (request.method === "GET" && url.pathname === "/api/options") { response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify(options)); return; }
    if (request.method === "GET" && url.pathname === "/api/state") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ config: initialConfig ?? getDefaultConfig(), defaults: getDefaultConfig(), destinations, mode, version }));
      return;
    }
    if (request.method === "POST" && ["/api/save", "/api/cancel"].includes(url.pathname)) {
      let body = "";
      request.on("data", chunk => { body += chunk; if (body.length > 100000) request.destroy(); });
      request.on("end", () => {
        if (url.pathname === "/api/cancel") { response.writeHead(200, { "Content-Type": "application/json" }); response.end("{}"); closeLater(onCancel); return; }
        let payload;
        try { payload = JSON.parse(body); } catch { response.writeHead(400); response.end("JSON inválido"); return; }
        if (!payload || typeof payload !== "object") { response.writeHead(400); response.end("JSON inválido"); return; }
        const checked = validateConfig(payload.config);
        if (checked.errors.length) { response.writeHead(400, { "Content-Type": "application/json" }); response.end(JSON.stringify({ errors: checked.errors })); return; }
        const requested = Array.isArray(payload.destinations) ? payload.destinations : destinations.filter(destination => destination.selected);
        const chosen = [];
        for (const item of requested) {
          const match = destinations.find(destination => destination.id === item?.id);
          if (match && !chosen.includes(match)) chosen.push(match);
        }
        if (!chosen.length) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ errors: [{ key: "destinations", value: "empty" }] }));
          return;
        }
        try {
          const installed = mode === "install" ? installSkill(path.join(root, "skills", "git-commit-suggest"), chosen) : chosen;
          const saved = installed.map(destination => saveConfig(destination.skillDir, checked.config).path);
          response.writeHead(200, { "Content-Type": "application/json" }); response.end(JSON.stringify({ paths: saved }));
          closeLater(() => onSave?.(saved));
        } catch (error) { response.writeHead(500); response.end(error.message); }
      });
      return;
    }
    response.writeHead(404); response.end("Not found");
  });
  server.listen(port, "127.0.0.1", () => {
    const address = server.address();
    timer = setTimeout(() => server.close(), 10 * 60 * 1000);
    timer.unref();
    server.url = `http://127.0.0.1:${address.port}/?token=${token}`;
    server.token = token;
  });
  server.on("close", () => clearTimeout(timer));
  return server;
}
