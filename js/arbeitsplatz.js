/* 🧑‍💻 Arbeitsplatz: frei verschieb- und vergrößerbare Fenster (Code, Text, Tabelle, Folien, KI, Musik, Video, Web, Lernhub).
   Am PC als Desktop mit Taskleiste und Start-Menü (oder klassisch mit Dock).
   Läuft komplett im Browser – auch auf GitHub Pages und am Handy (dort als Tabs oder geteilter Bildschirm).
   Gespeichert wird nur auf diesem Gerät (localStorage), nicht im Konto. Die Apps stehen in js/ws-*.js. */
const WS_KEY = "lh-ws-v1";
const WS_APPS = {};
const WS_MOBILE = window.matchMedia("(max-width: 760px)");
const WS_MAX_WINS = 12;
let WS = wsLoad();
let WS_ON = false;
let WS_SAVE_T = 0;

function wsNum(v, min, max, def) {
  v = +v;
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
}
function wsLoad() {
  const d = { wins: [], z: 1, act: "", act2: "", split: false, ratio: 50, fs: false, data: {} };
  try {
    const o = JSON.parse(localStorage.getItem(WS_KEY) || "null");
    if (!o || typeof o !== "object") return d;
    if (Array.isArray(o.wins))
      d.wins = o.wins
        .filter((w) => w && /^[a-z]{2,8}$/.test(w.app) && /^w\d{1,16}$/.test(w.id))
        .slice(0, WS_MAX_WINS)
        .map((w) => ({
          id: w.id,
          app: w.app,
          x: wsNum(w.x, -80, 95, 4),
          y: wsNum(w.y, 0, 95, 4),
          w: wsNum(w.w, 15, 100, 55),
          h: wsNum(w.h, 15, 100, 70),
          z: wsNum(w.z, 1, 1e6, 1),
          max: !!w.max,
          min: !!w.min,
          url: typeof w.url === "string" ? w.url.slice(0, 600) : "",
        }));
    d.z = Math.max(1, ...d.wins.map((w) => w.z));
    d.split = !!o.split;
    d.classic = !!o.classic;
    d.ratio = wsNum(o.ratio, 20, 80, 50);
    if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) d.data = o.data;
  } catch (e) {}
  return d;
}
function wsData(app) {
  const d = WS.data[app];
  return d && typeof d === "object" && !Array.isArray(d) ? d : (WS.data[app] = {});
}
function wsSave() {
  clearTimeout(WS_SAVE_T);
  WS_SAVE_T = setTimeout(wsSaveNow, 500);
}
function wsSaveNow() {
  clearTimeout(WS_SAVE_T);
  WS_SAVE_T = 0;
  Object.values(WS_APPS).forEach((a) => a.flush && a.flush());
  try {
    localStorage.setItem(WS_KEY, JSON.stringify({ wins: WS.wins, split: WS.split, ratio: WS.ratio, classic: WS.classic, data: WS.data }));
  } catch (e) {
    toast("⚠️ Arbeitsplatz konnte nicht gespeichert werden (Speicher voll?)");
  }
}
window.addEventListener("pagehide", () => WS_SAVE_T && wsSaveNow());

