/* 🎬 Video-Player im Arbeitsplatz: eigene Videodateien (mit Untertiteln), Links (MP4/WebM, YouTube, Vimeo),
   YouTube-Suche (offizieller Player, Credits beim Kanal) und freie Filme aus dem Internet Archive.
   Läuft ein Video, pausiert die Musik – und umgekehrt. */
const WS_VID = { list: [], i: -1, res: [], q: "", f: "yt", busy: false, msg: "", yt: null, tok: 0, files: new Map(), sub: "" };
const WS_VID_TIPS = ["Mathe einfach erklärt", "Programmieren lernen", "Physik Experimente", "Englisch lernen", "Doku Geschichte", "Chemie Versuche", "Bewerbungsgespräch Tipps", "Lofi Lernmusik"];

function wsVidClean(v) {
  if (!v || typeof v !== "object") return null;
  const o = { src: v.src, title: wsStr(v.title, 150) || "Video", ch: wsStr(v.ch, 80), dur: wsNum(v.dur, 0, 360000, 0), art: wsHttps(v.art) };
  if (v.src === "yt" && WS_ID.yt.test(v.id)) o.id = v.id;
  else if (v.src === "ia" && WS_ID.ia.test(v.id)) o.id = v.id;
  else if (v.src === "vimeo" && /^\d{1,12}$/.test(v.id)) o.id = v.id;
  else if (v.src === "url" && wsHttps(v.url)) o.url = wsHttps(v.url);
  else if (v.src === "file" && /^f\d+$/.test(v.id)) o.id = v.id;
  else return null;
  if (v.lic) o.lic = wsHttps(v.lic);
  return o;
}
const wsVidKey = (v) => v.src + ":" + (v.id || v.url);
function wsVidData() {
  const d = wsData("video");
  d.recent = (Array.isArray(d.recent) ? d.recent : []).map(wsVidClean).filter((v) => v && v.src !== "file").slice(0, 24);
  d.rate = wsNum(d.rate, 0.25, 3, 1);
  return d;
}
/* Link → Video: YouTube, Vimeo, Internet Archive oder direkte Videodatei */
function wsVidParse(s) {
  s = String(s || "").trim();
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
  } catch (e) {
    return null;
  }
  const h = u.hostname.replace(/^(www|m|music)\./, "");
  let id = "";
  if (h === "youtube.com" || h === "youtube-nocookie.com") id = u.searchParams.get("v") || (/^\/(?:embed|shorts|live)\/([\w-]{11})/.exec(u.pathname) || [])[1];
  else if (h === "youtu.be") id = u.pathname.slice(1, 12);
  if (id && WS_ID.yt.test(id)) return { src: "yt", id, title: "YouTube-Video" };
  if (h === "vimeo.com" || h === "player.vimeo.com") {
    const m = /(\d{4,12})/.exec(u.pathname);
    if (m) return { src: "vimeo", id: m[1], title: "Vimeo-Video" };
  }
  if (h === "archive.org") {
    const m = /^\/(?:details|embed)\/([\w.-]{1,100})/.exec(u.pathname);
    if (m) return { src: "ia", id: m[1], title: m[1] };
  }
  if (u.protocol === "https:" && /\.(mp4|webm|ogv|ogg|mov|m4v)$/i.test(u.pathname)) return { src: "url", url: u.href, title: decodeURIComponent(u.pathname.split("/").pop()).slice(0, 100) };
  return null;
}

