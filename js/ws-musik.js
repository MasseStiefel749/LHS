/* 🎵 Musik im Arbeitsplatz – sieht aus und funktioniert wie Spotify.
   Katalog: Spotify (Suche nach Songs, Künstlern, Alben und Playlists, Playlists per Link oder Profil) über die öffentlichen
   Spotify-Seiten, gelesen mit r.jina.ai. Abgespielt wird immer der ganze Song – über den offiziellen YouTube-Player
   (das Video ist sichtbar, kein Download). Dazu freie Musik von Audius und dem Internet Archive (dort auch zum Herunterladen).
   Credits: Musikdaten © Spotify, Wiedergabe über YouTube, alle Rechte bei den Künstlerinnen, Künstlern und Labels. */
const WS_AUD = "https://api.audius.co/v1";
const WS_JINA = "https://r.jina.ai/";
const WS_PIPED = "https://api.piped.private.coffee";
const WS_SPU = "https://open.spotify.com/";
const WS_YTC_KEY = "lh-ytc";
var WS_AUDIO = new Audio();
var WS_NOW = null;
const WS_ID = { sp: /^[A-Za-z0-9]{22}$/, yt: /^[\w-]{11}$/, au: /^[A-Za-z0-9]{1,20}$/, ia: /^[\w.-]{1,100}$/ };
const WS_P = { q: [], i: -1, ctx: null, shuffle: false, repeat: 0, yt: null, ytApi: null, mode: "", cand: [], ci: 0, tok: 0, vol: 0.8, busy: false, loop: 0 };
const WS_MUS = { hist: [{ v: "home" }], hi: 0, cache: new Map(), jina: [], cards: [], rows: [], rowCtx: null, lib: "", menuT: null, np: true, clean: false };
const WS_SP_TOP = [
  ["37i9dQZEVXbJiZcmkrIHGU", "Top 50 – Deutschland", "https://charts-images.scdn.co/assets/locale_en/regional/daily/region_de_default.jpg"],
  ["37i9dQZF1DXcBWIGoYBM5M", "Today’s Top Hits", "https://i.scdn.co/image/ab67706f00000002ffe80c69d2e795ea01e63447"],
  ["37i9dQZF1DX4jP4eebSWR9", "Hot Hits Deutschland", "https://i.scdn.co/image/ab67706f000000020b9c3c49dea6729350aabe86"],
  ["37i9dQZF1DWSTqUqJcxFk6", "Deutschrap Brandneu", "https://i.scdn.co/image/ab67706f0000000284dea2c6e8a28c1f0d82c56d"],
  ["37i9dQZEVXbMDoHDwVN2tF", "Top 50 – Global", "https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg"],
  ["37i9dQZF1DX0XUsuxWHRQd", "RapCaviar", "https://i.scdn.co/image/ab67706f000000024a9c51e58f024feff1f2c35f"],
  ["37i9dQZF1DXbYM3nMM0oPk", "Mega Hit Mix", "https://i.scdn.co/image/ab67706f00000002a3ea328f2589a7abf1ef46ca"],
  ["37i9dQZF1DX5Ejj0EkURtP", "All Out 2010s", "https://i.scdn.co/image/ab67706f00000002ddeb90231491c14812b062ff"],
];
const WS_SP_FOCUS = [
  ["37i9dQZF1DWWQRwui0ExPn", "lofi beats", "https://i.scdn.co/image/ab67706f00000002266beb50b0032b0f140a749e"],
  ["37i9dQZF1DWZeKCadgRdKQ", "Deep Focus", "https://i.scdn.co/image/ab67706f000000026020f2f6476db518ef747da4"],
  ["37i9dQZF1DX4sWSpwq3LiO", "Peaceful Piano", "https://i.scdn.co/image/ab67706f0000000270e1fb7db7b45809d6a80377"],
];
const WS_GENRES = [
  ["Pop", "#8d67ab"], ["Hip-Hop", "#ba5d07"], ["Deutschrap", "#e13300"], ["Rock", "#e91429"], ["Dance & Electronic", "#0d73ec"],
  ["Lofi", "#477d95"], ["Lernen & Fokus", "#503750"], ["Chill", "#8c1932"], ["Party", "#af2896"], ["Gaming", "#e8115b"],
  ["Klassik", "#7d4b32"], ["Indie", "#608108"], ["R&B", "#dc148c"], ["Workout", "#777777"], ["Schlafen", "#1e3264"], ["Jazz", "#a56752"],
];
const WS_IC = {
  play: "M8 5v14l11-7z",
  pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  next: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
  prev: "M6 6h2v12H6zm3.5 6 8.5 6V6z",
  shuffle: "M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
  repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  repeat1: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  heartO: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z",
  queue: "M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z",
  vol: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
  mute: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z",
  search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  lib: "M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
  more: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  dl: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  np: "M16 20H2V4h14v16zm2-12h4V4h-4v4zm0 12h4v-4h-4v4zm0-6h4v-4h-4v4z",
  back: "M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  fwd: "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  ext: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
  expand: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
};
const wsIc = (n, s) => `<svg viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" fill="currentColor" aria-hidden="true"><path d="${WS_IC[n]}"/></svg>`;
const wsHttps = (u) => (typeof u === "string" && /^https:\/\/[^\s"'<>()]+$/.test(u) ? u.slice(0, 600) : "");
const wsMusKey = (t) => t.src + ":" + t.id;
const wsStr = (v, n) => String(v == null ? "" : v).slice(0, n);

WS_AUDIO.preload = "none";
WS_AUDIO.addEventListener("ended", () => wsMusNext(1, true));
["play", "pause"].forEach((ev) => WS_AUDIO.addEventListener(ev, wsMusUi));
WS_AUDIO.addEventListener("timeupdate", wsMusTime);
WS_AUDIO.addEventListener("error", () => {
  if (WS_AUDIO.src && WS_P.mode === "a") toast("⚠️ Dieser Titel lässt sich gerade nicht abspielen");
});

/* ======================= Daten säubern (alles, was aus dem Netz oder dem Speicher kommt) ======================= */
function wsMusClean(t) {
  if (!t || !WS_ID[t.src] || typeof t.id !== "string" || !WS_ID[t.src].test(t.id)) return null;
  const o = { src: t.src, id: t.id, title: wsStr(t.title, 150) || "Ohne Titel", artist: wsStr(t.artist, 160), dur: wsNum(t.dur, 0, 36000, 0), art: wsHttps(t.art) };
  if (t.src === "sp") {
    o.artists = (Array.isArray(t.artists) ? t.artists : []).filter((a) => a && WS_ID.sp.test(a.id)).slice(0, 8).map((a) => ({ id: a.id, name: wsStr(a.name, 80) }));
    if (WS_ID.sp.test(t.alb)) o.alb = t.alb;
    o.album = wsStr(t.album, 150);
    if (t.ex) o.ex = 1;
  } else if (t.src === "au" || t.src === "ia") {
    o.dl = t.dl === "ia" ? "ia" : wsHttps(t.dl);
    o.link = wsHttps(t.link);
    o.lic = wsHttps(t.lic);
    if (t.src === "au") o.stream = `${WS_AUD}/tracks/${t.id}/stream?app_name=lernhub`;
  } else if (t.src === "yt") o.ch = wsStr(t.ch, 80);
  if (t.qd) o.qd = 1;
  return o;
}
function wsMusColClean(c) {
  if (!c || !/^(sp|au|own|liked)$/.test(c.src) || !/^(playlist|album|artist|user|track|liked)$/.test(c.kind)) return null;
  const id = String(c.id || "");
  const ok =
    c.src === "sp" ? (c.kind === "user" ? /^[\w.-]{1,64}$/.test(id) : WS_ID.sp.test(id)) : c.src === "au" ? WS_ID.au.test(id) : c.src === "own" ? /^p\d{1,16}$/.test(id) : id === "liked";
  if (!ok) return null;
  return { src: c.src, kind: c.kind, id, name: wsStr(c.name, 120) || "Ohne Namen", sub: wsStr(c.sub, 120), art: wsHttps(c.art) };
}
function wsMusLib() {
  const d = wsData("musik");
  const arr = (v) => (Array.isArray(v) ? v : []);
  if (!WS_MUS.clean) {
    WS_MUS.clean = true;
    d.liked = arr(d.liked).concat(arr(d.fav)).map(wsMusClean).filter(Boolean).slice(0, 1000);
    delete d.fav;
    delete d.q;
    d.pls = arr(d.pls)
      .filter((p) => p && /^p\d{1,16}$/.test(p.id))
      .slice(0, 50)
      .map((p) => ({ id: p.id, name: wsStr(p.name, 80) || "Meine Playlist", desc: wsStr(p.desc, 300), tracks: arr(p.tracks).map(wsMusClean).filter(Boolean).slice(0, 500) }));
    d.saved = arr(d.saved).map(wsMusColClean).filter(Boolean).slice(0, 100);
    d.recent = arr(d.recent).map(wsMusColClean).filter(Boolean).slice(0, 12);
    const last = d.last && typeof d.last === "object" ? d.last : {};
    d.last = { q: arr(last.q).map(wsMusClean).filter(Boolean).slice(0, 200), i: wsNum(last.i, 0, 199, 0), ctx: wsMusColClean(last.ctx) };
    WS_P.vol = wsNum(d.vol, 0, 1, 0.8);
  }
  return d;
}
const wsMusLinkOf = (t) =>
  t.src === "sp" ? WS_SPU + "track/" + t.id : t.src === "yt" ? "https://www.youtube.com/watch?v=" + t.id : t.link || "";

/* ======================= Spotify-Katalog (öffentliche Seiten über r.jina.ai) ======================= */
function wsMusCached(k, v) {
  if (v !== undefined) {
    WS_MUS.cache.set(k, { t: Date.now(), v });
    if (WS_MUS.cache.size > 80) WS_MUS.cache.delete(WS_MUS.cache.keys().next().value);
    return v;
  }
  const c = WS_MUS.cache.get(k);
  return c && Date.now() - c.t < 30 * 60000 ? c.v : null;
}
async function wsJina(url, opt) {
  const now = Date.now();
  WS_MUS.jina = WS_MUS.jina.filter((t) => now - t < 60000);
  if (WS_MUS.jina.length >= 18) throw new Error("Zu viele Anfragen in einer Minute – kurz warten und nochmal");
  WS_MUS.jina.push(now);
  const h = {};
  if (opt && opt.html) h["X-Respond-With"] = "html";
  if (opt && opt.wait) {
    h["X-Wait-For-Selector"] = opt.wait;
    h["X-Timeout"] = "25";
  }
  const ac = new AbortController(),
    tm = setTimeout(() => ac.abort(), 45000);
  try {
    const r = await fetch(WS_JINA + url, { headers: h, signal: ac.signal });
    if (r.status === 429) throw new Error("Der Spotify-Leser ist gerade ausgelastet – gleich nochmal versuchen");
    if (!r.ok) throw new Error("Spotify gerade nicht erreichbar (HTTP " + r.status + ")");
    return await r.text();
  } catch (e) {
    throw e.name === "AbortError" ? new Error("Spotify antwortet nicht (Zeitüberschreitung)") : e;
  } finally {
    clearTimeout(tm);
  }
}
const wsMdTxt = (s) =>
  String(s || "")
    .replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim()
    .slice(0, 150);
/* Suchseiten von open.spotify.com als Markdown → Songs, Künstler, Alben, Playlists */
function wsSpParse(md) {
  const out = { track: [], artist: [], album: [], playlist: [] },
    seen = new Set();
  const L = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\(https:\/\/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|artist|album|playlist|show|episode|user)\/([\w.-]+)[^)]*\)/g;
  const add = (k, o) => {
    if (o && !seen.has(k + o.id)) {
      seen.add(k + o.id);
      out[k].push(o);
    }
  };
  String(md || "")
    .split(/!\[Image \d+\]\(/)
    .slice(1)
    .forEach((b) => {
      const art = wsHttps((/^([^)\s]+)\)/.exec(b) || [])[1]);
      const ls = [...b.matchAll(L)].map((m) => ({ name: wsMdTxt(m[1]), type: m[2], id: m[3] }));
      const p = ls[0];
      if (!p || !WS_ID.sp.test(p.id)) return;
      const ars = ls.filter((l) => l.type === "artist" && WS_ID.sp.test(l.id)).map((l) => ({ id: l.id, name: l.name }));
      if (p.type === "artist") ars.forEach((a, i) => add("artist", { src: "sp", kind: "artist", id: a.id, name: a.name, sub: "Künstler", art: i ? "" : art }));
      else if (p.type === "track") {
        const al = ls.find((l) => l.type === "album" && WS_ID.sp.test(l.id)),
          d = /(?:^|\n)\s*(\d{1,2}):(\d{2})\s*(?:\n|$)/.exec(b);
        add(
          "track",
          wsMusClean({
            src: "sp",
            id: p.id,
            title: p.name,
            artist: ars.map((a) => a.name).join(", "),
            artists: ars,
            alb: al && al.id,
            album: al ? al.name : "",
            dur: d ? +d[1] * 60 + +d[2] : 0,
            art,
            ex: /\/track\/[A-Za-z0-9]{22}[^)]*\)\s*E\[/.test(b),
          }),
        );
      } else if (p.type === "album") {
        const y = (/\b((?:19|20)\d{2})\s*•/.exec(b) || [])[1] || "";
        add("album", { src: "sp", kind: "album", id: p.id, name: p.name, sub: [y, ars.map((a) => a.name).join(", ")].filter(Boolean).join(" • "), artists: ars, art });
      } else if (p.type === "playlist") {
        const by = (/\nBy ([^\n]{1,80})/.exec(b) || [])[1] || (/([\d.,]+ Followers)/.exec(b) || [])[1] || "";
        add("playlist", { src: "sp", kind: "playlist", id: p.id, name: p.name, sub: by ? (/Followers/.test(by) ? by.replace("Followers", "Follower") : "Von " + wsMdTxt(by)) : "Playlist", art });
      }
    });
  return out;
}
async function wsSpSearch(q, f) {
  const path = { "": "", tracks: "/tracks", artists: "/artists", albums: "/albums", playlists: "/playlists" }[f || ""];
  const sel = { "": "track", tracks: "track", artists: "artist", albums: "album", playlists: "playlist" }[f || ""];
  const url = `${WS_SPU}search/${encodeURIComponent(q)}${path}`;
  const c = wsMusCached(url);
  if (c) return c;
  return wsMusCached(url, wsSpParse(await wsJina(url, { wait: `a[href*='/${sel}/']` })));
}
async function wsSpUser(name) {
  const url = `${WS_SPU}user/${encodeURIComponent(name)}/playlists`;
  const c = wsMusCached(url);
  if (c) return c;
  return wsMusCached(url, wsSpParse(await wsJina(url, { wait: "a[href*='/playlist/']" })).playlist);
}
/* Playlist, Album, Künstler oder Song: die Einbett-Seite von Spotify enthält alle Daten als JSON */
async function wsSpEnt(kind, id) {
  const k = kind + ":" + id,
    c = wsMusCached(k);
  if (c) return c;
  const html = await wsJina(`${WS_SPU}embed/${kind}/${id}`, { html: 1 });
  const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  let e = null;
  try {
    e = m && JSON.parse(m[1]).props.pageProps.state.data.entity;
  } catch (x) {}
  if (!e) throw new Error("Nicht gefunden – ist das privat oder gelöscht?");
  const imgs = [...((e.coverArt && e.coverArt.sources) || []), ...((e.visualIdentity && e.visualIdentity.image) || [])]
    .map((i) => ({ u: wsHttps(i && i.url), w: +(i && (i.width || i.maxWidth)) || 0 }))
    .filter((i) => i.u)
    .sort((a, b) => Math.abs(a.w - 300) - Math.abs(b.w - 300));
  const art = imgs.length ? imgs[0].u : "";
  const bg = e.visualIdentity && e.visualIdentity.backgroundBase;
  const col = bg ? `rgb(${wsNum(bg.red, 0, 255, 60) | 0},${wsNum(bg.green, 0, 255, 60) | 0},${wsNum(bg.blue, 0, 255, 60) | 0})` : "";
  const year = String((e.releaseDate && e.releaseDate.isoString) || "").slice(0, 4);
  const spId = (uri, t) => (new RegExp(`^spotify:${t}:([A-Za-z0-9]{22})$`).exec(uri || "") || [])[1];
  let tracks;
  if (kind === "track") {
    const ars = (e.artists || []).map((a) => ({ id: spId(a.uri, "artist"), name: a.name })).filter((a) => a.id);
    tracks = [wsMusClean({ src: "sp", id, title: e.name || e.title, artist: ars.map((a) => a.name).join(", "), artists: ars, dur: (e.duration || 0) / 1000, art, ex: e.isExplicit })];
  } else
    tracks = (e.trackList || [])
      .map((x) => {
        const tid = spId(x.uri, "track");
        return tid && wsMusClean({ src: "sp", id: tid, title: x.title, artist: x.subtitle, dur: (x.duration || 0) / 1000, art: kind === "album" ? art : "", alb: kind === "album" ? id : "", album: kind === "album" ? e.name : "", ex: x.isExplicit });
      })
      .filter(Boolean);
  const sub = kind === "track" ? tracks[0].artist : wsStr(e.subtitle, 120);
  return wsMusCached(k, { src: "sp", kind, id, name: wsStr(e.name || e.title, 150), sub, art, col, year, tracks, artists: kind === "track" ? tracks[0].artists : [] });
}