/* ---------- Ansicht ---------- */
function wsWin(id) {
  return WS.wins.find((w) => w.id === id);
}
function renderWs() {
  document.body.classList.add("wsview");
  document.body.classList.toggle("wsfull", WS.fs);
  // Andere Teile der App rufen render() auch zwischendurch auf – Editor & Co. sollen dabei nicht neu starten
  if (WS_ON && document.getElementById("ws")) return wsPaint();
  WS_ON = true;
  WS.wins = WS.wins.filter((w) => WS_APPS[w.app]);
  const dock = Object.entries(WS_APPS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(
      ([id, a]) =>
        `<button class="wsdock" onclick="wsOpen('${id}')" title="${esc(a.name)} öffnen"><span>${a.icon}</span><small>${esc(a.short || a.name)}</small></button>`,
    )
    .join("");
  $("app").innerHTML = `<div class="ws${wsDt() ? " dt" : ""}" id="ws">
    <div class="wsbar">${dock}<span class="wsgap"></span>
      <button class="wstool wsnomob" onclick="wsClassic(false)" title="Desktop-Ansicht mit Taskleiste" aria-label="Desktop-Ansicht">🖥️</button>
      <button class="wstool" onclick="wsTile()" title="Alle Fenster nebeneinander anordnen" aria-label="Anordnen">⊞</button>
      <button class="wstool wsonlymob" id="wsSplitBtn" onclick="wsSplit()" title="Zwei Fenster übereinander" aria-label="Teilen">${WS.split ? "▭" : "⬓"}</button>
      <button class="wstool" id="wsFullBtn" onclick="wsFull()" title="Vollbild an/aus" aria-label="Vollbild">${WS.fs ? "🗗" : "⛶"}</button>
    </div>
    <div class="wstabs" id="wsTabs"></div>
    <div class="wsdesk${WS.split ? " split" : ""}" id="wsDesk" style="--wsr:${WS.ratio}%">
      <div class="wssbar" onpointerdown="wsRatioGrab(event)" title="Ziehen, um die Aufteilung zu ändern" aria-hidden="true"></div>
      <div class="wsempty" id="wsEmpty"><div style="font-size:42px">🧑‍💻</div><b>Dein Arbeitsplatz</b>
        <p class="small mut">Öffne oben eine App. Fenster an der Titelleiste verschieben, an der Ecke unten rechts größer ziehen,
        an den Rand ziehen zum Andocken. Die 🤖 KI kann alles für dich bedienen – mit eigenem Mauszeiger.
        Am Handy wechselst du über die Tabs oder teilst den Bildschirm mit ⬓ (Trennlinie verschiebbar).</p>
        <button class="btn sm" onclick="wsStarter()">🚀 Programmieren mit KI starten</button></div>
      <div class="wscur" id="wsCur" hidden><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M3 2l7 19 2.6-7.6L20 11z" fill="#7c5cff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span>KI</span></div>
      <div class="wsicons" id="wsIcons"></div>
    </div>
    <div class="wstask" id="wsTask"></div>
  </div>`;
  WS.wins.forEach(wsMount);
  if (!WS.wins.some((w) => w.id === WS.act)) WS.act = (WS.wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0] || {}).id || "";
  wsIconsPaint();
  wsPaint();
  wsMiniPaint();
}
function wsStop() {
  document.body.classList.remove("wsview", "wsfull");
  if (!WS_ON) return;
  WS_ON = false;
  WS.wins.forEach(wsUnmount);
  wsSaveNow();
  wsMiniPaint();
}
function wsMount(w) {
  const a = WS_APPS[w.app],
    desk = $("wsDesk");
  if (!a || !desk) return;
  const el = document.createElement("section");
  el.className = "wswin";
  el.id = w.id;
  el.setAttribute("aria-label", a.name);
  el.innerHTML = `<header class="wshead" onpointerdown="wsGrab(event,'${w.id}')" ondblclick="wsMax('${w.id}')">
      <span class="wsico">${a.icon}</span><b class="wstitle">${esc(wsTitle(w))}</b>
      <span class="wsbtns"><button onclick="wsMin('${w.id}')" title="Minimieren" aria-label="Minimieren" class="wsdtonly">—</button><button onclick="wsSnap('${w.id}','l')" title="Links andocken" aria-label="Links andocken">◧</button><button onclick="wsSnap('${w.id}','r')" title="Rechts andocken" aria-label="Rechts andocken">◨</button><button onclick="wsMax('${w.id}')" title="Maximieren" aria-label="Maximieren">▢</button><button onclick="wsClose('${w.id}')" title="Schließen" aria-label="Schließen">✕</button></span>
    </header><div class="wsbody"></div><i class="wsrs" onpointerdown="wsGrab(event,'${w.id}',1)"></i>`;
  el.addEventListener("pointerdown", () => wsFocus(w.id), true);
  desk.appendChild(el);
  wsPlace(w);
  try {
    a.mount(w, el.querySelector(".wsbody"));
  } catch (e) {
    console.warn(e);
    el.querySelector(".wsbody").innerHTML = `<p class="small" style="padding:12px">⚠️ ${esc(e.message)}</p>`;
  }
}
function wsUnmount(w) {
  const a = WS_APPS[w.app],
    el = document.getElementById(w.id);
  if (a && a.unmount) {
    try {
      a.unmount(w, el);
    } catch (e) {}
  }
}
function wsTitle(w) {
  const a = WS_APPS[w.app];
  return (a.title && a.title(w)) || a.name;
}
function wsRetitle(w) {
  const t = document.querySelector(`#${w.id} .wstitle`);
  if (t) t.textContent = wsTitle(w);
  wsPaint();
}
function wsPlace(w) {
  const el = document.getElementById(w.id);
  if (!el) return;
  const m = w.max;
  el.style.left = (m ? 0 : w.x) + "%";
  el.style.top = (m ? 0 : w.y) + "%";
  el.style.width = (m ? 100 : w.w) + "%";
  el.style.height = (m ? 100 : w.h) + "%";
  el.style.zIndex = w.z;
  el.classList.toggle("max", m);
  el.classList.toggle("min", !!w.min);
}
function wsPaint() {
  const tabs = $("wsTabs");
  if (!tabs) return;
  const act2 = WS.split && WS.wins.some((w) => w.id === WS.act2) && WS.act2 !== WS.act ? WS.act2 : "";
  WS.wins.forEach((w) => {
    const el = document.getElementById(w.id);
    if (el) {
      el.classList.toggle("act", w.id === WS.act);
      el.classList.toggle("act2", w.id === act2);
    }
  });
  tabs.innerHTML = WS.wins
    .map(
      (w) =>
        `<button class="${w.id === WS.act ? "on" : w.id === act2 ? "on2" : ""}" onclick="wsFocus('${w.id}')">${WS_APPS[w.app].icon} ${esc(wsTitle(w).slice(0, 18))}<span class="wsx" onclick="event.stopPropagation();wsClose('${w.id}')" title="Schließen">✕</span></button>`,
    )
    .join("");
  const e = $("wsEmpty");
  if (e) e.hidden = WS.wins.length > 0;
  wsTaskPaint();
}

