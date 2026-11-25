// Schneller Selbsttest ohne Abhängigkeiten: node tools/check.mjs (läuft auch in CI)
// Prüft Syntax aller Skripte, doppelte globale Namen, Datei-Verweise und das Schema von content/erweiterungen.js.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), "utf8");
const list = (dir) => readdirSync(join(root, dir)).filter((f) => f.endsWith(".js")).map((f) => `${dir}/${f}`);

// 1) Syntax
const files = [...list("js"), ...list("content").filter((f) => !f.endsWith("bridge-token.js")), ...list("extension"), "sw.js", "apps/desktop/main.js"];
for (const f of files) {
  try {
    execFileSync(process.execPath, ["--check", join(root, f)], { stdio: "pipe" });
  } catch (e) {
    fail(`Syntax ${f}: ${String(e.stderr).split("\n").slice(0, 5).join(" ")}`);
  }
}
const html = read("index.html");
const inline = [...html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter((m) => !/\bsrc=/.test(m[1] || "") && !/type="(?!text\/javascript)/.test(m[1] || ""));
inline.forEach((m, i) => {
  try {
    new vm.Script(m[2], { filename: `index.html#script${i + 1}` });
  } catch (e) {
    fail(`Syntax index.html (Inline-Skript ${i + 1}): ${e.message}`);
  }
});

// 2) Eingebundene Dateien existieren (index.html und Service-Worker-Cache)
const srcs = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"#?:]+)"/g)].map((m) => m[1]);
const sw = read("sw.js");
const cached = [...sw.matchAll(/["'](\.?\/?(?:js|css|content|icons)\/[^"']+)["']/g)].map((m) => m[1].replace(/^\.?\//, ""));
for (const f of new Set([...srcs, ...cached])) if (!f.endsWith("bridge-token.js") && !existsSync(join(root, f))) fail(`Datei fehlt: ${f}`);

// 3) Doppelte globale Namen: alle klassischen Skripte teilen sich einen Scope (const/let doppelt = Absturz beim Laden)
const scripts = srcs.filter((f) => f.endsWith(".js") && existsSync(join(root, f))).map((f) => [f, read(f)]);
inline.forEach((m, i) => scripts.push([`index.html#script${i + 1}`, m[2]]));
const seen = new Map();
for (const [f, src] of scripts) {
  const body = src.replace(/^\s*["']use strict["'];?/, "");
  const indent = (body.match(/^([ \t]*)(?:async\s+)?function\s/m) || ["", ""])[1];
  const re = new RegExp(`^${indent}(?:async\\s+)?(?:function\\*?\\s+([\\w$]+)|(?:const|let|class)\\s+([\\w$]+))`, "gm");
  for (const m of body.matchAll(re)) {
    const name = m[1] || m[2];
    if (seen.has(name) && seen.get(name) !== f) fail(`Globaler Name doppelt: ${name} in ${seen.get(name)} und ${f}`);
    else seen.set(name, f);
  }
}

// 4) Schema von content/erweiterungen.js (Agent-Inhalte)
const ID = /^[A-Za-z0-9_-]{1,60}$/;
const str = (v) => typeof v === "string" && v.trim() !== "";
const strs = (v, min = 1) => Array.isArray(v) && v.length >= min && v.every(str);
const ctx = { window: {} };
try {
  vm.runInNewContext(read("content/erweiterungen.js"), ctx, { timeout: 2000 });
} catch (e) {
  fail(`erweiterungen.js lässt sich nicht ausführen: ${e.message}`);
}
const ext = ctx.window.LERNHUB_EXT;
if (ext !== undefined) {
  const bad = (where, msg) => fail(`erweiterungen.js ${where}: ${msg}`);
  const subjIds = new Set();
  (ext.subjects || []).forEach((s, si) => {
    const w = `subjects[${si}]`;
    if (!ID.test(s.id)) bad(w, `id "${s.id}" ungültig`);
    if (subjIds.has(s.id)) bad(w, `id "${s.id}" doppelt`);
    subjIds.add(s.id);
    if (!str(s.name)) bad(w, "name fehlt");
    if (s.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(s.color)) bad(w, `color "${s.color}" ist kein #rrggbb`);
    const topicIds = new Set();
    (s.topics || []).forEach((t, ti) => {
      const tw = `${w}.topics[${ti}] (${t.id})`;
      if (!ID.test(t.id)) bad(tw, "id ungültig");
      if (topicIds.has(t.id)) bad(tw, "id doppelt");
      topicIds.add(t.id);
      if (!str(t.name)) bad(tw, "name fehlt");
      (t.mc || []).forEach((q, i) => {
        if (!str(q.q) || !strs(q.c, 2) || q.c.length > 8 || !Number.isInteger(q.a) || q.a < 0 || q.a >= q.c.length) bad(tw, `mc[${i}] ungültig`);
      });
      (t.cards || []).forEach((c, i) => !(str(c.f) && str(c.b)) && bad(tw, `cards[${i}] braucht f und b`));
      (t.gaps || []).forEach((g, i) => !(str(g.t) && g.t.includes("___") && strs(g.a)) && bad(tw, `gaps[${i}] braucht t mit ___ und a[]`));
      (t.free || []).forEach((f, i) => !(str(f.q) && strs(f.a)) && bad(tw, `free[${i}] braucht q und a[]`));
    });
  });
  Object.entries(ext.sprachen || {}).forEach(([k, p]) => {
    const w = `sprachen.${k}`;
    if (!ID.test(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_"))) bad(w, "Name ungültig");
    (p.vok || []).forEach((v, i) => !(str(v.de) && str(v.en)) && bad(w, `vok[${i}] braucht de und en`));
    (p.calls || []).forEach((c, i) => {
      if (!str(c.title) || !Array.isArray(c.lines) || !c.lines.every((l) => str(l.bot) && strs(l.expect))) bad(w, `calls[${i}] ungültig`);
    });
  });
  (ext.schulen || []).forEach((s, i) => !str(s) && fail(`erweiterungen.js schulen[${i}] ungültig`));
  (ext.termine || []).forEach((t, i) => !(/^\d{4}-\d{2}-\d{2}$/.test(t.datum) && str(t.titel)) && fail(`erweiterungen.js termine[${i}] braucht datum JJJJ-MM-TT und titel`));
}

if (errors.length) {
  console.error(errors.map((e) => "✗ " + e).join("\n"));
  console.error(`\n${errors.length} Problem(e) gefunden.`);
  process.exit(1);
}
console.log(`✓ ${files.length} Dateien + ${inline.length} Inline-Skript(e) ok, ${seen.size} globale Namen eindeutig, erweiterungen.js passt zum Schema.`);