/* ======================= Audius & Internet Archive (frei, ganze Songs, teils downloadbar) ======================= */
function wsAuTrack(t) {
  if (!t || !WS_ID.au.test(t.id) || t.is_streamable === false || t.is_stream_gated) return null;
  const dl = t.is_downloadable && !t.is_download_gated && t.download && t.download.url;
  return wsMusClean({
    src: "au",
    id: t.id,
    title: t.title,
    artist: t.user && t.user.name,
    dur: +t.duration || 0,
    art: t.artwork && (t.artwork["480x480"] || t.artwork["150x150"]),
    dl,
    link: t.permalink ? "https://audius.co" + String(t.permalink).replace(/[^\w/%.-]/g, "") : "",
  });
}
const wsAuPl = (p) =>
  p && WS_ID.au.test(p.id)
    ? wsMusColClean({ src: "au", kind: "playlist", id: p.id, name: p.playlist_name, sub: (p.is_album ? "Album" : "Playlist") + " • " + ((p.user && p.user.name) || "Audius"), art: p.artwork && (p.artwork["480x480"] || p.artwork["150x150"]) })
    : null;
const wsAuUser = (u) =>
  u && WS_ID.au.test(u.id) ? wsMusColClean({ src: "au", kind: "user", id: u.id, name: u.name, sub: "Künstler • Audius", art: u.profile_picture && (u.profile_picture["480x480"] || u.profile_picture["150x150"]) }) : null;
