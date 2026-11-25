/* 💻 Code im Arbeitsplatz: Monaco (der Editor aus VS Code) am PC, einfacher Editor am Handy.
   HTML/CSS/JS laufen in einer abgeschotteten Vorschau (kein Zugriff auf Lernhub-Daten), Python im Browser (Pyodide),
   Java, C, C# & Co. über den eingebetteten OneCompiler. Ganze Projekte lassen sich in StackBlitz öffnen. */
const WS_MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
const WS_MONACO_SRI = "sha384-pHG02SG8pId94Np3AbPmBEJ1yPqaH0IkJGLSNGXYmuGhkazT8Lr/57WYpbkGjJtu";
const WS_PY_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";
const WS_PY_LIMIT = 20000;
const WS_LANG = {
  js: "javascript", mjs: "javascript", ts: "typescript", html: "html", htm: "html", css: "css", py: "python",
  java: "java", c: "c", h: "c", cpp: "cpp", cs: "csharp", json: "json", md: "markdown", sql: "sql", php: "php",
  xml: "xml", go: "go", rs: "rust", kt: "kotlin", rb: "ruby", sh: "shell", txt: "plaintext",
  lua: "lua", swift: "swift", scala: "scala", pl: "perl", r: "r", jl: "julia", hs: "plaintext",
};
// Was der Browser nicht selbst ausführen kann, kompiliert Wandbox (freier Online-Compiler) – die Ausgabe landet in der Konsole
const WS_WB = "https://wandbox.org/api";
const WS_WB_LANG = {
  java: ["Java"], c: ["C"], cpp: ["C++"], cs: ["C#", /^mono/], go: ["Go"], rs: ["Rust"], rb: ["Ruby"], php: ["PHP"],
  ts: ["TypeScript"], sql: ["SQL"], sh: ["Bash script"], lua: ["Lua"], swift: ["Swift"], scala: ["Scala"], hs: ["Haskell"],
  pl: ["Perl"], r: ["R"], jl: ["Julia"],
};
let WS_WB_LIST = null;
// Ersatz, falls Wandbox nicht erreichbar ist (und für Kotlin): der eingebettete OneCompiler
const WS_OC = { java: "java", c: "c", cpp: "cpp", cs: "csharp", go: "go", rs: "rust", kt: "kotlin", rb: "ruby", php: "php", ts: "typescript", sql: "mysql", sh: "bash" };
const WS_CODE = { ed: null, ta: null, frame: null, token: "", out: [], py: null, pyT: 0, wait: null, waitT: 0 };
const WS_CODE_START = {
  "index.html": `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Mein Projekt</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hallo Lernhub! 👋</h1>
  <button id="knopf">Klick mich</button>
  <p id="ausgabe"></p>
  <script src="script.js"></script>
</body>
</html>
`,
  "style.css": `body {
  font-family: system-ui, sans-serif;
  padding: 24px;
  background: #f4f5fb;
}
button {
  background: #7c5cff;
  color: white;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 16px;
}
`,
  "script.js": `let klicks = 0;
document.getElementById("knopf").addEventListener("click", () => {
  klicks++;
  document.getElementById("ausgabe").textContent = \`Du hast \${klicks}× geklickt\`;
  console.log("Klick Nummer", klicks);
});
`,
  "main.py": `namen = ["Ada", "Linus", "Grace"]
for name in namen:
    print(f"Hallo {name}!")
`,
  "Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hallo aus Java!");
    }
}
`,
};
let WS_MONACO = null;

function wsFileOk(n) {
  return /^[\w-][\w.-]{0,59}$/.test(n) && !(n in Object.prototype);
}
function wsFileExt(n) {
  return (String(n).split(".").pop() || "").toLowerCase();
}
function wsCodeData() {
  const d = wsData("code");
  if (!d.files || typeof d.files !== "object" || Array.isArray(d.files)) d.files = {};
  Object.keys(d.files).forEach((k) => {
    if (!wsFileOk(k) || typeof d.files[k] !== "string") delete d.files[k];
  });
  if (!Object.keys(d.files).length) d.files = Object.assign({}, WS_CODE_START);
  if (typeof d.cur !== "string" || !Object.prototype.hasOwnProperty.call(d.files, d.cur)) d.cur = Object.keys(d.files)[0];
  if (typeof d.stdin !== "string") d.stdin = "";
  return d;
}

/* ---------- Editor ---------- */
function wsMonaco() {
  if (window.monaco && monaco.editor) return Promise.resolve(window.monaco);
  if (WS_MONACO) return WS_MONACO;
  WS_MONACO = Promise.race([
    docScript(WS_MONACO_BASE + "/vs/loader.js", WS_MONACO_SRI).then(
    () =>
      new Promise((res, rej) => {
        window.MonacoEnvironment = {
          getWorkerUrl: () =>
            URL.createObjectURL(
              new Blob(
                [`self.MonacoEnvironment={baseUrl:${JSON.stringify(WS_MONACO_BASE + "/")}};importScripts(${JSON.stringify(WS_MONACO_BASE + "/vs/base/worker/workerMain.js")});`],
                { type: "text/javascript" },
              ),
            ),
        };
        window.require.config({ paths: { vs: WS_MONACO_BASE + "/vs" } });
        window.require(["vs/editor/editor.main"], () => res(window.monaco), rej);
      }),
    ),
    new Promise((res, rej) => setTimeout(() => rej(new Error("Zeitüberschreitung")), 20000)),
  ]);
  WS_MONACO.catch(() => (WS_MONACO = null));
  return WS_MONACO;
}
function wsCodeEditor() {
  const host = $("wcEd");
  if (!host) return;
  const d = wsCodeData();
  wsCodeDispose();
  if (d.simple || matchMedia("(pointer: coarse)").matches) return wsCodeTextarea(host);
  host.innerHTML = `<div class="wcload small mut">VS-Code-Editor wird geladen …</div>`;
  wsMonaco()
    .then((m) => {
      if ($("wcEd") !== host || WS_CODE.ed) return;
      host.innerHTML = "";
      WS_CODE.ed = m.editor.create(host, {
        value: d.files[d.cur],
        language: WS_LANG[wsFileExt(d.cur)] || "plaintext",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: true, scale: 1, renderCharacters: false },
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', monospace",
        renderLineHighlight: "all",
        bracketPairColorization: { enabled: true },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        tabSize: 2,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      });
      WS_CODE.ed.onDidChangeModelContent(() => wsCodeChanged(WS_CODE.ed.getValue()));
      WS_CODE.ed.onDidChangeCursorPosition((e) => {
        const p = $("wcPos");
        if (p) p.textContent = `Zeile ${e.position.lineNumber}, Spalte ${e.position.column}`;
      });
      WS_CODE.ed.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => wsCodeRun());
    })
    .catch(() => {
      if ($("wcEd") === host) wsCodeTextarea(host, "VS-Code-Editor nicht erreichbar (offline?) – einfacher Editor aktiv.");
    });
}
function wsCodeTextarea(host, note) {
  const d = wsCodeData();
  host.innerHTML = `${note ? `<div class="small mut" style="padding:4px 8px">${esc(note)}</div>` : ""}<textarea class="wcta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code"></textarea>`;
  const ta = host.querySelector("textarea");
  ta.value = d.files[d.cur];
  ta.addEventListener("input", () => wsCodeChanged(ta.value));
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      wsCodeRun();
    }
  });
  WS_CODE.ta = ta;
}
function wsCodeDispose() {
  if (WS_CODE.ed) {
    try {
      WS_CODE.ed.getModel().dispose();
      WS_CODE.ed.dispose();
    } catch (e) {}
  }
  WS_CODE.ed = null;
  WS_CODE.ta = null;
}
function wsCodeChanged(v) {
  const d = wsCodeData();
  d.files[d.cur] = v;
  wsSave();
}
function wsCodeValue(v) {
  const d = wsCodeData();
  if (WS_CODE.ed) {
    if (WS_CODE.ed.getValue() !== v) WS_CODE.ed.setValue(v);
    window.monaco.editor.setModelLanguage(WS_CODE.ed.getModel(), WS_LANG[wsFileExt(d.cur)] || "plaintext");
  } else if (WS_CODE.ta) WS_CODE.ta.value = v;
}
// Dateisymbole wie im VS-Code-Standardthema (Seti)
const WS_FICON = {
  js: ["JS", "#cbcb41"], mjs: ["JS", "#cbcb41"], ts: ["TS", "#519aba"], py: ["PY", "#519aba"], html: ["<>", "#e37933"], htm: ["<>", "#e37933"],
  css: ["#", "#519aba"], json: ["{}", "#cbcb41"], md: ["M↓", "#519aba"], java: ["J", "#cc3e44"], c: ["C", "#519aba"], cpp: ["C+", "#a074c4"],
  h: ["H", "#a074c4"], cs: ["C#", "#8dc149"], go: ["GO", "#519aba"], rs: ["RS", "#e37933"], php: ["php", "#a074c4"], kt: ["K", "#e37933"],
  rb: ["RB", "#cc3e44"], sql: ["DB", "#f55385"], sh: ["$", "#4d5a5e"], lua: ["LUA", "#519aba"], swift: ["SW", "#e37933"], txt: ["≡", "#8a8a8a"],
};
function wsCodeIcon(n) {
  const f = WS_FICON[wsFileExt(n)] || ["≡", "#8a8a8a"];
  return `<i class="vsc-fi" style="color:${f[1]}">${esc(f[0])}</i>`;
}
function wsCodeFiles() {
  const el = $("wcFiles");
  if (!el) return;
  const d = wsCodeData();
  const names = Object.keys(d.files);
  el.innerHTML = names
    .map((n) => `<button class="${n === d.cur ? "on" : ""}" data-f="${esc(n)}" onclick="wsCodeOpen(this.dataset.f)" title="${esc(n)}">${wsCodeIcon(n)}${esc(n)}</button>`)
    .join("");
  const tr = $("wcTree");
  if (tr)
    tr.innerHTML = names
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((n) => `<button class="${n === d.cur ? "on" : ""}" data-f="${esc(n)}" onclick="wsCodeOpen(this.dataset.f)" title="${esc(n)}">${wsCodeIcon(n)}<span>${esc(n)}</span></button>`)
      .join("");
  const cr = $("wcCrumb");
  if (cr) cr.innerHTML = `projekt <span>›</span> ${wsCodeIcon(d.cur)}${esc(d.cur)}`;
  const lg = $("wcLang");
  if (lg) lg.textContent = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", html: "HTML", css: "CSS", json: "JSON", java: "Java", markdown: "Markdown", csharp: "C#", cpp: "C++", c: "C", go: "Go", rust: "Rust", php: "PHP", sql: "SQL", plaintext: "Nur-Text" }[WS_LANG[wsFileExt(d.cur)] || "plaintext"] || WS_LANG[wsFileExt(d.cur)];
  const on = el.querySelector("button.on");
  if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
}
function wsCodeToggle(k) {
  const root = document.querySelector(".vsc");
  if (!root) return;
  const d = wsCodeData();
  const off = !root.classList.toggle(k === "side" ? "noside" : "nopanel");
  d[k] = off;
  wsSave();
  if (WS_CODE.ed) setTimeout(() => WS_CODE.ed && WS_CODE.ed.layout(), 30);
}
function wsCodeQuick() {
  const d = wsCodeData();
  toastModal(`<div class="wsp-menu"><input class="fi" id="wcQ" placeholder="Dateinamen eingeben, um zu suchen" autocomplete="off"
    oninput="const q=this.value.toLowerCase();document.querySelectorAll('#wcQL button').forEach(b=>b.hidden=!b.dataset.f.toLowerCase().includes(q))"
    onkeydown="if(event.key==='Enter'){const b=[...document.querySelectorAll('#wcQL button')].find(x=>!x.hidden);if(b)b.click()}">
    <div id="wcQL">${Object.keys(d.files).map((n) => `<button data-f="${esc(n)}" onclick="closeModal();wsCodeOpen(this.dataset.f)" style="width:100%">${wsCodeIcon(n)} ${esc(n)}</button>`).join("")}</div></div>`);
  setTimeout(() => $("wcQ") && $("wcQ").focus(), 50);
}
function wsCodeOpen(n) {
  const d = wsCodeData();
  if (!Object.prototype.hasOwnProperty.call(d.files, n)) return;
  d.cur = n;
  wsCodeValue(d.files[n]);
  wsCodeFiles();
  wsSave();
}
function wsCodeNew(name, content) {
  const d = wsCodeData();
  const n = name || (prompt("Dateiname (z. B. app.js, rechner.py, Main.java):", "") || "").trim();
  if (!n) return false;
  if (!wsFileOk(n)) {
    toast("Nur Buchstaben, Zahlen, Punkt, - und _ (max. 60 Zeichen)");
    return false;
  }
  if (Object.keys(d.files).length >= 40 && !d.files[n]) {
    toast("Höchstens 40 Dateien");
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(d.files, n)) d.files[n] = content || "";
  wsCodeOpen(n);
  return true;
}

/* ---------- Ausführen ---------- */
function wsCodeOutBody(html) {
  const o = $("wcOut");
  if (o) o.innerHTML = html;
  return o;
}
function wsCodeOut(t, s) {
  WS_CODE.out.push([t, s]);
  if (WS_CODE.out.length > 300) WS_CODE.out.shift();
  const c = $("wcCon");
  if (!c) return;
  const line = document.createElement("div");
  line.className = "wcl " + t;
  line.textContent = s;
  c.appendChild(line);
  c.scrollTop = c.scrollHeight;
}
function wsCodeClear() {
  WS_CODE.out = [];
  const c = $("wcCon");
  if (c) c.textContent = "";
}
function wsCodeDone() {
  clearTimeout(WS_CODE.waitT);
  const b = $("wcRun");
  if (b) b.disabled = false;
  const r = WS_CODE.wait;
  WS_CODE.wait = null;
  if (r) r(WS_CODE.out.map((x) => (x[0] === "error" ? "FEHLER: " : x[0] === "info" ? "" : "") + x[1]).join("\n").slice(-3000) || "(keine Ausgabe)");
}
function wsCodeRun(name) {
  const d = wsCodeData();
  if (name && Object.prototype.hasOwnProperty.call(d.files, name)) wsCodeOpen(name);
  const f = d.cur,
    ext = wsFileExt(f);
  if (WS_CODE.wait) wsCodeDone();
  WS_CODE.out = [];
  const p = new Promise((res) => (WS_CODE.wait = res));
  const b = $("wcRun");
  if (b) b.disabled = true;
  if (ext === "py") wsCodePy(d.files[f], d.stdin);
  else if (WS_WB_LANG[ext]) wsCodeWb(f, d.files[f], ext, d.stdin);
  else if (WS_OC[ext]) wsCodeOC(f, d.files[f], ext);
  else if (/^(html?|css|m?js)$/.test(ext)) wsCodeWeb(d, f, ext);
  else {
    wsCodeOutBody(`<pre class="wcpre" id="wcCon"></pre>`);
    wsCodeOut("info", `.${ext}-Dateien kann ich nicht ausführen – HTML, CSS, JavaScript, Python, Java, C, C++, C#, Go, Rust, PHP, Kotlin, Ruby, TypeScript, SQL, Bash, Lua, Swift, Scala, Haskell, Perl, R und Julia gehen.`);
    wsCodeDone();
  }
  return p;
}
function wsCodeWeb(d, f, ext) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  WS_CODE.token = token;
  const hook = `<script>(function(){var T=${JSON.stringify(token)};function s(t,a){try{parent.postMessage({lhRun:T,t:t,s:Array.prototype.map.call(a,function(x){if(x instanceof Error)return x.message;try{return typeof x==="object"&&x!==null?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}}["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){s(k,arguments);try{o.apply(console,arguments)}catch(e){}}});addEventListener("error",function(e){s("error",[e.message+(e.lineno?" (Zeile "+e.lineno+")":"")])});addEventListener("unhandledrejection",function(e){s("error",["Promise: "+(e.reason&&e.reason.message||e.reason)])});addEventListener("load",function(){setTimeout(function(){s("done",[])},400)})})();<\/script>`;
  const inl = (s) => String(s).replace(/<\/script/gi, "<\\/script");
  const html = d.files["index.html"];
  const page = typeof html === "string" && (!/^m?js$/.test(ext) || html.includes(f));
  let doc;
  if (page) {
    doc = html
      .replace(/<link\b[^>]*href=["']?(?:\.\/)?([\w.-]+\.css)["']?[^>]*>/gi, (m, n) =>
        Object.prototype.hasOwnProperty.call(d.files, n) ? `<style>${d.files[n].replace(/<\/style/gi, "<\\/style")}</style>` : m,
      )
      .replace(/<script\b([^>]*?)\bsrc=["']?(?:\.\/)?([\w.-]+\.m?js)["']?([^>]*)>\s*<\/script>/gi, (m, a, n, b) =>
        Object.prototype.hasOwnProperty.call(d.files, n)
          ? `<script${/type=["']?module/i.test(a + b) ? ' type="module"' : ""}>${inl(d.files[n])}<\/script>`
          : m,
      );
    doc = /<head\b[^>]*>/i.test(doc) ? doc.replace(/<head\b[^>]*>/i, (h) => h + hook) : hook + doc;
  } else doc = `<!DOCTYPE html><meta charset="utf-8">${hook}<script>${inl(d.files[f])}<\/script>`;
  wsCodeOutBody(
    `<iframe class="wcframe${page ? "" : " hide"}" sandbox="allow-scripts allow-modals allow-forms" title="Vorschau"></iframe><pre class="wcpre${page ? "" : " tall"}" id="wcCon"></pre>`,
  );
  const fr = $("wcOut").querySelector("iframe");
  WS_CODE.frame = fr;
  $("wcOutT").textContent = page ? "Vorschau & Konsole" : "Konsole";
  fr.srcdoc = doc;
  WS_CODE.waitT = setTimeout(wsCodeDone, 5000);
}
window.addEventListener("message", (e) => {
  const m = e.data;
  if (!m || !WS_CODE.token || m.lhRun !== WS_CODE.token || !WS_CODE.frame || e.source !== WS_CODE.frame.contentWindow) return;
  if (m.t === "done") return wsCodeDone();
  wsCodeOut(/^(log|info|warn|error)$/.test(m.t) ? m.t : "log", String(m.s).slice(0, 2000));
});
function wsPyWorker() {
  const src = `importScripts(${JSON.stringify(WS_PY_BASE + "pyodide.js")});
var ready = loadPyodide({ indexURL: ${JSON.stringify(WS_PY_BASE)} }).then(function (p) {
  p.setStdout({ batched: function (s) { postMessage({ t: "log", s: s }); } });
  p.setStderr({ batched: function (s) { postMessage({ t: "error", s: s }); } });
  return p;
});
onmessage = async function (e) {
  try {
    var p = await ready;
    postMessage({ t: "ready" });
    var lines = String(e.data.stdin || "").split("\\n");
    if (lines[lines.length - 1] === "") lines.pop();
    p.setStdin({ stdin: function () { return lines.length ? lines.shift() : undefined; } });
    await p.loadPackagesFromImports(e.data.code);
    await p.runPythonAsync(e.data.code);
  } catch (x) {
    var m = String((x && x.message) || x);
    postMessage({ t: "error", s: /EOFError/.test(m) ? "input() braucht Eingaben – trag sie unter ⌨️ Eingabe ein (eine pro Zeile)." : m.split("\\n").slice(-6).join("\\n") });
  }
  postMessage({ t: "done" });
};`;
  const w = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
  w.onmessage = (e) => {
    const m = e.data || {};
    if (m.t === "ready") {
      clearTimeout(WS_CODE.pyT);
      WS_CODE.pyT = setTimeout(() => {
        wsCodeOut("error", `⏱️ Abgebrochen – läuft länger als ${WS_PY_LIMIT / 1000} s (Endlosschleife?)`);
        w.terminate();
        WS_CODE.py = null;
        wsCodeDone();
      }, WS_PY_LIMIT);
      const c = $("wcCon");
      if (c && c.firstChild && c.firstChild.classList.contains("load")) c.firstChild.remove();
    } else if (m.t === "done") {
      clearTimeout(WS_CODE.pyT);
      wsCodeDone();
    } else wsCodeOut(m.t === "error" ? "error" : "log", String(m.s).slice(0, 3000));
  };
  w.onerror = () => {
    wsCodeOut("error", "Python konnte nicht geladen werden – bist du online?");
    WS_CODE.py = null;
    wsCodeDone();
  };
  return w;
}
function wsCodePy(code, stdin) {
  wsCodeOutBody(`<pre class="wcpre tall" id="wcCon"></pre>`);
  $("wcOutT").textContent = "Python";
  if (!WS_CODE.py) {
    WS_CODE.py = wsPyWorker();
    WS_CODE.out = [];
    const c = $("wcCon");
    c.innerHTML = `<div class="wcl info load">🐍 Python wird geladen (beim ersten Mal ca. 10 MB) …</div>`;
  }
  WS_CODE.py.postMessage({ code, stdin: stdin || "" });
}
async function wsWbCompiler(ext) {
  if (!WS_WB_LIST)
    WS_WB_LIST = fetch(WS_WB + "/list.json")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .catch((e) => {
        WS_WB_LIST = null;
        throw e;
      });
  const [lang, pref] = WS_WB_LANG[ext];
  const list = (await WS_WB_LIST).filter((c) => c && c.language === lang && !/head/.test(c.name));
  const c = (pref && list.find((x) => pref.test(x.name))) || list[0];
  if (!c) throw new Error(lang + " gibt es dort gerade nicht");
  return c.name;
}
async function wsCodeWb(f, code, ext, stdin) {
  wsCodeOutBody(`<pre class="wcpre tall" id="wcCon"></pre>`);
  $("wcOutT").textContent = "Konsole";
  wsCodeOut("info", `⚙️ ${f} wird online kompiliert (Wandbox) …`);
  // Wandbox speichert als prog.java – öffentliche Klassen müssten sonst genauso heißen
  if (ext === "java") code = code.replace(/^public\s+(?=(?:final\s+|abstract\s+|sealed\s+)*(?:class|interface|enum|record)\b)/gm, "");
  const tok = (WS_CODE.token = "wb" + Date.now());
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 45000);
  try {
    const r = await fetch(WS_WB + "/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler: await wsWbCompiler(ext), code, stdin: String(stdin || "").slice(0, 20000) }),
      signal: ac.signal,
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (WS_CODE.token !== tok) return;
    WS_CODE.out = [];
    const c = $("wcCon");
    if (c) c.textContent = "";
    const put = (kind, s) => String(s || "").replace(/\n$/, "").split("\n").slice(0, 400).forEach((l) => l && wsCodeOut(kind, l.slice(0, 2000)));
    put("error", j.compiler_error);
    put("log", j.program_output);
    put("error", j.program_error);
    if (j.signal) wsCodeOut("error", "⏱️ Abgebrochen (" + j.signal + ") – zu lange gelaufen oder zu viel Speicher?");
    else if (String(j.status) !== "0") wsCodeOut("info", "Beendet mit Code " + j.status);
    else if (!j.program_output) wsCodeOut("info", "✅ Fertig (keine Ausgabe)");
    wsCodeDone();
  } catch (e) {
    if (WS_CODE.token !== tok) return;
    if (WS_OC[ext]) return wsCodeOC(f, code, ext);
    wsCodeOut("error", "Online-Compiler nicht erreichbar (" + (e.name === "AbortError" ? "Zeitüberschreitung" : e.message) + ") – bist du online?");
    wsCodeDone();
  } finally {
    clearTimeout(t);
  }
}
function wsCodeStdin(v) {
  wsCodeData().stdin = String(v).slice(0, 20000);
  wsSave();
}
function wsCodeStdinToggle() {
  const b = $("wcInBox");
  if (!b) return;
  b.hidden = !b.hidden;
  if (!b.hidden) b.querySelector("textarea").focus();
}
function wsCodeOC(f, code, ext) {
  const dark = document.body.classList.contains("dark") ? "&theme=dark" : "";
  wsCodeOutBody(
    `<iframe class="wcframe tall" src="https://onecompiler.com/embed/${WS_OC[ext]}?listenToEvents=true&hideLanguageSelection=true&hideNew=true&hideTitle=true&hideNewFileOption=true${dark}" title="OneCompiler" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer"></iframe>`,
  );
  $("wcOutT").textContent = "OneCompiler";
  const fr = $("wcOut").querySelector("iframe");
  fr.onload = () => {
    fr.contentWindow.postMessage({ eventType: "populateCode", language: WS_OC[ext], files: [{ name: f, content: code }] }, "https://onecompiler.com");
    setTimeout(() => fr.contentWindow && fr.contentWindow.postMessage({ eventType: "triggerRun" }, "https://onecompiler.com"), 700);
  };
  WS_CODE.out = [["info", "Läuft im eingebetteten OneCompiler – die Ausgabe steht dort (die KI sieht sie nicht)."]];
  setTimeout(wsCodeDone, 300);
}

/* ---------- Dateien & Werkzeuge ---------- */
const WS_IDES = [
  ["☕", "Java-IDE (JDoodle)", "https://www.jdoodle.com/online-java-compiler"],
  ["🧩", "OneCompiler (60+ Sprachen)", "https://onecompiler.com/embed/java"],
  ["📓", "JupyterLite (Python-Notebooks)", "https://jupyter.org/try-jupyter/lab/"],
  ["🔌", "Wokwi (Arduino & ESP32)", "https://wokwi.com/"],
  ["🔍", "Python Tutor (Code Schritt für Schritt)", "https://pythontutor.com/visualize.html"],
];
const WS_IDES_TAB = [
  ["🟦", "vscode.dev", "https://vscode.dev/", "Echtes VS Code im Browser"],
  ["🟣", "Eclipse Theia", "https://try.theia-cloud.io/", "Browser-IDE der Eclipse Foundation"],
  ["🐙", "GitHub Codespaces", "https://github.com/codespaces", "VS Code mit Linux-Rechner in der Cloud"],
  ["🔁", "Replit", "https://replit.com/", "Online-IDE für viele Sprachen"],
  ["📊", "Google Colab", "https://colab.research.google.com/", "Python-Notebooks mit Grafikkarte"],
];
function wsCodeMenu() {
  const d = wsCodeData();
  toastModal(`<h2 style="margin-top:0">💻 ${esc(d.cur)}</h2>
    <div class="wsmenu">
      <button class="btn ghost sm" onclick="closeModal();wsCodeRename()">✏️ Umbenennen</button>
      <button class="btn ghost sm" onclick="closeModal();wsCodeDel()">🗑️ Löschen</button>
      <button class="btn ghost sm" onclick="wsCodeDl()">⬇️ Datei herunterladen</button>
      <button class="btn ghost sm" onclick="wsCodeZip()">📦 Alle als ZIP</button>
      <button class="btn ghost sm" onclick="$('wcImp').click()">📂 Dateien öffnen</button>
      <button class="btn ghost sm" onclick="closeModal();wsCodeMode()">${d.simple ? "🧩 VS-Code-Editor" : "📝 Einfacher Editor"}</button>
    </div>
    <input type="file" id="wcImp" hidden multiple onchange="wsCodeImport(this)">
    <h3>Andere IDEs im Arbeitsplatz</h3>
    <div class="wsmenu">
      <button class="btn ghost sm" onclick="closeModal();wsCodeStackblitz()">⚡ Projekt in StackBlitz öffnen</button>
      ${WS_IDES.map((x, i) => `<button class="btn ghost sm" onclick="closeModal();wsOpen('web',{url:WS_IDES[${i}][2]})">${x[0]} ${esc(x[1])}</button>`).join("")}
    </div>
    <h3>Im neuen Tab (lassen sich nicht einbetten)</h3>
    <div class="wsmenu">
      ${WS_IDES_TAB.map((x) => `<a class="btn ghost sm" href="${esc(x[2])}" target="_blank" rel="noopener" title="${esc(x[3])}">${x[0]} ${esc(x[1])} ↗</a>`).join("")}
    </div>
    <p class="small mut">▶ Ausführen schickt Java, C, C#, Go & Co. an den freien Online-Compiler Wandbox – Python und Web laufen direkt im Browser.
    Eingebettete IDEs bekommen nur, was du dort eintippst. vscode.dev ist echtes VS Code (auch mit Ordnern von deinem PC); Eclipse Theia ist die Browser-IDE der Eclipse Foundation (Login nötig).</p>
    <button class="btn ghost sm" onclick="closeModal()">Schließen</button>`);
}
function wsCodeRename() {
  const d = wsCodeData();
  const n = (prompt("Neuer Name:", d.cur) || "").trim();
  if (!n || n === d.cur) return;
  if (!wsFileOk(n)) return toast("Ungültiger Dateiname");
  if (Object.prototype.hasOwnProperty.call(d.files, n)) return toast("Den Namen gibt es schon");
  d.files[n] = d.files[d.cur];
  delete d.files[d.cur];
  d.cur = n;
  wsCodeOpen(n);
}
function wsCodeDel() {
  const d = wsCodeData();
  if (!confirm(`„${d.cur}“ wirklich löschen?`)) return;
  delete d.files[d.cur];
  wsCodeData();
  wsCodeOpen(d.cur);
}
function wsCodeDl() {
  const d = wsCodeData();
  wsDownload(new Blob([d.files[d.cur]], { type: "text/plain;charset=utf-8" }), d.cur);
}
function wsCodeZip() {
  const d = wsCodeData();
  wsDownload(wsZip(Object.keys(d.files).map((n) => ({ name: n, data: d.files[n] }))), "projekt.zip");
}
async function wsCodeImport(inp) {
  const fs = [...(inp.files || [])].slice(0, 20);
  inp.value = "";
  let n = 0;
  for (const f of fs) {
    if (f.size > 1e6) {
      toast(`${f.name} ist zu groß (max. 1 MB)`);
      continue;
    }
    const name = f.name.replace(/[^\w.-]/g, "_").slice(0, 60);
    if (wsCodeNew(name)) {
      wsCodeData().files[name] = await f.text();
      n++;
    }
  }
  closeModal();
  wsCodeOpen(wsCodeData().cur);
  if (n) toast(`📂 ${n} Datei(en) geöffnet`);
}
function wsCodeMode() {
  const d = wsCodeData();
  d.simple = !d.simple;
  wsSave();
  wsCodeEditor();
}
function wsCodeStackblitz() {
  const d = wsCodeData();
  const w = wsOpen("web", { url: "lh:stackblitz" });
  if (!w) return;
  WS_WEB_POST[w.id] = {
    action: "https://stackblitz.com/run?embed=1&file=" + encodeURIComponent(d.cur),
    fields: Object.assign(
      {
        "project[title]": "Lernhub-Projekt",
        "project[description]": "Aus dem Lernhub-Arbeitsplatz",
        "project[template]": d.files["index.html"] != null ? "html" : "node",
      },
      Object.fromEntries(Object.keys(d.files).map((n) => [`project[files][${n}]`, d.files[n]])),
    ),
  };
  wsWebMount(w, document.querySelector(`#${w.id} .wsbody`));
}

/* ---------- Für die KI ---------- */
async function wsCodeWrite(name, content) {
  if (!wsFileOk(name)) return `⚠️ Ungültiger Dateiname „${name}“`;
  const w = wsOpen("code");
  if (!w) return "⚠️ Code-Fenster geht nicht auf";
  const d = wsCodeData();
  if (!Object.prototype.hasOwnProperty.call(d.files, name)) wsCodeNew(name, "");
  else wsCodeOpen(name);
  await new Promise((r) => setTimeout(r, 60));
  await wsCursor($("wcEd") || document.getElementById(w.id), "KI schreibt " + name);
  const text = String(content).slice(0, 100000);
  await wsTypeInto((t) => {
    d.files[name] = t;
    if (d.cur === name) wsCodeValue(t);
  }, text);
  wsSave();
  return `✅ ${name} geschrieben (${text.split("\n").length} Zeilen)`;
}
async function wsCodeRunAi(name, stdin) {
  const w = wsOpen("code");
  if (!w) return "⚠️ Code-Fenster geht nicht auf";
  if (typeof stdin === "string" && stdin) {
    wsCodeStdin(stdin);
    const ta = $("wcIn");
    if (ta) ta.value = wsCodeData().stdin;
  }
  await wsCursor($("wcRun"), "KI klickt ▶");
  const out = await wsCodeRun(name);
  return `Ausgabe von ${wsCodeData().cur}:\n${out}`;
}

WS_APPS.code = {
  icon: "💻",
  name: "Code",
  order: 1,
  w: 62,
  h: 80,
  title: () => "Code · " + wsCodeData().cur,
  mount(w, body) {
    const ic = (p) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    body.innerHTML = `<div class="wcode vsc${wsCodeData().side === false ? " noside" : ""}${wsCodeData().panel === false ? " nopanel" : ""}">
      <div class="vsc-title">
        <span class="vsc-logo" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="#23a9f2" d="M17.6 2.2 9.3 9.8 4.4 6 2.5 7l4.8 5-4.8 5 1.9 1 4.9-3.8 8.3 7.6 3.9-1.9V4.1zM17.4 16.6 12 12l5.4-4.6z"/></svg></span>
        <nav class="vsc-menu"><button onclick="wsCodeMenu()">Datei</button><button onclick="WS_CODE.ed?WS_CODE.ed.trigger('m','undo'):document.execCommand('undo')">Bearbeiten</button><button onclick="WS_CODE.ed&&(WS_CODE.ed.focus(),WS_CODE.ed.trigger('m','editor.action.selectAll'))">Auswahl</button><button onclick="wsCodeToggle('side')">Anzeigen</button><button onclick="wsCodeRun()">Ausführen</button><button onclick="wsCodeToggle('panel')">Terminal</button><button onclick="wsCodeMenu()">Hilfe</button></nav>
        <button class="vsc-cc" onclick="wsCodeQuick()" title="Datei suchen (Strg+P)">${ic('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>')}<span>projekt</span></button>
        <span class="wsgap"></span>
        <button class="vsc-run" id="wcRun" onclick="wsCodeRun()" title="Ausführen (Strg+Enter)" aria-label="Ausführen"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg></button>
        <button class="vsc-tb" onclick="wsCodeToggle('side')" title="Seitenleiste ein/aus (Strg+B)" aria-label="Seitenleiste">${ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>')}</button>
        <button class="vsc-tb" onclick="wsCodeToggle('panel')" title="Terminal ein/aus (Strg+J)" aria-label="Terminal">${ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h18"/>')}</button></div>
      <div class="vsc-body">
        <nav class="vsc-act" aria-label="Aktivitätsleiste">
          <button class="on" onclick="wsCodeToggle('side')" title="Explorer (Strg+Umschalt+E)" aria-label="Explorer">${ic('<path d="M14 3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z"/><path d="M14 3v4h4"/><path d="M9 21h9a2 2 0 0 0 2-2V9"/>')}</button>
          <button onclick="WS_CODE.ed?(WS_CODE.ed.focus(),WS_CODE.ed.trigger('m','actions.find')):wsCodeQuick()" title="Suchen (Strg+F)" aria-label="Suchen">${ic('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>')}</button>
          <button onclick="toast('⎇ Quellcodeverwaltung: Lade dein Projekt mit Datei → „Alle als ZIP“ herunter oder öffne es in vscode.dev')" title="Quellcodeverwaltung" aria-label="Quellcodeverwaltung">${ic('<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-6 3-11 7"/>')}</button>
          <button onclick="wsCodeRun()" title="Ausführen und Debuggen" aria-label="Ausführen">${ic('<path d="M8 5v14l11-7z"/>')}</button>
          <button onclick="wsCodeMenu()" title="Erweiterungen & andere IDEs" aria-label="Erweiterungen">${ic('<rect x="4" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/><path d="m14 7.5 3.5-3.5 3.5 3.5-3.5 3.5z"/>')}</button>
          <span class="wsgap"></span>
          <button onclick="wsCodeMode()" title="Einfacher Editor / VS-Code-Editor" aria-label="Einstellungen">${ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>')}</button></nav>
        <aside class="vsc-side"><div class="vsc-sh"><span>EXPLORER</span><span class="wsgap"></span>
            <button onclick="wsCodeNew()" title="Neue Datei" aria-label="Neue Datei">${ic('<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M12 11v6M9 14h6"/>')}</button>
            <button onclick="wsCodeMenu()" title="Mehr" aria-label="Mehr">⋯</button></div>
          <div class="vsc-sec">⌵ PROJEKT</div><div class="vsc-tree" id="wcTree"></div></aside>
        <div class="vsc-edarea">
          <div class="vsc-tabs wcfiles" id="wcFiles"></div>
          <div class="vsc-crumbs" id="wcCrumb"></div>
          <div class="wcmain"><div class="wced" id="wcEd"></div>
            <div class="wcout"><div class="wcohead"><span class="vsc-ptab">PROBLEME</span><b class="vsc-ptab on" id="wcOutT">Ausgabe</b><span class="vsc-ptab">TERMINAL</span><span class="wsgap"></span><button class="vsc-tb" onclick="wsCodeStdinToggle()" title="Eingaben für input() / Scanner" aria-label="Eingabe">⌨</button><button class="vsc-tb" onclick="wsCodeClear()" title="Konsole leeren" aria-label="Konsole leeren">${ic('<circle cx="12" cy="12" r="8"/><path d="m6.5 17.5 11-11"/>')}</button><button class="vsc-tb" onclick="wsCodeToggle('panel')" title="Bereich schließen" aria-label="Bereich schließen">✕</button></div>
            <div class="wcin" id="wcInBox" ${wsCodeData().stdin ? "" : "hidden"}><textarea id="wcIn" rows="2" spellcheck="false" placeholder="Eingaben für input() / Scanner – eine pro Zeile" oninput="wsCodeStdin(this.value)" aria-label="Eingabe">${esc(wsCodeData().stdin)}</textarea></div>
            <div class="wcobody" id="wcOut"><pre class="wcpre tall" id="wcCon"><span class="mut">▶ Ausführen (oben rechts oder Strg+Enter) startet die offene Datei. HTML/CSS/JS zeigt die Vorschau, Python läuft direkt im Browser, Java, C, C# &amp; Co. kompiliert Wandbox.</span></pre></div></div></div></div></div>
      <footer class="vsc-status"><span title="Branch">⎇ main</span><span title="Probleme">⊗ 0 ⚠ 0</span><span class="wsgap"></span><span id="wcPos">Zeile 1, Spalte 1</span><span>Leerzeichen: 2</span><span>UTF-8</span><span>LF</span><span id="wcLang"></span><span title="Benachrichtigungen">🔔</span></footer>
    </div>`;
    body.querySelector(".vsc").addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "b" || k === "j" || (k === "p" && !e.shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        k === "p" ? wsCodeQuick() : wsCodeToggle(k === "b" ? "side" : "panel");
      }
    }, true);
    wsCodeFiles();
    wsCodeEditor();
  },
  unmount() {
    if (WS_CODE.wait) wsCodeDone();
    wsCodeDispose();
    WS_CODE.frame = null;
    WS_CODE.token = "";
  },
  shown() {
    if (WS_CODE.ed) setTimeout(() => WS_CODE.ed && WS_CODE.ed.layout(), 30);
  },
  ctx() {
    const d = wsCodeData();
    const out = WS_CODE.out.map((x) => x[1]).join("\n").slice(-1200);
    return `Code-Dateien: ${Object.keys(d.files).join(", ")}\nOffene Datei ${d.cur}:\n\`\`\`\n${d.files[d.cur].slice(0, 5000)}\n\`\`\`${d.stdin ? "\nEingabe (stdin): " + d.stdin.slice(0, 300) : ""}${out ? "\nLetzte Ausgabe:\n" + out : ""}`;
  },
};