/* ---------- Fenster-Verwaltung ---------- */
function wsOpen(app, opts) {
  const a = WS_APPS[app];
  if (!a) return null;
  if (V.view !== "ws") go("ws");
  let w = !a.multi && WS.wins.find((x) => x.app === app);
  if (!w) {
    if (WS.wins.length >= WS_MAX_WINS) {
      toast(`Höchstens ${WS_MAX_WINS} Fenster – schließ erst eins`);
      return null;
    }
    const n = WS.wins.length;
    w = {
      id: "w" + (Date.now() + n),
      app,
      x: 3 + (n % 6) * 4,
      y: 2 + (n % 6) * 5,
      w: a.w || 55,
      h: a.h || 72,
      z: ++WS.z,
      max: false,
      url: (opts && opts.url) || "",
    };
    WS.wins.push(w);
    wsMount(w);
  } else if (opts && opts.url && a.go) a.go(w, opts.url);
  wsFocus(w.id);
  wsSave();
  return w;
}
function wsFocus(id) {
  const w = wsWin(id);
  if (!w) return;
  if (w.min) {
    w.min = false;
    wsSave();
  }
  if (WS.act !== id) {
    WS.act2 = WS.act;
    WS.act = id;
  }
  if (w.z < WS.z) w.z = ++WS.z;
  wsPlace(w);
  wsPaint();
  const a = WS_APPS[w.app];
  if (a.shown) a.shown(w);
}
function wsClose(id) {
  const i = WS.wins.findIndex((w) => w.id === id);
  if (i < 0) return;
  const w = WS.wins[i];
  wsUnmount(w);
  const el = document.getElementById(id);
  if (el) el.remove();
  WS.wins.splice(i, 1);
  if (WS.act === id) WS.act = WS.act2 && wsWin(WS.act2) && !wsWin(WS.act2).min ? WS.act2 : wsTopId();
  wsPaint();
  wsSave();
}
const wsTopId = () => (WS.wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0] || {}).id || "";
function wsMin(id) {
  const w = wsWin(id);
  if (!w) return;
  w.min = true;
  wsPlace(w);
  if (WS.act === id) WS.act = wsTopId();
  wsPaint();
  wsSave();
}
// „Desktop anzeigen“: alles minimieren – nochmal klicken holt dieselben Fenster zurück
function wsShowDesk() {
  const open = WS.wins.filter((w) => !w.min);
  const set = (list, min) =>
    list.forEach((w) => {
      w.min = min;
      wsPlace(w);
    });
  if (open.length) {
    WS.peek = open.map((w) => w.id);
    set(open, true);
  } else set((WS.peek || []).map(wsWin).filter(Boolean), false);
  WS.act = wsTopId();
  wsPaint();
  wsSave();
}
function wsSnap(id, side) {
  const w = wsWin(id);
  if (!w) return;
  Object.assign(w, { max: false, x: side === "r" ? 50 : 0, y: 0, w: 50, h: 100 });
  wsPlace(w);
  wsSave();
}
function wsMax(id) {
  const w = wsWin(id);
  if (!w) return;
  w.max = !w.max;
  wsPlace(w);
  wsSave();
}
function wsTile() {
  const n = WS.wins.length;
  if (!n) return toast("Noch keine Fenster offen");
  const cols = Math.ceil(Math.sqrt(n)),
    rows = Math.ceil(n / cols);
  WS.wins.forEach((w, i) => {
    const r = Math.floor(i / cols),
      inRow = r === rows - 1 ? n - r * cols : cols;
    Object.assign(w, { max: false, w: 100 / inRow, h: 100 / rows, x: (i % cols) * (100 / inRow), y: r * (100 / rows) });
    wsPlace(w);
  });
  wsSave();
}
function wsSplit() {
  WS.split = !WS.split;
  if (WS.split && !wsWin(WS.act2)) WS.act2 = (WS.wins.find((w) => w.id !== WS.act) || {}).id || "";
  const d = $("wsDesk");
  if (d) d.classList.toggle("split", WS.split);
  const b = $("wsSplitBtn");
  if (b) b.textContent = WS.split ? "▭" : "⬓";
  wsPaint();
  wsSave();
}
// Am Handy: Trennlinie zwischen den zwei Fenstern frei verschieben
function wsRatioGrab(e) {
  const desk = $("wsDesk");
  if (!desk) return;
  e.preventDefault();
  const bar = e.currentTarget;
  bar.setPointerCapture(e.pointerId);
  desk.classList.add("wsdrag");
  const move = (ev) => {
    const r = desk.getBoundingClientRect();
    WS.ratio = Math.round(wsNum(((ev.clientY - r.top) / r.height) * 100, 20, 80, 50));
    desk.style.setProperty("--wsr", WS.ratio + "%");
  };
  const up = () => {
    bar.removeEventListener("pointermove", move);
    bar.removeEventListener("pointerup", up);
    bar.removeEventListener("pointercancel", up);
    desk.classList.remove("wsdrag");
    wsSave();
  };
  bar.addEventListener("pointermove", move);
  bar.addEventListener("pointerup", up);
  bar.addEventListener("pointercancel", up);
}
function wsFull() {
  WS.fs = !WS.fs;
  document.body.classList.toggle("wsfull", WS.fs);
  const b = $("wsFullBtn");
  if (b) b.textContent = WS.fs ? "🗗" : "⛶";
  wsTaskPaint();
}
/* Verschieben (Titelleiste) und Größe ändern (Ecke) – Maus, Stift und Finger */
function wsGrab(e, id, resize) {
  if (e.button > 0 || e.target.closest(".wsbtns") || WS_MOBILE.matches) return;
  const w = wsWin(id),
    desk = $("wsDesk"),
    el = document.getElementById(id);
  if (!w || !desk || !el) return;
  e.preventDefault();
  wsFocus(id);
  const r = desk.getBoundingClientRect();
  if (w.max && !resize) {
    w.max = false;
    w.x = wsNum(((e.clientX - r.left) / r.width) * 100 - w.w / 2, 0, 100 - w.w, 0);
    w.y = 0;
    wsPlace(w);
  }
  const st = { x: e.clientX, y: e.clientY, w: Object.assign({}, w) };
  desk.classList.add("dragging");
  el.setPointerCapture(e.pointerId);
  const move = (ev) => {
    const dx = ((ev.clientX - st.x) / r.width) * 100,
      dy = ((ev.clientY - st.y) / r.height) * 100;
    if (resize) {
      w.w = wsNum(st.w.w + dx, 15, 100 - Math.max(0, w.x), w.w);
      w.h = wsNum(st.w.h + dy, 15, 100 - w.y, w.h);
    } else {
      w.x = wsNum(st.w.x + dx, 10 - w.w, 95, w.x);
      w.y = wsNum(st.w.y + dy, 0, 95, w.y);
      desk.dataset.snap =
        ev.clientX - r.left < 18 ? "l" : r.right - ev.clientX < 18 ? "r" : ev.clientY - r.top < 8 ? "m" : "";
    }
    wsPlace(w);
  };
  const up = () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    desk.classList.remove("dragging");
    const s = desk.dataset.snap;
    desk.dataset.snap = "";
    if (s === "m") wsMax(id);
    else if (s) wsSnap(id, s);
    else wsSave();
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
}
function wsStarter(app) {
  wsOpen(app || "code");
  const k = wsOpen("ki");
  const c = WS.wins.find((w) => w.app === (app || "code"));
  if (c && k) {
    wsSnap(c.id, "l");
    wsSnap(k.id, "r");
    if (WS_MOBILE.matches && !WS.split) {
      WS.act2 = c.id;
      wsSplit();
    }
  }
}
/* Aus dem Erklär-Modus: Thema mit der KI üben – Programmier-Themen mit Code-Fenster, alles andere mit Text */
function wsLearn(sid, tid) {
  const subj = subjById(sid),
    tp = subj && subj.topics.find((t) => t.id === tid);
  if (!tp) return;
  const code = /programm|informatik|code|coding|java|python|html|css|sql|software|anwendungsentwick|algorithm|datenbank|web/i.test(subj.name + " " + tp.name);
  wsStarter(code ? "code" : "text");
  WS_AI.draft = `Ich lerne gerade ${subj.name}: „${tp.name}“. Gib mir eine kleine Übung dazu hier im Arbeitsplatz${code ? " mit Startcode im Code-Fenster" : " im Text-Fenster"} – erst Tipps, nicht gleich die Lösung.`;
  if (window.wsKiPaint) wsKiPaint();
  const inp = $("wkIn");
  if (inp) {
    inp.value = WS_AI.draft;
    inp.focus();
  }
}

