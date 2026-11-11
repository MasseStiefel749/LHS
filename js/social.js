/* Lernhub Social: Wochenligen mit Auf- und Abstieg, Klassen-Challenge per Klassencode, Lern-Buddy-Duelle.
   Alles läuft über die Supabase-Funktionen aus supabase/schema.sql (rpc aus cloud.js). Gesendet werden nur
   Spitzname-bezogene Zahlen und Duell-Ergebnisse – nie Antworten oder Notizen. */

const TIERS = [
  ["Bronze", "🥉", "#cd7f32"],
  ["Silber", "🥈", "#9ca3af"],
  ["Gold", "🥇", "#f59e0b"],
  ["Saphir", "💙", "#3b82f6"],
  ["Rubin", "❤️", "#e11d48"],
  ["Smaragd", "💚", "#10b981"],
  ["Amethyst", "💜", "#8b5cf6"],
  ["Perle", "🤍", "#f9a8d4"],
  ["Obsidian", "🖤", "#4b5563"],
  ["Diamant", "💎", "#22d3ee"],
];
let SOC = {
  sec: "friends",
  league: null,
  cls: undefined,
  ranking: null,
  duels: null,
  at: {},
  busy: {},
  err: "",
};
const CLASS_CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;

function socTabs() {
  return `<div class="segtabs" style="margin-top:14px">${[
    ["friends", "🤝 Freunde"],
    ["league", "🏅 Liga"],
    ["class", "🏫 Klasse"],
    ["duels", "⚔️ Duelle"],
  ]
    .map(
      ([k, l]) =>
        `<button class="${SOC.sec === k ? "on" : ""}" onclick="socSet('${k}')">${l}</button>`,
    )
    .join("")}</div>`;
}
function socSet(k) {
  SOC.sec = k;
  SOC.err = "";
  renderBoard();
}
function socReset() {
  SOC = {
    sec: "friends",
    league: null,
    cls: undefined,
    ranking: null,
    duels: null,
    at: {},
    busy: {},
    err: "",
  };
  DUEL = null;
}
async function socLoad(k, force) {
  if (!CLOUD || !CLOUD.nick || SOC.busy[k]) return;
  if (!force && Date.now() - (SOC.at[k] || 0) < 60000) return;
  SOC.busy[k] = true;
  SOC.err = "";
  try {
    if (k === "league") {
      SOC.league = await rpc("league_view");
      const best = Math.max(0, Math.min(9, +(SOC.league && SOC.league.best) || 0));
      if (best > (S.stats.leagueBest || 0)) {
        S.stats.leagueBest = best;
        save();
      }
    } else if (k === "class") {
      const [info, rank] = await Promise.all([rpc("class_info"), rpc("class_ranking")]);
      SOC.cls = info || null;
      SOC.ranking = Array.isArray(rank) ? rank : [];
    } else if (k === "duels") {
      const d = await rpc("duel_list");
      SOC.duels = Array.isArray(d) ? d : [];
      const wins = SOC.duels.filter((x) => duelOutcome(x) === "win").length;
      if (wins > (S.stats.duelWins || 0)) {
        S.stats.duelWins = wins;
        save();
      }
    }
  } catch (e) {
    SOC.err = e.message;
  }
  SOC.at[k] = Date.now();
  SOC.busy[k] = false;
  if (V.view === "board" && SOC.sec === k) renderBoard();
}
function socBody() {
  const k = SOC.sec;
  if (Date.now() - (SOC.at[k] || 0) > 60000) setTimeout(() => socLoad(k), 0);
  const err = SOC.err ? `<p class="small" style="color:var(--red)">⚠️ ${esc(SOC.err)}</p>` : "";
  const html = k === "league" ? leagueHTML() : k === "class" ? classHTML() : duelsHTML();
  return (
    err +
    html +
    `<div class="quickbtns"><button class="btn ghost sm" onclick="socLoad('${k}',true)">🔄 Aktualisieren</button></div>`
  );
}
const SOC_LOADING = '<p class="mut center">⏳ Lädt …</p>';
function socFriendNames() {
  return new Set((BOARD.friends || []).map((f) => String(f.nickname).toLowerCase()));
}
async function socFriend(nick) {
  try {
    const r = await rpc("friend_request", { p_nick: nick });
    toast(
      {
        sent: "Anfrage an " + nick + " gesendet ✓",
        accepted: "Ihr seid jetzt befreundet 🎉",
        exists: "Schon befreundet oder angefragt",
        not_found: "Nicht gefunden",
      }[r] || String(r),
      3500,
    );
    boardLoad();
  } catch (e) {
    toast(e.message, 5000);
  }
}