async function wsAuGet(path) {
  const k = "au:" + path,
    c = wsMusCached(k);
  if (c) return c;
  const r = await fetch(`${WS_AUD}${path}${path.includes("?") ? "&" : "?"}app_name=lernhub`);
  if (!r.ok) throw new Error("Audius: HTTP " + r.status);
  const j = await r.json();
  return wsMusCached(k, j && j.data);
}
function wsIaTrack(x) {
  if (!x || !WS_ID.ia.test(x.identifier)) return null;
  const one = (v) => String(Array.isArray(v) ? v[0] : v || "");
  return wsMusClean({
    src: "ia",
    id: x.identifier,
    title: one(x.title) || x.identifier,
    artist: one(x.creator),
    art: `https://archive.org/services/img/${x.identifier}`,
    dl: "ia",
    link: `https://archive.org/details/${x.identifier}`,
    lic: one(x.licenseurl).replace(/^http:/, "https:"),
  });
}
async function wsIaSearch(q) {
  const ia = String(q).replace(/[^\p{L}\p{N}\s'-]/gu, " ").trim() || "music";
  const r = await fetch(
    `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${ia}) AND mediatype:audio AND licenseurl:(*creativecommons* OR *publicdomain*) AND -collection:podcasts AND -collection:librivoxaudio`)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&sort[]=downloads+desc&rows=25&output=json`,
  );
  if (!r.ok) throw new Error("Internet Archive: HTTP " + r.status);
  return (((await r.json()).response || {}).docs || []).map(wsIaTrack).filter(Boolean);
}
// Internet-Archive-Einträge sind Alben – die erste MP3 wird erst beim Abspielen gesucht
async function wsMusSrc(t) {
  if (t.src === "au") return `${WS_AUD}/tracks/${t.id}/stream?app_name=lernhub`;
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

/* ======================= YouTube: passendes Video zum Spotify-Song finden und abspielen ======================= */
function wsYtCache(k, v) {
  let c = {};
  try {
    c = JSON.parse(localStorage.getItem(WS_YTC_KEY) || "{}") || {};
  } catch (e) {}
  if (v === undefined) return Array.isArray(c[k]) ? c[k].filter((x) => WS_ID.yt.test(x)) : [];
  c[k] = v;
  const ks = Object.keys(c);
  if (ks.length > 600) ks.slice(0, ks.length - 600).forEach((x) => delete c[x]);
  try {
    localStorage.setItem(WS_YTC_KEY, JSON.stringify(c));
  } catch (e) {}
}
async function wsPipedFind(q, dur) {
  const get = async (f) => {
    const ac = new AbortController(),
      tm = setTimeout(() => ac.abort(), 12000);
    try {
      const r = await fetch(`${WS_PIPED}/search?q=${encodeURIComponent(q)}&filter=${f}`, { signal: ac.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      return (j.items || [])
        .map((x) => ({ id: (/[?&]v=([\w-]{11})/.exec((x && x.url) || "") || [])[1], d: +x.duration || 0, t: String(x.title || ""), up: String(x.uploaderName || "") }))
        .filter((x) => x.id);
    } finally {
      clearTimeout(tm);
    }
  };
  let it = await get("music_songs");
  if (!it.length) it = await get("videos");
  const bad = /\b(live|cover|karaoke|remix|sped ?up|slowed|8d|nightcore|instrumental|reaction|lyrics? video)\b/i;
  const score = (x) => (dur && x.d ? Math.min(60, Math.abs(x.d - dur)) : 20) + (bad.test(x.t) && !bad.test(q) ? 40 : 0) - (/ - Topic$/.test(x.up) ? 5 : 0);
  return it
    .slice(0, 12)
    .sort((a, b) => score(a) - score(b))
    .map((x) => x.id)
    .slice(0, 4);
}
async function wsYtHtmlFind(q) {
  const html = await wsJina("https://www.youtube.com/results?search_query=" + encodeURIComponent(q), { html: 1 });
  return [...new Set([...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]))].slice(0, 5);
}
async function wsYtFind(t) {
  if (t.src === "yt") return [t.id];
  const hit = wsYtCache(t.id);
  if (hit.length) return hit;
  const q = `${String(t.artist || "").split(",")[0]} ${t.title}`.replace(/\s+/g, " ").trim().slice(0, 120);
  let ids = [];
  try {
    ids = await wsPipedFind(q, t.dur);
  } catch (e) {}
  if (!ids.length)
    try {
      ids = await wsYtHtmlFind(q + " audio");
    } catch (e) {}
  if (ids.length) wsYtCache(t.id, ids);
  return ids;
}
function wsYtApi() {
  if (window.YT && YT.Player) return Promise.resolve(window.YT);
  if (WS_P.ytApi) return WS_P.ytApi;
  WS_P.ytApi = new Promise((res, rej) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      res(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => rej(new Error("YouTube ist nicht erreichbar"));
    document.head.appendChild(s);
    setTimeout(() => rej(new Error("YouTube lädt nicht")), 20000);
  });
  WS_P.ytApi.catch(() => (WS_P.ytApi = null));
  return WS_P.ytApi;
}
function wsYtBox() {
  let box = document.getElementById("wmYtBox");
  if (box) return box;
  box = document.createElement("div");
  box.id = "wmYtBox";
  box.className = "wmytbox float";
  box.hidden = true;
  box.innerHTML = `<div class="wmythead"><b id="wmYtT"></b>
    <button onclick="wsMusNext(-1)" title="Zurück" aria-label="Zurück">${wsIc("prev", 18)}</button>
    <button id="wmYtPP" onclick="wsMusToggle()" title="Abspielen/Pause" aria-label="Abspielen/Pause">${wsIc("pause", 18)}</button>
    <button onclick="wsMusNext(1)" title="Weiter" aria-label="Weiter">${wsIc("next", 18)}</button>
    <button onclick="wsOpen('musik')" title="Musik öffnen" aria-label="Musik öffnen">${wsIc("expand", 18)}</button>
    <button onclick="wsMusStop()" title="Stopp" aria-label="Stopp">${wsIc("close", 18)}</button></div><div class="wmytin"><div id="wmYt"></div></div>`;
  document.body.appendChild(box);
  return box;
}
async function wsYtPlayer() {
  if (WS_P.yt) return WS_P.yt;
  if (WS_P.ytMaking) return WS_P.ytMaking;
  WS_P.ytMaking = (async () => {
    const YTa = await wsYtApi();
    wsYtBox();
    return new Promise((res, rej) => {
      const tm = setTimeout(() => rej(new Error("YouTube-Player startet nicht")), 20000);
      const p = new YTa.Player("wmYt", {
        host: "https://www.youtube-nocookie.com",
        width: 640,
        height: 360,
        playerVars: { playsinline: 1, rel: 0, iv_load_policy: 3, fs: 1 },
        events: {
          onReady: () => {
            clearTimeout(tm);
            WS_P.yt = p;
            res(p);
          },
          onStateChange: (e) => {
            if (e.data === 0) wsMusNext(1, true);
            wsMusUi();
          },
          onError: wsYtErr,
        },
      });
    });
  })();
  WS_P.ytMaking.catch(() => {}).then(() => (WS_P.ytMaking = null));
  return WS_P.ytMaking;
}
function wsYtErr() {
  // 101/150: Einbetten verboten, 100: weg, 2/5: kaputt – nächstes passendes Video probieren
  if (WS_P.mode !== "y" || !WS_P.yt) return;
  WS_P.ci++;
  if (WS_P.cand[WS_P.ci]) return WS_P.yt.loadVideoById(WS_P.cand[WS_P.ci]);
  if (WS_NOW && WS_NOW.src === "sp") wsYtCache(WS_NOW.id, []);
  toast("😕 Kein abspielbares Video zu „" + ((WS_NOW && WS_NOW.title) || "diesem Song") + "“ – weiter zum nächsten");
  if (WS_P.q.length > 1) setTimeout(() => wsMusNext(1, true), 900);
}
function wsYtState() {
  try {
    return WS_P.yt ? WS_P.yt.getPlayerState() : -1;
  } catch (e) {
    return -1;
  }
}
/* Das Video liegt über dem Platzhalter im Musik-Fenster – ist der verdeckt oder zu, schwebt es als Mini-Player unten rechts */
function wsYtPlace() {
  const box = document.getElementById("wmYtBox");
  if (!box) return;
  const on = WS_P.mode === "y" && !!WS_NOW;
  box.hidden = !on;
  if (!on) return;
  const ph = document.getElementById("wmVid");
  let r = null;
  if (ph) {
    const q = ph.getBoundingClientRect();
    if (q.width > 120 && q.height > 68) {
      const pts = [
        [q.left + q.width / 2, q.top + q.height / 2],
        [q.left + 6, q.top + 6],
        [q.right - 6, q.bottom - 6],
      ];
      const ok = pts.every(([x, y]) => {
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
        const hit = document.elementsFromPoint(x, y).find((el) => !box.contains(el));
        return hit && (hit === ph || ph.contains(hit));
      });
      if (ok) r = q;
    }
  }
  box.classList.toggle("float", !r);
  if (r) {
    const s = box.style;
    const v = [r.left, r.top, r.width, r.height].map((x) => Math.round(x) + "px");
    if (s.left !== v[0] || s.top !== v[1] || s.width !== v[2] || s.height !== v[3]) Object.assign(s, { left: v[0], top: v[1], width: v[2], height: v[3] });
  } else if (box.style.left) box.removeAttribute("style");
}
function wsYtLoop() {
  if (WS_P.loop) return;
  const f = () => {
    if (WS_P.mode !== "y") {
      WS_P.loop = 0;
      return wsYtPlace();
    }
    wsYtPlace();
    WS_P.loop = requestAnimationFrame(f);
  };
  WS_P.loop = requestAnimationFrame(f);
}
setInterval(() => {
  if (WS_P.mode === "y" && WS_P.yt) wsMusTime();
}, 500);

/* ======================= Wiedergabe ======================= */
function wsMusPlaying() {
  if (WS_P.mode === "y") {
    const s = wsYtState();
    return s === 1 || s === 3 || (WS_P.busy && !!WS_NOW);
  }
  return WS_P.mode === "a" && !!WS_AUDIO.src && !WS_AUDIO.paused;
}
function wsMusPos() {
  if (WS_P.mode === "y" && WS_P.yt && WS_P.yt.getCurrentTime) {
    try {
      return { cur: WS_P.yt.getCurrentTime() || 0, dur: WS_P.yt.getDuration() || (WS_NOW && WS_NOW.dur) || 0 };
    } catch (e) {}
  }
  if (WS_P.mode === "a") return { cur: WS_AUDIO.currentTime || 0, dur: WS_AUDIO.duration || (WS_NOW && WS_NOW.dur) || 0 };
  return { cur: 0, dur: (WS_NOW && WS_NOW.dur) || 0 };
}
function wsMusPlayList(list, i, ctx) {
  const l = (list || []).map(wsMusClean).filter(Boolean).slice(0, 500);
  if (!l.length) return toast("Hier ist nichts zum Abspielen");
  WS_P.q = l;
  // Suchergebnisse & Trends sind keine echte Sammlung – Name nur für die Anzeige, nicht in „Zuletzt gehört“
  WS_P.ctx = ctx && /^(search|trend)$/.test(ctx.id) ? null : wsMusColClean(ctx);
  if (WS_P.ctx) {
    const d = wsMusLib();
    d.recent = [WS_P.ctx].concat(d.recent.filter((c) => !(c.src === WS_P.ctx.src && c.id === WS_P.ctx.id))).slice(0, 12);
  }
  wsMusPlayAt(WS_P.shuffle && i == null ? Math.floor(Math.random() * l.length) : Math.max(0, Math.min(l.length - 1, i || 0)));
}
async function wsMusPlayAt(i) {
  const t = WS_P.q[i];
  if (!t) return;
  WS_P.i = i;
  WS_NOW = t;
  const tok = ++WS_P.tok;
  if (window.wsVidPause) wsVidPause();
  const d = wsMusLib();
  d.last = { q: WS_P.q.slice(0, 200), i: Math.min(i, 199), ctx: WS_P.ctx };
  wsSave();
  if (t.src === "sp" || t.src === "yt") {
    WS_AUDIO.pause();
    WS_P.mode = "y";
    WS_P.busy = true;
    wsYtBox();
    wsMusUi(true);
    const ids = await wsYtFind(t).catch(() => []);
    if (tok !== WS_P.tok) return;
    if (!ids.length) {
      WS_P.busy = false;
      wsMusUi();
      toast("😕 Zu „" + t.title + "“ finde ich gerade kein Video" + (WS_P.q.length > 1 ? " – nächster Song" : ""), 3500);
      if (WS_P.q.length > 1) setTimeout(() => tok === WS_P.tok && wsMusNext(1, true), 1500);
      return;
    }
    WS_P.cand = ids;
    WS_P.ci = 0;
    if (!t.art) t.art = `https://i.ytimg.com/vi/${ids[0]}/mqdefault.jpg`;
    let p;
    try {
      p = await wsYtPlayer();
    } catch (e) {
      WS_P.busy = false;
      wsMusUi();
      return toast("⚠️ " + e.message, 4000);
    }
    if (tok !== WS_P.tok) return;
    p.loadVideoById(ids[0]);
    p.setVolume(Math.round(WS_P.vol * 100));
    WS_P.busy = false;
    wsYtLoop();
  } else {
    if (WS_P.yt) {
      try {
        WS_P.yt.stopVideo();
      } catch (e) {}
    }
    WS_P.mode = "a";
    wsYtPlace();
    wsMusUi(true);
    try {
      await wsMusSrc(t);
    } catch (e) {
      return toast("⚠️ Abspielen ging nicht: " + e.message, 4000);
    }
    if (tok !== WS_P.tok) return;
    WS_AUDIO.src = t.stream || (await wsMusSrc(t));
    WS_AUDIO.volume = WS_P.vol;
    WS_AUDIO.play().catch(() => {});
  }
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: t.album || (WS_P.ctx && WS_P.ctx.name) || "", artwork: t.art ? [{ src: t.art, sizes: "300x300" }] : [] });
      navigator.mediaSession.setActionHandler("play", wsMusToggle);
      navigator.mediaSession.setActionHandler("pause", wsMusToggle);
      navigator.mediaSession.setActionHandler("nexttrack", () => wsMusNext(1));
      navigator.mediaSession.setActionHandler("previoustrack", () => wsMusNext(-1));
    } catch (e) {}
  }
  wsMusUi(true);
}
function wsMusNext(d, auto) {
  const n = WS_P.q.length;
  if (!n) return;
  if (auto && WS_P.repeat === 2) return wsMusSeekTo(0, true);
  if (d < 0 && wsMusPos().cur > 3) return wsMusSeekTo(0);
  let j = WS_P.i + d;
  if (WS_P.shuffle && n > 1 && d > 0 && !(WS_P.q[WS_P.i + 1] && WS_P.q[WS_P.i + 1].qd)) {
    do j = Math.floor(Math.random() * n);
    while (j === WS_P.i);
  }
  if (j >= n) {
    if (auto && WS_P.repeat !== 1) {
      WS_P.mode === "y" && WS_P.yt ? WS_P.yt.pauseVideo() : WS_AUDIO.pause();
      return wsMusUi();
    }
    j = 0;
  }
  if (j < 0) j = n - 1;
  if (WS_P.q[WS_P.i] && WS_P.q[WS_P.i].qd) delete WS_P.q[WS_P.i].qd;
  wsMusPlayAt(j);
}
function wsMusToggle() {
  if (WS_P.mode === "y" && WS_P.yt) {
    const s = wsYtState();
    if (s === 1 || s === 3) WS_P.yt.pauseVideo();
    else {
      if (window.wsVidPause) wsVidPause();
      WS_P.yt.playVideo();
    }
    setTimeout(wsMusUi, 150);
  } else if (WS_P.mode === "a" && WS_AUDIO.src) {
    if (WS_AUDIO.paused) {
      if (window.wsVidPause) wsVidPause();
      WS_AUDIO.play().catch(() => {});
    } else WS_AUDIO.pause();
  } else if (WS_P.q.length) wsMusPlayAt(Math.max(0, WS_P.i));
  else toast("Such dir erst einen Song aus 🎵");
}
function wsMusPause() {
  if (WS_P.mode === "y" && WS_P.yt && [1, 3].includes(wsYtState())) WS_P.yt.pauseVideo();
  if (WS_P.mode === "a" && !WS_AUDIO.paused) WS_AUDIO.pause();
  setTimeout(wsMusUi, 150);
}
function wsMusStop() {
  WS_P.tok++;
  if (WS_P.yt) {
    try {
      WS_P.yt.stopVideo();
    } catch (e) {}
  }
  WS_AUDIO.pause();
  WS_P.mode = "";
  wsYtPlace();
  wsMusUi();
}
function wsMusSeekTo(sec, play) {
  if (WS_P.mode === "y" && WS_P.yt) {
    WS_P.yt.seekTo(sec, true);
    if (play) WS_P.yt.playVideo();
  } else if (WS_P.mode === "a") {
    WS_AUDIO.currentTime = sec;
    if (play) WS_AUDIO.play().catch(() => {});
  }
  wsMusTime();
}
function wsMusSeek(v) {
  const p = wsMusPos();
  if (p.dur) wsMusSeekTo((v / 1000) * p.dur);
}
function wsMusVol(v) {
  WS_P.vol = wsNum(v, 0, 1, 0.8);
  WS_AUDIO.volume = WS_P.vol;
  if (WS_P.yt) {
    try {
      WS_P.yt.setVolume(Math.round(WS_P.vol * 100));
    } catch (e) {}
  }
  wsMusLib().vol = WS_P.vol;
  wsSave();
  const r = $("wmVol");
  if (r) r.style.setProperty("--p", WS_P.vol * 100 + "%");
  const b = $("wmVolB");
  if (b) b.innerHTML = wsIc(WS_P.vol ? "vol" : "mute", 18);
}
function wsMusMute() {
  if (WS_P.vol) {
    WS_P.mvol = WS_P.vol;
    wsMusVol(0);
  } else wsMusVol(WS_P.mvol || 0.8);
  const r = $("wmVol");
  if (r) r.value = WS_P.vol;
}
function wsMusShuffle() {
  WS_P.shuffle = !WS_P.shuffle;
  wsMusUi();
}
function wsMusRepeat() {
  WS_P.repeat = (WS_P.repeat + 1) % 3;
  wsMusUi();
}
function wsMusQueueAdd(t) {
  t = wsMusClean(t);
  if (!t) return;
  t.qd = 1;
  if (!WS_P.q.length) {
    WS_P.q = [t];
    return wsMusPlayAt(0);
  }
  let k = WS_P.i + 1;
  while (WS_P.q[k] && WS_P.q[k].qd) k++;
  WS_P.q.splice(k, 0, t);
  if (WS_P.q.length > 500) WS_P.q.length = 500;
  toast("Zur Warteschlange hinzugefügt");
  if (wsMusCur().v === "queue") wsMusView();
}
function wsMusFmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  return s >= 3600 ? Math.floor(s / 3600) + ":" + String(Math.floor(s / 60) % 60).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0") : Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
function wsMusTotal(list) {
  const s = list.reduce((a, t) => a + (t.dur || 0), 0);
  if (!s) return "";
  return s >= 3600 ? `ca. ${Math.floor(s / 3600)} Std. ${Math.floor(s / 60) % 60} Min.` : `${Math.floor(s / 60)} Min. ${Math.floor(s % 60)} Sek.`;
}
function wsMusTime() {
  const sk = $("wmSeek");
  if (!sk) return;
  const p = wsMusPos();
  const pct = p.dur ? Math.min(100, (p.cur / p.dur) * 100) : 0;
  if (document.activeElement !== sk) {
    sk.value = Math.round(pct * 10);
    sk.style.setProperty("--p", pct + "%");
    $("wmCur").textContent = wsMusFmt(p.cur);
  }
  $("wmDur").textContent = p.dur ? wsMusFmt(p.dur) : "-:--";
}

