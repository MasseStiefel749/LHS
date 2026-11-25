// Kopiert die Web-App in einen Ordner unter apps/ – daraus bauen Desktop-App (Electron) und Android-App (Capacitor).
// Start: node apps/build-web.mjs desktop/www
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APPS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(APPS, "..");
const OUT = path.resolve(APPS, process.argv[2] || "www");
if (!OUT.startsWith(APPS + path.sep)) throw new Error("Zielordner muss unter apps/ liegen");
const FILES = ["index.html", "manifest.webmanifest", "sw.js", "LICENSE"];
const DIRS = ["css", "js", "content", "icons", "extension"];
// Geheimes oder nur für den Agenten auf diesem PC
const SKIP = /^content[\\/](bridge-token\.js|status\.json|auftraege|\.agent-running)/;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
for (const d of DIRS)
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), {
    recursive: true,
    filter: (src) => !SKIP.test(path.relative(ROOT, src)),
  });
const count = fs.readdirSync(OUT, { recursive: true }).length;
console.log(`${path.relative(ROOT, OUT)} gebaut (${count} Einträge)`);