/* ===================== 🏅 Wochenligen ===================== */
function leagueEndsIn() {
  const now = new Date(),
    n = new Date(now);
  n.setHours(24, 0, 0, 0);
  while (n.getDay() !== 1) n.setDate(n.getDate() + 1);
  const ms = n - now,
    d = Math.floor(ms / 864e5),
    h = Math.floor((ms % 864e5) / 36e5),
    m = Math.floor((ms % 36e5) / 6e4);
  return d ? `${d} T ${h} Std` : `${h} Std ${m} Min`;
}
function tierChip(t) {
  const T = TIERS[t] || TIERS[0];
  return `<span class="tierchip" style="--tc:${T[2]}">${T[1]} ${T[0]}</span>`;
}
async function leagueJoin(on) {
  if (
    !on &&
    !confirm(
      "Liga verlassen? Deine Stufe bleibt gespeichert, du erscheinst aber nicht mehr in der Liga-Tabelle.",
    )
  )
    return;
  try {
    await rpc("league_join", { p_on: !!on });
    toast(on ? "Willkommen in der Liga! 🏅" : "Liga verlassen");
  } catch (e) {
    toast(e.message, 5000);
  }
  socLoad("league", true);
}
function leagueHTML() {
  const L = SOC.league;
  if (!L) return SOC.busy.league || !SOC.at.league ? SOC_LOADING : "";
  const tier = Math.max(0, Math.min(9, +L.tier || 0)),
    T = TIERS[tier];
  const ladder = `<div class="tierladder">${TIERS.map((x, i) => `<span class="${i === tier ? "on" : ""} ${i <= (+L.best || 0) ? "got" : ""}" title="${x[0]}" style="--tc:${x[2]}">${x[1]}</span>`).join("")}</div>`;
  if (!L.on)
    return `<div class="card" style="margin-top:6px"><b>🏅 Wochenligen – wie bei Duolingo</b>
    <p class="small mut">Jede Woche trittst du in deiner Liga gegen andere Lernhub-Nutzer an. Wer viele XP sammelt, steigt auf (Bronze → Silber → … → 💎 Diamant). Wer gar nicht lernt, steigt ab.</p>
    ${ladder}
    <div class="exitem small">🔒 Sichtbar für andere in deiner Liga: nur dein <b>Spitzname</b>, deine <b>Wochen-XP</b> und deine <b>Streak</b>. Austreten geht jederzeit.</div>
    <button class="btn g" style="margin-top:10px" onclick="leagueJoin(true)">Mitmachen</button></div>`;
  const rows = Array.isArray(L.rows) ? L.rows : [];
  const active = rows.filter((r) => (+r.week_xp || 0) > 0).length;
  const upN = tier < 9 ? Math.max(1, Math.ceil(active * 0.3)) : 0;
  const downFrom = tier > 0 && active >= 5 ? active - Math.floor(active * 0.2) : Infinity;
  const zone = (r, rk) => {
    const x = +r.week_xp || 0;
    if (tier < 9 && x >= 50 && rk <= upN) return "up";
    if (tier > 0 && (x === 0 || rk > downFrom)) return "down";
    return "";
  };
  const meIdx = rows.findIndex((r) => r.is_me),
    me = rows[meIdx];
  let tip = "";
  if (me) {
    const z = zone(me, meIdx + 1);
    tip =
      z === "up"
        ? "⬆️ Du bist in der Aufstiegszone – halte durch!"
        : z === "down"
          ? +me.week_xp
            ? "⬇️ Abstiegsgefahr – ein paar Lektionen retten dich!"
            : "⬇️ Ohne XP steigst du ab – eine Lektion reicht schon!"
          : tier < 9
            ? (+me.week_xp || 0) < 50
              ? `Noch ${50 - (+me.week_xp || 0)} XP bis zur Aufstiegs-Chance (mind. 50 XP)`
              : "Bleib dran – die oberen 30 % steigen auf."
            : "💎 Höchste Liga – verteidige deinen Platz!";
  }
  const last = L.last && L.last.week && dayDiff(today(), L.last.week) <= 13 ? L.last : null;
  const lastTxt = last
    ? last.result === "up"
      ? `🎉 Letzte Woche Platz ${last.rank} mit ${last.xp} XP – Aufstieg in ${TIERS[Math.min(9, last.tier + 1)][0]}!`
      : last.result === "down"
        ? `😕 Letzte Woche Abstieg in ${TIERS[Math.max(0, last.tier - 1)][0]}. Diese Woche holst du's zurück!`
        : `Letzte Woche: Platz ${last.rank} mit ${last.xp} XP – Liga gehalten.`
    : "";
  return `<div class="card leaguehead" style="margin-top:6px;--tc:${T[2]}">
      <div style="display:flex;align-items:center;gap:12px"><span style="font-size:44px">${T[1]}</span>
        <div><b style="font-size:20px">${T[0]}-Liga</b><div class="small mut">⏱️ Endet in ${leagueEndsIn()} · ${rows.length} Teilnehmer</div></div></div>
      ${ladder}
      ${tip ? `<p class="small" style="margin:8px 0 0"><b>${tip}</b></p>` : ""}
      ${lastTxt ? `<p class="small mut" style="margin:6px 0 0">${lastTxt}</p>` : ""}
    </div>
    ${rows
      .map((r, i) => {
        const z = zone(r, i + 1);
        return `<div class="rankrow lgrow ${z} ${r.is_me ? "me" : ""}"><span class="rk">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span><b>${esc(r.nickname)}${r.is_me ? " (du)" : ""}</b>
      <span class="rv">${+r.week_xp || 0} XP</span><span class="rs">🔥 ${+r.streak || 0}${z === "up" ? " · ⬆️ Aufstieg" : z === "down" ? " · ⬇️ Abstieg" : ""}</span></div>`;
      })
      .join("")}
    ${rows.length < 2 ? '<p class="small mut center">Noch wenige in dieser Liga – lade Klassenkameraden ein!</p>' : ""}
    <p class="small mut">Regeln: Die oberen 30 % mit mind. 50 Wochen-XP steigen auf. Wer 0 XP hat – oder ab 5 Aktiven zu den unteren 20 % gehört –, steigt ab. Abgerechnet wird Montag 0 Uhr.</p>
    <button class="btn ghost sm" onclick="leagueJoin(false)">Liga verlassen</button>`;
}

