/* Lernhub Cloud: Konto, Freunde, Bestenliste über Supabase (REST/GoTrue per fetch, kein SDK).
   An Freunde gehen nur Zahlen (XP, Streak, Lektionen …). Der private Cloud-Speicher (js/konto.js) sieht nur der Besitzer. */
const CLOUD_KEY = "lernhub_cloud_v1";
let CLOUD = null;
let BOARD = { rows: null, friends: [], tab: "week", mode: "login", loading: false, at: 0, err: "" };
let CLOUD_T = null,
  CLOUD_LAST = "";
const NICK_RE = /^[A-Za-z0-9_.-]{3,20}$/;
/* Angezeigter Name kommt immer aus dem eingeloggten Konto – ohne Login „Gast“ */
function accountName() {
  return CLOUD ? CLOUD.nick || String(CLOUD.email || "").split("@")[0] || "" : "";
}
function userName() {
  return accountName() || "Gast";
}
function sideUserHTML() {
  const n = accountName();
  return n
    ? `<span class="suav">${esc(n.slice(0, 1).toUpperCase())}</span><span class="sutx"><b>${esc(n)}</b><small>Angemeldet · Konto</small></span>`
    : `<span class="suav guest">👤</span><span class="sutx"><b>Gast</b><small>Einloggen / Registrieren</small></span>`;
}
function renderSideUser() {
  const el = document.getElementById("sideUser");
  if (el)
    el.innerHTML = `<button class="sideuser" onclick="go('konto')" title="Konto">${sideUserHTML()}</button>${window.inviteOpen ? `<button class="sideinvite" onclick="inviteOpen()">📣 Freunde einladen</button>` : ""}<button class="sidecoffee" onclick="coffeeOpen()">Buy me a coffee</button>`;
}

// Buy-Me-a-Coffee-Link hier eintragen, z. B. "https://buymeacoffee.com/NAME" (leer = „kommt bald“)
const COFFEE_URL = "";
function coffeeOpen() {
  if (COFFEE_URL) openUrl(COFFEE_URL);
  else toast("☕ Kommt bald – danke, dass du Lernhub unterstützen willst!", 3500);
}

