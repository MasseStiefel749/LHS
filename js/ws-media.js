/* 🌐 Web-Fenster und 🎵 Musik im Arbeitsplatz.
   Web: Seiten, die Einbetten erlauben (Wikipedia, Excalidraw, Photopea, OneCompiler …), laufen im Fenster – der Rest im neuen Tab.
   Musik: drei legale Quellen – Audius (ganze Songs, Download wenn der Künstler ihn erlaubt), Internet Archive (gemeinfrei/Creative
   Commons, immer downloadbar) und Apple/iTunes (30-s-Vorschau jedes Chart-Songs + Link zu Spotify & Co.).
   Chart-Songs komplett herunterzuladen wäre illegal – dafür gibt es nur die Vorschau und den Link zum Anbieter. */
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
  order: 7,
  multi: true,
  w: 58,
  h: 76,
  title: (w) => (w.url === "lh:stackblitz" ? "StackBlitz" : wsWebHost(w.url) || "Web"),
  mount: wsWebMount,
  ctx: () =>
    "Web-Fenster: " +
    (WS.wins.filter((w) => w.app === "web").map((w) => w.url || "Startseite").join(", ") || "keins"),
};

/* ---------- 🎵 Musik ---------- */
const WS_AUD = "https://api.audius.co/v1";
var WS_AUDIO = new Audio();
var WS_NOW = null;
const WS_MUS = { list: [], q: "", busy: false, idx: -1, msg: "", fav: false };
const WS_MUS_SRC = {
  au: ["🎶 Ganze Songs · Audius", ""],
  ia: ["💿 Frei & downloadbar · Internet Archive", "CC"],
  it: ["🍎 Alle Charts · 30-s-Vorschau", "30 s"],
};
WS_AUDIO.preload = "none";
WS_AUDIO.addEventListener("ended", () => wsMusNext(1));
["play", "pause"].forEach((ev) =>
  WS_AUDIO.addEventListener(ev, () => {
    wsMusBar();
    wsMiniPaint();
  }),
);
WS_AUDIO.addEventListener("timeupdate", wsMusTime);
WS_AUDIO.addEventListener("error", () => {
  if (WS_AUDIO.src) toast("⚠️ Dieser Titel lässt sich gerade nicht abspielen");
});