/* ======================= Bibliothek ======================= */
function wsMusLiked(t) {
  return !!t && wsMusLib().liked.some((x) => x.src === t.src && x.id === t.id);
}
function wsMusLike(t) {
  t = wsMusClean(t);
  if (!t) return;
  const d = wsMusLib(),
    j = d.liked.findIndex((x) => x.src === t.src && x.id === t.id);
  if (j >= 0) d.liked.splice(j, 1);
  else {
    if (d.liked.length >= 1000) return toast("Höchstens 1000 Lieblingssongs");
    delete t.qd;
    d.liked.unshift(t);
  }
  wsSave();
  toast(j >= 0 ? "Aus Lieblingssongs entfernt" : "Zu Lieblingssongs hinzugefügt");
  const k = wsMusKey(t);
  document.querySelectorAll(`.wsp [data-lk="${k}"]`).forEach((b) => {
    b.classList.toggle("on", j < 0);
    b.innerHTML = wsIc(j < 0 ? "heart" : "heartO", b.dataset.s || 16);
  });
  if (wsMusCur().v === "col" && wsMusCur().src === "liked") wsMusView();
  wsMusLibPaint();
}
function wsMusSaved(c) {
  return !!c && wsMusLib().saved.some((x) => x.src === c.src && x.kind === c.kind && x.id === c.id);
}
function wsMusSave(c) {
  c = wsMusColClean(c);
  if (!c || c.src === "own" || c.src === "liked") return;
  const d = wsMusLib(),
    j = d.saved.findIndex((x) => x.src === c.src && x.kind === c.kind && x.id === c.id);
  if (j >= 0) d.saved.splice(j, 1);
  else if (d.saved.length >= 100) return toast("Höchstens 100 gespeicherte Einträge");
  else d.saved.unshift(c);
  wsSave();
  toast(j >= 0 ? "Aus deiner Bibliothek entfernt" : "In deiner Bibliothek gespeichert");
  wsMusLibPaint();
  wsMusView();
}
function wsMusPlNew(name, tracks) {
  const d = wsMusLib();
  if (d.pls.length >= 50) return toast("Höchstens 50 eigene Playlists"), null;
  const p = { id: "p" + Date.now(), name: wsStr(name, 80) || "Meine Playlist #" + (d.pls.length + 1), desc: "", tracks: (tracks || []).map(wsMusClean).filter(Boolean).slice(0, 500) };
  p.tracks.forEach((t) => delete t.qd);
  d.pls.unshift(p);
  wsSave();
  wsMusLibPaint();
  return p;
}
function wsMusPlAdd(pid, t) {
  const p = wsMusLib().pls.find((x) => x.id === pid);
  t = wsMusClean(t);
  if (!p || !t) return;
  delete t.qd;
  if (p.tracks.some((x) => x.src === t.src && x.id === t.id)) return toast("Ist schon in „" + p.name + "“");
  if (p.tracks.length >= 500) return toast("Höchstens 500 Songs pro Playlist");
  p.tracks.push(t);
  wsSave();
  closeModal();
  toast("Zu „" + p.name + "“ hinzugefügt");
  if (wsMusCur().id === pid) wsMusView();
}
function wsMusPlRename(pid) {
  const p = wsMusLib().pls.find((x) => x.id === pid);
  if (!p) return;
  const n = prompt("Name der Playlist:", p.name);
  if (n == null) return;
  p.name = wsStr(n.trim(), 80) || p.name;
  wsSave();
  wsMusLibPaint();
  wsMusView();
}
function wsMusPlDel(pid) {
  const d = wsMusLib(),
    p = d.pls.find((x) => x.id === pid);
  if (!p || !confirm(`Playlist „${p.name}“ löschen?`)) return;
  d.pls = d.pls.filter((x) => x.id !== pid);
  wsSave();
  wsMusLibPaint();
  wsMusGo({ v: "home" });
}
function wsMusPlRemove(pid, i) {
  const p = wsMusLib().pls.find((x) => x.id === pid);
  if (!p || !p.tracks[i]) return;
  p.tracks.splice(i, 1);
  wsSave();
  wsMusView();
}

/* ======================= Navigation & Ansichten ======================= */
const wsMusCur = () => WS_MUS.hist[WS_MUS.hi] || { v: "home" };
function wsMusGo(v, replace) {
  if (!$("wmView")) {
    WS_MUS.hist = WS_MUS.hist.slice(0, WS_MUS.hi + 1);
    WS_MUS.hist.push(v);
    WS_MUS.hi = WS_MUS.hist.length - 1;
    return wsOpen("musik");
  }
  if (replace) WS_MUS.hist[WS_MUS.hi] = v;
  else {
    WS_MUS.hist = WS_MUS.hist.slice(0, WS_MUS.hi + 1);
    WS_MUS.hist.push(v);
    if (WS_MUS.hist.length > 40) WS_MUS.hist.shift();
    WS_MUS.hi = WS_MUS.hist.length - 1;
  }
  wsMusView();
  const m = $("wmView");
  if (m) m.scrollTop = 0;
}
function wsMusHist(d) {
  const j = WS_MUS.hi + d;
  if (j < 0 || j >= WS_MUS.hist.length) return;
  WS_MUS.hi = j;
  wsMusView();
}
function wsMusOpen(c) {
  c = wsMusColClean(c);
  if (c) wsMusGo({ v: "col", src: c.src, kind: c.kind, id: c.id, name: c.name, art: c.art, sub: c.sub });
}
function wsMusSearchGo(q, f) {
  q = String(q || "").trim().slice(0, 200);
  const link = wsMusParseLink(q);
  if (link) return wsMusOpen(Object.assign({ name: "Wird geladen …" }, link));
  wsMusGo({ v: "search", q, f: f != null ? f : (wsMusCur().v === "search" && wsMusCur().f) || "" }, wsMusCur().v === "search");
}
function wsMusParseLink(s) {
  s = String(s || "").trim();
  let m = /(?:open\.spotify\.com\/(?:intl-[\w-]+\/)?(?:embed\/)?|spotify:)(track|album|playlist|artist|user)[/:]([\w.-]{1,64})/.exec(s);
  if (m && (m[1] === "user" ? /^[\w.-]{1,64}$/.test(m[2]) : WS_ID.sp.test(m[2]))) return { src: "sp", kind: m[1], id: m[2] };
  return null;
}
async function wsMusLoad(v) {
  if (v.data || v.loading) return;
  v.loading = true;
  v.err = "";
  try {
    v.data = await wsMusFetch(v);
  } catch (e) {
    v.err = e.message || "Fehler";
  }
  v.loading = false;
  if (wsMusCur() === v) wsMusView();
}
async function wsMusFetch(v) {
  if (v.v === "search") {
    const q = v.q;
    if (v.f === "au") {
      const [tr, pl, us] = await Promise.allSettled([
        wsAuGet(`/tracks/search?query=${encodeURIComponent(q)}`),
        wsAuGet(`/playlists/search?query=${encodeURIComponent(q)}`),
        wsAuGet(`/users/search?query=${encodeURIComponent(q)}`),
      ]).then((r) => r.map((x) => (x.status === "fulfilled" && Array.isArray(x.value) ? x.value : [])));
      return { track: tr.map(wsAuTrack).filter(Boolean).slice(0, 30), playlist: pl.map(wsAuPl).filter(Boolean).slice(0, 12), artist: us.map(wsAuUser).filter(Boolean).slice(0, 12), album: [] };
    }
    if (v.f === "ia") return { track: await wsIaSearch(q), artist: [], album: [], playlist: [] };
    return wsSpSearch(q, v.f);
  }
  if (v.v === "col") {
    if (v.src === "sp" && v.kind === "user") return { tracks: [], items: await wsSpUser(v.id) };
    if (v.src === "sp") return wsSpEnt(v.kind, v.id);
    if (v.src === "au" && v.kind === "playlist") {
      const [meta, tr] = await Promise.all([wsAuGet(`/playlists/${v.id}`), wsAuGet(`/playlists/${v.id}/tracks`)]);
      const p = wsAuPl(Array.isArray(meta) ? meta[0] : meta) || {};
      return Object.assign({}, p, { tracks: (tr || []).map(wsAuTrack).filter(Boolean) });
    }
    if (v.src === "au" && v.kind === "user") {
      const [meta, tr] = await Promise.all([wsAuGet(`/users/${v.id}`), wsAuGet(`/users/${v.id}/tracks?limit=50`)]);
      return Object.assign({}, wsAuUser(meta) || {}, { tracks: (tr || []).map(wsAuTrack).filter(Boolean) });
    }
  }
  if (v.v === "home") {
    const tr = await wsAuGet("/tracks/trending?limit=12");
    return { track: (tr || []).map(wsAuTrack).filter(Boolean) };
  }
  return {};
}
// Diskografie eines Künstlers: Alben-Suche nach dem Namen, gefiltert auf genau diesen Künstler
async function wsMusDisco(v, name) {
  if (v.disco || v.discoLoading || !name) return;
  v.discoLoading = true;
  try {
    const r = await wsSpSearch(name, "albums");
    const own = r.album.filter((a) => (a.artists || []).some((x) => x.id === v.id));
    v.disco = own.length ? own : r.album.slice(0, 8);
  } catch (e) {
    v.disco = [];
  }
  v.discoLoading = false;
  if (wsMusCur() === v) wsMusView();
}

