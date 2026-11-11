/* Schulen & Klassen für alle
   - Schulsuche über jedeschule.codefor.de (offene Schuldaten, Code for Germany)
   - Deutsch, Mathe, Englisch passend zur Klassenstufe (content/schulfaecher.js)
   - weitere Fächer: einmal von OpenCode erstellt (GitHub-Workflow), dann in der Cloud gespeichert.
     Alle aus demselben Bundesland + Schulart + Stufe bekommen exakt dasselbe Paket (keine Abweichungen).
   Das Lernhub-Original (Gewerbeschule VS, E1FI) bleibt unverändert, solange keine andere Schule gewählt ist. */
const SF_LAENDER = {
  BW: "Baden-Württemberg",
  BY: "Bayern",
  BE: "Berlin",
  BB: "Brandenburg",
  HB: "Bremen",
  HH: "Hamburg",
  HE: "Hessen",
  MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen",
  NW: "Nordrhein-Westfalen",
  RP: "Rheinland-Pfalz",
  SL: "Saarland",
  SN: "Sachsen",
  ST: "Sachsen-Anhalt",
  SH: "Schleswig-Holstein",
  TH: "Thüringen",
  XX: "Deutschland (allgemein)",
};
const SF_ARTEN = {
  gs: "Grundschule",
  hs: "Haupt-/Mittel-/Werkrealschule",
  rs: "Realschule",
  ge: "Gemeinschafts-/Gesamtschule",
  gy: "Gymnasium",
  bs: "Berufsschule (Ausbildung)",
  bf: "Berufsfachschule/Berufskolleg",
  bg: "Berufliches Gymnasium/FOS/BOS",
  fs: "Förderschule",
  so: "Sonstige Schule",
};
const SF_FACH = {
  deutsch: { k: "de", name: "Deutsch", color: "#e17055" },
  mathe: { k: "ma", name: "Mathe", color: "#0984e3" },
  englisch: { k: "en", name: "Englisch", color: "#00b894", lang: "en-GB" },
};
const SF_SUGG = {
  gs: ["Sachunterricht", "Religion", "Ethik", "Musik", "Kunst"],
  sek: [
    "Biologie",
    "Geschichte",
    "Erdkunde",
    "Physik",
    "Chemie",
    "Gemeinschaftskunde",
    "Wirtschaft",
    "Informatik",
    "Französisch",
    "Spanisch",
    "Latein",
    "Religion",
    "Ethik",
    "Musik",
    "Kunst",
    "Technik",
  ],
  beruf: [
    "Wirtschafts- und Sozialkunde",
    "Gemeinschaftskunde",
    "Betriebswirtschaft",
    "Rechnungswesen",
    "Informatik",
    "Technik",
    "Physik",
    "Chemie",
    "Biologie",
    "Geschichte",
    "Ethik",
    "Religion",
    "Französisch",
    "Spanisch",
  ],
};
const SF_ORIG_SID = "BW-04102258"; /* Gewerbliche Schulen VS */
const SF_PACKS_KEY = "lernhub_packs_v1";
const SF_KEY_RE = /^[A-Z]{2}\|[a-z]{2}\|(1[0-3]|[1-9]|L[1-4])\|[a-z0-9-]{2,40}$/;
const SF_STUFE_RE = /^(1[0-3]|[1-9]|L[1-4])$/;
const SF_SID_RE = /^[A-Z]{2}-[A-Za-z0-9_-]{1,90}$/;
const SF_NAME_RE = /^[A-Za-zÄÖÜäöüß0-9 .,&()/+-]{2,40}$/;
const SF_TID_RE = /^pk[0-9a-f]{8}_\d+$/;
const SF_API = "https://jedeschule.codefor.de/schools/";
const SF = {
  packs: {},
  clean: {},
  ver: 0,
  cache: null,
  sig: "",
  avail: null,
  status: {},
  at: 0,
  busy: false,
  results: [],
  pick: null,
  ctrl: null,
  t: null,
  rep: null,
};

/* ---------- Profil prüfen (wird von sanitizeState aufgerufen) ---------- */
function sanitizeSchool(st) {
  const p = st.profile;
  p.sid = typeof p.sid === "string" && SF_SID_RE.test(p.sid) ? p.sid : "";
  p.land = SF_LAENDER[p.land] ? p.land : "XX";
  p.art = SF_ARTEN[p.art] ? p.art : "so";
  p.stufe = typeof p.stufe === "string" && SF_STUFE_RE.test(p.stufe) ? p.stufe : "";
  if (!p.stufe) p.sid = "";
  const seen = {};
  p.faecher = (Array.isArray(p.faecher) ? p.faecher : [])
    .filter(
      (x) =>
        x &&
        /^[a-z0-9-]{2,40}$/.test(x.slug) &&
        typeof x.name === "string" &&
        SF_NAME_RE.test(x.name) &&
        !SF_FACH[x.slug] &&
        !seen[x.slug] &&
        (seen[x.slug] = 1),
    )
    .slice(0, 20)
    .map((x) => ({ slug: x.slug, name: x.name }));
  p.year = Number.isInteger(p.year) && p.year > 2000 && p.year < 3000 ? p.year : 0;
}

