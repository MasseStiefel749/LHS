/* 🌐 Web-Fenster im Arbeitsplatz (die Musik steht in js/ws-musik.js, Videos in js/ws-video.js).
   Seiten, die Einbetten erlauben (Wikipedia, Excalidraw, Photopea, OneCompiler …), laufen im Fenster – der Rest im neuen Tab. */
const WS_WEB_POST = {};
const WS_NOFRAME =
  /(^|\.)(vscode\.dev|github\.dev|github\.com|google\.[a-z.]+|office\.com|microsoft365\.com|live\.com|programiz\.com|spotify\.com|instagram\.com|facebook\.com|x\.com|twitter\.com|chatgpt\.com|openai\.com|developer\.mozilla\.org|stackoverflow\.com|w3schools\.com)$/i;
const WS_WEB_TILES = [
  ["✏️", "Excalidraw", "https://excalidraw.com/", "Whiteboard & Skizzen"],
  ["🖍️", "tldraw", "https://tldraw.com/", "Zeichnen & Diagramme"],
  ["🖼️", "Photopea", "https://www.photopea.com/", "Bilder bearbeiten wie Photoshop"],
  ["⚡", "StackBlitz", "https://stackblitz.com/edit/js?embed=1", "Web-IDE (VS-Code-Stil)"],
  ["☕", "Java", "https://www.jdoodle.com/online-java-compiler", "Java schreiben & ausführen"],
  ["📓", "JupyterLite", "https://jupyter.org/try-jupyter/lab/", "Python-Notebooks im Browser"],
  ["🔌", "Wokwi", "https://wokwi.com/", "Arduino & Elektronik simulieren"],
  ["📐", "GeoGebra", "https://www.geogebra.org/calculator", "Mathe & Funktionen"],
  ["📚", "Wikipedia", "https://de.m.wikipedia.org/", "Nachschlagen"],
];
const WS_WEB_TABS = [
  ["🟦", "vscode.dev", "https://vscode.dev/", "echtes VS Code"],
  ["🟣", "Eclipse Theia", "https://try.theia-cloud.io/", "Eclipse-IDE im Browser"],
  ["📄", "Office online", "https://www.office.com/", "Word, Excel, PowerPoint"],
  ["📝", "Google Docs", "https://docs.google.com/", "Docs, Tabellen, Präsentationen"],
];

