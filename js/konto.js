/* Lernhub Konto: Anmelde-Bildschirm (Einloggen, Registrieren, Passwort vergessen) und privater Cloud-Speicher
   für den kompletten Lernstand (Supabase-Tabelle user_state, nur für den Besitzer lesbar).
   Gerätegebundene Geheimnisse (API-Key, Untis-Link, Vault-Pfad, Push-Adresse) verlassen nie das Gerät. */
const SYNC_KEY = "lernhub_sync_v1";
const SYNC_MAX = 1900000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let KONTO = {
  mode: "login",
  busy: false,
  showPw: false,
  welcome: false,
  at: 0,
  err: "",
  pulledAt: 0,
  google: false,
  ids: null,
};
let SYNC = { on: true, base: null, hash: "", email: "" };
let STATE_T = null;

function syncLoad() {
  try {
    const o = JSON.parse(localStorage.getItem(SYNC_KEY) || "null");
    if (o && typeof o === "object")
      SYNC = {
        on: o.on !== false,
        base: typeof o.base === "string" ? o.base : null,
        hash: String(o.hash || ""),
        email: String(o.email || ""),
      };
  } catch (e) {}
}
function syncStore() {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(SYNC));
  } catch (e) {}
}
function syncReset() {
  SYNC = { on: SYNC.on, base: null, hash: "", email: "" };
  syncStore();
  clearTimeout(STATE_T);
}

/* ---- Was in die Cloud darf ---- */
function stateForSync(st) {
  const c = JSON.parse(JSON.stringify(st));
  c.chat.apiKey = "";
  c.chat.fishKey = "";
  c.untis.url = "";
  c.agent = {
    vaultPath: "",
    schoolUrl: c.agent.schoolUrl || "",
    connected: false,
    full: false,
    lastPing: 0,
  };
  delete c.push;
  c.remind.notify = false;
  if (c.focus) c.focus.run = null;
  return c;
}
/* Akku-Stand ändert sich ständig von selbst und zählt nicht als „neuer Lernstand“ */
function stateHash(c) {
  const s = JSON.stringify(Object.assign({}, c, { hearts: null }));
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + "." + s.length;
}
function stateApply(data, at) {
  const clean = sanitizeState(data);
  clean.chat.apiKey = S.chat.apiKey;
  clean.chat.fishKey = S.chat.fishKey || "";
  clean.untis.url = S.untis.url;
  clean.agent.vaultPath = S.agent.vaultPath;
  clean.push = S.push;
  clean.remind.notify = S.remind.notify;
  clean.authAsked = true;
  SYNC.base = at;
  SYNC.hash = stateHash(stateForSync(clean));
  syncStore();
  /* Stundenplan & Termine dieses Geräts nicht verlieren – werden beim nächsten Abgleich mit hochgeladen */
  if (!clean.untis.ev.length && S.untis.ev.length) {
    clean.untis.ev = S.untis.ev;
    clean.untis.at = S.untis.at;
  }
  if (!clean.untis.week.length && S.untis.week.length) clean.untis.week = S.untis.week;
  if (!clean.untis.off.length && S.untis.off.length) clean.untis.off = S.untis.off;
  S.events.forEach((e) => {
    if (!clean.events.some((x) => x.id === e.id || (x.date === e.date && x.title === e.title)))
      clean.events.push(e);
  });
  localStorage.setItem(LS_KEY, JSON.stringify(clean));
  location.reload();
}
function syncReady() {
  return !!(CLOUD && cloudCfg() && SYNC.on);
}