/* ---------- Modus & Fächer ---------- */
function schoolMode() {
  const p = S.profile;
  return !!(
    p.sid &&
    SF_STUFE_RE.test(p.stufe || "") &&
    !(p.sid === SF_ORIG_SID && KLASSEN.includes(p.klasse))
  );
}
/* gleiche Regel wie band() in agent/aufgaben-worker.mjs */
function sfBand(fach, stufe) {
  if (stufe.startsWith("L")) return fach === "mathe" ? "9-10" : "11-13";
  const n = +stufe;
  return n <= 2
    ? "1-2"
    : n <= 4
      ? "3-4"
      : n <= 6
        ? "5-6"
        : n <= 8
          ? "7-8"
          : n <= 10
            ? "9-10"
            : "11-13";
}
function sfStufeTxt(s) {
  return s.startsWith("L") ? s.slice(1) + ". Ausbildungsjahr" : "Klasse " + s;
}
function sfPrefix() {
  const p = S.profile;
  return p.land + "|" + p.art + "|" + p.stufe + "|";
}
function sfKey(slug) {
  return sfPrefix() + slug;
}
function sfMyKeys() {
  return Object.keys(SF_FACH)
    .concat(S.profile.faecher.map((x) => x.slug))
    .map(sfKey);
}
function sfSlug(name) {
  const s = String(name || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return { mathematik: "mathe", english: "englisch", geografie: "geographie" }[s] || s;
}
function schoolDesc() {
  if (!schoolMode()) return "";
  const p = S.profile;
  return `${SF_ARTEN[p.art]}, ${sfStufeTxt(p.stufe)}${p.land !== "XX" ? ", " + SF_LAENDER[p.land] : ""}`;
}

function sfLoadPacks() {
  try {
    const o = JSON.parse(localStorage.getItem(SF_PACKS_KEY) || "{}");
    for (const k in o)
      if (SF_KEY_RE.test(k) && o[k] && typeof o[k] === "object")
        SF.packs[k] = {
          name: String(o[k].name || "").slice(0, 40),
          subject: o[k].subject,
          at: String(o[k].at || ""),
        };
  } catch (e) {}
}
function sfSavePacks() {
  try {
    localStorage.setItem(SF_PACKS_KEY, JSON.stringify(SF.packs));
  } catch (e) {}
}
function sfPackSubj(key) {
  if (!SF.packs[key]) return null;
  if (!(key in SF.clean)) {
    const s = cleanSubject(SF.packs[key].subject);
    SF.clean[key] = s && SF_TID_RE.test(s.topics[0].id) ? s : null;
  }
  return SF.clean[key];
}
function sfBuiltin(f, band, key) {
  const src = ((window.LERNHUB_SCHULFAECHER || {})[f] || {})[band];
  if (!src) return null;
  const m = SF_FACH[f],
    extra = key ? (sfPackSubj(key) || { topics: [] }).topics : [];
  return cleanSubject({
    id: "sf_" + m.k + "_" + band.replace("-", ""),
    name: m.name,
    color: m.color,
    lang: m.lang,
    topics: src.topics.concat(extra),
  });
}
/* Alle bekannten Schul-Fächer (für Wiederholungen auch aus anderen Stufen) + die sichtbaren im Schulmodus */
function sfBuild() {
  const p = S.profile,
    mode = schoolMode();
  const sig = [mode, p.land, p.art, p.stufe, p.faecher.map((x) => x.slug).join(","), SF.ver].join(
    "|",
  );
  if (SF.cache && SF.sig === sig) return SF.cache;
  const all = {},
    ids = [];
  for (const k in SF.packs) {
    const s = sfPackSubj(k);
    if (s) all[s.id] = s;
  }
  for (const f in SF_FACH)
    for (const b in (window.LERNHUB_SCHULFAECHER || {})[f] || {}) {
      const s = sfBuiltin(f, b);
      if (s) all[s.id] = s;
    }
  if (mode) {
    for (const f in SF_FACH) {
      const s = sfBuiltin(f, sfBand(f, p.stufe), sfKey(f));
      if (s) {
        all[s.id] = s;
        ids.push(s.id);
      }
    }
    for (const x of p.faecher) {
      const s = sfPackSubj(sfKey(x.slug));
      if (s) ids.push(s.id);
    }
  }
  SF.sig = sig;
  return (SF.cache = { ids, all });
}
function schoolSubjectIds() {
  return schoolMode() ? sfBuild().ids : null;
}
function schoolSubj(id) {
  return sfBuild().all[id];
}
function schoolAllIds() {
  return Object.keys(sfBuild().all);
}
/* Wiederholungen aus Cloud-Paketen behalten, solange das Paket auf diesem Gerät noch nicht geladen ist */
function schoolKeepTid(tid) {
  return SF_TID_RE.test(tid || "") && !sfKeyOfTid(tid);
}
function sfKeyOfTid(tid) {
  for (const k in SF.packs) {
    const s = sfPackSubj(k);
    if (s && s.topics.some((t) => t.id === tid)) return k;
  }
  return "";
}
function sfKeyOfSubj(id) {
  if (!schoolMode()) return "";
  for (const f in SF_FACH)
    if (id === "sf_" + SF_FACH[f].k + "_" + sfBand(f, S.profile.stufe).replace("-", ""))
      return sfKey(f);
  for (const x of S.profile.faecher) {
    const s = sfPackSubj(sfKey(x.slug));
    if (s && s.id === id) return sfKey(x.slug);
  }
  return "";
}
const sfBusy = (st) => !!st && (st.status === "offen" || st.status === "arbeit");

/* ---------- Cloud-Abgleich (ohne Login lesbar) ---------- */
async function schoolSync(force) {
  if (!schoolMode() || !window.cloudCfg || !cloudCfg() || SF.busy) return;
  if (!force && Date.now() - SF.at < 5 * 60e3) return;
  SF.busy = true;
  SF.at = Date.now();
  let changed = false;
  const done = [];
  try {
    const list = await cloudReq("/rest/v1/rpc/pack_list", { p_prefix: sfPrefix() });
    SF.avail = (Array.isArray(list) ? list : [])
      .filter((x) => x && SF_KEY_RE.test(x.key))
      .map((x) => ({
        key: x.key,
        name: String(x.name || "").slice(0, 40),
        topics: +x.topics || 0,
        at: String(x.at || ""),
      }));
    const mine = sfMyKeys();
    const need = SF.avail
      .filter((a) => mine.includes(a.key) && (!SF.packs[a.key] || SF.packs[a.key].at !== a.at))
      .map((a) => a.key);
    if (need.length) {
      const got = await cloudReq("/rest/v1/rpc/pack_get", { p_keys: need.slice(0, 30) });
      for (const g of Array.isArray(got) ? got : []) {
        if (!g || !SF_KEY_RE.test(g.key) || !g.subject) continue;
        const old = SF.packs[g.key],
          oldN = old && sfPackSubj(g.key) ? sfPackSubj(g.key).topics.length : 0;
        SF.packs[g.key] = {
          name: String(g.name || "").slice(0, 40),
          subject: g.subject,
          at: String(g.at || ""),
        };
        delete SF.clean[g.key];
        const s = sfPackSubj(g.key);
        if (s && s.topics.length > oldN)
          done.push(
            oldN
              ? `☁️ ${s.name}: ${s.topics.length - oldN} neue Themen`
              : `✅ ${s.name} ist fertig!`,
          );
        changed = true;
      }
      if (changed) {
        SF.ver++;
        sfSavePacks();
      }
    }
    const st = await cloudReq("/rest/v1/rpc/pack_status", { p_keys: mine.slice(0, 30) });
    const before = JSON.stringify(SF.status);
    SF.status = {};
    for (const x of Array.isArray(st) ? st : [])
      if (x && SF_KEY_RE.test(x.key)) SF.status[x.key] = x;
    if (JSON.stringify(SF.status) !== before) changed = true;
  } catch (e) {
    SF.err = e.message;
  }
  SF.busy = false;
  if (done.length && window.toast) toast(done.join(" · "));
  if (changed && ["home", "path"].includes(V.view) && $("modal").classList.contains("hidden"))
    render();
}
setInterval(() => {
  if (
    document.visibilityState === "visible" &&
    schoolMode() &&
    Object.values(SF.status).some(sfBusy)
  )
    schoolSync(true);
}, 60e3);

/* ---------- Schule wählen ---------- */
function sfLandOpts(sel) {
  return Object.keys(SF_LAENDER)
    .filter((k) => k !== "XX")
    .map((k) => `<option value="${k}" ${k === sel ? "selected" : ""}>${SF_LAENDER[k]}</option>`)
    .join("");
}
function schoolPickerOpen() {
  SF.pick = null;
  const p = S.profile;
  const orig =
    SCHULEN.map(
      (s, i) =>
        `<div class="listrow" onclick="pickSchool(${i})"><span class="emo">🏫</span><div><b>${esc(s)}</b><small>Schule</small></div></div>`,
    ).join("") +
    KLASSEN.map(
      (k, i) =>
        `<div class="listrow" onclick="pickClass(${i})"><span class="emo">🎓</span><div><b>${esc(k)}</b><small>Klasse</small></div></div>`,
    ).join("");
  toastModal(`<h2 style="margin-top:0">🏫 Schule &amp; Klasse</h2>
    <p class="small mut">Aktuell: <b>${esc(p.school || "–")}</b> · ${esc(p.klasse || "–")}${schoolMode() ? " · " + esc(schoolDesc()) : " (Lernhub-Original)"}</p>
    <p class="small">Such deine Schule – <b>Deutsch, Mathe und Englisch</b> passend zu deiner Klasse sind sofort da. Weitere Fächer erstellt OpenCode einmalig, danach haben alle dieselben Aufgaben.</p>
    <div class="schrow"><input class="fi" id="sfQ" placeholder="Schulname, z. B. Goethe-Gymnasium" autocomplete="off" oninput="sfSearchSoon()">
      <select class="fi" id="sfLand" onchange="sfSearchSoon()"><option value="">Alle Bundesländer</option>${sfLandOpts(p.sid ? p.land : "")}</select></div>
    <div class="schbtns"><button class="btn ghost sm" onclick="sfNear()">📍 In meiner Nähe</button>
      <button class="btn ghost sm" onclick="sfManual()">✍️ Schule von Hand eintragen</button></div>
    <div id="sfRes" class="schres"></div>
    <details class="schorig"><summary>Lernhub-Original (Gewerbliche Schulen VS · E1FI)</summary>${orig}</details>
    <p class="small mut">Schuldaten: <a href="https://jedeschule.codefor.de" target="_blank" rel="noopener">jedeschule.codefor.de</a> (Code for Germany). Dorthin geht nur dein Suchbegriff bzw. dein ungefährer Standort.</p>
    <button class="btn ghost sm" onclick="closeModal()">Schließen</button>`);
  setTimeout(() => {
    const q = $("sfQ");
    if (q) q.focus();
  }, 50);
}
function sfSearchSoon() {
  clearTimeout(SF.t);
  SF.t = setTimeout(() => sfSearch(), 350);
}
function sfCleanSchool(x) {
  if (!x || typeof x.id !== "string" || !SF_SID_RE.test(x.id) || typeof x.name !== "string")
    return null;
  const land = x.id.slice(0, 2);
  if (!SF_LAENDER[land] || land === "XX") return null;
  return {
    sid: x.id,
    land,
    name: x.name.replace(/\s+/g, " ").trim().slice(0, 140),
    city: str(x.city, 60),
    zip: str(String(x.zip || ""), 10),
    type: str(x.school_type, 80),
  };
}
async function sfSearch(geo) {
  const box = $("sfRes");
  if (!box) return;
  const q = (($("sfQ") || {}).value || "").trim(),
    land = ($("sfLand") || {}).value || "";
  if (!geo && q.length < 3) {
    box.innerHTML = q ? `<p class="small mut">Mindestens 3 Buchstaben …</p>` : "";
    return;
  }
  const u = new URL(SF_API);
  if (q.length >= 3) u.searchParams.set("name", q.slice(0, 80));
  if (SF_LAENDER[land]) u.searchParams.set("state", land);
  if (geo) {
    u.searchParams.set("by_lat", geo.lat.toFixed(2));
    u.searchParams.set("by_lon", geo.lon.toFixed(2));
  }
  u.searchParams.set("limit", "30");
  if (SF.ctrl) SF.ctrl.abort();
  SF.ctrl = new AbortController();
  box.innerHTML = `<p class="small mut">Suche …</p>`;
  try {
    const r = await fetch(u, { signal: SF.ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    SF.results = (Array.isArray(j) ? j : []).map(sfCleanSchool).filter(Boolean);
    if (!$("sfRes")) return;
    $("sfRes").innerHTML = SF.results.length
      ? SF.results
          .map(
            (s, i) =>
              `<div class="listrow" onclick="sfChoose(${i})"><span class="emo">🏫</span><div><b>${esc(s.name)}</b><small>${esc([s.zip, s.city].filter(Boolean).join(" "))} · ${esc(SF_LAENDER[s.land])}</small></div></div>`,
          )
          .join("")
      : `<p class="small mut">Nichts gefunden. Tipp: nur einen Teil des Namens eingeben (z. B. „Goethe“) oder <a onclick="sfManual()">von Hand eintragen</a>.</p>`;
  } catch (e) {
    if (e.name === "AbortError" || !$("sfRes")) return;
    $("sfRes").innerHTML =
      `<p class="small mut">Schulsuche gerade nicht erreichbar. <a onclick="sfManual()">Von Hand eintragen</a></p>`;
  }
}
function sfNear() {
  if (!navigator.geolocation) return toast("Standort wird von diesem Browser nicht unterstützt");
  const box = $("sfRes");
  if (box) box.innerHTML = `<p class="small mut">Standort wird ermittelt …</p>`;
  navigator.geolocation.getCurrentPosition(
    (pos) => sfSearch({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => {
      if ($("sfRes"))
        $("sfRes").innerHTML =
          `<p class="small mut">Kein Standort – bitte den Schulnamen eingeben.</p>`;
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
  );
}
function sfGuessArt(name, type) {
  const t = (name + " " + type).toLowerCase();
  if (/grundschule|primar/.test(t)) return "gs";
  if (/förder|sbbz|sonderpäd/.test(t)) return "fs";
  if (
    /berufliches gymnasium|wirtschaftsgymnasium|technisches gymnasium|fachoberschule|berufsoberschule|\bfos\b|\bbos\b/.test(
      t,
    )
  )
    return "bg";
  if (/gymnasium/.test(t)) return "gy";
  if (/realschule/.test(t)) return "rs";
  if (
    /gemeinschaftsschule|gesamtschule|sekundarschule|oberschule|stadtteilschule|regionalschule/.test(
      t,
    )
  )
    return "ge";
  if (/hauptschule|mittelschule|werkrealschule/.test(t)) return "hs";
  if (/berufsfachschule|berufskolleg/.test(t)) return "bf";
  if (
    /berufsschule|gewerb|kaufmänn|berufsbild|berufliche|\bbbs\b|oberstufenzentrum|hauswirtschaft/.test(
      t,
    )
  )
    return "bs";
  return "so";
}
function sfChoose(i) {
  const s = SF.results[i];
  if (!s) return;
  SF.pick = {
    sid: s.sid,
    land: s.land,
    name: s.name,
    city: s.city,
    art: sfGuessArt(s.name, s.type),
  };
  sfStep2();
}
function sfManual() {
  SF.pick = {
    manual: true,
    sid: "",
    land: S.profile.land !== "XX" ? S.profile.land : "BW",
    name: "",
    city: "",
    art: "so",
  };
  sfStep2();
}
function sfStep2() {
  const p = SF.pick,
    cur = S.profile;
  toastModal(`<h2 style="margin-top:0">🏫 ${p.manual ? "Schule eintragen" : esc(p.name)}</h2>
    ${
      p.manual
        ? `<label class="fl">Name der Schule</label><input class="fi" id="sfMName" maxlength="120" placeholder="z. B. Goethe-Gymnasium Musterstadt">
         <label class="fl">Bundesland</label><select class="fi" id="sfMLand">${sfLandOpts(p.land)}<option value="XX">Anderes / Ausland</option></select>`
        : `<p class="small mut">${esc(p.city)} · ${esc(SF_LAENDER[p.land])}</p>`
    }
    <label class="fl">Schulart</label>
    <select class="fi" id="sfArt" onchange="sfStufeOpts()">${Object.keys(SF_ARTEN)
      .map((k) => `<option value="${k}" ${k === p.art ? "selected" : ""}>${SF_ARTEN[k]}</option>`)
      .join("")}</select>
    <label class="fl">Klassenstufe</label><select class="fi" id="sfStufe"></select>
    <label class="fl">Klasse (optional)</label><input class="fi" id="sfKl" maxlength="20" placeholder="z. B. 7b">
    <p class="small mut">Alle aus demselben Bundesland mit derselben Schulart und Stufe lernen mit denselben Aufgaben – so gibt es keine Abweichungen.</p>
    <button class="btn" onclick="sfSave()">Speichern</button> <button class="btn ghost" onclick="schoolPickerOpen()">Zurück</button>`);
  sfStufeOpts(cur.stufe);
}
function sfStufeOpts(pre) {
  const a = ($("sfArt") || {}).value,
    el = $("sfStufe");
  if (!el) return;
  const old = pre || el.value;
  const r = (x, y) => Array.from({ length: y - x + 1 }, (_, i) => String(x + i));
  const list =
    a === "gs"
      ? r(1, 4)
      : a === "bs"
        ? ["L1", "L2", "L3", "L4"]
        : a === "bf" || a === "bg"
          ? r(10, 13).concat(["L1", "L2", "L3"])
          : a === "fs" || a === "so"
            ? r(1, 13)
            : r(5, 13);
  el.innerHTML = list
    .map((s) => `<option value="${s}" ${s === old ? "selected" : ""}>${sfStufeTxt(s)}</option>`)
    .join("");
}
function sfSave() {
  const p = SF.pick;
  if (!p) return;
  if (p.manual) {
    const n = (($("sfMName") || {}).value || "").replace(/\s+/g, " ").trim();
    if (n.length < 3) return toast("Bitte den Namen der Schule eingeben");
    p.name = n.slice(0, 120);
    p.land = SF_LAENDER[$("sfMLand").value] ? $("sfMLand").value : "XX";
    p.sid = p.land + "-man-" + (sfSlug(n).slice(0, 60) || "schule");
  }
  const art = $("sfArt").value,
    stufe = $("sfStufe").value;
  if (!SF_ARTEN[art] || !SF_STUFE_RE.test(stufe)) return toast("Bitte Schulart und Stufe wählen");
  const kl = (($("sfKl") || {}).value || "").replace(/\s+/g, " ").trim().slice(0, 20);
  const P = S.profile;
  Object.assign(P, {
    sid: p.sid,
    land: p.land,
    art,
    stufe,
    klasse: kl || sfStufeTxt(stufe),
    year: sfSchoolYear(),
    school: (p.name + (p.city && !p.name.includes(p.city) ? " (" + p.city + ")" : "")).slice(
      0,
      160,
    ),
  });
  save();
  closeModal();
  SF.at = 0;
  SF.avail = null;
  SF.status = {};
  schoolSync(true);
  if (V.view === "onboard") renderOnboard();
  else {
    renderTop();
    render();
  }
  toast(
    schoolMode()
      ? "Gespeichert ✓ Deutsch, Mathe & Englisch für " + sfStufeTxt(stufe) + " sind da"
      : "Gespeichert ✓ Lernhub-Original",
  );
}

/* ---------- Neues Schuljahr: Stufe hochsetzen ---------- */
function sfSchoolYear() {
  const d = new Date();
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
}
function sfNextStufe(s, art) {
  if (s.startsWith("L")) return +s[1] < 4 ? "L" + (+s[1] + 1) : "";
  const n = +s;
  return (art === "gs" && n >= 4) || n >= 13 ? "" : String(n + 1);
}
function sfYearCheck() {
  if (!schoolMode()) return;
  const p = S.profile,
    y = sfSchoolYear();
  if (!p.year) {
    p.year = y;
    save();
    return;
  }
  if (p.year >= y) return;
  p.year = y;
  save();
  const nx = sfNextStufe(p.stufe, p.art);
  if (!nx)
    return toastModal(`<h2 style="margin-top:0">🎉 Neues Schuljahr!</h2><p>Gehst du jetzt auf eine andere Schule? Dann wähle sie neu – deine Fortschritte bleiben erhalten.</p>
    <button class="btn" onclick="schoolPickerOpen()">Schule ändern</button> <button class="btn ghost" onclick="closeModal()">Passt so</button>`);
  toastModal(`<h2 style="margin-top:0">🎉 Neues Schuljahr!</h2><p>Bist du jetzt in <b>${sfStufeTxt(nx)}</b>? Dann bekommst du die passenden Aufgaben – alte Fortschritte bleiben erhalten.</p>
    <button class="btn g" onclick="sfPromote('${nx}')">Ja, ${sfStufeTxt(nx)}</button> <button class="btn ghost" onclick="closeModal()">Nein, gleiche Stufe</button>`);
}
function sfPromote(nx) {
  if (!SF_STUFE_RE.test(nx)) return;
  const p = S.profile,
    old = p.stufe;
  p.stufe = nx;
  p.klasse =
    /^\d+/.test(p.klasse) && !old.startsWith("L") ? p.klasse.replace(/^\d+/, nx) : sfStufeTxt(nx);
  save();
  closeModal();
  SF.at = 0;
  SF.avail = null;
  SF.status = {};
  schoolSync(true);
  renderTop();
  render();
  toast("Viel Erfolg in " + sfStufeTxt(nx) + "! 🚀");
}

/* ---------- Dashboard-Karte ---------- */
function schoolDashHTML() {
  if (!schoolMode()) return "";
  const p = S.profile,
    b = sfBuild();
  const chips = b.ids
    .map((id) => {
      const s = b.all[id];
      return `<button class="schip" style="--c:${s.color}" onclick="openSubject('${id}')">${esc(s.name)} <small>${s.topics.length}</small></button>`;
    })
    .join("");
  const pend = p.faecher
    .filter((x) => !sfPackSubj(sfKey(x.slug)))
    .map((x) => {
      const st = SF.status[sfKey(x.slug)];
      if (st && st.status === "fehler" && (st.kind === "neu" || st.kind === "mehr"))
        return `<button class="schip bad" data-s="${x.slug}" onclick="schoolRetry(this.dataset.s)">⚠️ ${esc(x.name)} <small>nochmal versuchen</small></button>`;
      const txt = !st
        ? "wird gesucht …"
        : st.status === "arbeit"
          ? "OpenCode schreibt …"
          : st.pos
            ? "Platz " + st.pos
            : "in der Warteschlange";
      return `<span class="schip wait">⏳ ${esc(x.name)} <small>${esc(txt)}</small></span>`;
    })
    .join("");
  const others = (SF.avail || [])
    .filter((a) => !SF_FACH[a.key.split("|")[3]] && !p.faecher.some((x) => sfKey(x.slug) === a.key))
    .slice(0, 12);
  return `<div class="card schpanel">
    <div class="schhead"><div><b>🏫 ${esc(p.school)}</b><small>${esc(p.klasse)} · ${esc(schoolDesc())}</small></div>
      <button class="btn ghost sm" onclick="openSchoolPicker()">Ändern</button></div>
    <div class="schchips">${chips}${pend}<button class="schip add" onclick="schoolAddFach()">➕ Fach</button></div>
    ${
      others.length
        ? `<p class="small mut" style="margin:10px 0 4px">Von anderen aus deiner Stufe schon erstellt – mit einem Klick dabei:</p>
      <div class="schchips">${others.map((a) => `<button class="schip" data-k="${esc(a.key)}" onclick="schoolTake(this.dataset.k)">➕ ${esc(a.name)} <small>${a.topics}</small></button>`).join("")}</div>`
        : ""
    }
  </div>`;
}
function schoolTake(key) {
  const a = (SF.avail || []).find((x) => x.key === key);
  if (!a || !key.startsWith(sfPrefix())) return;
  const slug = key.split("|")[3];
  if (S.profile.faecher.length >= 20) return toast("Maximal 20 Fächer");
  if (!S.profile.faecher.some((x) => x.slug === slug) && SF_NAME_RE.test(a.name))
    S.profile.faecher.push({ slug, name: a.name });
  save();
  render();
  schoolSync(true);
  toast("☁️ " + a.name + " wird geladen …");
}

/* ---------- Fach hinzufügen / mehr Aufgaben ---------- */
function schoolAddFach() {
  if (!schoolMode()) return schoolPickerOpen();
  const p = S.profile;
  const sugg = (
    p.art === "gs" ? SF_SUGG.gs : ["bs", "bf", "bg"].includes(p.art) ? SF_SUGG.beruf : SF_SUGG.sek
  ).filter((n) => !p.faecher.some((x) => x.slug === sfSlug(n)));
  toastModal(`<h2 style="margin-top:0">➕ Fach hinzufügen</h2>
    <p class="small mut">Für <b>${esc(schoolDesc())}</b>. Gibt es das Fach schon, bekommst du sofort dieselben Aufgaben wie alle anderen. Sonst erstellt OpenCode es einmalig (meist 10–30 Minuten) – danach gilt es für alle in deiner Stufe.</p>
    <input class="fi" id="sfName" maxlength="40" placeholder="z. B. Biologie" onkeydown="if(event.key==='Enter')schoolAddGo()">
    <div class="schchips" style="margin:8px 0 12px">${sugg.map((n) => `<button class="schip" data-n="${esc(n)}" onclick="$('sfName').value=this.dataset.n">${esc(n)}</button>`).join("")}</div>
    <button class="btn" onclick="schoolAddGo()">Hinzufügen</button> <button class="btn ghost" onclick="closeModal()">Abbrechen</button>
    ${p.faecher.length ? `<p class="small mut" style="margin-top:14px">Deine Fächer:</p><div class="schchips">${p.faecher.map((x) => `<span class="schip">${esc(x.name)} <button class="schx" title="Entfernen" data-s="${x.slug}" onclick="schoolDrop(this.dataset.s)">✕</button></span>`).join("")}</div>` : ""}`);
  setTimeout(() => {
    const q = $("sfName");
    if (q) q.focus();
  }, 50);
}
function sfReqErr(e) {
  const m = String((e && e.message) || e);
  return /Limit erreicht/.test(m)
    ? "Tageslimit erreicht (5 Anfragen pro Tag) – morgen geht's weiter."
    : m;
}
function sfNeedLogin() {
  if (!window.cloudCfg || !cloudCfg()) {
    toast("Die Cloud ist für diese App nicht eingerichtet");
    return true;
  }
  if (!CLOUD) {
    closeModal();
    toast("Bitte kurz kostenlos einloggen – so kann niemand die KI zuspammen.");
    go("konto");
    return true;
  }
  return false;
}
async function schoolAddGo() {
  const name = (($("sfName") || {}).value || "").replace(/\s+/g, " ").trim();
  if (!SF_NAME_RE.test(name))
    return toast("Fachname: 2–40 Zeichen, nur Buchstaben, Zahlen und . , & ( ) / + -");
  const slug = sfSlug(name),
    p = S.profile;
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return toast("Bitte einen anderen Fachnamen wählen");
  if (SF_FACH[slug]) return toast(SF_FACH[slug].name + " ist schon dabei 🙂");
  if (p.faecher.some((x) => x.slug === slug)) return toast("Das Fach hast du schon");
  if (p.faecher.length >= 20) return toast("Maximal 20 Fächer");
  const key = sfKey(slug);
  if (!(SF.avail || []).some((a) => a.key === key)) {
    if (sfNeedLogin()) return;
    try {
      const r = await rpc("pack_request", {
        p_key: key,
        p_name: name,
        p_kind: "neu",
        p_school: String(p.school || "").slice(0, 100),
      });
      toast(
        r === "exists"
          ? "☁️ Gibt es schon – wird geladen …"
          : r === "queued"
            ? "⏳ Wird schon für deine Stufe erstellt"
            : `⏳ OpenCode erstellt jetzt „${name}“ – meist 10–30 Minuten.`,
      );
    } catch (e) {
      return toast(sfReqErr(e));
    }
  }
  p.faecher.push({ slug, name });
  save();
  closeModal();
  render();
  schoolSync(true);
}
async function schoolRetry(slug) {
  const x = S.profile.faecher.find((f) => f.slug === slug);
  if (!x || sfNeedLogin()) return;
  try {
    await rpc("pack_request", {
      p_key: sfKey(slug),
      p_name: x.name,
      p_kind: "neu",
      p_school: String(S.profile.school || "").slice(0, 100),
    });
    toast("⏳ Neuer Versuch gestartet");
    schoolSync(true);
  } catch (e) {
    toast(sfReqErr(e));
  }
}
function schoolDrop(slug) {
  S.profile.faecher = S.profile.faecher.filter((x) => x.slug !== slug);
  save();
  schoolAddFach();
  render();
}
async function schoolMore(id) {
  const key = sfKeyOfSubj(id),
    s = subjById(id);
  if (!key || !s || sfNeedLogin()) return;
  if (sfBusy(SF.status[key]))
    return toast("⏳ OpenCode arbeitet schon daran – schau gleich nochmal vorbei");
  const name = SF_FACH[key.split("|")[3]]
    ? SF_FACH[key.split("|")[3]].name
    : (SF.packs[key] || {}).name || s.name;
  try {
    const r = await rpc("pack_request", {
      p_key: key,
      p_name: name,
      p_kind: "mehr",
      p_school: String(S.profile.school || "").slice(0, 100),
    });
    toast(
      r === "full"
        ? "Das Fach hat schon die maximale Anzahl Themen 💪"
        : r === "queued"
          ? "⏳ Wird schon erstellt"
          : "⏳ OpenCode erstellt 2 neue Themen – für alle in deiner Stufe.",
    );
    schoolSync(true);
  } catch (e) {
    toast(sfReqErr(e));
  }
}
function schoolPathCard(id) {
  const key = sfKeyOfSubj(id);
  if (!key) return "";
  const busy = sfBusy(SF.status[key]);
  return `<div class="card center" style="cursor:pointer" data-s="${id}" onclick="schoolMore(this.dataset.s)"><div style="font-size:28px">${busy ? "⏳" : "☁️"}</div><b>${busy ? "Wird erstellt …" : "Mehr Aufgaben"}</b><br><small class="mut">${busy ? "OpenCode arbeitet daran" : "OpenCode erstellt sie für alle"}</small></div>`;
}

/* ---------- Fehler in Cloud-Aufgaben melden ---------- */
function packReportLink() {
  if (typeof LES === "undefined" || !LES || !LES.items || !window.cloudCfg || !cloudCfg())
    return "";
  const it = curItem();
  if (!it || !SF_TID_RE.test(it.tid || "") || !["mc", "card", "gap", "free"].includes(it.kind))
    return "";
  return `<div style="margin-top:8px"><a class="small mut" onclick="packReport()">⚠️ Aufgabe falsch? Melden</a></div>`;
}
function packReport() {
  const it = curItem(),
    key = it && sfKeyOfTid(it.tid);
  if (!key) return toast("Aufgabe nicht gefunden");
  if (!CLOUD) return toast("Zum Melden bitte im Konto einloggen");
  SF.rep = { key, tid: it.tid, kind: it.kind, idx: it.idx };
  toastModal(`<h2 style="margin-top:0">⚠️ Aufgabe melden</h2>
    <p class="small mut">OpenCode prüft die Aufgabe und korrigiert sie für alle.</p>
    <textarea class="ta" id="sfNote" maxlength="300" rows="3" placeholder="Was ist falsch? (optional)"></textarea>
    <div style="margin-top:10px"><button class="btn" onclick="packReportGo()">Melden</button> <button class="btn ghost" onclick="closeModal()">Abbrechen</button></div>`);
}
async function packReportGo() {
  const r = SF.rep;
  if (!r) return;
  try {
    await rpc("pack_report", {
      p_key: r.key,
      p_tid: r.tid,
      p_kind: r.kind,
      p_idx: r.idx,
      p_note: (($("sfNote") || {}).value || "").slice(0, 300),
    });
    closeModal();
    toast("Danke! Wird geprüft und für alle korrigiert 🙏");
  } catch (e) {
    toast(sfReqErr(e));
  }
}

sfLoadPacks();