/* ---------- Mauszeiger der KI ---------- */
function wsCursor(target, label) {
  const desk = $("wsDesk"),
    cur = $("wsCur");
  if (!desk || !cur || !target) return Promise.resolve();
  const win = target.closest && target.closest(".wswin");
  if (win) wsFocus(win.id);
  const r = desk.getBoundingClientRect(),
    t = target.getBoundingClientRect();
  cur.hidden = false;
  cur.classList.remove("fade");
  cur.style.zIndex = WS.z + 5;
  cur.style.transform = `translate(${Math.round(t.left - r.left + Math.min(t.width / 2, 80))}px,${Math.round(t.top - r.top + Math.min(t.height / 2, 28))}px)`;
  cur.querySelector("span").textContent = String(label || "KI").slice(0, 60);
  clearTimeout(cur._h);
  cur._h = setTimeout(() => cur.classList.add("fade"), 4000);
  return new Promise((res) => setTimeout(res, 650));
}
/* Text „tippen“: in Schritten einsetzen, damit man sieht, was die KI schreibt */
async function wsTypeInto(set, text) {
  const n = Math.min(14, Math.max(1, Math.ceil(text.length / 120)));
  for (let i = 1; i <= n; i++) {
    set(text.slice(0, Math.round((text.length * i) / n)));
    if (i < n) await new Promise((r) => setTimeout(r, 55));
  }
}