/* ---- Hochladen (gebündelt nach dem Speichern) ---- */
function statePushSoon() {
  if (!syncReady()) return;
  clearTimeout(STATE_T);
  STATE_T = setTimeout(statePush, 8000);
}
async function statePush(force) {
  clearTimeout(STATE_T);
  if (!syncReady()) return false;
  const c = stateForSync(S),
    json = JSON.stringify(c),
    h = stateHash(c);
  if (!force && h === SYNC.hash) return true;
  if (json.length > SYNC_MAX) {
    KONTO.err =
      "Dein Lernstand ist zu groß für den Cloud-Speicher (eigene Charakterbilder verkleinern).";
    kontoRedraw();
    return false;
  }
  try {
    const at = await rpc("state_save", { p_data: c, p_base: SYNC.base });
    SYNC.base = at;
    SYNC.hash = h;
    SYNC.email = CLOUD.email;
    syncStore();
    KONTO.at = Date.now();
    KONTO.err = "";
    kontoRedraw();
    return true;
  } catch (e) {
    if (/state_conflict/.test(e.message)) return statePull(true);
    KONTO.err = /state_too_big/.test(e.message)
      ? "Dein Lernstand ist zu groß für den Cloud-Speicher."
      : e.message;
    kontoRedraw();
    return false;
  }
}
/* ---- Herunterladen: neuerer Stand von einem anderen Gerät? ---- */
function localHasProgress() {
  return (
    S.xp > 0 ||
    S.stats.answered > 0 ||
    (S.notes || []).length > 0 ||
    S.chars.length > 0 ||
    S.untis.week.length > 0
  );
}
async function statePull() {
  if (!syncReady()) return;
  KONTO.pulledAt = Date.now();
  let r;
  try {
    r = await rpc("state_load");
  } catch (e) {
    KONTO.err = e.message;
    kontoRedraw();
    return;
  }
  if (!r || !r.data) return statePush(true);
  if (SYNC.email && SYNC.email !== CLOUD.email) {
    SYNC.base = null;
    SYNC.hash = "";
  }
  if (r.updated_at === SYNC.base) return statePush();
  const local = stateForSync(S);
  const localChanged = SYNC.base === null ? localHasProgress() : stateHash(local) !== SYNC.hash;
  if (!localChanged) return stateApply(r.data, r.updated_at);
  syncConflict(r);
}
function syncConflict(r) {
  const d = r.data || {},
    ds = d.stats || {},
    when = new Date(r.updated_at);
  const row = (ic, title, xp, les, sub) =>
    `<div class="listrow" style="cursor:default"><span class="emo">${ic}</span><div><b>${title}</b><small class="mut">⚡ ${+xp || 0} XP · 📚 ${+les || 0} Lektionen${sub ? " · " + sub : ""}</small></div></div>`;
  window.__syncR = r;
  toastModal(`<h2 style="margin-top:0">☁️ Welchen Lernstand behalten?</h2>
    <p>In deinem Konto liegt ein anderer Stand als auf diesem Gerät.</p>
    ${row("☁️", "Cloud", d.xp, ds.lessons, "gespeichert " + esc(when.toLocaleString("de-DE")))}
    ${row("💻", "Dieses Gerät", S.xp, S.stats.lessons, "")}
    <div class="center" style="margin-top:12px">
      <button class="btn g" onclick="closeModal();stateApply(window.__syncR.data, window.__syncR.updated_at)">☁️ Cloud-Stand laden</button>
      <button class="btn ghost" onclick="closeModal();SYNC.base=window.__syncR.updated_at;SYNC.email=CLOUD.email;statePush(true)">💻 Diesen behalten &amp; hochladen</button></div>
    <p class="small mut">Der andere Stand wird dabei überschrieben.</p>`);
}