/* ===================== 🏫 Klassen-Challenge ===================== */
async function classCreate() {
  const name = (($("clsName") || {}).value || "").trim();
  if (name.length < 2 || name.length > 40) return toast("Klassenname: 2–40 Zeichen");
  try {
    const code = await rpc("class_create", { p_name: name });
    toast("Klasse erstellt ✓ Code: " + code, 5000);
    confetti(30);
  } catch (e) {
    toast(e.message, 5000);
  }
  socLoad("class", true);
}
async function classJoin() {
  const code = (($("clsCode") || {}).value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!CLASS_CODE_RE.test(code)) return toast("Der Klassencode hat 6 Zeichen (z. B. K7QX2M)");
  try {
    const r = await rpc("class_join", { p_code: code });
    toast(
      {
        joined: "Willkommen in der Klasse! 🎉",
        already: "Du bist schon in einer Klasse – verlasse sie zuerst",
        not_found: "Code nicht gefunden – Tippfehler?",
        full: "Die Klasse ist voll (60)",
      }[r] || String(r),
      4000,
    );
    if (r === "joined") confetti(30);
  } catch (e) {
    toast(e.message, 5000);
  }
  socLoad("class", true);
}
async function classLeave() {
  if (!confirm("Klasse wirklich verlassen? (Ist sie danach leer, wird sie gelöscht.)")) return;
  try {
    await rpc("class_leave");
    toast("Klasse verlassen");
  } catch (e) {
    toast(e.message, 5000);
  }
  socLoad("class", true);
}
function classShare() {
  if (SOC.cls) inviteOpen(true);
}
function classHTML() {
  const C = SOC.cls;
  if (C === undefined) return SOC_LOADING;
  const rankList = (SOC.ranking || []).length
    ? `<h2 class="h2">🏫 Klassen-Ranking (Ø Wochen-XP)</h2>${SOC.ranking.map((r, i) => `<div class="rankrow ${r.mine ? "me" : ""}"><span class="rk">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span><b>${esc(r.name)}</b><span class="rv">Ø ${+r.avg_xp || 0} XP</span><span class="rs">👥 ${+r.members || 0} Mitglieder</span></div>`).join("")}`
    : "";
  if (!C)
    return `<div class="two" style="margin-top:6px">
      <div class="card"><b>🔑 Klasse beitreten</b><p class="small mut">Code von deiner Klasse eingeben (6 Zeichen).</p>
        <div class="exrow"><input class="fi" id="clsCode" maxlength="6" placeholder="K7QX2M" style="text-transform:uppercase;letter-spacing:3px;font-weight:800" onkeydown="if(event.key==='Enter')classJoin()"><button class="btn g" onclick="classJoin()">Beitreten</button></div></div>
      <div class="card"><b>➕ Klasse erstellen</b><p class="small mut">Du bekommst einen Code zum Teilen (z. B. in der Klassen-WhatsApp).</p>
        <div class="exrow"><input class="fi" id="clsName" maxlength="40" placeholder="z. B. E1FI A" onkeydown="if(event.key==='Enter')classCreate()"><button class="btn" onclick="classCreate()">Erstellen</button></div></div>
    </div>
    <div class="exitem small">🔒 In der Klasse sehen sich alle Mitglieder gegenseitig mit Spitzname, Wochen-XP, Streak und Lektionen. Andere Klassen sehen nur Klassenname, Mitgliederzahl und Ø-XP.</div>
    ${rankList}`;
  const pct = C.goal ? Math.min(100, Math.round((100 * (+C.week_total || 0)) / C.goal)) : 0;
  const fr = socFriendNames(),
    members = Array.isArray(C.members) ? C.members : [];
  return `<div class="card" style="margin-top:6px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:36px">🏫</span><div style="flex:1"><b style="font-size:19px">${esc(C.name)}</b><div class="small mut">👥 ${+C.count || members.length} Mitglieder</div></div>
        <div class="center"><div class="small mut">Klassencode</div><b class="classcode">${esc(C.code)}</b></div></div>
      <div class="quickbtns"><button class="btn sm" onclick="classShare()">📤 Klasse einladen</button></div>
      <h2 class="h2" style="margin-top:12px">🎯 Wochen-Challenge</h2>
      <p class="small mut" style="margin:0">Gemeinsames Ziel: ${C.goal} XP (150 pro Person) bis Sonntag</p>
      <div class="bar" style="margin-top:8px;height:14px"><i style="width:${pct}%"></i></div>
      <p class="small"><b>${+C.week_total || 0} / ${C.goal} XP</b> · ${pct >= 100 ? "🎉 Geschafft – starke Klasse!" : `noch ${Math.max(0, C.goal - (+C.week_total || 0))} XP`}</p>
    </div>
    ${members
      .map(
        (
          m,
          i,
        ) => `<div class="rankrow ${m.is_me ? "me" : ""}"><span class="rk">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span><b>${esc(m.nickname)}${m.is_me ? " (du)" : ""}</b>
      <span class="rv">${+m.week_xp || 0} XP ${!m.is_me && !fr.has(String(m.nickname).toLowerCase()) ? `<button class="btn ghost sm" title="Als Freund hinzufügen" onclick="socFriend(this.dataset.n)" data-n="${esc(m.nickname)}">➕</button>` : ""}</span>
      <span class="rs">🔥 ${+m.streak || 0} · 📚 ${+m.lessons || 0} Lektionen</span></div>`,
      )
      .join("")}
    ${rankList}
    <button class="btn ghost sm" style="margin-top:12px" onclick="classLeave()">Klasse verlassen</button>`;
}