/* ---------- Desktop-Modus am PC: Hintergrund, Symbole, Taskleiste mit Start-Menü, Minimieren ---------- */
function wsDt() {
  return !WS.classic && !WS_MOBILE.matches;
}
WS_MOBILE.addEventListener("change", () => {
  const ws = $("ws");
  if (ws) ws.classList.toggle("dt", wsDt());
  wsPaint();
});
function wsClassic(on) {
  WS.classic = !!on;
  const ws = $("ws");
  if (ws) ws.classList.toggle("dt", wsDt());
  wsStartClose();
  wsPaint();
  wsSave();
  toast(on ? "Klassische Ansicht – 🖥️ oben rechts schaltet den Desktop wieder ein" : "Desktop-Ansicht an");
}
const wsAppList = () => Object.entries(WS_APPS).sort((a, b) => a[1].order - b[1].order);
function wsIconsPaint() {
  const el = $("wsIcons");
  if (!el) return;
  el.innerHTML = wsAppList()
    .map(
      ([id, a]) =>
        `<button class="wsicon" ondblclick="wsOpen('${id}')" onkeydown="if(event.key==='Enter')wsOpen('${id}')" title="${esc(a.name)} – Doppelklick zum Öffnen"><span>${a.icon}</span><small>${esc(a.short || a.name)}</small></button>`,
    )
    .join("");
}
function wsTaskApp(id) {
  const wins = WS.wins.filter((w) => w.app === id);
  if (!wins.length) return wsOpen(id);
  const top = wins.slice().sort((a, b) => b.z - a.z)[0];
  if (wins.length === 1 && top.id === WS.act && !top.min) return wsMin(top.id);
  // Mehrere Fenster einer App: der Reihe nach durchschalten
  const i = wins.findIndex((w) => w.id === WS.act);
  wsFocus(i >= 0 ? wins[(i + 1) % wins.length].id : top.id);
}
function wsTaskPaint() {
  const el = $("wsTask");
  if (!el) return;
  const act = wsWin(WS.act);
  const pl = typeof wsMusPlaying === "function" && WS_NOW ? wsMusPlaying() : null;
  el.innerHTML = `<button class="wstb wsstartb" id="wsStartB" onclick="wsStartMenu()" title="Start" aria-label="Start"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4cc2ff" d="M3 3h8.5v8.5H3zm9.5 0H21v8.5h-8.5zM3 12.5h8.5V21H3zm9.5 0H21V21h-8.5z"/></svg></button>
    <button class="wstb wstsearch" onclick="wsStartMenu('')" title="Suchen" aria-label="Suchen">🔎 <span>Suchen</span></button>
    ${wsAppList()
      .map(([id, a]) => {
        const wins = WS.wins.filter((w) => w.app === id);
        const on = act && act.app === id && !act.min;
        const tip = wins.length ? wins.map((w) => wsTitle(w)).join(" · ") : a.name + " öffnen";
        return `<button class="wstb${wins.length ? " run" : ""}${on ? " on" : ""}" onclick="wsTaskApp('${id}')" title="${esc(tip)}" aria-label="${esc(a.name)}"><span>${a.icon}</span>${wins.length > 1 ? `<i>${wins.length}</i>` : ""}</button>`;
      })
      .join("")}
    <span class="wsgap"></span>
    ${pl !== null ? `<button class="wstb wstray" onclick="wsOpen('musik')" title="${esc(WS_NOW.title + " – " + WS_NOW.artist)}"><span onclick="event.stopPropagation();wsMusToggle()">${pl ? "⏸" : "▶"}</span><small>${esc(WS_NOW.title.slice(0, 22))}</small></button>` : ""}
    <button class="wstb" onclick="wsTile()" title="Alle Fenster anordnen" aria-label="Anordnen">⊞</button>
    <button class="wstb" onclick="wsFull()" title="Vollbild an/aus" aria-label="Vollbild">${WS.fs ? "🗗" : "⛶"}</button>
    <span class="wsclock" id="wsClock" title="${esc(new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}">${wsClockH()}</span>
    <button class="wsdeskb" onclick="wsShowDesk()" title="Desktop anzeigen" aria-label="Desktop anzeigen"></button>`;
}
function wsClockH() {
  const d = new Date();
  return `<b>${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</b><small>${d.toLocaleDateString("de-DE")}</small>`;
}
setInterval(() => {
  const c = document.getElementById("wsClock");
  if (c) c.innerHTML = wsClockH();
}, 15000);
function wsStartClose() {
  const m = $("wsStart");
  if (m) m.remove();
  document.removeEventListener("pointerdown", wsStartOut, true);
}
function wsStartOut(e) {
  if (!e.target.closest("#wsStart,#wsStartB,.wstsearch")) wsStartClose();
}
function wsStartMenu(q) {
  if ($("wsStart") && q === undefined) return wsStartClose();
  wsStartClose();
  const ws = $("ws");
  if (!ws) return;
  const m = document.createElement("div");
  m.className = "wsstart";
  m.id = "wsStart";
  m.setAttribute("role", "dialog");
  m.setAttribute("aria-label", "Start");
  const name = (window.S && S.profile && S.profile.name) || "Du";
  m.innerHTML = `<input class="fi" id="wsStartQ" placeholder="Nach Apps und Lernhub-Bereichen suchen" autocomplete="off" oninput="wsStartList(this.value)" onkeydown="if(event.key==='Escape')wsStartClose();if(event.key==='Enter'){const b=document.querySelector('#wsStartL button');if(b)b.click()}">
    <div id="wsStartL"></div>
    <div class="wsstartf"><span>🙂 ${esc(name)}</span><span class="wsgap"></span>
      <button class="wstool" onclick="wsClassic(true)" title="Ohne Desktop (Dock oben)">Klassische Ansicht</button>
      <button class="wstool" onclick="wsStartClose();go('home')" title="Arbeitsplatz verlassen">⏻ Zum Dashboard</button></div>`;
  ws.appendChild(m);
  wsStartList(q || "");
  setTimeout(() => {
    const i = $("wsStartQ");
    if (i) i.focus();
    document.addEventListener("pointerdown", wsStartOut, true);
  }, 0);
}
function wsStartList(q) {
  const el = $("wsStartL");
  if (!el) return;
  const n = (s) => String(s).toLowerCase();
  q = n(q).trim();
  const apps = wsAppList().filter(([id, a]) => id !== "lernhub" && (!q || n(a.name).includes(q)));
  const lh = (typeof NAV !== "undefined" ? NAV : []).filter((x) => x[0] !== "ws" && (!q || n(x[2]).includes(q)));
  el.innerHTML = `${apps.length ? `<p class="wssec">Apps</p><div class="wsstartg">${apps.map(([id, a]) => `<button onclick="wsStartClose();wsOpen('${id}')"><span>${a.icon}</span><small>${esc(a.name)}</small></button>`).join("")}</div>` : ""}
    ${lh.length ? `<p class="wssec">Lernhub – öffnet als eigenes Fenster</p><div class="wsstartg">${lh.map((x) => `<button onclick="wsStartClose();wsOpen('lernhub',{url:'${x[0]}'})"><span>${x[1]}</span><small>${esc(x[2])}</small></button>`).join("")}</div>` : ""}
    ${!apps.length && !lh.length ? `<p class="small mut" style="padding:10px">Nichts gefunden.</p>` : ""}`;
}