/* ---- Anmelden & Co. ---- */
function kontoVals() {
  return {
    email: (($("kE") || {}).value || "").trim(),
    pw: ($("kP") || {}).value || "",
    nick: (($("kN") || {}).value || "").trim(),
  };
}
async function kontoBusy(fn) {
  if (KONTO.busy) return;
  KONTO.busy = true;
  renderKonto();
  try {
    await fn();
  } catch (e) {
    toast(e.message, 6000);
  }
  KONTO.busy = false;
  if (V.view === "konto") renderKonto();
}
async function kontoAfterAuth(nick) {
  KONTO.ids = null;
  if (SYNC.email !== CLOUD.email) {
    SYNC.base = null;
    SYNC.hash = "";
    SYNC.email = CLOUD.email;
    syncStore();
  }
  await cloudAfterLogin(nick);
  S.authAsked = true;
  save();
  await statePull(false);
  if (!CLOUD.nick) {
    KONTO.welcome = false;
    go("konto");
  } else if (V.view === "konto" && KONTO.welcome) {
    KONTO.welcome = false;
    go(S.seenOnboard ? "home" : "onboard");
  }
}
function kontoLogin() {
  const { email, pw } = kontoVals();
  if (!EMAIL_RE.test(email) || !pw) return toast("E-Mail und Passwort eingeben");
  kontoBusy(async () => {
    const j = await cloudReq("/auth/v1/token?grant_type=password", { email, password: pw });
    CLOUD = null;
    cloudSession(j);
    toast("Eingeloggt ✓");
    await kontoAfterAuth(CLOUD.nick);
  });
}
function kontoRegister() {
  const { email, pw, nick } = kontoVals();
  if (!EMAIL_RE.test(email)) return toast("Bitte eine gültige E-Mail eingeben");
  if (pw.length < 8) return toast("Passwort: mindestens 8 Zeichen");
  if (!NICK_RE.test(nick)) return toast("Spitzname: 3–20 Zeichen, nur Buchstaben, Zahlen, _ . -");
  kontoBusy(async () => {
    const j = await cloudReq("/auth/v1/signup?redirect_to=" + encodeURIComponent(kontoBackUrl()), {
      email,
      password: pw,
      data: { nickname: nick },
    });
    if (j && j.access_token) {
      cloudSession(j);
      toast("Konto erstellt ✓ Willkommen, " + nick + "!");
      await kontoAfterAuth(nick);
    } else {
      KONTO.mode = "login";
      toastModal(
        `<h2 style="margin-top:0">📧 Fast geschafft</h2><p>Wir haben dir eine Mail an <b>${esc(email)}</b> geschickt. Klick auf den Link darin – danach bist du automatisch eingeloggt.</p><p class="small mut">Keine Mail? Schau im Spam-Ordner nach.</p><button class="btn" onclick="closeModal()">OK</button>`,
      );
    }
  });
}
function kontoForgot() {
  const { email } = kontoVals();
  if (!EMAIL_RE.test(email)) return toast("Bitte deine E-Mail eingeben");
  kontoBusy(async () => {
    await cloudReq("/auth/v1/recover?redirect_to=" + encodeURIComponent(kontoBackUrl()), { email });
    KONTO.mode = "login";
    toast("Falls es ein Konto gibt, ist jetzt eine Mail mit Link unterwegs 📧", 7000);
  });
}
function kontoNewPw() {
  const pw = ($("kP") || {}).value || "",
    pw2 = ($("kP2") || {}).value || "";
  if (pw.length < 8) return toast("Passwort: mindestens 8 Zeichen");
  if (pw !== pw2) return toast("Die Passwörter stimmen nicht überein");
  kontoBusy(async () => {
    await cloudReq("/auth/v1/user", { password: pw }, await cloudToken(), "PUT");
    KONTO.mode = "login";
    toast("Neues Passwort gespeichert ✓");
  });
}
function kontoSkip() {
  S.authAsked = true;
  save();
  KONTO.welcome = false;
  go(S.seenOnboard ? "home" : "onboard");
}
async function kontoLogout(wipe) {
  if (
    wipe &&
    !confirm(
      "Abmelden und alle Lernhub-Daten von diesem Gerät entfernen? In der Cloud bleibt alles erhalten.",
    )
  )
    return;
  if (syncReady()) await statePush();
  await cloudLogout();
  if (wipe) {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(SYNC_KEY);
    location.reload();
  }
}
function kontoSyncToggle(on) {
  SYNC.on = !!on;
  syncStore();
  if (on) {
    SYNC.email = SYNC.email || CLOUD.email;
    statePull(true);
  }
  renderKonto();
}
function kontoBackUrl() {
  return location.origin + location.pathname;
}