/* ===================== ⚔️ Lern-Buddy-Duelle ===================== */
/* Beide bekommen dieselben 5 Fragen: Fach + Zufallszahl (seed) bestimmen Auswahl und Reihenfolge. */
let DUEL = null;
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(a, rnd) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function duelPool(subj) {
  const s = DATA[subj],
    out = [];
  if (!s || !Array.isArray(s.topics)) return out;
  s.topics.forEach((t) =>
    (t.mc || []).forEach((q) => {
      if (
        q &&
        typeof q.q === "string" &&
        Array.isArray(q.c) &&
        q.c.length >= 2 &&
        Number.isInteger(q.a) &&
        q.c[q.a] !== undefined
      )
        out.push(q);
    }),
  );
  return out;
}
function duelSubjects() {
  return Object.keys(DATA).filter((id) => safeId(id) && duelPool(id).length >= 5);
}
function duelQuestions(subj, seed) {
  const rnd = mulberry32(seed);
  return seededShuffle(duelPool(subj), rnd)
    .slice(0, 5)
    .map((q) => {
      const order = seededShuffle(
        q.c.map((_, i) => i),
        rnd,
      );
      return { q: q.q, c: order.map((i) => q.c[i]), a: order.indexOf(q.a), w: q.w || "" };
    });
}
function duelOutcome(d) {
  if (d.status !== "done" || d.my_score == null || d.other_score == null) return "";
  if (d.my_score !== d.other_score) return d.my_score > d.other_score ? "win" : "loss";
  if (d.my_ms !== d.other_ms) return d.my_ms < d.other_ms ? "win" : "loss";
  return "draw";
}
function subjName(id) {
  const s = subjById(id);
  return s ? s.name : id;
}
function secs(ms) {
  return (Math.round((+ms || 0) / 100) / 10).toLocaleString("de-DE") + " s";
}
function duelBegin(o) {
  const qs = duelQuestions(o.subj, o.seed);
  if (qs.length < 5)
    return toast(
      "Für dieses Fach gibt es auf deinem Gerät zu wenige Fragen – bitte Seite neu laden",
    );
  DUEL = Object.assign({ qs, i: 0, score: 0, t0: 0, pick: null, res: null, sending: false }, o);
  go("duel");
}
function duelNew() {
  const nick = ($("duelFriend") || {}).value || "",
    subj = ($("duelSubj") || {}).value || "";
  if (!nick) return toast("Wähle einen Freund aus");
  if (!duelSubjects().includes(subj)) return toast("Wähle ein Fach aus");
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 1;
  duelBegin({ mode: "new", nick, subj, seed });
}
function duelAccept(id) {
  const d = (SOC.duels || []).find((x) => x.id === id);
  if (!d || d.mine || d.status !== "open") return toast("Duell nicht mehr offen");
  if (!DATA[d.subj])
    return toast("Dieses Fach gibt es in deiner Lernhub-Version nicht – bitte Seite neu laden");
  duelBegin({ mode: "play", id: d.id, nick: d.other, subj: d.subj, seed: +d.seed });
}
async function duelDecline(id, mine) {
  if (!confirm(mine ? "Herausforderung zurückziehen?" : "Duell ablehnen?")) return;
  try {
    await rpc("duel_decline", { p_id: id });
  } catch (e) {
    toast(e.message, 5000);
  }
  socLoad("duels", true);
}
function renderDuel() {
  if (!DUEL) {
    SOC.sec = "duels";
    V.view = "board";
    return render();
  }
  const D = DUEL,
    head = `<div class="hero" style="background:linear-gradient(135deg,#ef4444,#7c5cff)"><h1>⚔️ Duell gegen ${esc(D.nick)}</h1><p>${esc(subjName(D.subj))} · 5 Fragen · Punkte zählen zuerst, bei Gleichstand die Zeit.</p><span class="big">⚔️</span></div>`;
  if (D.res || D.sending || D.i >= D.qs.length)
    return ($("app").innerHTML = head + duelResultHTML());
  if (!D.t0)
    return ($("app").innerHTML =
      head +
      `<div class="card center" style="margin-top:14px">
    <p>${D.mode === "play" ? `<b>${esc(D.nick)}</b> hat schon gespielt – sein Ergebnis siehst du danach.` : `Du spielst zuerst. Danach bekommt <b>${esc(D.nick)}</b> genau dieselben Fragen.`}</p>
    <p class="small mut">Die Zeit läuft ab dem Start. Nicht neu laden – sonst ist der Versuch weg.</p>
    <button class="btn g" onclick="DUEL.t0=Date.now();renderDuel()">▶️ Los geht's</button> <button class="btn ghost" onclick="DUEL=null;go('board')">Abbrechen</button></div>`);
  const q = D.qs[D.i],
    picked = D.pick != null;
  $("app").innerHTML =
    head +
    `<div class="card" style="margin-top:14px">
    <div class="small mut">Frage ${D.i + 1} / ${D.qs.length} · ✅ ${D.score}</div>
    <div class="bar" style="margin:6px 0 10px"><i style="width:${Math.round((100 * D.i) / D.qs.length)}%"></i></div>
    <b style="font-size:17px">${esc(q.q)}</b>
    ${q.c.map((c, k) => `<button class="choice duelopt ${picked ? (k === q.a ? "ok" : k === D.pick ? "bad" : "") : ""}" ${picked ? "disabled" : ""} onclick="duelPick(${k})">${esc(c)}</button>`).join("")}
    ${picked ? `${q.w ? `<p class="small mut">💡 ${esc(q.w)}</p>` : ""}<button class="btn g" style="margin-top:10px" onclick="duelNext()">${D.i + 1 < D.qs.length ? "Weiter →" : "Fertig 🏁"}</button>` : ""}
  </div>`;
}
function duelPick(k) {
  const D = DUEL;
  if (!D || D.pick != null) return;
  D.pick = k;
  if (k === D.qs[D.i].a) D.score++;
  renderDuel();
}
function duelNext() {
  const D = DUEL;
  if (!D) return;
  D.i++;
  D.pick = null;
  if (D.i >= D.qs.length) {
    D.ms = Date.now() - D.t0;
    duelSubmit();
  } else renderDuel();
}
async function duelSubmit() {
  const D = DUEL;
  if (!D || D.sending) return;
  D.sending = true;
  D.err = "";
  renderDuel();
  try {
    if (D.mode === "new") {
      const r = await rpc("duel_create", {
        p_nick: D.nick,
        p_subj: D.subj,
        p_seed: D.seed,
        p_score: D.score,
        p_ms: D.ms,
      });
      if (r !== "sent")
        throw new Error(
          {
            not_found: "Spitzname nicht gefunden",
            not_friends: "Ihr müsst befreundet sein",
            limit: "Zu viele offene Duelle (max. 20)",
            self: "Gegen dich selbst geht nicht 😉",
          }[r] || String(r),
        );
      D.res = { sent: true };
    } else {
      const r = await rpc("duel_play", { p_id: D.id, p_score: D.score, p_ms: D.ms });
      if (!r || !r.ok) throw new Error("Duell ist abgelaufen oder wurde schon gespielt");
      const o = duelOutcome({
        status: "done",
        my_score: r.my_score,
        my_ms: r.my_ms,
        other_score: r.other_score,
        other_ms: r.other_ms,
      });
      D.res = { other_score: r.other_score, other_ms: r.other_ms, o };
      if (o === "win") {
        S.stats.duelWins = (S.stats.duelWins || 0) + 1;
        confetti(60);
      }
    }
    S.stats.duelsPlayed = (S.stats.duelsPlayed || 0) + 1;
    addXP(D.score * 2);
    SOC.at.duels = 0;
  } catch (e) {
    D.err = e.message;
  }
  D.sending = false;
  renderDuel();
}
function duelResultHTML() {
  const D = DUEL;
  if (D.sending)
    return `<div class="card center" style="margin-top:14px">⏳ Ergebnis wird gesendet …</div>`;
  const mine = `<div class="kpis" style="margin-top:14px"><div class="kpi"><b>${D.score} / ${D.qs.length}</b><small>richtig</small></div><div class="kpi"><b>${secs(D.ms)}</b><small>Zeit</small></div><div class="kpi"><b>+${D.score * 2}</b><small>XP</small></div></div>`;
  if (D.err)
    return (
      mine +
      `<div class="card center" style="margin-top:14px"><p style="color:var(--red)">⚠️ ${esc(D.err)}</p>
    <button class="btn g" onclick="duelSubmit()">🔁 Nochmal senden</button> <button class="btn ghost" onclick="DUEL=null;go('board')">Zurück</button></div>`
    );
  const R = D.res || {};
  const line = R.sent
    ? `${mascotHTML(`Herausforderung an ${D.nick} gesendet! Sobald ${D.nick} gespielt hat, siehst du hier unter ⚔️ Duelle, wer gewonnen hat.`)}`
    : mascotHTML(
        R.o === "win"
          ? `Gewonnen! 🎉 ${D.nick} hatte ${R.other_score} richtig in ${secs(R.other_ms)}.`
          : R.o === "loss"
            ? `Knapp verloren – ${D.nick} hatte ${R.other_score} richtig in ${secs(R.other_ms)}. Revanche?`
            : `Unentschieden! Exakt gleich gut.`,
      );
  setTimeout(() => {
    if (window.mascotIntro) mascotIntro();
  }, 50);
  return (
    mine +
    `<div style="margin-top:14px">${line}</div>
    <div class="quickbtns" style="margin-top:12px"><button class="btn g" onclick="DUEL=null;SOC.sec='duels';go('board')">Zu den Duellen</button>${!R.sent ? `<button class="btn" onclick="const n=DUEL.nick;DUEL=null;SOC.sec='duels';go('board');setTimeout(()=>{const f=$('duelFriend');if(f)f.value=n;},50)">⚔️ Revanche</button>` : ""}</div>`
  );
}
function duelsHTML() {
  const all = SOC.duels;
  if (all === null) return SOC_LOADING;
  const friends = (BOARD.friends || []).filter((f) => f.status === "accepted"),
    subs = duelSubjects();
  const inc = all.filter((d) => !d.mine && d.status === "open"),
    wait = all.filter((d) => d.mine && d.status === "open");
  const past = all.filter((d) => d.status !== "open").slice(0, 15);
  const meta = (d) =>
    `${esc(subjName(d.subj))} · ${new Date(d.created_at).toLocaleDateString("de-DE")}`;
  const newCard = `<div class="card" style="margin-top:6px"><b>⚔️ Neues Duell</b>
    ${
      friends.length
        ? `<p class="small mut">Ihr bekommt dieselben 5 Fragen. Wer mehr richtig hat, gewinnt – bei Gleichstand der Schnellere.</p>
      <div class="exrow"><select class="fi" id="duelFriend"><option value="">Freund wählen …</option>${friends.map((f) => `<option value="${esc(f.nickname)}">${esc(f.nickname)}</option>`).join("")}</select>
      <select class="fi" id="duelSubj">${subs.map((s) => `<option value="${esc(s)}">${esc(subjName(s))}</option>`).join("")}</select>
      <button class="btn g" onclick="duelNew()">Herausfordern</button></div>`
        : `<p class="small mut">Duelle gehen nur mit bestätigten Freunden. Füge zuerst unter 🤝 Freunde jemanden hinzu.</p><button class="btn sm" onclick="socSet('friends')">🤝 Zu den Freunden</button>`
    }</div>`;
  const res = (d) => {
    const o =
      d.status === "declined"
        ? "❌ abgelehnt"
        : d.status === "expired"
          ? "⌛ abgelaufen"
          : { win: "🏆 Sieg", loss: "😕 Niederlage", draw: "🤝 Unentschieden" }[duelOutcome(d)] ||
            "";
    return `<div class="rankrow"><span class="rk">${d.mine ? "➡️" : "⬅️"}</span><b>${esc(d.other)}</b><span class="rv">${o}</span>
      <span class="rs">${meta(d)}${d.status === "done" ? ` · du ${d.my_score}/5 (${secs(d.my_ms)}) – ${esc(d.other)} ${d.other_score}/5 (${secs(d.other_ms)})` : ""}</span></div>`;
  };
  return `${
    inc.length
      ? `<h2 class="h2">📨 Du wirst herausgefordert</h2>${inc
          .map(
            (d) => `<div class="rankrow me"><span class="rk">⚔️</span><b>${esc(d.other)}</b>
      <span class="rv"><button class="btn g sm" onclick="duelAccept(${+d.id})">Spielen</button> <button class="btn ghost sm" onclick="duelDecline(${+d.id},false)">Ablehnen</button></span><span class="rs">${meta(d)} · 7 Tage Zeit</span></div>`,
          )
          .join("")}`
      : ""
  }
    ${newCard}
    ${wait.length ? `<h2 class="h2">⏳ Wartet auf Gegner</h2>${wait.map((d) => `<div class="rankrow"><span class="rk">⏳</span><b>${esc(d.other)}</b><span class="rv">${d.my_score}/5 <button class="xbtn" title="Zurückziehen" onclick="duelDecline(${+d.id},true)">✕</button></span><span class="rs">${meta(d)}</span></div>`).join("")}` : ""}
    ${past.length ? `<h2 class="h2">📜 Letzte Duelle</h2>${past.map(res).join("")}` : ""}
    ${!all.length ? '<p class="small mut center">Noch keine Duelle – fordere jemanden heraus!</p>' : ""}
    <p class="small mut">🏆 Gewonnene Duelle (30 Tage): ${all.filter((d) => duelOutcome(d) === "win").length}</p>`;
}

/* ===================== WebUntis über Proxy (falls direkter Abruf an CORS scheitert) ===================== */
async function cloudUntis(url) {
  const cfg = cloudCfg();
  if (!cfg || !CLOUD) throw new Error("Proxy nur mit Lernhub-Konto verfügbar");
  const r = await fetch(cfg.url + "/functions/v1/untis-ics", {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: "Bearer " + (await cloudToken()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error("Untis-Proxy: " + (t.slice(0, 120) || "HTTP " + r.status));
  return t;
}