/* ---------- 🧠 Lernhub als Fenster: jeder Bereich (Lernpfad, Notizen, Planer …) gleichzeitig neben den Apps ---------- */
const wsLhView = (v) => (/^[a-z]{2,12}$/.test(v) && v !== "ws" && typeof navItem === "function" && navItem(v) ? v : "home");
WS_APPS.lernhub = {
  icon: "🧠",
  name: "Lernhub",
  order: 0,
  multi: true,
  w: 52,
  h: 82,
  title: (w) => {
    const n = typeof navItem === "function" && navItem(wsLhView(w.url));
    return n ? n[1] + " " + n[2] : "Lernhub";
  },
  mount(w, body) {
    w.url = wsLhView(w.url);
    body.innerHTML = `<iframe class="wlframe" src="index.html?fenster=1&v=${w.url}" title="Lernhub – ${esc(wsTitle(w))}"></iframe>`;
  },
  go(w, v) {
    w.url = wsLhView(v);
    const f = document.querySelector(`#${w.id} .wlframe`);
    if (f) f.src = `index.html?fenster=1&v=${w.url}`;
    wsRetitle(w);
  },
  ctx: () => "Lernhub-Fenster: " + (WS.wins.filter((w) => w.app === "lernhub").map((w) => w.url).join(", ") || "keins"),
};
// Das Fenster meldet, welchen Bereich es gerade zeigt (für Titel und Taskleiste)
window.addEventListener("message", (e) => {
  if (e.origin !== location.origin || !e.data || typeof e.data.lhFenster !== "string") return;
  const f = [...document.querySelectorAll(".wlframe")].find((x) => x.contentWindow === e.source);
  const w = f && wsWin(f.closest(".wswin").id);
  if (!w) return;
  w.url = wsLhView(e.data.lhFenster);
  wsRetitle(w);
  wsSave();
});

