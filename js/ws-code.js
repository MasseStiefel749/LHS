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
        theme: document.body.classList.contains("dark") ? "vs-dark" : "vs",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      });
      WS_CODE.ed.onDidChangeModelContent(() => wsCodeChanged(WS_CODE.ed.getValue()));
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
function wsCodeFiles() {
  const el = $("wcFiles");
  if (!el) return;
  const d = wsCodeData();
  el.innerHTML = Object.keys(d.files)
    .map((n) => `<button class="${n === d.cur ? "on" : ""}" data-f="${esc(n)}" onclick="wsCodeOpen(this.dataset.f)">${esc(n)}</button>`)
    .join("");
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
    body.innerHTML = `<div class="wcode">
      <div class="wcbar"><div class="wcfiles" id="wcFiles"></div>
        <button class="wstool" onclick="wsCodeNew()" title="Neue Datei" aria-label="Neue Datei">＋</button>
        <button class="btn g sm" id="wcRun" onclick="wsCodeRun()" title="Ausführen (Strg+Enter)">▶ Ausführen</button>
        <button class="wstool" onclick="wsCodeMenu()" title="Dateien & andere IDEs" aria-label="Mehr">⋯</button></div>
      <div class="wcmain"><div class="wced" id="wcEd"></div>
        <div class="wcout"><div class="wcohead"><b id="wcOutT">Ausgabe</b><span class="wsgap"></span><button class="wstool" onclick="wsCodeStdinToggle()" title="Eingaben für input() / Scanner" aria-label="Eingabe">⌨️</button><button class="wstool" onclick="wsCodeClear()" title="Konsole leeren" aria-label="Konsole leeren">🧹</button></div>
        <div class="wcin" id="wcInBox" ${wsCodeData().stdin ? "" : "hidden"}><textarea id="wcIn" rows="2" spellcheck="false" placeholder="Eingaben für input() / Scanner – eine pro Zeile" oninput="wsCodeStdin(this.value)" aria-label="Eingabe">${esc(wsCodeData().stdin)}</textarea></div>
        <div class="wcobody" id="wcOut"><pre class="wcpre tall" id="wcCon"><span class="mut">▶ Ausführen startet die offene Datei. HTML/CSS/JS zeigt die Vorschau, Python läuft direkt im Browser, Java, C, C# &amp; Co. kompiliert Wandbox.</span></pre></div></div></div>
    </div>`;
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