const wsHttps = (u) => (typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u.slice(0, 600) : "");
function wsMusTrack(t) {
  if (!t || !/^[A-Za-z0-9]{1,20}$/.test(t.id) || t.is_streamable === false || t.is_stream_gated) return null;
  const art = t.artwork && t.artwork["150x150"];
  const dl = t.is_downloadable && !t.is_download_gated && t.download && t.download.url;
  return {
    src: "au",
    id: t.id,
    title: String(t.title || "Ohne Titel").slice(0, 120),
    artist: String((t.user && t.user.name) || "").slice(0, 80),
    dur: +t.duration || 0,
    art: wsHttps(art),
    dl: wsHttps(dl),
    link: t.permalink ? "https://audius.co" + String(t.permalink).replace(/[^\w/%.-]/g, "") : "",
    stream: `${WS_AUD}/tracks/${t.id}/stream?app_name=lernhub`,
  };
}
function wsMusIt(x) {
  const p = wsHttps(x && x.previewUrl);
  if (!p) return null;
  return {
    src: "it",
    id: String(x.trackId || "").slice(0, 20),
    title: String(x.trackName || "Ohne Titel").slice(0, 120),
    artist: String(x.artistName || "").slice(0, 80),
    dur: 30,
    art: wsHttps(x.artworkUrl100),
    dl: "",
    link: wsHttps(x.trackViewUrl),
    stream: p,
  };
}
function wsMusIa(x) {
  if (!x || !/^[\w.-]{1,100}$/.test(x.identifier)) return null;
  const one = (v) => String(Array.isArray(v) ? v[0] : v || "");
  return {
    src: "ia",
    id: x.identifier,
    title: one(x.title).slice(0, 120) || x.identifier,
    artist: one(x.creator).slice(0, 80),
    dur: 0,
    art: `https://archive.org/services/img/${x.identifier}`,
    dl: "ia",
    link: `https://archive.org/details/${x.identifier}`,
    lic: wsHttps(one(x.licenseurl).replace(/^http:/, "https:")),
    stream: "",
  };
}
// Gespeicherte Favoriten prüfen, bevor sie wieder in <img>/<audio> landen
function wsMusClean(t) {
  if (!t || !WS_MUS_SRC[t.src] || typeof t.id !== "string" || !/^[\w.-]{1,100}$/.test(t.id)) return null;
  return {
    src: t.src,
    id: t.id,
    title: String(t.title || "").slice(0, 120),
    artist: String(t.artist || "").slice(0, 80),
    dur: wsNum(t.dur, 0, 36000, 0),
    art: wsHttps(t.art),
    dl: t.dl === "ia" ? "ia" : wsHttps(t.dl),
    link: wsHttps(t.link),
    lic: wsHttps(t.lic),
    stream: t.src === "ia" ? "" : wsHttps(t.stream),
  };
}
function wsMusFavs() {
  const d = wsData("musik");
  if (!Array.isArray(d.fav)) d.fav = [];
  d.fav = d.fav.map(wsMusClean).filter(Boolean).slice(0, 200);
  return d.fav;
}
const wsMusKey = (t) => t.src + ":" + t.id;
function wsMusFav(i) {
  const t = WS_MUS.list[i];
  if (!t) return;
  const f = wsMusFavs(),
    k = wsMusKey(t),
    j = f.findIndex((x) => wsMusKey(x) === k);
  if (j >= 0) f.splice(j, 1);
  else if (f.length >= 200) return toast("Höchstens 200 Lieblingssongs");
  else f.unshift(wsMusClean(t));
  wsSave();
  toast(j >= 0 ? "💔 Entfernt" : "❤️ In deinen Lieblingssongs");
  if (WS_MUS.fav) wsMusShowFav(true);
  else wsMusPaint();
}
function wsMusShowFav(on) {
  WS_MUS.fav = !!on;
  if (on) {
    WS_MUS.list = wsMusFavs().slice();
    WS_MUS.idx = WS_NOW ? WS_MUS.list.findIndex((x) => wsMusKey(x) === wsMusKey(WS_NOW)) : -1;
    WS_MUS.msg = WS_MUS.list.length ? "" : "Noch keine Lieblingssongs – tipp bei einem Song auf 🤍.";
    wsMusPaint();
  } else wsMusSearch();
}
// Internet-Archive-Einträge sind Alben – die erste MP3 wird erst beim Abspielen gesucht
async function wsMusSrc(t) {
  if (t.stream) return t.stream;
  const r = await fetch(`https://archive.org/metadata/${t.id}/files`);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const fs = ((await r.json()).result || []).filter((f) => f && typeof f.name === "string" && /\.mp3$/i.test(f.name));
  const f = fs.find((x) => x.format === "VBR MP3") || fs[0];
  if (!f) throw new Error("Keine MP3 in diesem Eintrag");
  const len = String(f.length || "");
  t.dur = len.includes(":") ? len.split(":").reduce((a, b) => a * 60 + +b, 0) || 0 : +len || 0;
  t.stream = `https://archive.org/download/${t.id}/${f.name.split("/").map(encodeURIComponent).join("/")}`;
  return t.stream;
}
async function wsMusSearch(q) {
  q = String(q == null ? WS_MUS.q : q).trim().slice(0, 100);
  WS_MUS.q = q;
  WS_MUS.fav = false;
  wsData("musik").q = q;
  WS_MUS.busy = true;
  WS_MUS.msg = "";
  wsMusPaint();
  const get = async (u, pick) => {
    const r = await fetch(u);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return pick(await r.json());
  };
  const ia = q.replace(/[^\p{L}\p{N}\s'-]/gu, " ").trim();
  const res = await Promise.allSettled([
    get(q ? `${WS_AUD}/tracks/search?query=${encodeURIComponent(q)}&app_name=lernhub` : `${WS_AUD}/tracks/trending?app_name=lernhub&limit=30`, (j) =>
      (Array.isArray(j.data) ? j.data : []).map(wsMusTrack).filter(Boolean).slice(0, q ? 15 : 30),
    ),
    ia
      ? get(
          `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${ia}) AND mediatype:audio AND licenseurl:(*creativecommons* OR *publicdomain*) AND -collection:podcasts AND -collection:librivoxaudio`)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&sort[]=downloads+desc&rows=10&output=json`,
          (j) => ((j.response && j.response.docs) || []).map(wsMusIa).filter(Boolean),
        )
      : [],
    q ? get(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=15&country=DE`, (j) => (j.results || []).map(wsMusIt).filter(Boolean)) : [],
  ]);
  if (WS_MUS.q !== q) return;
  // Charts-Vorschau zuerst, wenn man nach einem bestimmten Song sucht – sonst ganze Songs
  const [au, ar, it] = res.map((x) => (x.status === "fulfilled" ? x.value : []));
  WS_MUS.list = q ? [...it.slice(0, 5), ...au, ...ar, ...it.slice(5)] : au;
  WS_MUS.idx = -1;
  if (!WS_MUS.list.length)
    WS_MUS.msg = res.some((x) => x.status === "rejected") ? "Die Musik-Suche ist gerade nicht erreichbar – bist du online?" : "Nichts gefunden – versuch einen anderen Begriff.";
  WS_MUS.busy = false;
  wsMusPaint();
  wsSave();
}
async function wsMusPlay(i) {
  const t = WS_MUS.list[i];
  if (!t) return;
  WS_MUS.idx = i;
  WS_NOW = t;
  wsMusPaint();
  try {
    await wsMusSrc(t);
  } catch (e) {
    return toast("⚠️ Abspielen ging nicht: " + e.message, 4000);
  }
  if (WS_NOW !== t) return;
  WS_AUDIO.src = t.stream;
  WS_AUDIO.volume = wsNum(wsData("musik").vol, 0, 1, 0.8);
  WS_AUDIO.play().catch(() => {});
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, artwork: t.art ? [{ src: t.art, sizes: "150x150" }] : [] });
    navigator.mediaSession.setActionHandler("nexttrack", () => wsMusNext(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => wsMusNext(-1));
  }
  wsMusPaint();
}
function wsMusNext(d) {
  if (!WS_MUS.list.length) return;
  wsMusPlay((WS_MUS.idx + d + WS_MUS.list.length) % WS_MUS.list.length);
}
function wsMusToggle() {
  if (!WS_AUDIO.src) return wsMusPlay(0);
  if (WS_AUDIO.paused) WS_AUDIO.play().catch(() => {});
  else WS_AUDIO.pause();
}
async function wsMusDl(i) {
  const t = WS_MUS.list[i];
  if (!t || !t.dl) return toast("Diesen Titel darf man nicht herunterladen – nur anhören");
  toast("⬇️ " + t.title + " wird geladen …", 30000);
  let url = t.dl;
  try {
    if (url === "ia") url = await wsMusSrc(t);
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const b = await r.blob();
    const ext = /wav|wave/.test(b.type) ? "wav" : /flac/.test(b.type) ? "flac" : /ogg/.test(b.type) ? "ogg" : /aiff/.test(b.type) ? "aiff" : "mp3";
    wsDownload(b, `${t.artist ? t.artist + " - " : ""}${t.title}`.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 100) + "." + ext);
    toast("✅ Heruntergeladen" + (t.lic ? " – Lizenz beachten (Link beim Song)" : ""));
  } catch (e) {
    toast("⚠️ Download ging nicht: " + e.message, 4000);
  }
}
function wsMusFmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
function wsMusTime() {
  const sk = $("wmSeek"),
    tm = $("wmTime");
  if (!sk || !tm) return;
  const d = WS_AUDIO.duration || (WS_NOW && WS_NOW.dur) || 0;
  if (document.activeElement !== sk) sk.value = d ? Math.round((WS_AUDIO.currentTime / d) * 1000) : 0;
  tm.textContent = `${wsMusFmt(WS_AUDIO.currentTime)} / ${wsMusFmt(d)}`;
}
function wsMusSeek(v) {
  const d = WS_AUDIO.duration || 0;
  if (d) WS_AUDIO.currentTime = (v / 1000) * d;
}
function wsMusVol(v) {
  WS_AUDIO.volume = wsNum(v, 0, 1, 0.8);
  wsData("musik").vol = WS_AUDIO.volume;
  wsSave();
}
function wsMusBar() {
  const el = $("wmBar");
  if (!el) return;
  const t = WS_NOW;
  el.innerHTML = `${t && t.art ? `<img src="${esc(t.art)}" alt="" width="44" height="44">` : `<span class="wmart">🎵</span>`}
    <div class="wmnow"><b>${esc(t ? t.title : "Nichts läuft")}</b><small>${esc(t ? t.artist : "Such oben nach einem Song")}</small>
      <input type="range" id="wmSeek" min="0" max="1000" value="0" oninput="wsMusSeek(this.value)" aria-label="Position"><small id="wmTime">0:00 / 0:00</small></div>
    <div class="wmctl"><button onclick="wsMusNext(-1)" title="Zurück" aria-label="Zurück">⏮</button><button class="big" onclick="wsMusToggle()" title="Abspielen/Pause" aria-label="Abspielen/Pause">${WS_AUDIO.src && !WS_AUDIO.paused ? "⏸" : "▶"}</button><button onclick="wsMusNext(1)" title="Weiter" aria-label="Weiter">⏭</button>
      <input type="range" min="0" max="1" step="0.05" value="${WS_AUDIO.volume}" oninput="wsMusVol(this.value)" title="Lautstärke" aria-label="Lautstärke"></div>`;
  wsMusTime();
}
function wsMusPaint() {
  const el = $("wmList");
  if (!el) return;
  const q = WS_MUS.q,
    favs = new Set(wsMusFavs().map(wsMusKey));
  const fb = $("wmFav");
  if (fb) fb.classList.toggle("on", WS_MUS.fav);
  let last = "";
  el.innerHTML = WS_MUS.busy
    ? `<p class="small mut" style="padding:12px">⏳ Suche bei Audius, Internet Archive und Apple …</p>`
    : (WS_MUS.msg ? `<p class="small mut" style="padding:12px">${esc(WS_MUS.msg)}</p>` : "") +
      (WS_MUS.fav ? `<p class="small mut wmsec">❤️ Deine Lieblingssongs</p>` : !q && WS_MUS.list.length ? `<p class="small mut wmsec">🔥 Gerade beliebt</p>` : "") +
      WS_MUS.list
        .map((t, i) => {
          const sec = q && !WS_MUS.fav && t.src !== last ? `<p class="small mut wmsec">${WS_MUS_SRC[t.src][0]}</p>` : "";
          last = t.src;
          const tag = WS_MUS_SRC[t.src][1];
          const sp = `https://open.spotify.com/search/${encodeURIComponent((t.artist + " " + t.title).trim())}`;
          return `${sec}<div class="wmrow${i === WS_MUS.idx ? " on" : ""}" onclick="wsMusPlay(${i})">
        ${t.art ? `<img src="${esc(t.art)}" alt="" width="40" height="40" loading="lazy">` : `<span class="wmart">🎵</span>`}
        <div><b>${esc(t.title)}</b><small>${tag ? `<i class="wmtag">${tag}</i> ` : ""}${esc(t.artist)}${t.dur && t.src !== "it" ? " · " + wsMusFmt(t.dur) : ""}</small></div>
        <button class="wstool" onclick="event.stopPropagation();wsMusFav(${i})" title="Lieblingssong" aria-label="Lieblingssong">${favs.has(wsMusKey(t)) ? "❤️" : "🤍"}</button>
        ${t.dl ? `<button class="wstool" onclick="event.stopPropagation();wsMusDl(${i})" title="Herunterladen (frei erlaubt)" aria-label="Herunterladen">⬇️</button>` : ""}
        ${t.src === "it" ? `<a class="wstool" href="${esc(sp)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Ganzer Song bei Spotify" aria-label="Bei Spotify">🟢</a>` : t.lic ? `<a class="wstool" href="${esc(t.lic)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Lizenz" aria-label="Lizenz">©</a>` : ""}
      </div>`;
        })
        .join("") +
      (q && !WS_MUS.fav
        ? `<p class="small mut" style="padding:10px">Ganze Chart-Songs gibt es legal nur bei den Anbietern:
          <a href="https://open.spotify.com/search/${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer">Spotify ↗</a> ·
          <a href="https://music.youtube.com/search?q=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer">YouTube Music ↗</a> ·
          <a href="https://music.apple.com/de/search?term=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer">Apple Music ↗</a></p>`
        : "");
  wsMusBar();
}
async function wsMusAi(q) {
  const w = wsOpen("musik");
  if (!w) return "⚠️ Kein Fenster frei";
  const inp = $("wmQ");
  await wsCursor(inp, "KI sucht Musik");
  if (inp) await wsTypeInto((t) => (inp.value = t), String(q).slice(0, 100));
  await wsMusSearch(q);
  if (!WS_MUS.list.length) return "🎵 Nichts gefunden zu „" + q + "“";
  await wsCursor(document.querySelector("#wmList .wmrow"), "KI drückt ▶");
  await wsMusPlay(0);
  return `🎵 Spielt: ${WS_NOW.title} – ${WS_NOW.artist}${WS_NOW.src === "it" ? " (30-s-Vorschau, ganzer Song über 🟢 Spotify)" : ""}`;
}
WS_APPS.musik = {
  icon: "🎵",
  name: "Musik",
  order: 6,
  w: 40,
  h: 78,
  mount(w, body) {
    const d = wsData("musik");
    if (!WS_MUS.q && typeof d.q === "string") WS_MUS.q = d.q.slice(0, 100);
    body.innerHTML = `<div class="wmus">
      <form class="wwbar" onsubmit="event.preventDefault();wsMusSearch(this.q.value)">
        <input class="fi" id="wmQ" name="q" value="${esc(WS_MUS.q)}" placeholder="Song, Künstler oder Stimmung (z. B. lofi zum Lernen)" autocomplete="off">
        <button class="wstool" title="Suchen" aria-label="Suchen">🔎</button>
        <button type="button" class="wstool" id="wmFav" onclick="wsMusShowFav(!WS_MUS.fav)" title="Lieblingssongs" aria-label="Lieblingssongs">❤️</button></form>
      <div class="wmlist" id="wmList"></div>
      <div class="wmbar" id="wmBar"></div>
      <p class="small mut wmnote">Ganze Songs: Audius · Frei herunterladen: Internet Archive (CC/gemeinfrei) · Charts: 30-s-Vorschau von Apple + 🟢 Link zu Spotify. Läuft weiter, auch wenn du woanders in Lernhub bist.</p>
    </div>`;
    if (!WS_MUS.list.length && !WS_MUS.busy) wsMusSearch(WS_MUS.q);
    else wsMusPaint();
  },
  ctx: () => (WS_NOW ? `Musik: ${WS_AUDIO.paused ? "pausiert" : "spielt"} „${WS_NOW.title}“ von ${WS_NOW.artist}` : "Musik: aus"),
};