/* ---------- Mini-Player, wenn außerhalb des Arbeitsplatzes Musik läuft ---------- */
function wsMiniPaint() {
  let m = document.getElementById("wsMini");
  // YouTube-Wiedergabe hat ihr eigenes schwebendes Fenster – der Mini-Player ist nur für Audius/Archiv
  const show = !WS_ON && typeof wsMusPlaying === "function" && WS_P.mode === "a" && wsMusPlaying();
  if (!show) {
    if (m) m.hidden = true;
    return;
  }
  if (!m) {
    m = document.createElement("div");
    m.id = "wsMini";
    m.className = "wsmini";
    document.body.appendChild(m);
  }
  m.hidden = false;
  m.innerHTML = `<button onclick="wsMusToggle()" title="Pause" aria-label="Pause">⏸</button><span onclick="wsOpen('musik')">🎵 ${esc((WS_NOW && WS_NOW.title) || "Musik")}</span>`;
}

/* ---------- Browser-Erweiterung „Lernhub Begleiter“ ---------- */
const WS_EXT = { ok: false, klick: false, zugriff: false, pend: {}, n: 0, last: null, via: "win" };
/* Antworten kommen vom Content-Script (gleiches Fenster) oder – in der Seitenleiste – vom Panel drumherum */
window.addEventListener("message", (e) => {
  const fromPanel = window.parent !== window && e.source === window.parent;
  if ((e.source !== window && !fromPanel) || !e.data || e.data.lhExt !== "res") return;
  const d = e.data;
  if (d.hello) {
    Object.assign(WS_EXT, { ok: true, klick: !!d.klick, zugriff: !!d.zugriff });
    if (window.wsKiPaint) wsKiPaint();
    return;
  }
  const p = WS_EXT.pend[d.id];
  if (p) {
    delete WS_EXT.pend[d.id];
    p(d);
  }
});
function wsExt(cmd, args, ms) {
  return new Promise((res) => {
    const id = ++WS_EXT.n;
    WS_EXT.pend[id] = res;
    const msg = { lhExt: "req", id, cmd, args: args || {} };
    if (WS_EXT.via === "panel") window.parent.postMessage(msg, "*");
    else window.postMessage(msg, location.origin);
    setTimeout(() => {
      if (!WS_EXT.pend[id]) return;
      delete WS_EXT.pend[id];
      res({ error: "Die Browser-Erweiterung antwortet nicht" });
    }, ms || 15000);
  });
}
async function wsExtHello() {
  let r = await wsExt("hallo", {}, 1500);
  if (!(r && r.ok) && window.parent !== window && WS_EXT.via !== "panel") {
    WS_EXT.via = "panel";
    r = await wsExt("hallo", {}, 1500);
    if (!(r && r.ok)) WS_EXT.via = "win";
  }
  if (r && r.ok) Object.assign(WS_EXT, { ok: true, klick: !!r.klick, zugriff: !!r.zugriff });
  if (window.wsKiPaint) wsKiPaint();
  return WS_EXT.ok;
}
/* Erweiterung als ZIP direkt aus der App – Dateien liegen im Ordner extension/ */
const WS_EXT_FILES = ["manifest.json", "background.js", "bridge.js", "panel.html", "panel.js", "panel.css", "icon.png"];
async function wsExtDownload() {
  try {
    const files = [];
    for (const f of WS_EXT_FILES) {
      const r = await fetch("extension/" + f, { cache: "no-cache" });
      if (!r.ok) throw new Error(f + " fehlt");
      files.push({ name: "lernhub-begleiter/" + f, data: new Uint8Array(await r.arrayBuffer()) });
    }
    wsDownload(wsZip(files), "lernhub-begleiter.zip");
  } catch (e) {
    toast("⚠️ Download ging nicht: " + e.message, 4000);
  }
}
function wsExtHelp() {
  toastModal(`<h2 style="margin-top:0">🧩 Lernhub Begleiter</h2>
    <p>Mit der Erweiterung läuft Lernhub in der Seitenleiste deines normalen Browsers (Chrome, Edge, Brave, Opera, Firefox) –
    und die KI kann, wenn du es erlaubst, Seiten als neuen Tab <b>öffnen</b> (z. B. vscode.dev oder Office), den Tab daneben <b>lesen</b>, mit ihrem Mauszeiger <b>darauf zeigen</b>,
    <b>klicken</b> und <b>tippen</b>. Rechtsklick auf markierten Text → „Mit Lernhub-KI erklären“.</p>
    <ol class="small" style="padding-left:20px">
      <li><button class="btn sm" onclick="wsExtDownload()">⬇️ Erweiterung herunterladen</button> und die ZIP entpacken</li>
      <li><b>chrome://extensions</b> (Edge: <b>edge://extensions</b>) öffnen, oben rechts <b>Entwicklermodus</b> an</li>
      <li><b>Entpackte Erweiterung laden</b> → den Ordner <b>lernhub-begleiter</b> wählen</li>
      <li>Auf das Lernhub-Symbol in der Leiste klicken – Lernhub öffnet sich rechts. Dort „Tabs lesen“ erlauben.</li>
    </ol>
    <p class="small"><b>Firefox:</b> <b>about:debugging#/runtime/this-firefox</b> öffnen → „Temporäres Add-on laden“ → im Ordner <b>manifest.json</b> wählen.
    Firefox vergisst unsignierte Add-ons beim Neustart – dann einfach wieder laden.</p>
    <p class="small mut">Klicken &amp; Tippen ist aus, bis du es in der Seitenleiste einschaltest. Passwortfelder fasst die KI nie an.
    Am Handy gibt es keine Erweiterungen – dort läuft alles andere trotzdem.</p>
    <button class="btn ghost sm" onclick="closeModal()">Schließen</button>`);
}