/* ---------- Bausteine ---------- */
function wsMusImg(u, cls) {
  return u ? `<img class="${cls || ""}" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="wsp-noimg ${cls || ""}">♪</span>`;
}
function wsMusCardH(c) {
  const i = WS_MUS.cards.push(c) - 1;
  return `<div class="wsp-card" role="button" tabindex="0" onclick="wsMusCardOpen(${i})" onkeydown="if(event.key==='Enter')wsMusCardOpen(${i})">
    <div class="wsp-cimg${c.kind === "artist" || c.kind === "user" ? " round" : ""}">${wsMusImg(c.art)}<button class="wsp-cplay" onclick="event.stopPropagation();wsMusCardPlay(${i})" title="Abspielen" aria-label="${esc(c.name)} abspielen">${wsIc("play", 24)}</button></div>
    <b>${esc(c.name)}</b><small>${esc(c.sub || "")}</small></div>`;
}
function wsMusCardOpen(i) {
  const c = WS_MUS.cards[i];
  if (c) wsMusOpen(c);
}
async function wsMusCardPlay(i) {
  const c = WS_MUS.cards[i];
  if (!c) return;
  try {
    const d = c.src === "own" || c.src === "liked" ? { tracks: wsMusColTracks(c) } : await wsMusFetch({ v: "col", src: c.src, kind: c.kind, id: c.id });
    if (!d.tracks || !d.tracks.length) return toast("Keine Songs gefunden");
    wsMusPlayList(d.tracks, WS_P.shuffle ? null : 0, Object.assign({}, c, { art: c.art || d.art }));
  } catch (e) {
    toast("⚠️ " + e.message, 4000);
  }
}
function wsMusColTracks(c) {
  const d = wsMusLib();
  if (c.src === "liked") return d.liked;
  const p = c.src === "own" && d.pls.find((x) => x.id === c.id);
  return p ? p.tracks : [];
}
function wsMusRowsH(list, ctx, opt) {
  opt = opt || {};
  WS_MUS.rows = list;
  WS_MUS.rowCtx = ctx;
  const now = WS_NOW && wsMusKey(WS_NOW),
    liked = new Set(wsMusLib().liked.map(wsMusKey));
  return `<div class="wsp-tl${opt.noAlbum ? " noalb" : ""}">
    <div class="wsp-tr wsp-th"><span>#</span><span>Titel</span><span class="wsp-alb">Album</span><span></span><span title="Dauer">${wsIc("clock", 16)}</span><span></span></div>
    ${list
      .map((t, i) => {
        const k = wsMusKey(t),
          ars = t.artists && t.artists.length ? t.artists.map((a) => `<a href="#" onclick="event.preventDefault();event.stopPropagation();wsMusOpen({src:'sp',kind:'artist',id:'${a.id}',name:this.textContent})">${esc(a.name)}</a>`).join(", ") : esc(t.artist);
        const alb = t.alb ? `<a href="#" onclick="event.preventDefault();event.stopPropagation();wsMusOpen({src:'sp',kind:'album',id:'${t.alb}',name:this.textContent})">${esc(t.album)}</a>` : esc(t.album || (t.src === "au" ? "Audius" : t.src === "ia" ? "Internet Archive" : ""));
        return `<div class="wsp-tr${k === now ? " on" : ""}" data-k="${esc(k)}" onclick="wsMusRow(${i})" ondblclick="wsMusRow(${i})">
        <span class="wsp-n"><i>${i + 1}</i><b class="wsp-eq"><u></u><u></u><u></u></b><em>${wsIc("play", 16)}</em></span>
        <span class="wsp-tt">${opt.noArt ? "" : wsMusImg(t.art, "wsp-timg")}<span><b>${esc(t.title)}</b><small>${t.ex ? '<i class="wsp-e">E</i>' : ""}${t.src === "au" ? '<i class="wsp-src">Audius</i>' : t.src === "ia" ? '<i class="wsp-src">CC</i>' : ""}${ars}</small></span></span>
        <span class="wsp-alb">${alb}</span>
        <button class="wsp-like${liked.has(k) ? " on" : ""}" data-lk="${esc(k)}" onclick="event.stopPropagation();wsMusLike(WS_MUS.rows[${i}])" title="Lieblingssong" aria-label="Lieblingssong">${wsIc(liked.has(k) ? "heart" : "heartO", 16)}</button>
        <span class="wsp-d">${t.dur ? wsMusFmt(t.dur) : ""}</span>
        <button class="wsp-more" onclick="event.stopPropagation();wsMusMenu(${i})" title="Mehr" aria-label="Mehr">${wsIc("more", 16)}</button></div>`;
      })
      .join("")}</div>`;
}
function wsMusRow(i) {
  const t = WS_MUS.rows[i];
  if (!t) return;
  if (WS_NOW && wsMusKey(WS_NOW) === wsMusKey(t) && WS_P.q === WS_MUS.rowsQ) return wsMusToggle();
  wsMusPlayList(WS_MUS.rows, i, WS_MUS.rowCtx);
  WS_MUS.rowsQ = WS_P.q;
}
function wsMusMenu(i) {
  const t = WS_MUS.rows[i];
  if (!t) return;
  WS_MUS.menuT = t;
  const c = wsMusCur(),
    own = c.v === "col" && c.src === "own";
  const a = t.artists && t.artists[0];
  toastModal(`<div class="wsp-menu"><div class="wsp-mh">${wsMusImg(t.art)}<div><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div></div>
    <button onclick="closeModal();wsMusQueueAdd(WS_MUS.menuT)">${wsIc("queue")} Zur Warteschlange hinzufügen</button>
    <button onclick="wsMusPlPick()">${wsIc("add")} Zu Playlist hinzufügen</button>
    <button onclick="closeModal();wsMusLike(WS_MUS.menuT)">${wsIc(wsMusLiked(t) ? "heart" : "heartO")} ${wsMusLiked(t) ? "Aus Lieblingssongs entfernen" : "Zu Lieblingssongs hinzufügen"}</button>
    ${own ? `<button onclick="closeModal();wsMusPlRemove('${c.id}',${i})">${wsIc("close")} Aus dieser Playlist entfernen</button>` : ""}
    ${a ? `<button onclick="closeModal();wsMusOpen({src:'sp',kind:'artist',id:'${a.id}',name:WS_MUS.menuT.artists[0].name})">${wsIc("lib")} Zum Künstler</button>` : t.src === "sp" && t.artist ? `<button onclick="closeModal();wsMusSearchGo(WS_MUS.menuT.artist.split(',')[0],'artists')">${wsIc("lib")} Künstler suchen</button>` : ""}
    ${t.alb ? `<button onclick="closeModal();wsMusOpen({src:'sp',kind:'album',id:'${t.alb}',name:WS_MUS.menuT.album})">${wsIc("lib")} Zum Album</button>` : ""}
    <button onclick="closeModal();wsMusShare(WS_MUS.menuT)">${wsIc("share")} Teilen</button>
    ${t.dl ? `<button onclick="closeModal();wsMusDl(WS_MUS.menuT)">${wsIc("dl")} Herunterladen (frei erlaubt)</button>` : ""}
    <a href="${esc(wsMusLinkOf(t))}" target="_blank" rel="noopener noreferrer">${wsIc("ext")} ${t.src === "sp" ? "Auf Spotify öffnen" : t.src === "au" ? "Bei Audius öffnen" : t.src === "ia" ? "Im Internet Archive öffnen" : "Auf YouTube öffnen"}</a>
    ${t.lic ? `<a href="${esc(t.lic)}" target="_blank" rel="noopener noreferrer">©️ Lizenz ansehen</a>` : ""}
    <button class="wsp-mx" onclick="closeModal()">Schließen</button></div>`);
}
function wsMusPlPick() {
  const d = wsMusLib();
  toastModal(`<div class="wsp-menu"><h3 style="margin:4px 0 10px">Zu Playlist hinzufügen</h3>
    <button onclick="const p=wsMusPlNew(prompt('Name der neuen Playlist:','Meine Playlist #${d.pls.length + 1}'));if(p)wsMusPlAdd(p.id,WS_MUS.menuT)">${wsIc("add")} Neue Playlist</button>
    ${d.pls.map((p) => `<button onclick="wsMusPlAdd('${p.id}',WS_MUS.menuT)">${wsIc("queue")} ${esc(p.name)} <small>${p.tracks.length} Songs</small></button>`).join("")}
    <button class="wsp-mx" onclick="closeModal()">Abbrechen</button></div>`);
}
async function wsMusShare(x) {
  let title, url, sp;
  const base = location.origin + location.pathname;
  if (x && x.src && x.title) {
    title = `🎵 ${x.title}${x.artist ? " – " + x.artist : ""}`;
    url = x.src === "sp" || x.src === "au" ? `${base}#ws?musik=${x.src}.track.${x.id}` : "";
    sp = wsMusLinkOf(x);
  } else if (x && x.kind) {
    title = `🎵 ${x.name}${x.sub ? " – " + x.sub : ""}`;
    if (x.src === "sp" || x.src === "au") {
      url = `${base}#ws?musik=${x.src}.${x.kind}.${x.id}`;
      sp = x.src === "sp" ? `${WS_SPU}${x.kind}/${x.id}` : "";
    } else {
      const tr = wsMusColTracks(x).slice(0, 40);
      const text = `${title}\n${tr.map((t, i) => `${i + 1}. ${t.title} – ${t.artist}`).join("\n")}`;
      return wsMusShareText(title, text, "");
    }
  } else return;
  wsMusShareText(title, `${title}\n${url ? "In Lernhub anhören: " + url + "\n" : ""}${sp ? "Original: " + sp : ""}`.trim(), url || sp);
}
async function wsMusShareText(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: url || undefined });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast("🔗 Link kopiert – jetzt einfügen und teilen");
  } catch (e) {
    toastModal(`<h3 style="margin-top:0">Teilen</h3><textarea class="ta" rows="5" readonly onclick="this.select()">${esc(text)}</textarea><button class="btn ghost sm" onclick="closeModal()">Schließen</button>`);
  }
}
/* Geteilter Link #ws?musik=sp.playlist.ID (aus arbeitsplatz.js) */
async function wsMusFromLink(s) {
  const m = /^(sp|au)\.(track|playlist|album|artist|user)\.([\w.-]{1,64})$/.exec(String(s || ""));
  if (!m) return;
  const [, src, kind, id] = m;
  if (kind === "track") {
    wsOpen("musik");
    try {
      if (src === "sp") {
        const e = await wsSpEnt("track", id);
        wsMusPlayList(e.tracks, 0, null);
      } else {
        const t = wsAuTrack(await wsAuGet(`/tracks/${id}`));
        if (t) wsMusPlayList([t], 0, null);
      }
    } catch (e) {
      toast("⚠️ " + e.message, 4000);
    }
  } else wsMusOpen({ src, kind, id, name: "Wird geladen …" });
}
async function wsMusDl(t) {
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
    toast("✅ Heruntergeladen" + (t.lic ? " – Lizenz beachten" : ""));
  } catch (e) {
    toast("⚠️ Download ging nicht: " + e.message, 4000);
  }
}
function wsMusImport() {
  toastModal(`<h2 style="margin-top:0">🎧 Von Spotify holen</h2>
    <p class="small mut">Link einer öffentlichen Playlist, eines Albums, Songs oder Künstlers einfügen (in Spotify: ⋯ → Teilen → Link kopieren).
    Oder dein Spotify-Profil: dann siehst du alle deine öffentlichen Playlists.</p>
    <input class="fi" id="wmImp" placeholder="https://open.spotify.com/playlist/… oder …/user/deinname" autocomplete="off">
    <div class="wsmenu" style="margin-top:10px"><button class="btn sm" onclick="wsMusImportGo()">Öffnen</button><button class="btn ghost sm" onclick="closeModal()">Abbrechen</button></div>
    <p class="small mut">Private Playlists und „Lieblingssongs“ aus Spotify kann niemand ohne dein Spotify-Login lesen – mach sie in Spotify öffentlich oder kopiere sie in eine öffentliche Playlist.</p>`);
  setTimeout(() => $("wmImp") && $("wmImp").focus(), 50);
}
function wsMusImportGo() {
  const v = ($("wmImp") || {}).value || "";
  const l = wsMusParseLink(v) || (/^[\w.-]{2,64}$/.test(v.trim()) ? { src: "sp", kind: "user", id: v.trim() } : null);
  if (!l) return toast("Das ist kein Spotify-Link");
  closeModal();
  wsMusOpen(Object.assign({ name: l.kind === "user" ? l.id : "Wird geladen …" }, l));
}
function wsMusLibMenu() {
  toastModal(`<div class="wsp-menu"><h3 style="margin:4px 0 10px">Deine Bibliothek</h3>
    <button onclick="closeModal();const p=wsMusPlNew();if(p)wsMusOpen({src:'own',kind:'playlist',id:p.id,name:p.name})">${wsIc("add")} Neue Playlist erstellen</button>
    <button onclick="wsMusImport()">${wsIc("ext")} Spotify-Link oder -Profil öffnen</button>
    <button class="wsp-mx" onclick="closeModal()">Abbrechen</button></div>`);
}

