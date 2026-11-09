// Lernhub-Entwicklungsserver: liefert den Ordner aus und lädt die Seite bei jeder Dateiänderung automatisch neu.
// Start: node dev-server.mjs  (oder Doppelklick auf lernhub-starten.cmd) – nur lokal erreichbar (127.0.0.1).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HOST = "127.0.0.1";
const START_PORT = Number(process.env.PORT) || 5500;
const WATCH_EXT = /\.(html|js|mjs|css|json|webmanifest|svg|png|jpe?g|webp|ico)$/i;
const IGNORE = /(^|[\\/])(\.git|node_modules|supabase|docs)([\\/]|$)/;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".ics": "text/calendar; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8"
};
const RELOAD_SNIPPET = `<script>(()=>{const es=new EventSource("/__reload");
es.addEventListener("reload",e=>{const f=e.data||"";
if(/\\.css$/i.test(f)){document.querySelectorAll('link[rel="stylesheet"]').forEach(l=>{const u=new URL(l.href);u.searchParams.set("v",Date.now());l.href=u.href;});}
else location.reload();});})();</script>`;

const clients = new Set();

function send(res, code, body, type) {
  res.writeHead(code, { "Content-Type": type || "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}`);
  if (url.pathname === "/__reload") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write("retry: 1000\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");

  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, "Bad request"); }
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(ROOT, "." + rel);
  // Kein Zugriff außerhalb des Projektordners und nicht auf versteckte Dateien (.git, .env …)
  if (!file.startsWith(ROOT + path.sep) || rel.split("/").some(p => p.startsWith("."))) return send(res, 403, "Forbidden");
  // Fremde Webseiten dürfen den Bridge-Token nicht per <script src> einbinden
  const site = req.headers["sec-fetch-site"];
  if (/bridge-token\.js$/i.test(rel) && site && site !== "same-origin" && site !== "none") return send(res, 403, "Forbidden");

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, "Nicht gefunden: " + rel);
    const ext = path.extname(file).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    if (ext === ".html") {
      fs.readFile(file, "utf8", (e, html) => {
        if (e) return send(res, 500, "Lesefehler");
        const out = html.includes("</body>") ? html.replace("</body>", RELOAD_SNIPPET + "\n</body>") : html + RELOAD_SNIPPET;
        send(res, 200, req.method === "HEAD" ? "" : out, type);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
});

let timer = null, lastFile = "";
fs.watch(ROOT, { recursive: true }, (_evt, name) => {
  if (!name || IGNORE.test(name) || !WATCH_EXT.test(name) || /dev-server\.mjs$/.test(name)) return;
  lastFile = name;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const f = lastFile.replace(/\\/g, "/");
    console.log(`[${new Date().toLocaleTimeString("de-DE")}] geändert: ${f} → Seite lädt neu (${clients.size} Tab${clients.size === 1 ? "" : "s"})`);
    for (const c of clients) c.write(`event: reload\ndata: ${f}\n\n`);
  }, 150);
});

// Hält die Verbindung offen, falls ein Proxy/Virenscanner inaktive Streams kappt
setInterval(() => { for (const c of clients) c.write(": ping\n\n"); }, 25000);

function listen(port) {
  server.once("error", err => {
    if (err.code === "EADDRINUSE" && port < START_PORT + 20) return listen(port + 1);
    console.error("Server-Fehler:", err.message);
    process.exit(1);
  });
  server.listen(port, HOST, () => {
    const addr = `http://${HOST}:${port}/`;
    console.log(`\n  Lernhub läuft auf ${addr}\n  Änderungen an HTML/JS/CSS laden die Seite automatisch neu. Beenden: Strg+C\n`);
    if (process.argv.includes("--open")) {
      import("node:child_process").then(({ spawn }) => spawn("cmd", ["/c", "start", "", addr], { detached: true, stdio: "ignore" }).unref());
    }
  });
}
listen(START_PORT);