/* ---------- Dateien: Download und ZIP (ohne Komprimierung – reicht für Text und Office) ---------- */
function wsDownload(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
let WS_CRC = null;
function wsCrc(b) {
  if (!WS_CRC) {
    WS_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      WS_CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = WS_CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function wsZip(files, type) {
  const enc = new TextEncoder(),
    parts = [],
    dir = [];
  let off = 0;
  files.forEach((f) => {
    const name = enc.encode(f.name),
      data = typeof f.data === "string" ? enc.encode(f.data) : f.data,
      crc = wsCrc(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, off, true);
    dir.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  });
  const size = dir.reduce((a, b) => a + b.length, 0),
    e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, size, true);
  e.setUint32(16, off, true);
  return new Blob([...parts, ...dir, new Uint8Array(e.buffer)], { type: type || "application/zip" });
}

/* ---------- Start: #ws öffnet den Arbeitsplatz (z. B. aus der Erweiterung), #ws?ki=… füllt die KI-Frage vor,
   #ws?musik=sp.playlist.ID / #ws?video=yt.ID sind geteilte Links aus Musik und Video ---------- */
function wsFromHash() {
  const m = /^#ws(?:\?(ki|musik|video)=([^&]*))?$/.exec(location.hash || "");
  if (!m) return;
  history.replaceState(null, "", location.pathname + location.search);
  let q = "";
  try {
    q = decodeURIComponent(m[2] || "").slice(0, 3000);
  } catch (e) {}
  if (V.view === "onboard") return;
  if (q && m[1] === "musik" && window.wsMusFromLink) wsMusFromLink(q);
  else if (q && m[1] === "video" && window.wsVidFromLink) {
    wsOpen("video");
    wsVidFromLink(q);
  } else if (q) {
    wsOpen("ki");
    if (window.wsKiPrefill) wsKiPrefill(q);
  } else go("ws");
}
window.addEventListener("hashchange", wsFromHash);
window.addEventListener("load", () => {
  setTimeout(wsFromHash, 300);
  wsExtHello();
});