/* ---- Google (Supabase OAuth, Implicit Flow: Tokens kommen wie bei Mail-Links im #-Teil zurück) ---- */
const OAUTH_KEY = "lernhub_oauth";
const GOOGLE_G = `<svg width="18" height="18" viewBox="0 0 48 48" style="vertical-align:-3px;margin-right:6px" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
function kontoGoogleCheck() {
  const cfg = cloudCfg();
  fetch(cfg.url + "/auth/v1/settings", { headers: { apikey: cfg.key } })
    .then((r) => r.json())
    .then((j) => {
      KONTO.google = !!(j && j.external && j.external.google);
      if (KONTO.google) kontoRedraw();
    })
    .catch(() => {});
}
function kontoOauthMark(kind) {
  try {
    sessionStorage.setItem(OAUTH_KEY, kind);
  } catch (e) {}
}
function kontoGoogle() {
  kontoOauthMark("login");
  location.href =
    cloudCfg().url +
    "/auth/v1/authorize?provider=google&redirect_to=" +
    encodeURIComponent(kontoBackUrl());
}
function kontoGoogleLink() {
  kontoBusy(async () => {
    const j = await cloudReq(
      "/auth/v1/user/identities/authorize?provider=google&skip_http_redirect=true&redirect_to=" +
        encodeURIComponent(kontoBackUrl()),
      null,
      await cloudToken(),
      "GET",
    );
    if (!j || !/^https:\/\//.test(j.url || "")) throw new Error("Verknüpfen gerade nicht möglich");
    kontoOauthMark("link");
    location.href = j.url;
  });
}
async function kontoIdsLoad() {
  KONTO.ids = false;
  try {
    const u = await cloudReq("/auth/v1/user", null, await cloudToken(), "GET");
    KONTO.ids = ((u && u.identities) || []).map((i) => i.provider);
  } catch (e) {
    KONTO.ids = [];
  }
  kontoRedraw();
}
function kontoIdsHTML() {
  if (!KONTO.google) return "";
  if (KONTO.ids === null) {
    KONTO.ids = false;
    setTimeout(kontoIdsLoad, 0);
  }
  const linked = Array.isArray(KONTO.ids) && KONTO.ids.includes("google");
  return `<div class="card" style="margin-top:14px"><b>🔗 Mit Google anmelden</b>
    ${
      !Array.isArray(KONTO.ids)
        ? `<p class="small mut">⏳ …</p>`
        : linked
          ? `<p class="small mut">✅ Google ist verknüpft – du kannst dich mit E-Mail oder mit Google einloggen.</p>`
          : `<p class="small mut">Verknüpfe dein Google-Konto, dann geht das Einloggen künftig mit einem Klick.</p>
      <button class="btn ghost sm" ${KONTO.busy ? "disabled" : ""} onclick="kontoGoogleLink()">${GOOGLE_G}Mit Google verknüpfen</button>`
    }</div>`;
}

/* Rücksprung aus Bestätigungs- oder Passwort-Mail: Tokens stehen im #-Teil der Adresse */
async function kontoFromLink() {
  const h = location.hash || "";
  if (!/access_token=|error_description=/.test(h)) return false;
  const p = new URLSearchParams(h.slice(1));
  const q = new URLSearchParams(location.search);
  ["error", "error_code", "error_description"].forEach((k) => q.delete(k));
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
  let oauth = "";
  try {
    oauth = sessionStorage.getItem(OAUTH_KEY) || "";
    sessionStorage.removeItem(OAUTH_KEY);
  } catch (e) {}
  if (p.get("error_description")) {
    toast(
      p.get("error_code") === "identity_already_exists"
        ? "Dieses Google-Konto gehört schon zu einem anderen Lernhub-Konto."
        : oauth
          ? "Google-Anmeldung abgebrochen oder fehlgeschlagen."
          : "Link ungültig oder abgelaufen – bitte neu anfordern.",
      7000,
    );
    return false;
  }
  const j = {
    access_token: p.get("access_token"),
    refresh_token: p.get("refresh_token"),
    expires_in: +p.get("expires_in") || 3600,
    expires_at: +p.get("expires_at") || 0,
  };
  if (!j.access_token || !j.refresh_token) return false;
  try {
    j.user = await cloudReq("/auth/v1/user", null, j.access_token, "GET");
  } catch (e) {
    toast(e.message, 6000);
    return false;
  }
  CLOUD = null;
  cloudSession(j);
  if (p.get("type") === "recovery") {
    KONTO.mode = "newpw";
    V.view = "konto";
    render();
    return true;
  }
  toast(
    oauth === "link"
      ? "Google verknüpft ✓"
      : oauth
        ? "Mit Google eingeloggt ✓"
        : "E-Mail bestätigt ✓ Du bist eingeloggt.",
  );
  await kontoAfterAuth(CLOUD.nick);
  return true;
}

/* ---- Bildschirm ---- */
function kontoRedraw() {
  if (V.view === "konto" && !typingNow()) renderKonto();
}
function pwField(id, label, ac, enter) {
  return `<label class="fl" style="display:block;margin-top:10px">${label}</label>
    <div class="exrow"><input class="fi" id="${id}" type="${KONTO.showPw ? "text" : "password"}" autocomplete="${ac}" ${enter ? `onkeydown="if(event.key==='Enter')${enter}"` : ""}>
    <button class="btn ghost sm" type="button" title="Passwort zeigen" onclick="KONTO.showPw=!KONTO.showPw;kontoKeep(renderKonto)">${KONTO.showPw ? "🙈" : "👁️"}</button></div>`;
}
/* Getippte Werte beim Neuzeichnen behalten */
function kontoKeep(fn) {
  const keep = {};
  ["kE", "kP", "kP2", "kN"].forEach((id) => {
    const el = $(id);
    if (el) keep[id] = el.value;
  });
  fn();
  Object.keys(keep).forEach((id) => {
    const el = $(id);
    if (el) el.value = keep[id];
  });
}
function kontoMode(m) {
  KONTO.mode = m;
  kontoKeep(renderKonto);
}
function kontoFormHTML() {
  const m = KONTO.mode,
    b = KONTO.busy;
  const tabs = `<div class="segtabs"><button class="${m === "login" ? "on" : ""}" onclick="kontoMode('login')">Einloggen</button><button class="${m === "register" ? "on" : ""}" onclick="kontoMode('register')">Konto erstellen</button></div>`;
  if (m === "newpw")
    return `<b>🔑 Neues Passwort festlegen</b>
    ${pwField("kP", "Neues Passwort (mind. 8 Zeichen)", "new-password", "")}
    ${pwField("kP2", "Passwort wiederholen", "new-password", "kontoNewPw()")}
    <button class="btn g" style="width:100%;margin-top:14px" ${b ? "disabled" : ""} onclick="kontoNewPw()">${b ? "⏳ …" : "Passwort speichern"}</button>
    ${CLOUD ? `<p class="center small"><a onclick="kontoMode('login')">Abbrechen</a></p>` : ""}`;
  if (m === "forgot")
    return `<b>🔑 Passwort vergessen?</b>
    <p class="small mut">Gib deine E-Mail ein – du bekommst einen Link, mit dem du ein neues Passwort festlegst.</p>
    <label class="fl">E-Mail</label><input class="fi" id="kE" type="email" autocomplete="email" onkeydown="if(event.key==='Enter')kontoForgot()">
    <button class="btn g" style="width:100%;margin-top:14px" ${b ? "disabled" : ""} onclick="kontoForgot()">${b ? "⏳ …" : "Link schicken"}</button>
    <p class="center small"><a onclick="kontoMode('login')">← Zurück zum Einloggen</a></p>`;
  const reg = m === "register";
  const google = KONTO.google
    ? `<button class="btn ghost" style="width:100%;margin-top:12px" ${b ? "disabled" : ""} onclick="kontoGoogle()">${GOOGLE_G}${reg ? "Mit Google registrieren" : "Mit Google anmelden"}</button>
    <p class="center small mut" style="margin:10px 0 0">oder mit E-Mail</p>`
    : "";
  return `${tabs}${google}
    <label class="fl">E-Mail</label><input class="fi" id="kE" type="email" autocomplete="email">
    ${pwField("kP", reg ? "Passwort (mind. 8 Zeichen)" : "Passwort", reg ? "new-password" : "current-password", reg ? "" : "kontoLogin()")}
    ${reg ? `<label class="fl" style="display:block;margin-top:10px">Spitzname (sehen deine Freunde)</label><input class="fi" id="kN" maxlength="20" autocomplete="nickname" placeholder="z. B. MaxIT_23" value="" onkeydown="if(event.key==='Enter')kontoRegister()">` : ""}
    <button class="btn g" style="width:100%;margin-top:14px" ${b ? "disabled" : ""} onclick="${reg ? "kontoRegister()" : "kontoLogin()"}">${b ? "⏳ …" : reg ? "Konto erstellen" : "Einloggen"}</button>
    ${reg ? "" : `<p class="center small"><a onclick="kontoMode('forgot')">Passwort vergessen?</a></p>`}`;
}
function kontoLocalHTML() {
  return `<div class="card" style="margin-top:14px"><b>💾 Auf diesem Gerät</b>
    <p class="small mut">Dein Lernstand wird nach jeder Aufgabe automatisch in diesem Browser gespeichert. Für ein anderes Gerät oder zur Sicherheit: Backup-Datei herunterladen und dort wieder einlesen.</p>
    <div class="quickbtns"><button class="btn ghost sm" onclick="exportData()">⬇️ Backup herunterladen</button>
    <button class="btn ghost sm" onclick="$('impFileK').click()">⬆️ Backup einlesen</button></div>
    <input type="file" id="impFileK" accept=".json" style="display:none" onchange="importData(this)"></div>`;
}
function kontoCloudHTML() {
  const ok = syncReady();
  const last = KONTO.at
    ? new Date(KONTO.at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : "";
  const status = !SYNC.on
    ? "aus – nur auf diesem Gerät gespeichert"
    : KONTO.err
      ? "⚠️ " + esc(KONTO.err)
      : last
        ? "✓ gesichert um " + last + " Uhr"
        : SYNC.base
          ? "✓ gesichert"
          : "wird gleich gesichert …";
  return `<div class="card" style="margin-top:14px"><b>☁️ Cloud-Speicher</b>
    <p class="small mut">Fortschritt, XP, Streak, Notizen, Termine, eigene Fächer und Charaktere werden automatisch in deinem Konto gesichert – einloggen auf einem anderen Gerät, und alles ist da. Nur du kannst diese Daten sehen. API-Key, Untis-Link und Vault-Pfad bleiben auf dem Gerät.</p>
    <button class="choice ${SYNC.on ? "sel" : ""}" onclick="kontoSyncToggle(${!SYNC.on})">${SYNC.on ? "✅" : "⬜"} Lernstand automatisch in der Cloud sichern</button>
    <p class="small ${KONTO.err ? "" : "mut"}" style="${KONTO.err ? "color:var(--red)" : ""}">Status: ${status}</p>
    ${
      ok
        ? `<div class="quickbtns"><button class="btn ghost sm" onclick="statePush(true).then(ok=>ok&&toast('Gesichert ✓'))">⬆️ Jetzt sichern</button>
      <button class="btn ghost sm" onclick="statePull(true)">⬇️ Von der Cloud laden</button></div>`
        : ""
    }</div>`;
}
function renderKonto() {
  const cfg = cloudCfg();
  const fritz =
    window.faceSVG && castById("fritz")
      ? `<div style="width:110px;margin:0 auto">${faceSVG(castById("fritz"))}</div>`
      : `<span class="bigemoji">🐧</span>`;
  let body = "";
  if (!cfg) {
    body = `<div class="card" style="margin-top:14px"><b>🔧 Konten sind noch nicht eingerichtet</b>
      <p class="small mut">Für Einloggen und Cloud-Speicher braucht Lernhub einen kostenlosen Supabase-Speicher. Den richtet einmal die Person ein, die Lernhub veröffentlicht (README → „Konto &amp; Bestenliste“). Bis dahin bleibt alles auf diesem Gerät.</p></div>
      ${kontoLocalHTML()}`;
  } else if (!CLOUD || KONTO.mode === "newpw") {
    body = `${CLOUD || !window.inviteBannerHTML ? "" : inviteBannerHTML()}<div class="card" style="margin-top:14px">${kontoFormHTML()}</div>
      ${
        KONTO.welcome
          ? `<div class="center" style="margin-top:14px"><button class="btn ghost" onclick="kontoSkip()">Ohne Konto weiter</button>
      <p class="small mut">Dann bleibt alles nur auf diesem Gerät. Einloggen kannst du später jederzeit unter 👤 Konto.</p></div>`
          : kontoLocalHTML()
      }`;
  } else {
    if (SYNC.on && Date.now() - KONTO.pulledAt > 120000) setTimeout(() => statePull(false), 0);
    body = `<div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span style="font-size:34px">👤</span>
        <div style="flex:1;min-width:180px"><b>${esc(CLOUD.nick || "Noch kein Spitzname")}</b><br><small class="mut">${esc(CLOUD.email)}</small></div>
        <button class="btn ghost sm" onclick="kontoLogout(false)">Abmelden</button></div>
      ${
        CLOUD.nick
          ? ""
          : `<div class="card" style="margin-top:14px"><b>Wähle deinen Spitznamen</b>
        <p class="small mut">Unter diesem Namen finden dich deine Freunde.</p>
        <div class="exrow"><input class="fi" id="cN" maxlength="20" placeholder="z. B. MaxIT_23"><button class="btn g" onclick="cloudSetNick()">Speichern</button></div></div>`
      }
      ${kontoCloudHTML()}
      ${kontoIdsHTML()}
      ${kontoLocalHTML()}
      <div class="card" style="margin-top:14px"><b>🔐 Sicherheit</b>
        <div class="quickbtns"><button class="btn ghost sm" onclick="KONTO.mode='newpw';renderKonto()">🔑 Passwort ändern</button>
        <button class="btn ghost sm" onclick="kontoLogout(true)">🧹 Abmelden &amp; Gerät leeren</button>
        <button class="btn r sm" onclick="cloudDelete()">Konto löschen</button></div>
        <p class="small mut">„Gerät leeren“ ist für Schul- oder Leih-PCs: Danach ist hier nichts mehr gespeichert, in der Cloud bleibt alles.</p></div>`;
  }
  const title = !cfg
    ? "Dein Speicher"
    : KONTO.mode === "newpw"
      ? "Neues Passwort"
      : CLOUD
        ? "Dein Konto"
        : KONTO.welcome
          ? "Willkommen bei Lernhub"
          : "Einloggen";
  $("app").innerHTML = `<div class="obwrap">${KONTO.welcome || !CLOUD ? fritz : ""}
    <div class="center"><h1 class="h1">${title}</h1>
    ${!CLOUD && cfg ? `<p class="mut">Mit Konto ist dein Lernstand gesichert – auf jedem Gerät, auch wenn der Browser-Speicher gelöscht wird.</p>` : ""}</div>
    ${body}</div>`;
}

function kontoInit() {
  syncLoad();
  if (!cloudCfg()) return;
  kontoGoogleCheck();
  kontoFromLink().then((handled) => {
    if (handled) return;
    if (CLOUD && SYNC.on) setTimeout(() => statePull(false), 1500);
  });
  document.addEventListener("visibilitychange", () => {
    if (!syncReady()) return;
    if (document.visibilityState === "hidden") statePush();
    else if (Date.now() - KONTO.pulledAt > 120000) statePull(false);
  });
}