function wsWebUrl(v) {
  v = String(v || "").trim();
  if (!v) return "";
  if (/^lh:stackblitz$/.test(v)) return v;
  if (!/^https?:\/\//i.test(v)) v = /^[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(v) ? "https://" + v : "https://de.m.wikipedia.org/w/index.php?search=" + encodeURIComponent(v);
  let u;
  try {
    u = new URL(v);
  } catch (e) {
    return "";
  }
  if (u.protocol === "http:") u.protocol = "https:";
  if (u.protocol !== "https:") return "";
  const yt = /(^|\.)youtube\.com$/.test(u.hostname) ? u.searchParams.get("v") : u.hostname === "youtu.be" ? u.pathname.slice(1) : "";
  if (yt && /^[\w-]{6,20}$/.test(yt)) return "https://www.youtube-nocookie.com/embed/" + yt;
  return u.href.slice(0, 600);
}
function wsWebHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return "";
  }
}
function wsWebMount(w, body) {
  if (!body) return;
  const url = w.url;
  const ext = url && url !== "lh:stackblitz" ? url : "";
  body.innerHTML = `<div class="wweb">
    <form class="wwbar" onsubmit="event.preventDefault();wsWebGo('${w.id}',this.u.value)">
      <button type="button" class="wstool" onclick="wsWebGo('${w.id}','')" title="Startseite" aria-label="Startseite">⌂</button>
      <input class="fi" name="u" value="${esc(ext)}" placeholder="Adresse oder Suchbegriff (Wikipedia)" autocomplete="off" inputmode="url">
      <button class="wstool" title="Öffnen" aria-label="Öffnen">↵</button>
      ${ext ? `<a class="wstool" href="${esc(ext)}" target="_blank" rel="noopener noreferrer" title="Im neuen Tab öffnen" aria-label="Im neuen Tab öffnen">↗</a>` : ""}
    </form><div class="wwbody"></div></div>`;
  const box = body.querySelector(".wwbody");
  if (!url) {
    const tile = (t, tab) =>
      `<button class="wwtile" data-u="${esc(t[2])}" onclick="${tab ? "window.open(this.dataset.u,'_blank','noopener')" : `wsWebGo('${w.id}',this.dataset.u)`}"><span>${t[0]}</span><b>${esc(t[1])}${tab ? " ↗" : ""}</b><small>${esc(t[3])}</small></button>`;
    box.innerHTML = `<div class="wwtiles">${WS_WEB_TILES.map((t) => tile(t)).join("")}</div>
      <p class="small mut" style="margin:12px 4px 6px">Lassen sich nicht einbetten – öffnen im neuen Tab:</p>
      <div class="wwtiles">${WS_WEB_TABS.map((t) => tile(t, 1)).join("")}</div>`;
    return;
  }
  if (url === "lh:stackblitz") {
    const p = WS_WEB_POST[w.id];
    if (!p) {
      box.innerHTML = `<p class="small mut" style="padding:14px">Das StackBlitz-Projekt ist nach dem Neuladen weg – öffne es neu über 💻 Code → ⋯.</p>`;
      return;
    }
    delete WS_WEB_POST[w.id];
    const name = "wsf" + w.id;
    box.innerHTML = `<iframe name="${name}" class="wwframe" title="StackBlitz" allow="clipboard-read; clipboard-write; cross-origin-isolated"></iframe>`;
    const f = document.createElement("form");
    f.method = "POST";
    f.action = p.action;
    f.target = name;
    f.hidden = true;
    Object.entries(p.fields).forEach(([k, v]) => {
      const i = document.createElement("input");
      i.type = "hidden";
      i.name = k;
      i.value = v;
      f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
    f.remove();
    return;
  }
  if (WS_NOFRAME.test(wsWebHost(url))) {
    box.innerHTML = `<div class="center" style="padding:22px"><div style="font-size:36px">🔒</div>
      <p><b>${esc(wsWebHost(url))}</b> erlaubt nicht, im Fenster angezeigt zu werden.</p>
      <a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Im neuen Tab öffnen ↗</a></div>`;
    return;
  }
  box.innerHTML = `<iframe class="wwframe" src="${esc(url)}" title="${esc(wsWebHost(url))}" referrerpolicy="no-referrer"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
    allow="clipboard-read; clipboard-write; fullscreen"></iframe>
    <div class="wwhint small mut">Bleibt die Seite leer? Dann verbietet sie das Einbetten – nimm ↗.</div>`;
}
function wsWebGo(id, v) {
  const w = wsWin(id);
  if (!w) return;
  const u = wsWebUrl(v);
  if (v && !u) return toast("Nur https-Adressen");
  w.url = u;
  wsWebMount(w, document.querySelector(`#${id} .wsbody`));
  wsRetitle(w);
  wsSave();
}
async function wsWebAi(url) {
  const u = wsWebUrl(url);
  if (!u || u === "lh:stackblitz") return "⚠️ Ungültige Adresse";
  const w = wsOpen("web", { url: u });
  if (!w) return "⚠️ Kein Fenster frei";
  if (w.url !== u) wsWebGo(w.id, u);
  await wsCursor(document.getElementById(w.id), "KI öffnet " + wsWebHost(u));
  return WS_NOFRAME.test(wsWebHost(u)) ? `${wsWebHost(u)} lässt sich nicht einbetten – Link zum neuen Tab steht im Fenster` : `🌐 ${wsWebHost(u)} geöffnet`;
}
WS_APPS.web = {
  icon: "🌐",
  name: "Web",
  order: 8,
  multi: true,
  w: 58,
  h: 76,
  title: (w) => (w.url === "lh:stackblitz" ? "StackBlitz" : wsWebHost(w.url) || "Web"),
  mount: wsWebMount,
  ctx: () =>
    "Web-Fenster: " +
    (WS.wins.filter((w) => w.app === "web").map((w) => w.url || "Startseite").join(", ") || "keins"),
};