/* ---------- Seitenleiste „Deine Bibliothek“ ---------- */
function wsMusLibItems() {
  const d = wsMusLib();
  const items = [{ src: "liked", kind: "liked", id: "liked", name: "Lieblingssongs", sub: `Playlist • ${d.liked.length} Songs`, art: "" }];
  d.pls.forEach((p) => items.push({ src: "own", kind: "playlist", id: p.id, name: p.name, sub: `Playlist • ${S && S.profile && S.profile.name ? S.profile.name : "Du"}`, art: (p.tracks.find((t) => t.art) || {}).art || "" }));
  d.saved.forEach((c) => items.push(c));
  const f = WS_MUS.lib;
  return f ? items.filter((c) => (f === "playlist" ? c.kind === "playlist" || c.kind === "liked" || c.kind === "user" : c.kind === f)) : items;
}
function wsMusLibH(full) {
  const items = wsMusLibItems(),
    cur = wsMusCur(),
    ctx = WS_P.ctx;
  WS_MUS.libItems = items;
  const chip = (k, l) => `<button class="wsp-chip${WS_MUS.lib === k ? " on" : ""}" onclick="WS_MUS.lib=WS_MUS.lib==='${k}'?'':'${k}';wsMusLibPaint();${full ? "wsMusView()" : ""}">${l}</button>`;
  return `<div class="wsp-libh"><button class="wsp-libt" onclick="wsMusGo({v:'lib'})">${wsIc("lib", 22)}<b>Deine Bibliothek</b></button>
      <button class="wsp-ib" onclick="wsMusLibMenu()" title="Playlist erstellen oder importieren" aria-label="Erstellen">${wsIc("add", 18)}</button></div>
    <div class="wsp-chips">${chip("playlist", "Playlists")}${chip("album", "Alben")}${chip("artist", "Künstler")}</div>
    <div class="wsp-libl">${items
      .map((c, i) => {
        const on = cur.v === "col" && cur.src === c.src && cur.id === c.id,
          pl = ctx && ctx.src === c.src && ctx.id === c.id;
        return `<button class="wsp-li${on ? " on" : ""}${pl ? " pl" : ""}" onclick="wsMusOpen(WS_MUS.libItems[${i}])" title="${esc(c.name)}">
        ${c.src === "liked" ? `<span class="wsp-liked">${wsIc("heart", 18)}</span>` : wsMusImg(c.art, c.kind === "artist" || c.kind === "user" ? "round" : "")}
        <span><b>${esc(c.name)}</b><small>${esc(c.sub || "")}</small></span>${pl && wsMusPlaying() ? wsIc("vol", 14) : ""}</button>`;
      })
      .join("")}</div>`;
}
function wsMusLibPaint() {
  const el = $("wmLib");
  if (el) el.innerHTML = wsMusLibH();
}