/* ---------- Suche ---------- */
async function wsVidSearch(q, f) {
  q = String(q == null ? WS_VID.q : q).trim().slice(0, 150);
  if (f) WS_VID.f = f;
  WS_VID.q = q;
  if (!q) {
    WS_VID.res = [];
    return wsVidPaintList();
  }
  const link = wsVidParse(q);
  if (link && /[./]/.test(q)) return wsVidPlay([link], 0);
  const tok = ++WS_VID.tok;
  WS_VID.busy = true;
  WS_VID.msg = "";
  wsVidPaintList();
  let res = [];
  try {
    if (WS_VID.f === "ia") {
      const r = await fetch(
        `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${q.replace(/[^\p{L}\p{N}\s'-]/gu, " ")}) AND mediatype:movies AND licenseurl:(*creativecommons* OR *publicdomain*)`)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&sort[]=downloads+desc&rows=30&output=json`,
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const one = (v) => String(Array.isArray(v) ? v[0] : v || "");
      res = (((await r.json()).response || {}).docs || []).map((x) =>
        wsVidClean({ src: "ia", id: x.identifier, title: one(x.title), ch: one(x.creator), art: `https://archive.org/services/img/${x.identifier}`, lic: one(x.licenseurl).replace(/^http:/, "https:") }),
      );
    } else {
      let items = [];
      try {
        const r = await fetch(`${WS_PIPED}/search?q=${encodeURIComponent(q)}&filter=videos`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        items = ((await r.json()).items || []).map((x) => ({
          src: "yt",
          id: (/[?&]v=([\w-]{11})/.exec((x && x.url) || "") || [])[1],
          title: x.title,
          ch: x.uploaderName,
          dur: x.duration > 0 ? x.duration : 0,
          art: x.thumbnail,
        }));
      } catch (e) {
        const ids = await wsYtHtmlFind(q);
        items = ids.map((id) => ({ src: "yt", id, title: "YouTube-Video", art: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` }));
      }
      res = items.map(wsVidClean);
    }
  } catch (e) {
    if (tok === WS_VID.tok) WS_VID.msg = "Suche gerade nicht erreichbar – " + e.message;
  }
  if (tok !== WS_VID.tok) return;
  WS_VID.res = res.filter(Boolean).slice(0, 30);
  if (!WS_VID.res.length && !WS_VID.msg) WS_VID.msg = "Nichts gefunden.";
  WS_VID.busy = false;
  wsVidPaintList();
}

/* ---------- Abspielen ---------- */
function wsVidPause() {
  const v = document.querySelector("#wvStage video");
  if (v && !v.paused) v.pause();
  if (WS_VID.yt) {
    try {
      if (WS_VID.yt.getPlayerState() === 1) WS_VID.yt.pauseVideo();
    } catch (e) {}
  }
}
function wsVidDestroy() {
  if (WS_VID.yt) {
    try {
      WS_VID.yt.destroy();
    } catch (e) {}
    WS_VID.yt = null;
  }
}
function wsVidPlay(list, i) {
  WS_VID.list = (list || []).map(wsVidClean).filter(Boolean);
  if (!WS_VID.list.length) return;
  wsVidAt(i || 0);
}
async function wsVidAt(i) {
  const v = WS_VID.list[i];
  const stage = $("wvStage");
  if (!v) return;
  if (!stage) {
    WS_VID.i = i;
    return wsOpen("video");
  }
  WS_VID.i = i;
  const tok = ++WS_VID.tok;
  WS_VID.busy = false;
  wsVidDestroy();
  WS_VID.sub = "";
  if (v.src !== "file") {
    const d = wsVidData();
    d.recent = [v].concat(d.recent.filter((x) => wsVidKey(x) !== wsVidKey(v))).slice(0, 24);
    wsSave();
  }
  wsMusPause();
  stage.innerHTML = `<div class="wv-load"><div class="wsp-load"><i></i><i></i><i></i></div></div>`;
  wsVidInfo();
  wsVidPaintList();
  const w = WS.wins.find((x) => x.app === "video");
  if (w) wsRetitle(w);
  try {
    if (v.src === "yt") {
      const YTa = await wsYtApi();
      if (tok !== WS_VID.tok) return;
      stage.innerHTML = `<div id="wvYt"></div>`;
      WS_VID.yt = new YTa.Player("wvYt", {
        host: "https://www.youtube-nocookie.com",
        videoId: v.id,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, iv_load_policy: 3, fs: 1 },
        events: {
          onReady: (e) => {
            try {
              e.target.setPlaybackRate(wsVidData().rate);
              const dt = e.target.getVideoData();
              if (dt && dt.title && v.title === "YouTube-Video") {
                v.title = wsStr(dt.title, 150);
                v.ch = wsStr(dt.author, 80);
                wsVidInfo();
              }
            } catch (x) {}
          },
          onStateChange: (e) => {
            if (e.data === 1) wsMusPause();
            if (e.data === 0) wsVidEnd();
          },
          onError: () => {
            stage.innerHTML = `<div class="wv-msg"><p>😕 Dieses Video darf nicht eingebettet werden.</p><a class="btn sm" href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener noreferrer">Auf YouTube ansehen ↗</a></div>`;
          },
        },
      });
    } else if (v.src === "vimeo") {
      stage.innerHTML = `<iframe src="https://player.vimeo.com/video/${esc(v.id)}?autoplay=1&dnt=1" title="Vimeo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    } else {
      let src = v.url;
      if (v.src === "file") src = WS_VID.files.get(v.id);
      if (v.src === "ia") {
        const r = await fetch(`https://archive.org/metadata/${v.id}/files`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const fs = ((await r.json()).result || []).filter((f) => f && typeof f.name === "string" && /\.(mp4|webm|ogv|m4v)$/i.test(f.name));
        const f = fs.find((x) => /h\.264|MPEG4/i.test(x.format || "") && !/_512kb/i.test(x.name)) || fs.find((x) => /\.mp4$/i.test(x.name)) || fs[0];
        if (!f) throw new Error("Keine abspielbare Videodatei in diesem Eintrag");
        src = `https://archive.org/download/${v.id}/${f.name.split("/").map(encodeURIComponent).join("/")}`;
      }
      if (tok !== WS_VID.tok) return;
      if (!src) throw new Error("Datei ist nach dem Neuladen weg – bitte neu öffnen");
      stage.innerHTML = `<video controls autoplay playsinline preload="metadata"${v.art ? ` poster="${esc(v.art)}"` : ""}></video>`;
      const el = stage.querySelector("video");
      el.src = src;
      el.playbackRate = wsVidData().rate;
      el.addEventListener("play", () => wsMusPause());
      el.addEventListener("ended", wsVidEnd);
      el.addEventListener("ratechange", () => {
        wsVidData().rate = el.playbackRate;
        wsSave();
      });
      el.addEventListener("error", () => {
        if (el.error) stage.insertAdjacentHTML("beforeend", `<div class="wv-msg float">⚠️ Dieses Video kann der Browser nicht abspielen (Format?).</div>`);
      });
    }
  } catch (e) {
    if (tok === WS_VID.tok) stage.innerHTML = `<div class="wv-msg"><p>⚠️ ${esc(e.message)}</p></div>`;
  }
}
function wsVidEnd() {
  if ($("wvAuto") && $("wvAuto").checked && WS_VID.i + 1 < WS_VID.list.length) wsVidAt(WS_VID.i + 1);
}
function wsVidRate(r) {
  r = wsNum(r, 0.25, 3, 1);
  wsVidData().rate = r;
  wsSave();
  const el = document.querySelector("#wvStage video");
  if (el) el.playbackRate = r;
  if (WS_VID.yt) {
    try {
      WS_VID.yt.setPlaybackRate(r);
    } catch (e) {}
  }
}
async function wsVidPip() {
  const el = document.querySelector("#wvStage video");
  if (!el || !document.pictureInPictureEnabled) return toast("Bild-in-Bild geht nur bei Videodateien (bei YouTube: Rechtsklick ins Video)");
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await el.requestPictureInPicture();
  } catch (e) {
    toast("⚠️ " + e.message);
  }
}
function wsVidFull() {
  const s = $("wvStage");
  if (!s) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else if (s.requestFullscreen) s.requestFullscreen().catch(() => toast("Vollbild nicht erlaubt"));
}
function wsVidFiles(input) {
  const fs = [...(input.files || [])].filter((f) => /^video\//.test(f.type) || /\.(mp4|webm|ogv|mkv|mov|m4v)$/i.test(f.name)).slice(0, 50);
  input.value = "";
  if (!fs.length) return toast("Keine Videodatei ausgewählt");
  const list = fs.map((f) => {
    const id = "f" + Date.now() + Math.floor(Math.random() * 1e6);
    WS_VID.files.set(id, URL.createObjectURL(f));
    return { src: "file", id, title: f.name.replace(/\.[^.]+$/, ""), ch: "Eigene Datei" };
  });
  wsVidPlay(list, 0);
}
// Untertitel: .vtt direkt, .srt wird in WebVTT umgewandelt
async function wsVidSubs(input) {
  const f = input.files && input.files[0];
  input.value = "";
  const el = document.querySelector("#wvStage video");
  if (!f) return;
  if (!el) return toast("Untertitel gehen bei eigenen Dateien und Links, nicht bei YouTube (dort: ⚙️ im Player)");
  if (f.size > 2e6) return toast("Untertitel-Datei zu groß");
  let t = await f.text();
  if (!/^WEBVTT/.test(t.trim())) t = "WEBVTT\n\n" + t.replace(/\r/g, "").replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  if (WS_VID.sub) URL.revokeObjectURL(WS_VID.sub);
  WS_VID.sub = URL.createObjectURL(new Blob([t], { type: "text/vtt" }));
  el.querySelectorAll("track").forEach((x) => x.remove());
  const tr = document.createElement("track");
  tr.kind = "subtitles";
  tr.label = f.name.slice(0, 40);
  tr.srclang = "de";
  tr.src = WS_VID.sub;
  tr.default = true;
  el.appendChild(tr);
  setTimeout(() => el.textTracks[0] && (el.textTracks[0].mode = "showing"), 50);
  toast("💬 Untertitel geladen");
}
function wsVidLink() {
  const s = prompt("Link zum Video (YouTube, Vimeo, Internet Archive oder .mp4/.webm):");
  if (!s) return;
  const v = wsVidParse(s);
  if (!v) return toast("Diesen Link kann ich nicht abspielen");
  wsVidPlay([v], 0);
}
function wsVidShare() {
  const v = WS_VID.list[WS_VID.i];
  if (!v) return;
  const link = v.src === "yt" ? `https://www.youtube.com/watch?v=${v.id}` : v.src === "vimeo" ? `https://vimeo.com/${v.id}` : v.src === "ia" ? `https://archive.org/details/${v.id}` : v.url || "";
  if (!link) return toast("Eigene Dateien kann man nicht per Link teilen");
  const own = v.src === "yt" || v.src === "ia" ? `${location.origin}${location.pathname}#ws?video=${v.src}.${v.id}` : "";
  wsMusShareText("🎬 " + v.title, `🎬 ${v.title}\n${own ? "In Lernhub ansehen: " + own + "\n" : ""}Original: ${link}`, own || link);
}
function wsVidFromLink(s) {
  const m = /^(yt|ia)\.([\w.-]{1,100})$/.exec(String(s || ""));
  if (m && WS_ID[m[1]].test(m[2])) wsVidPlay([{ src: m[1], id: m[2], title: m[1] === "yt" ? "YouTube-Video" : m[2] }], 0);
}

/* ---------- Oberfläche ---------- */
function wsVidInfo() {
  const el = $("wvInfo");
  if (!el) return;
  const v = WS_VID.list[WS_VID.i];
  if (!v) {
    el.innerHTML = `<p class="small mut">Such oben nach einem Video, öffne eine Datei von deinem Gerät oder füge einen Link ein.</p>`;
    return;
  }
  const credit =
    v.src === "yt"
      ? `Video auf <a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener noreferrer">YouTube ↗</a>${v.ch ? " · Kanal: " + esc(v.ch) : ""} · Rechte beim Kanal`
      : v.src === "vimeo"
        ? `Video auf <a href="https://vimeo.com/${esc(v.id)}" target="_blank" rel="noopener noreferrer">Vimeo ↗</a> · Rechte bei den Urhebern`
        : v.src === "ia"
          ? `Aus dem <a href="https://archive.org/details/${esc(v.id)}" target="_blank" rel="noopener noreferrer">Internet Archive ↗</a>${v.lic ? ` · <a href="${esc(v.lic)}" target="_blank" rel="noopener noreferrer">Lizenz ↗</a>` : " · gemeinfrei/CC"}`
          : v.src === "url"
            ? `Quelle: ${esc(wsWebHost(v.url))}`
            : "Eigene Datei – bleibt auf deinem Gerät";
  const r = wsVidData().rate;
  el.innerHTML = `<h3>${esc(v.title)}</h3><p class="small mut">${credit}</p>
    <div class="wv-tools">
      <label class="small">Tempo <select class="fi" onchange="wsVidRate(this.value)">${[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((x) => `<option value="${x}"${x === r ? " selected" : ""}>${x}×</option>`).join("")}</select></label>
      <button class="wstool" onclick="wsVidPip()" title="Bild-in-Bild" aria-label="Bild-in-Bild">⧉</button>
      <button class="wstool" onclick="wsVidFull()" title="Vollbild" aria-label="Vollbild">⛶</button>
      <label class="wstool" title="Untertitel (.vtt/.srt) laden">💬<input type="file" accept=".vtt,.srt,text/vtt" hidden onchange="wsVidSubs(this)"></label>
      <button class="wstool" onclick="wsVidShare()" title="Teilen" aria-label="Teilen">🔗</button>
      <label class="small"><input type="checkbox" id="wvAuto" checked> Autoplay</label></div>`;
}
function wsVidCardH(v, i, kind) {
  const on = kind === "list" && i === WS_VID.i;
  return `<button class="wv-item${on ? " on" : ""}" onclick="${kind === "res" ? `wsVidPlay(WS_VID.res,${i})` : kind === "rec" ? `wsVidPlay(wsVidData().recent,${i})` : `wsVidAt(${i})`}">
    <span class="wv-th">${v.art ? `<img src="${esc(v.art)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<i>🎬</i>`}${v.dur ? `<em>${wsMusFmt(v.dur)}</em>` : ""}</span>
    <span><b>${esc(v.title)}</b><small>${esc(v.ch || { yt: "YouTube", ia: "Internet Archive", vimeo: "Vimeo", url: "Link", file: "Datei" }[v.src])}</small></span></button>`;
}
function wsVidPaintList() {
  const el = $("wvList");
  if (!el) return;
  const d = wsVidData();
  let h = "";
  if (WS_VID.list.length > 1) h += `<p class="wv-sec">Playlist</p>` + WS_VID.list.map((v, i) => wsVidCardH(v, i, "list")).join("");
  if (WS_VID.busy) h += `<div class="wsp-load"><i></i><i></i><i></i></div>`;
  else if (WS_VID.q) {
    h += `<p class="wv-sec">Ergebnisse für „${esc(WS_VID.q)}“${WS_VID.res.length > 1 ? ` <button class="wstool" onclick="wsVidPlay(WS_VID.res,0)" title="Alle nacheinander">▶ alle</button>` : ""}</p>`;
    h += WS_VID.msg ? `<p class="small mut">${esc(WS_VID.msg)}</p>` : WS_VID.res.map((v, i) => wsVidCardH(v, i, "res")).join("");
  } else {
    h += `<p class="wv-sec">Ideen</p><div class="wv-tips">${WS_VID_TIPS.map((t) => `<button class="wsp-chip" onclick="$('wvQ').value=this.textContent;wsVidSearch(this.textContent)">${esc(t)}</button>`).join("")}</div>`;
    if (d.recent.length) h += `<p class="wv-sec">Zuletzt angesehen</p>` + d.recent.map((v, i) => wsVidCardH(v, i, "rec")).join("");
  }
  el.innerHTML = h;
}
WS_APPS.video = {
  icon: "🎬",
  name: "Video",
  order: 7,
  w: 66,
  h: 80,
  title: () => (WS_VID.list[WS_VID.i] ? "Video · " + WS_VID.list[WS_VID.i].title : "Video"),
  mount(w, body) {
    body.innerHTML = `<div class="wv">
      <form class="wwbar" onsubmit="event.preventDefault();wsVidSearch(this.q.value)">
        <select class="fi wv-src" onchange="WS_VID.f=this.value;if(WS_VID.q)wsVidSearch()" aria-label="Quelle"><option value="yt"${WS_VID.f === "yt" ? " selected" : ""}>YouTube</option><option value="ia"${WS_VID.f === "ia" ? " selected" : ""}>Archiv (frei)</option></select>
        <input class="fi" id="wvQ" name="q" value="${esc(WS_VID.q)}" placeholder="Video suchen oder Link einfügen" autocomplete="off">
        <button class="wstool" title="Suchen" aria-label="Suchen">🔎</button>
        <label class="wstool" title="Videodatei vom Gerät öffnen">📂<input type="file" accept="video/*,.mkv" multiple hidden onchange="wsVidFiles(this)"></label>
        <button type="button" class="wstool" onclick="wsVidLink()" title="Link einfügen" aria-label="Link einfügen">🔗</button></form>
      <div class="wv-main"><div class="wv-left"><div class="wv-stage" id="wvStage"><div class="wv-msg"><div style="font-size:42px">🎬</div><p>Kein Video ausgewählt</p></div></div><div class="wv-info" id="wvInfo"></div></div>
      <div class="wv-list" id="wvList"></div></div></div>`;
    wsVidInfo();
    wsVidPaintList();
    if (WS_VID.list[WS_VID.i]) wsVidAt(WS_VID.i);
  },
  unmount() {
    wsVidDestroy();
  },
  ctx: () => {
    const v = WS_VID.list[WS_VID.i];
    return v ? `Video: „${v.title}“ (${v.src})` : "Video: aus";
  },
};
async function wsVidAi(q) {
  q = String(q || "").trim().slice(0, 150);
  const w = wsOpen("video");
  if (!w) return "⚠️ Kein Fenster frei";
  const inp = $("wvQ");
  await wsCursor(inp, "KI sucht ein Video");
  if (inp) await wsTypeInto((t) => (inp.value = t), q);
  await wsVidSearch(q);
  if (!WS_VID.res.length) return "🎬 Nichts gefunden zu „" + q + "“";
  wsVidPlay(WS_VID.res, 0);
  return `🎬 Spielt: ${WS_VID.res[0].title}`;
}