function cloudCfg() {
  const c = window.LERNHUB_CLOUD || {};
  return typeof c.url === "string" &&
    /^https:\/\/[^\s"'<>]+$/.test(c.url) &&
    typeof c.anonKey === "string" &&
    c.anonKey.length > 20
    ? { url: c.url.replace(/\/+$/, ""), key: c.anonKey }
    : null;
}
function cloudSave() {
  try {
    CLOUD
      ? localStorage.setItem(CLOUD_KEY, JSON.stringify(CLOUD))
      : localStorage.removeItem(CLOUD_KEY);
  } catch (e) {}
}
function cloudLoad() {
  try {
    const o = JSON.parse(localStorage.getItem(CLOUD_KEY) || "null");
    if (o && typeof o.access === "string" && typeof o.refresh === "string")
      CLOUD = {
        access: o.access,
        refresh: o.refresh,
        exp: +o.exp || 0,
        email: String(o.email || ""),
        nick: NICK_RE.test(o.nick || "") ? o.nick : "",
      };
  } catch (e) {
    CLOUD = null;
  }
}
function cloudSession(j) {
  const meta = (j.user && j.user.user_metadata) || {};
  CLOUD = {
    access: j.access_token,
    refresh: j.refresh_token,
    exp: +j.expires_at || Math.floor(Date.now() / 1000) + (+j.expires_in || 3600),
    email: (j.user && j.user.email) || (CLOUD && CLOUD.email) || "",
    nick: (CLOUD && CLOUD.nick) || (NICK_RE.test(meta.nickname || "") ? meta.nickname : ""),
  };
  cloudSave();
}
function cloudErr(j, status) {
  const m = String(
    (j && (j.message || j.msg || j.error_description || j.error)) || "HTTP " + status,
  );
  const map = {
    nickname_taken: "Dieser Spitzname ist schon vergeben.",
    bad_nickname: "Spitzname: 3–20 Zeichen, nur Buchstaben, Zahlen, _ . -",
    "Invalid login credentials": "E-Mail oder Passwort falsch.",
    "Email not confirmed": "Bitte zuerst den Link in der Bestätigungs-Mail anklicken.",
    "User already registered": "Mit dieser E-Mail gibt es schon ein Konto – bitte einloggen.",
    no_profile: "Bitte zuerst einen Spitznamen wählen.",
    already_in_class: "Du bist schon in einer Klasse – verlasse sie zuerst.",
    bad_class_name: "Klassenname: 2–40 Zeichen",
    bad_subject: "Unbekanntes Fach",
    bad_endpoint: "Dieser Browser nutzt einen unbekannten Push-Dienst.",
    bad_time: "Ungültige Uhrzeit",
    limit: "Limit erreicht – bitte erst etwas aufräumen.",
    busy: "Gerade sehr viele Anfragen – bitte später nochmal versuchen.",
    bad_subject_name: "Fachname: 2–40 Zeichen, nur Buchstaben, Zahlen und . , & ( ) / + -",
    bad_report: "Diese Aufgabe kann nicht gemeldet werden.",
    bad_key: "Bitte zuerst Schule und Klassenstufe wählen.",
    "Could not find the function":
      "Server noch nicht aktualisiert: supabase/schema.sql bitte erneut ausführen.",
  };
  for (const k in map) if (m.includes(k)) return map[k];
  return m.slice(0, 200);
}
async function cloudReq(path, body, token, method) {
  const cfg = cloudCfg();
  if (!cfg) throw new Error("Konto ist nicht eingerichtet");
  const h = { apikey: cfg.key, "Content-Type": "application/json" };
  if (token) h.Authorization = "Bearer " + token;
  const m = method || "POST";
  const r = await fetch(cfg.url + path, {
    method: m,
    headers: h,
    body: m === "GET" ? undefined : JSON.stringify(body || {}),
  });
  const txt = await r.text();
  let j = null;
  try {
    j = txt ? JSON.parse(txt) : null;
  } catch (e) {}
  if (!r.ok) {
    const e = new Error(cloudErr(j, r.status));
    e.status = r.status;
    throw e;
  }
  return j;
}
async function cloudToken() {
  if (!CLOUD) throw new Error("Nicht eingeloggt");
  if (Date.now() / 1000 > CLOUD.exp - 60) {
    try {
      cloudSession(
        await cloudReq("/auth/v1/token?grant_type=refresh_token", { refresh_token: CLOUD.refresh }),
      );
    } catch (e) {
      if (e.status === 400 || e.status === 401) {
        CLOUD = null;
        cloudSave();
      }
      throw e;
    }
  }
  return CLOUD.access;
}
async function rpc(name, args) {
  return cloudReq("/rest/v1/rpc/" + name, args || {}, await cloudToken());
}

/* ---- Sync: nach dem Speichern gebündelt, nur wenn sich Zahlen geändert haben ---- */
function cloudPayload() {
  return {
    p_xp: S.xp,
    p_week_xp: weekXPNow(),
    p_week_start: weekStartStr(),
    p_streak: streakNow(),
    p_best: S.streak.best,
    p_lessons: S.stats.lessons,
    p_answered: S.stats.answered,
    p_correct: S.stats.correct,
    p_hints: S.stats.hints || 0,
    p_last_day: S.streak.last || null,
    p_goal_day: dayGoalPct() >= 100 ? today() : null,
  };
}
function cloudPushSoon() {
  if (!CLOUD || !CLOUD.nick || !cloudCfg()) return;
  clearTimeout(CLOUD_T);
  CLOUD_T = setTimeout(cloudPush, 5000);
}
async function cloudPush() {
  if (!CLOUD || !CLOUD.nick) return;
  const p = cloudPayload(),
    k = JSON.stringify(p);
  if (k === CLOUD_LAST) return;
  try {
    await rpc("push_stats", p);
    CLOUD_LAST = k;
  } catch (e) {
    console.warn("Lernhub-Sync:", e.message);
  }
}
async function cloudAfterLogin(nickWanted) {
  const rows = await rpc("my_profile");
  const row = Array.isArray(rows) && rows[0];
  if (row) {
    CLOUD.nick = row.nickname;
    S.share.errors = !!row.share_errors;
    S.share.hints = !!row.share_hints;
    save();
  } else {
    CLOUD.nick = "";
    if (NICK_RE.test(nickWanted || "")) {
      try {
        await rpc("set_profile", {
          p_nick: nickWanted,
          p_share_errors: S.share.errors,
          p_share_hints: S.share.hints,
        });
        CLOUD.nick = nickWanted;
      } catch (e) {
        toast(e.message, 5000);
      }
    }
  }
  cloudSave();
  if (CLOUD.nick) {
    CLOUD_LAST = "";
    await cloudPush();
    await boardLoad();
    if (window.inviteApply) inviteApply();
    if (window.chatLoadOverview) chatLoadOverview();
  }
}

/* ---- Konto-Aktionen (Einloggen/Registrieren: js/konto.js) ---- */
async function cloudSetNick() {
  const nick = (($("cN") || {}).value || "").trim();
  if (!NICK_RE.test(nick)) return toast("Spitzname: 3–20 Zeichen, nur Buchstaben, Zahlen, _ . -");
  try {
    await rpc("set_profile", {
      p_nick: nick,
      p_share_errors: S.share.errors,
      p_share_hints: S.share.hints,
    });
    CLOUD.nick = nick;
    cloudSave();
    CLOUD_LAST = "";
    await cloudPush();
    await boardLoad();
    toast("Spitzname gespeichert ✓");
  } catch (e) {
    toast(e.message, 5000);
  }
  render();
}
async function cloudLogout() {
  if (CLOUD) {
    const t = CLOUD.access;
    cloudReq("/auth/v1/logout", {}, t).catch(() => {});
  }
  CLOUD = null;
  cloudSave();
  if (window.syncReset) syncReset();
  BOARD.rows = null;
  BOARD.friends = [];
  socReset();
  if (window.chatReset) chatReset();
  render();
  toast("Ausgeloggt");
}
async function cloudDelete() {
  if (
    !confirm(
      "Konto wirklich löschen? Spitzname, Zahlen, Freundschaften und der Cloud-Speicher werden sofort entfernt. Dein lokaler Lernstand bleibt.",
    )
  )
    return;
  try {
    await rpc("delete_account");
    CLOUD = null;
    cloudSave();
    if (window.syncReset) syncReset();
    BOARD.rows = null;
    BOARD.friends = [];
    socReset();
    if (window.chatReset) chatReset();
    render();
    toast("Konto gelöscht ✓");
  } catch (e) {
    toast(e.message, 5000);
  }
  render();
}
function shareSet(key, val) {
  S.share[key] = !!val;
  save();
  if (CLOUD && CLOUD.nick)
    rpc("set_profile", {
      p_nick: CLOUD.nick,
      p_share_errors: S.share.errors,
      p_share_hints: S.share.hints,
    })
      .then(boardLoad)
      .catch((e) => toast(e.message));
  renderBoard();
}
async function friendAdd() {
  const n = (($("frNick") || {}).value || "").trim();
  if (!NICK_RE.test(n)) return toast("Spitzname deines Freundes eingeben");
  try {
    const r = await rpc("friend_request", { p_nick: n });
    toast(
      {
        sent: "Anfrage gesendet ✓ – sobald " + n + " bestätigt, seht ihr euch.",
        accepted: "Ihr seid jetzt befreundet 🎉",
        exists: "Ihr seid schon befreundet oder die Anfrage läuft",
        not_found: "Spitzname nicht gefunden",
        self: "Das bist du selbst 😉",
        limit: "Zu viele offene Anfragen",
      }[r] || String(r),
      4000,
    );
    boardLoad();
  } catch (e) {
    toast(e.message, 5000);
  }
}
async function friendRespond(id, accept) {
  if (!accept && !confirm("Freundschaft bzw. Anfrage entfernen?")) return;
  try {
    await rpc("friend_respond", { p_id: id, p_accept: !!accept });
    boardLoad();
  } catch (e) {
    toast(e.message, 5000);
  }
}

/* ---- Bestenliste ---- */
async function boardLoad() {
  if (!CLOUD || !CLOUD.nick) return;
  BOARD.loading = true;
  BOARD.err = "";
  try {
    const [rows, fr] = await Promise.all([rpc("leaderboard"), rpc("friends_list")]);
    BOARD.rows = Array.isArray(rows) ? rows : [];
    BOARD.friends = Array.isArray(fr) ? fr : [];
  } catch (e) {
    BOARD.err = e.message;
  }
  BOARD.at = Date.now();
  BOARD.loading = false;
  if (V.view === "board") renderBoard();
}
function boardSorted(tab) {
  const k = tab === "all" ? "xp" : tab === "streak" ? "streak" : "week_xp";
  return (BOARD.rows || [])
    .slice()
    .sort((a, b) => (b[k] || 0) - (a[k] || 0) || (b.xp || 0) - (a.xp || 0));
}
function boardRank() {
  if (!BOARD.rows || BOARD.rows.length < 2) return null;
  const s = boardSorted("week"),
    i = s.findIndex((r) => r.is_me);
  return i < 0 ? null : { pos: i + 1, of: s.length };
}
function howBoardHTML() {
  return `<details class="exsec"><summary>❓ Wie wird die Bestenliste gesendet?</summary>
    <div class="exitem">Nach dem Lernen schickt Lernhub automatisch ein paar Zahlen (ca. 200 Byte – weniger als eine WhatsApp-Nachricht): XP, Wochen-XP, Streak, Lektionen, Aufgaben, Fehler, Hinweise. Du musst nichts selbst senden.</div>
    <div class="exitem">Nie an Freunde: deine Antworten, Notizen, Stundenplan oder Charaktere. API-Keys und Untis-Link verlassen nie dein Gerät. Den privaten Cloud-Speicher (👤 Konto) siehst nur du.</div>
    <div class="exitem">Sichtbar nur für dich und <b>bestätigte Freunde</b>: Spitzname eingeben → Freund bestätigt → ihr seht euch gegenseitig. Fehler und Hinweise nur, wenn du sie unten freigibst.</div>
    <div class="exitem">Konto löschen geht jederzeit mit einem Klick – alles ist dann sofort weg.</div></details>`;
}
function renderBoard() {
  const cfg = cloudCfg();
  if (cfg && CLOUD && CLOUD.nick && !BOARD.loading && Date.now() - BOARD.at > 60000) boardLoad();
  const head = `<div class="hero" style="background:linear-gradient(135deg,#f59e0b,#b45309)"><h1>🏆 Bestenliste</h1><p>Wer hat am meisten gelernt? Du gegen deine Klassenkameraden – nur mit Freunden, die du bestätigst.</p><span class="big">🥇</span></div>`;
  let body = "";
  if (!cfg) {
    body = `<div class="card" style="margin-top:14px"><b>🔧 Noch nicht eingerichtet</b>
      <p class="small mut">Für die Bestenliste braucht die Klasse einen gemeinsamen, kostenlosen Speicher (Supabase). Das richtet einmal die Person ein, die Lernhub für die Klasse veröffentlicht – Anleitung in der README unter „Konto &amp; Bestenliste“. Danach können sich alle mit E-Mail und Spitzname anmelden.</p></div>
      <h2 class="h2">Deine Zahlen</h2>${rowHTML({ nickname: userName(), is_me: true, xp: S.xp, week_xp: weekXPNow(), streak: streakNow(), lessons: S.stats.lessons, answered: S.stats.answered, wrong: S.stats.answered - S.stats.correct, hints: S.stats.hints || 0 }, 1, "week")}`;
  } else if (!CLOUD) {
    body = `<div class="card center" style="margin-top:14px"><b>👤 Melde dich an, um mitzuspielen</b>
      <p class="small mut">Mit Konto siehst du deine Freunde in der Bestenliste, und dein Lernstand wird in der Cloud gesichert.</p>
      <button class="btn g" onclick="go('konto')">Einloggen / Konto erstellen</button>
      <p class="small mut">Freiwillig. Ohne Konto funktioniert Lernhub komplett weiter – nur ohne Bestenliste.</p></div>`;
  } else if (!CLOUD.nick) {
    body = `<div class="card" style="margin-top:14px"><b>Wähle deinen Spitznamen</b>
      <p class="small mut">Unter diesem Namen finden dich deine Freunde.</p>
      <input class="fi" id="cN" maxlength="20" placeholder="z. B. MaxIT_23"><button class="btn g" style="margin-top:10px" onclick="cloudSetNick()">Speichern</button>
      <button class="btn ghost sm" style="margin-top:10px" onclick="cloudLogout()">Ausloggen</button></div>`;
  } else if (SOC.sec !== "friends") {
    body = socTabs() + socBody();
  } else {
    const tab = BOARD.tab,
      rows = boardSorted(tab);
    const fr = BOARD.friends || [],
      inc = fr.filter((f) => f.status === "pending" && f.incoming),
      out = fr.filter((f) => f.status === "pending" && !f.incoming),
      ok = fr.filter((f) => f.status === "accepted");
    body = `${socTabs()}
    <div class="segtabs">
      ${[
        ["week", "📈 Diese Woche"],
        ["all", "⚡ Gesamt-XP"],
        ["streak", "🔥 Streak"],
      ]
        .map(
          ([k, l]) =>
            `<button class="${tab === k ? "on" : ""}" onclick="BOARD.tab='${k}';renderBoard()">${l}</button>`,
        )
        .join("")}
    </div>
    ${BOARD.err ? `<p class="small" style="color:var(--red)">⚠️ ${esc(BOARD.err)}</p>` : ""}
    ${BOARD.rows === null ? '<p class="mut center">⏳ Lädt …</p>' : rows.map((r, i) => rowHTML(r, i + 1, tab)).join("")}
    ${BOARD.rows && rows.length < 2 ? '<p class="small mut center">Noch allein hier – füge unten Klassenkameraden hinzu! 👇</p>' : ""}
    ${inc.length ? `<h2 class="h2">📨 Anfragen an dich</h2>${inc.map((f) => `<div class="rankrow"><span class="rk">👋</span><b>${esc(f.nickname)}</b><span class="rv"><button class="btn g sm" onclick="friendRespond(${+f.id},true)">Annehmen</button> <button class="btn ghost sm" onclick="friendRespond(${+f.id},false)">Ablehnen</button></span></div>`).join("")}` : ""}
    <div class="card" style="margin-top:14px"><b>➕ Freund hinzufügen</b>
      <div class="exrow"><input class="fi" id="frNick" maxlength="20" placeholder="Spitzname" onkeydown="if(event.key==='Enter')friendAdd()"><button class="btn" onclick="friendAdd()">Anfragen</button></div>
      <p class="small mut">Dein Spitzname: <b>${esc(CLOUD.nick)}</b> – gib ihn deinen Klassenkameraden. Oder schick einfach deinen Link:</p>
      <button class="btn g sm" onclick="inviteOpen()">📣 Einladungslink teilen</button>
      ${out.map((f) => `<div class="trow"><span>⏳</span><span style="flex:1">${esc(f.nickname)} <small class="mut">wartet auf Bestätigung</small></span><button class="xbtn" onclick="friendRespond(${+f.id},false)">✕</button></div>`).join("")}
      ${ok.map((f) => `<div class="trow"><span>🤝</span><span style="flex:1">${esc(f.nickname)}</span><button class="xbtn" title="Entfernen" onclick="friendRespond(${+f.id},false)">✕</button></div>`).join("")}
    </div>
    <div class="card" style="margin-top:14px"><b>🔒 Was deine Freunde sehen</b>
      <p class="small mut">XP, Streak, Lektionen und Aufgaben sind für Freunde sichtbar. Diese beiden nur mit deiner Erlaubnis:</p>
      <button class="choice ${S.share.errors ? "sel" : ""}" onclick="shareSet('errors',${!S.share.errors})">${S.share.errors ? "✅" : "⬜"} ❌ Anzahl Fehler zeigen</button>
      <button class="choice ${S.share.hints ? "sel" : ""}" onclick="shareSet('hints',${!S.share.hints})">${S.share.hints ? "✅" : "⬜"} 💡 Anzahl Hinweise zeigen</button>
      <div class="quickbtns"><button class="btn ghost sm" onclick="BOARD.at=0;boardLoad()">🔄 Aktualisieren</button><button class="btn ghost sm" onclick="cloudLogout()">Ausloggen</button><button class="btn r sm" onclick="cloudDelete()">Konto löschen</button></div>
      <p class="small mut">Eingeloggt als ${esc(CLOUD.email)}</p>
    </div>`;
  }
  $("app").innerHTML = head + body + `<div style="margin-top:14px">${howBoardHTML()}</div>`;
}
function rowHTML(r, pos, tab) {
  const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : pos;
  const val =
    tab === "all"
      ? (r.xp || 0) + " XP"
      : tab === "streak"
        ? (r.streak || 0) + " 🔥"
        : (r.week_xp || 0) + " XP";
  const wrong = r.wrong === null || r.wrong === undefined ? "🔒" : r.wrong;
  const hints = r.hints === null || r.hints === undefined ? "🔒" : r.hints;
  return `<div class="rankrow ${r.is_me ? "me" : ""}"><span class="rk">${medal}</span><b>${esc(r.nickname)}${r.is_me ? " (du)" : ""}</b><span class="rv">${val}</span>
    <span class="rs">🔥 ${r.streak || 0} · 📚 ${r.lessons || 0} Lektionen · ✅ ${r.answered || 0} Aufgaben · ❌ ${wrong} Fehler · 💡 ${hints} Hinweise</span></div>`;
}
function cloudInit() {
  cloudLoad();
  if (CLOUD && cloudCfg())
    setTimeout(() => {
      cloudPush();
      boardLoad();
    }, 2500);
}