/* ---------- Hauptbereich ---------- */
function wsMusView() {
  const el = $("wmView");
  if (!el) return;
  const v = wsMusCur();
  WS_MUS.cards = [];
  const bk = $("wmBack"),
    fw = $("wmFwd");
  if (bk) bk.disabled = WS_MUS.hi <= 0;
  if (fw) fw.disabled = WS_MUS.hi >= WS_MUS.hist.length - 1;
  const q = $("wmQ");
  if (q && document.activeElement !== q) q.value = v.v === "search" ? v.q || "" : "";
  let h = "";
  try {
    h = v.v === "search" ? wsMusSearchH(v) : v.v === "col" ? wsMusColH(v) : v.v === "queue" ? wsMusQueueH() : v.v === "lib" ? `<div class="wsp-pad wsp-libfull">${wsMusLibH(true)}</div>` : v.v === "np" ? `<div class="wsp-pad">${wsMusNpH(true)}</div>` : wsMusHomeH(v);
  } catch (e) {
    console.warn(e);
    h = `<p class="wsp-msg">⚠️ ${esc(e.message)}</p>`;
  }
  el.innerHTML = h;
  el.classList.toggle("np", v.v === "np");
  wsMusNpPaint();
  wsMusLibPaint();
}
function wsMusSec(title, inner, more) {
  return inner ? `<section class="wsp-sec"><div class="wsp-sech"><h2>${esc(title)}</h2>${more || ""}</div>${inner}</section>` : "";
}
function wsMusHomeH(v) {
  const d = wsMusLib(),
    hr = new Date().getHours();
  const greet = hr < 5 ? "Gute Nacht" : hr < 11 ? "Guten Morgen" : hr < 18 ? "Guten Tag" : "Guten Abend";
  const quick = [{ src: "liked", kind: "liked", id: "liked", name: "Lieblingssongs", sub: "", art: "" }].concat(d.recent).slice(0, 8);
  WS_MUS.quick = quick;
  const sp = (l) => l.map((x) => wsMusCardH({ src: "sp", kind: "playlist", id: x[0], name: x[1], sub: "Spotify", art: x[2] })).join("");
  if (!v.data && !v.err) wsMusLoad(v);
  const au = v.data && v.data.track && v.data.track.length ? wsMusRowsH(v.data.track.slice(0, 8), { src: "au", kind: "playlist", id: "trend", name: "Angesagt auf Audius" }) : "";
  return `<div class="wsp-home"><div class="wsp-hero"><h1>${greet}</h1>
    <div class="wsp-quick">${quick
      .map(
        (c, i) => `<button class="wsp-qi" onclick="wsMusOpen(WS_MUS.quick[${i}])">${c.src === "liked" ? `<span class="wsp-liked">${wsIc("heart", 22)}</span>` : wsMusImg(c.art)}<b>${esc(c.name)}</b>
        <span class="wsp-qp" onclick="event.stopPropagation();WS_MUS.cards.push(WS_MUS.quick[${i}]);wsMusCardPlay(WS_MUS.cards.length-1)" title="Abspielen">${wsIc("play", 20)}</span></button>`,
      )
      .join("")}</div></div>
    <div class="wsp-pad">
    ${d.pls.length ? wsMusSec("Deine Playlists", `<div class="wsp-row">${d.pls.slice(0, 10).map((p) => wsMusCardH({ src: "own", kind: "playlist", id: p.id, name: p.name, sub: p.tracks.length + " Songs", art: (p.tracks.find((t) => t.art) || {}).art || "" })).join("")}</div>`) : ""}
    ${wsMusSec("Charts & Hits", `<div class="wsp-row">${sp(WS_SP_TOP)}</div>`)}
    ${wsMusSec("Zum Lernen & Konzentrieren", `<div class="wsp-row">${sp(WS_SP_FOCUS)}</div>`)}
    ${d.saved.length ? wsMusSec("Deine Bibliothek", `<div class="wsp-row">${d.saved.slice(0, 10).map(wsMusCardH).join("")}</div>`) : ""}
    ${wsMusSec("Angesagt auf Audius – frei & komplett", au || (v.err ? `<p class="wsp-msg">${esc(v.err)}</p>` : `<p class="wsp-msg">Lädt …</p>`))}
    <p class="wsp-credit">Musikdaten &amp; Cover: Spotify · Wiedergabe der ganzen Songs über den offiziellen YouTube-Player · Freie Musik: Audius &amp; Internet Archive.
    Alle Rechte liegen bei den Künstlerinnen, Künstlern und Labels. Spotify-Playlist öffnen: Link oben ins Suchfeld einfügen.</p></div></div>`;
}
function wsMusSearchH(v) {
  const chips = [["", "Alle"], ["tracks", "Songs"], ["artists", "Künstler"], ["albums", "Alben"], ["playlists", "Playlists"], ["au", "Audius (frei)"], ["ia", "Archiv (CC)"]];
  const bar = `<div class="wsp-chips wsp-sch">${chips.map(([k, l]) => `<button class="wsp-chip${(v.f || "") === k ? " on" : ""}" onclick="wsMusSearchGo(WS_MUS.hist[WS_MUS.hi].q,'${k}')">${l}</button>`).join("")}</div>`;
  if (!v.q) {
    WS_MUS.genres = WS_GENRES;
    return `<div class="wsp-pad"><h2 class="wsp-h2">Alle durchsuchen</h2><div class="wsp-genres">${WS_GENRES.map(
      (g, i) => `<button class="wsp-genre" style="background:${g[1]}" onclick="wsMusSearchGo(WS_MUS.genres[${i}][0],'playlists')"><b>${esc(g[0])}</b><span>♪</span></button>`,
    ).join("")}</div>
      <p class="wsp-credit">Tipp: Link einer Spotify-Playlist oder eines Profils ins Suchfeld einfügen – dann spielt Lernhub die ganze Liste ab.</p></div>`;
  }
  if (!v.data && !v.err) wsMusLoad(v);
  if (v.loading || (!v.data && !v.err)) return `<div class="wsp-pad">${bar}<div class="wsp-load"><i></i><i></i><i></i></div><p class="wsp-msg">Suche „${esc(v.q)}“ …</p></div>`;
  if (v.err)
    return `<div class="wsp-pad">${bar}<p class="wsp-msg">⚠️ ${esc(v.err)}</p><div class="wsmenu"><button class="btn sm" onclick="const v=wsMusCur();v.err='';v.data=null;wsMusView()">Nochmal</button>
      <button class="btn ghost sm" onclick="wsMusSearchGo(wsMusCur().q,'au')">Bei Audius suchen</button></div></div>`;
  const r = v.data;
  const ctx = { src: v.f === "au" ? "au" : "sp", kind: "playlist", id: "search", name: "Suche: " + v.q };
  const none = !r.track.length && !r.artist.length && !r.album.length && !r.playlist.length;
  if (none) return `<div class="wsp-pad">${bar}<p class="wsp-msg">Keine Ergebnisse für „${esc(v.q)}“. Prüf die Schreibweise oder probier einen anderen Filter.</p></div>`;
  const row = (l) => `<div class="wsp-row">${l.map(wsMusCardH).join("")}</div>`;
  const grid = (l) => `<div class="wsp-grid">${l.map(wsMusCardH).join("")}</div>`;
  if (v.f === "tracks" || v.f === "ia") return `<div class="wsp-pad">${bar}${wsMusRowsH(r.track, ctx)}</div>`;
  if (v.f === "artists") return `<div class="wsp-pad">${bar}${grid(r.artist)}</div>`;
  if (v.f === "albums") return `<div class="wsp-pad">${bar}${grid(r.album)}</div>`;
  if (v.f === "playlists") return `<div class="wsp-pad">${bar}${grid(r.playlist)}</div>`;
  const top = r.artist[0] || r.album[0] || r.playlist[0];
  let topH = "";
  if (top) {
    const i = WS_MUS.cards.push(top) - 1;
    topH = `<div class="wsp-top1" onclick="wsMusCardOpen(${i})">${wsMusImg(top.art, top.kind === "artist" || top.kind === "user" ? "round" : "")}<h3>${esc(top.name)}</h3>
      <small><i class="wsp-tag">${{ artist: "Künstler", album: "Album", playlist: "Playlist", user: "Profil" }[top.kind] || ""}</i> ${top.kind === "artist" ? "" : esc(top.sub || "")}</small>
      <button class="wsp-cplay" onclick="event.stopPropagation();wsMusCardPlay(${i})" aria-label="Abspielen">${wsIc("play", 24)}</button></div>`;
  }
  return `<div class="wsp-pad">${bar}
    <div class="wsp-tops">${topH ? `<div><h2 class="wsp-h2">Top-Ergebnis</h2>${topH}</div>` : ""}${r.track.length ? `<div class="wsp-tops-s"><h2 class="wsp-h2">Songs</h2>${wsMusRowsH(r.track.slice(0, 5), ctx, { noAlbum: true })}</div>` : ""}</div>
    ${r.artist.length ? wsMusSec("Künstler", row(r.artist)) : ""}
    ${r.album.length ? wsMusSec("Alben", row(r.album)) : ""}
    ${r.playlist.length ? wsMusSec("Playlists", row(r.playlist)) : ""}</div>`;
}
function wsMusColH(v) {
  let data,
    own = null;
  if (v.src === "liked") data = { name: "Lieblingssongs", sub: (S && S.profile && S.profile.name) || "Du", tracks: wsMusLib().liked, col: "rgb(80,56,160)" };
  else if (v.src === "own") {
    own = wsMusLib().pls.find((p) => p.id === v.id);
    if (!own) return `<p class="wsp-msg">Diese Playlist gibt es nicht mehr.</p>`;
    data = { name: own.name, sub: (S && S.profile && S.profile.name) || "Du", tracks: own.tracks, art: (own.tracks.find((t) => t.art) || {}).art || "", col: "rgb(83,83,83)" };
  } else {
    if (!v.data && !v.err) wsMusLoad(v);
    if (v.err)
      return `<div class="wsp-pad"><p class="wsp-msg">⚠️ ${esc(v.err)}</p><button class="btn sm" onclick="const v=wsMusCur();v.err='';wsMusView()">Nochmal</button></div>`;
    data = v.data || { name: v.name || "", sub: v.sub || "", art: v.art || "", tracks: [], loading: 1 };
  }
  const kindL = { playlist: "Playlist", album: "Album", artist: "Künstler", user: "Profil", track: "Song", liked: "Playlist" }[v.kind] || "";
  const ref = { src: v.src, kind: v.kind, id: v.id, name: data.name || v.name, sub: data.sub || "", art: data.art || v.art || "" };
  WS_MUS.colRef = ref;
  const tracks = data.tracks || [];
  const playingThis = WS_P.ctx && WS_P.ctx.src === v.src && WS_P.ctx.id === v.id && wsMusPlaying();
  const meta = [data.sub, data.year, tracks.length ? tracks.length + " Songs" : "", wsMusTotal(tracks)].filter(Boolean).map(esc).join(" • ");
  const saveB = v.src === "sp" || v.src === "au" ? `<button class="wsp-ib big${wsMusSaved(ref) ? " on" : ""}" onclick="wsMusSave(WS_MUS.colRef)" title="${wsMusSaved(ref) ? "Aus Bibliothek entfernen" : "In Bibliothek speichern"}" aria-label="Speichern">${wsIc(wsMusSaved(ref) ? "check" : "add", 26)}</button>` : "";
  const ownB = own
    ? `<button class="wsp-ib big" onclick="wsMusPlRename('${own.id}')" title="Umbenennen" aria-label="Umbenennen">✏️</button><button class="wsp-ib big" onclick="wsMusPlDel('${own.id}')" title="Löschen" aria-label="Löschen">🗑️</button>`
    : "";
  const copyB = v.src === "sp" && tracks.length && v.kind !== "artist" ? `<button class="wsp-ib big" onclick="const p=wsMusPlNew(WS_MUS.colRef.name,wsMusCur().data.tracks);if(p)toast('Als eigene Playlist kopiert – jetzt bearbeitbar')" title="Als eigene Playlist kopieren" aria-label="Kopieren">${wsIc("queue", 24)}</button>` : "";
  let body = "";
  if (v.kind === "user") {
    const items = (data.items || []).map((p) => Object.assign({}, p));
    body = data.loading ? `<div class="wsp-load"><i></i><i></i><i></i></div>` : items.length ? `<h2 class="wsp-h2">Öffentliche Playlists</h2><div class="wsp-grid">${items.map(wsMusCardH).join("")}</div>` : `<p class="wsp-msg">Keine öffentlichen Playlists gefunden. Stimmt der Profilname? (Steht im Profil-Link nach /user/)</p>`;
  } else if (data.loading) body = `<div class="wsp-load"><i></i><i></i><i></i></div>`;
  else if (!tracks.length) body = `<p class="wsp-msg">${v.src === "liked" ? "Songs, die du mit ♥ markierst, landen hier." : v.src === "own" ? "Noch leer – füge Songs über ⋯ → „Zu Playlist hinzufügen“ hinzu." : "Keine Songs gefunden."}</p>`;
  else {
    body = (v.kind === "artist" ? `<h2 class="wsp-h2">Beliebt</h2>` : "") + wsMusRowsH(tracks, ref, { noAlbum: v.kind === "album", noArt: v.kind === "album" });
    if (v.kind === "artist" && v.src === "sp") {
      wsMusDisco(v, data.name);
      body += wsMusSec("Diskografie", v.disco ? (v.disco.length ? `<div class="wsp-row">${v.disco.map(wsMusCardH).join("")}</div>` : `<p class="wsp-msg">Keine Alben gefunden.</p>`) : `<p class="wsp-msg">Lädt …</p>`);
    }
    if (v.kind === "track" && data.artists && data.artists[0]) {
      const a = data.artists[0];
      body += `<p><button class="btn ghost sm" onclick="wsMusOpen({src:'sp',kind:'artist',id:'${a.id}',name:WS_MUS.colRef.sub})">Mehr von ${esc(a.name)} →</button></p>`;
    }
  }
  const credit =
    v.src === "sp"
      ? `<p class="wsp-credit">Daten &amp; Cover von <a href="${WS_SPU}${v.kind}/${esc(v.id)}${v.kind === "user" ? "/playlists" : ""}" target="_blank" rel="noopener noreferrer">Spotify ↗</a>. Abgespielt werden die ganzen Songs über YouTube. © Rechte bei den Künstlern und Labels.</p>`
      : v.src === "au"
        ? `<p class="wsp-credit">Freie Musik von <a href="https://audius.co" target="_blank" rel="noopener noreferrer">Audius ↗</a> – direkt von den Künstlerinnen und Künstlern hochgeladen.</p>`
        : "";
  return `<div class="wsp-col"><header class="wsp-colh" style="--c:${data.col || "rgb(70,70,90)"}">
      ${v.src === "liked" ? `<span class="wsp-liked big">${wsIc("heart", 72)}</span>` : wsMusImg(data.art || v.art, v.kind === "artist" || v.kind === "user" ? "round" : "")}
      <div><small>${kindL}${v.src === "au" ? " • Audius" : ""}</small><h1>${esc(data.name || v.name || "")}</h1><p>${meta}</p></div></header>
    <div class="wsp-acts" style="--c:${data.col || "rgb(70,70,90)"}">${tracks.length ? `<button class="wsp-play" onclick="${playingThis ? "wsMusToggle()" : "wsMusPlayList(WS_MUS.rows,WS_P.shuffle?null:0,WS_MUS.rowCtx);WS_MUS.rowsQ=WS_P.q"}" aria-label="Abspielen">${wsIc(playingThis ? "pause" : "play", 28)}</button>
      <button class="wsp-ib big${WS_P.shuffle ? " on" : ""}" onclick="wsMusShuffle();wsMusView()" title="Zufallswiedergabe" aria-label="Zufallswiedergabe">${wsIc("shuffle", 26)}</button>` : ""}
      ${saveB}${copyB}${ownB}
      <button class="wsp-ib big" onclick="wsMusShare(WS_MUS.colRef)" title="Teilen" aria-label="Teilen">${wsIc("share", 22)}</button></div>
    <div class="wsp-pad">${body}${credit}</div></div>`;
}
function wsMusQueueH() {
  const q = WS_P.q,
    i = WS_P.i;
  if (!q.length || !q[i]) return `<div class="wsp-pad"><h1 class="wsp-h1">Warteschlange</h1><p class="wsp-msg">Leer – such dir etwas zum Hören aus.</p></div>`;
  const rest = q.slice(i + 1, i + 81);
  WS_MUS.qrest = rest;
  const h = (t, j) => `<div class="wsp-qr" onclick="wsMusPlayAt(${i + 1 + j})">${wsMusImg(t.art, "wsp-timg")}<span><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></span>${t.qd ? '<i class="wsp-tag">Eingereiht</i>' : ""}
    <button class="wsp-more" onclick="event.stopPropagation();WS_P.q.splice(${i + 1 + j},1);wsMusView()" title="Entfernen" aria-label="Entfernen">${wsIc("close", 16)}</button></div>`;
  return `<div class="wsp-pad"><h1 class="wsp-h1">Warteschlange</h1>
    <h2 class="wsp-h2">Läuft gerade</h2><div class="wsp-qr on">${wsMusImg(q[i].art, "wsp-timg")}<span><b>${esc(q[i].title)}</b><small>${esc(q[i].artist)}</small></span></div>
    <h2 class="wsp-h2">Als Nächstes${WS_P.ctx ? " aus: " + esc(WS_P.ctx.name) : ""}</h2>${rest.map(h).join("") || '<p class="wsp-msg">Danach ist Schluss.</p>'}
    ${rest.length ? `<button class="btn ghost sm" onclick="WS_P.q.length=WS_P.i+1;wsMusView()">Warteschlange leeren</button>` : ""}</div>`;
}

/* ---------- „Wird gerade gespielt“ (rechts) mit Video, Credits und nächstem Song ---------- */
function wsMusNpH(full) {
  const t = WS_NOW;
  if (!t) return `<div class="wsp-npe">${wsIc("queue", 40)}<p>Spiel einen Song ab – hier siehst du dann Video, Cover und Credits.</p></div>`;
  const yt = WS_P.mode === "y";
  const vid = yt && WS_P.cand[WS_P.ci];
  const nx = WS_P.q[WS_P.i + 1];
  const a = t.artists && t.artists[0];
  const credit =
    t.src === "sp"
      ? `<p>Musikdaten: <a href="${esc(wsMusLinkOf(t))}" target="_blank" rel="noopener noreferrer">Spotify ↗</a></p>
         <p>Wiedergabe: ${vid ? `<a href="https://www.youtube.com/watch?v=${esc(vid)}" target="_blank" rel="noopener noreferrer">YouTube-Video ↗</a>` : "YouTube"}</p>
         <p>Interpret: ${esc(t.artist || "–")}${t.album ? `<br>Album: ${esc(t.album)}` : ""}</p>`
      : t.src === "au"
        ? `<p>Hochgeladen von ${esc(t.artist)} auf <a href="${esc(t.link || "https://audius.co")}" target="_blank" rel="noopener noreferrer">Audius ↗</a></p>${t.dl ? "<p>Download vom Künstler erlaubt.</p>" : ""}`
        : t.src === "ia"
          ? `<p>Aus dem <a href="${esc(t.link)}" target="_blank" rel="noopener noreferrer">Internet Archive ↗</a>${t.lic ? ` · <a href="${esc(t.lic)}" target="_blank" rel="noopener noreferrer">Lizenz ↗</a>` : ""}</p>`
          : `<p>Video auf <a href="${esc(wsMusLinkOf(t))}" target="_blank" rel="noopener noreferrer">YouTube ↗</a>${t.ch ? " von " + esc(t.ch) : ""}</p>`;
  return `<div class="wsp-np-in">${full ? "" : `<div class="wsp-nph"><b>${esc((WS_P.ctx && WS_P.ctx.name) || "Wird gerade gespielt")}</b><button class="wsp-ib" onclick="wsMusNpToggle()" title="Schließen" aria-label="Schließen">${wsIc("close", 16)}</button></div>`}
    ${yt ? `<div class="wsp-vid" id="wmVid">${WS_P.busy ? '<div class="wsp-load"><i></i><i></i><i></i></div><small>Suche das passende Video …</small>' : ""}</div>` : `<div class="wsp-npart">${wsMusImg(t.art)}</div>`}
    <div class="wsp-npt"><div><h3>${esc(t.title)}</h3><small>${a ? `<a href="#" onclick="event.preventDefault();wsMusOpen({src:'sp',kind:'artist',id:'${a.id}',name:this.textContent})">${esc(a.name)}</a>${t.artists.length > 1 ? ", " + esc(t.artists.slice(1).map((x) => x.name).join(", ")) : ""}` : esc(t.artist)}</small></div>
      <button class="wsp-like${wsMusLiked(t) ? " on" : ""}" data-lk="${esc(wsMusKey(t))}" data-s="20" onclick="wsMusLike(WS_NOW)" aria-label="Lieblingssong">${wsIc(wsMusLiked(t) ? "heart" : "heartO", 20)}</button>
      <button class="wsp-ib" onclick="wsMusShare(WS_NOW)" title="Teilen" aria-label="Teilen">${wsIc("share", 18)}</button></div>
    <div class="wsp-box"><b>Credits</b>${credit}<p class="wsp-fine">Alle Rechte bei den Künstlerinnen, Künstlern und Labels.</p></div>
    ${nx ? `<div class="wsp-box"><div class="wsp-sech"><b>Als Nächstes</b><a href="#" onclick="event.preventDefault();wsMusGo({v:'queue'})">Warteschlange öffnen</a></div>
      <div class="wsp-qr" onclick="wsMusNext(1)">${wsMusImg(nx.art, "wsp-timg")}<span><b>${esc(nx.title)}</b><small>${esc(nx.artist)}</small></span></div></div>` : ""}</div>`;
}
function wsMusNpPaint() {
  const el = $("wmNp");
  if (!el) return;
  const full = wsMusCur().v === "np";
  el.hidden = !WS_MUS.np || full;
  el.innerHTML = el.hidden ? "" : wsMusNpH();
  const b = $("wmNpB");
  if (b) b.classList.toggle("on", WS_MUS.np);
}
function wsMusNpToggle() {
  const root = $("wsp");
  // Schmales Fenster: „Wird gerade gespielt“ als eigene Seite
  if (root && root.clientWidth < 760) return wsMusCur().v === "np" ? wsMusHist(-1) : wsMusGo({ v: "np" });
  WS_MUS.np = !WS_MUS.np;
  wsMusNpPaint();
}

/* ---------- Player-Leiste unten ---------- */
function wsMusBar() {
  const el = $("wmBar");
  if (!el) return;
  const t = WS_NOW,
    pl = wsMusPlaying();
  el.innerHTML = `<div class="wsp-bl">${t ? `${wsMusImg(t.art, "wsp-bimg")}<div class="wsp-bt" onclick="wsMusNpToggle()"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>
      <button class="wsp-like${wsMusLiked(t) ? " on" : ""}" data-lk="${esc(wsMusKey(t))}" onclick="wsMusLike(WS_NOW)" aria-label="Lieblingssong">${wsIc(wsMusLiked(t) ? "heart" : "heartO", 16)}</button>` : ""}</div>
    <div class="wsp-bc"><div class="wsp-ctl">
      <button class="wsp-ib${WS_P.shuffle ? " on" : ""}" onclick="wsMusShuffle()" title="Zufallswiedergabe" aria-label="Zufallswiedergabe">${wsIc("shuffle", 18)}</button>
      <button class="wsp-ib" onclick="wsMusNext(-1)" title="Zurück" aria-label="Zurück">${wsIc("prev", 20)}</button>
      <button class="wsp-pp" onclick="wsMusToggle()" title="${pl ? "Pause" : "Abspielen"}" aria-label="${pl ? "Pause" : "Abspielen"}">${WS_P.busy ? '<span class="wsp-spin"></span>' : wsIc(pl ? "pause" : "play", 20)}</button>
      <button class="wsp-ib" onclick="wsMusNext(1)" title="Weiter" aria-label="Weiter">${wsIc("next", 20)}</button>
      <button class="wsp-ib${WS_P.repeat ? " on" : ""}" onclick="wsMusRepeat()" title="${["Wiederholen", "Alle wiederholen", "Song wiederholen"][WS_P.repeat]}" aria-label="Wiederholen">${wsIc(WS_P.repeat === 2 ? "repeat1" : "repeat", 18)}</button></div>
      <div class="wsp-prog"><small id="wmCur">0:00</small><input type="range" class="wsp-rng" id="wmSeek" min="0" max="1000" value="0" oninput="this.style.setProperty('--p',this.value/10+'%');$('wmCur').textContent=wsMusFmt(this.value/1000*wsMusPos().dur)" onchange="wsMusSeek(this.value);this.blur()" aria-label="Position"><small id="wmDur">-:--</small></div></div>
    <div class="wsp-br">
      <button class="wsp-ib${WS_MUS.np ? " on" : ""}" id="wmNpB" onclick="wsMusNpToggle()" title="Wird gerade gespielt" aria-label="Wird gerade gespielt">${wsIc("np", 18)}</button>
      <button class="wsp-ib${wsMusCur().v === "queue" ? " on" : ""}" onclick="wsMusCur().v==='queue'?wsMusHist(-1):wsMusGo({v:'queue'})" title="Warteschlange" aria-label="Warteschlange">${wsIc("queue", 18)}</button>
      <button class="wsp-ib" id="wmVolB" onclick="wsMusMute()" title="Ton an/aus" aria-label="Ton an/aus">${wsIc(WS_P.vol ? "vol" : "mute", 18)}</button>
      <input type="range" class="wsp-rng wsp-vol" id="wmVol" min="0" max="1" step="0.01" value="${WS_P.vol}" style="--p:${WS_P.vol * 100}%" oninput="wsMusVol(this.value)" aria-label="Lautstärke">
      ${t ? `<button class="wsp-ib" onclick="wsMusShare(WS_NOW)" title="Teilen" aria-label="Teilen">${wsIc("share", 16)}</button>` : ""}</div>`;
  wsMusTime();
}
/* Alles, was sich beim Abspielen ändert, ohne die Seite neu aufzubauen */
function wsMusUi(trackChanged) {
  wsMusBar();
  const k = WS_NOW && wsMusKey(WS_NOW),
    pl = wsMusPlaying();
  document.querySelectorAll(".wsp-tr[data-k]").forEach((r) => {
    r.classList.toggle("on", r.dataset.k === k);
    r.classList.toggle("pl", r.dataset.k === k && pl);
  });
  if (trackChanged || !$("wmVid") === (WS_P.mode === "y")) wsMusNpPaint();
  else if (WS_P.mode === "y" && !WS_P.busy) {
    const ph = $("wmVid");
    if (ph && ph.firstChild) ph.innerHTML = "";
  }
  const pp = $("wmYtPP");
  if (pp) pp.innerHTML = wsIc(pl ? "pause" : "play", 18);
  const tt = $("wmYtT");
  if (tt) tt.textContent = WS_NOW ? WS_NOW.title + " · " + WS_NOW.artist : "";
  const cp = document.querySelector(".wsp-acts .wsp-play");
  if (cp && WS_P.ctx) {
    const c = wsMusCur();
    if (c.v === "col" && WS_P.ctx.src === c.src && WS_P.ctx.id === c.id) {
      cp.innerHTML = wsIc(pl ? "pause" : "play", 28);
      cp.setAttribute("onclick", "wsMusToggle()");
    }
  }
  if (trackChanged) wsMusLibPaint();
  if (window.wsMiniPaint) wsMiniPaint();
  if (window.wsTaskPaint) wsTaskPaint();
}

/* ======================= Für die KI ======================= */
async function wsMusAi(q) {
  q = String(q || "").trim().slice(0, 100);
  const w = wsOpen("musik");
  if (!w) return "⚠️ Kein Fenster frei";
  const inp = $("wmQ");
  await wsCursor(inp, "KI sucht Musik");
  if (inp) await wsTypeInto((t) => (inp.value = t), q);
  let list = [],
    ctx = null;
  try {
    const r = await wsSpSearch(q, "tracks");
    list = r.track;
    ctx = { src: "sp", kind: "playlist", id: "search", name: "Suche: " + q };
    wsMusGo({ v: "search", q, f: "tracks", data: r });
  } catch (e) {
    try {
      list = ((await wsAuGet(`/tracks/search?query=${encodeURIComponent(q)}`)) || []).map(wsAuTrack).filter(Boolean);
      wsMusGo({ v: "search", q, f: "au" });
    } catch (x) {}
  }
  if (!list.length) return "🎵 Nichts gefunden zu „" + q + "“";
  await wsCursor(document.querySelector("#wmView .wsp-tr[data-k]"), "KI drückt ▶");
  wsMusPlayList(list, 0, ctx);
  return `🎵 Spielt: ${WS_NOW.title} – ${WS_NOW.artist} (ganzer Song${WS_NOW.src === "sp" ? " über YouTube" : ""})`;
}

WS_APPS.musik = {
  icon: "🎵",
  name: "Musik",
  order: 6,
  w: 70,
  h: 86,
  title: () => (WS_NOW ? "Musik · " + WS_NOW.title : "Musik"),
  mount(w, body) {
    const d = wsMusLib();
    if (!WS_P.q.length && d.last.q.length) {
      WS_P.q = d.last.q;
      WS_P.i = Math.min(d.last.i, d.last.q.length - 1);
      WS_P.ctx = d.last.ctx;
      WS_NOW = WS_P.q[WS_P.i];
    }
    body.innerHTML = `<div class="wsp" id="wsp" tabindex="-1">
      <div class="wsp-topbar">
        <button class="wsp-ib" id="wmBack" onclick="wsMusHist(-1)" title="Zurück" aria-label="Zurück">${wsIc("back", 22)}</button>
        <button class="wsp-ib" id="wmFwd" onclick="wsMusHist(1)" title="Vor" aria-label="Vor">${wsIc("fwd", 22)}</button>
        <button class="wsp-home" onclick="wsMusGo({v:'home'})" title="Startseite" aria-label="Startseite">${wsIc("home", 22)}</button>
        <form class="wsp-search" onsubmit="event.preventDefault();wsMusSearchGo(this.q.value)">${wsIc("search", 20)}
          <input id="wmQ" name="q" placeholder="Was möchtest du hören?" autocomplete="off" aria-label="Suchen" onfocus="if(wsMusCur().v!=='search')wsMusGo({v:'search',q:'',f:''})"></form>
        <button class="wsp-ib wsp-libbtn" onclick="wsMusGo({v:'lib'})" title="Deine Bibliothek" aria-label="Deine Bibliothek">${wsIc("lib", 20)}</button>
      </div>
      <div class="wsp-main"><nav class="wsp-lib" id="wmLib" aria-label="Deine Bibliothek"></nav><main class="wsp-view" id="wmView"></main><aside class="wsp-np" id="wmNp" aria-label="Wird gerade gespielt"></aside></div>
      <footer class="wsp-bar" id="wmBar"></footer></div>`;
    const root = body.querySelector(".wsp");
    root.addEventListener("keydown", (e) => {
      if (e.key === " " && !/^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(e.target.tagName)) {
        e.preventDefault();
        wsMusToggle();
      }
    });
    wsMusView();
    wsMusBar();
    if (WS_P.mode === "y") wsYtLoop();
  },
  shown() {
    if (WS_P.mode === "y") wsYtLoop();
  },
  ctx: () => (WS_NOW ? `Musik: ${wsMusPlaying() ? "spielt" : "pausiert"} „${WS_NOW.title}“ von ${WS_NOW.artist}` : "Musik: aus"),
};
