/* Lernhub Extra: Streak-Freeze & Ruhetage, Fokus-Timer, Prüfungs-Countdown, Erfolge, App-Installation (PWA) & Push.
   Klassisches Script vor dem Haupt-Script: nutzt S, esc, save, today … nur zur Laufzeit. */

/* ===================== Zustand ===================== */
function extraDefaults() {
  return {
    freeze: { n: 0, used: [], rest: [], restSince: "", ms: 0 },
    focus: { work: 25, brk: 5, sessions: 0, min: 0, day: "", today: 0, task: "", run: null },
    badges: {},
    push: { on: false, endpoint: "" },
  };
}
function sanitizeExtra(st) {
  const D = extraDefaults();
  const isObj = (o) => o && typeof o === "object" && !Array.isArray(o);
  const day = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const f = isObj(st.freeze) ? st.freeze : {};
  st.freeze = {
    n: Math.max(0, Math.min(2, Math.floor(+f.n || 0))),
    used: (Array.isArray(f.used) ? f.used.filter(day) : []).slice(-60),
    rest: [
      ...new Set(
        (Array.isArray(f.rest) ? f.rest : [])
          .map(Number)
          .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
      ),
    ].slice(0, 2),
    restSince: day(f.restSince) ? f.restSince : "",
    ms: Math.max(0, Math.floor(+f.ms || 0)),
  };
  const fo = isObj(st.focus) ? st.focus : {};
  const r =
    isObj(fo.run) && (fo.run.mode === "work" || fo.run.mode === "break") && isFinite(fo.run.end)
      ? fo.run
      : null;
  st.focus = {
    work: [15, 25, 45, 50].includes(+fo.work) ? +fo.work : D.focus.work,
    brk: [5, 10, 15].includes(+fo.brk) ? +fo.brk : D.focus.brk,
    sessions: Math.max(0, Math.floor(+fo.sessions || 0)),
    min: Math.max(0, Math.floor(+fo.min || 0)),
    day: day(fo.day) ? fo.day : "",
    today: Math.max(0, Math.floor(+fo.today || 0)),
    task: typeof fo.task === "string" ? fo.task.slice(0, 120) : "",
    run: r
      ? {
          mode: r.mode,
          end: +r.end,
          len: Math.max(1, Math.min(90, +r.len || 25)),
          paused: r.paused == null ? null : Math.max(0, +r.paused || 0),
        }
      : null,
  };
  const b = isObj(st.badges) ? st.badges : {};
  st.badges = {};
  Object.keys(b)
    .slice(0, 200)
    .forEach((k) => {
      if (/^[a-z0-9_]{1,30}$/.test(k) && day(b[k])) st.badges[k] = b[k];
    });
  const p = isObj(st.push) ? st.push : {};
  st.push = {
    on: !!p.on,
    endpoint:
      typeof p.endpoint === "string" && /^https:\/\//.test(p.endpoint)
        ? p.endpoint.slice(0, 1000)
        : "",
  };
  ["exQ", "duelWins", "duelsPlayed", "leagueBest", "freezeUsed"].forEach((k) => {
    st.stats[k] = Math.max(0, Math.floor(+st.stats[k] || 0));
  });
}

/* ===================== 🧊 Streak-Freeze & Ruhetage ===================== */
const WD_LONG = [
  "",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];
function isoWd(d) {
  return ((new Date(d + "T00:00").getDay() + 6) % 7) + 1;
}
/* Ruhetage gelten erst ab dem Tag, an dem sie gewählt wurden – nachträgliches "Retten" geht nicht */
function isRestDay(d) {
  return !!S.freeze.restSince && d >= S.freeze.restSince && S.freeze.rest.includes(isoWd(d));
}
function streakRepair() {
  const L = S.streak.last;
  if (!L || S.streak.n <= 0) return;
  const gap = dayDiff(today(), L);
  if (gap <= 1) return;
  const miss = [];
  for (let k = gap - 1; k >= 1; k--) {
    const d = dayStr(-k);
    if (!isRestDay(d)) miss.push(d);
  }
  if (miss.length > S.freeze.n) return;
  S.freeze.n -= miss.length;
  S.freeze.used = S.freeze.used.concat(miss).slice(-60);
  S.stats.freezeUsed = (S.stats.freezeUsed || 0) + miss.length;
  S.streak.last = dayStr(-1);
  save();
  if (miss.length)
    setTimeout(
      () =>
        toast(
          `🧊 ${miss.length} Streak-Freeze eingesetzt – deine 🔥 ${S.streak.n}-Tage-Streak lebt!`,
          5000,
        ),
      800,
    );
}
function freezeEarn() {
  const n = S.streak.n;
  if (n < S.freeze.ms) S.freeze.ms = 0;
  const m = Math.floor(n / 7) * 7;
  if (m >= 7 && m > S.freeze.ms) {
    S.freeze.ms = m;
    if (S.freeze.n < 2) {
      S.freeze.n++;
      setTimeout(() => toast(`🧊 ${m} Tage Streak – du bekommst einen Streak-Freeze!`, 4500), 1500);
    }
    save();
  }
}
const FREEZE_PRICE = 100;
function freezeBuy() {
  if (S.freeze.n >= 2) return toast("Du hast schon 2 Freezes – mehr geht nicht");
  if (S.xp < FREEZE_PRICE) return toast(`Du brauchst ${FREEZE_PRICE} XP`);
  if (!confirm(`Streak-Freeze für ${FREEZE_PRICE} XP kaufen?`)) return;
  S.xp -= FREEZE_PRICE;
  S.freeze.n++;
  save();
  renderTop();
  toast("🧊 Streak-Freeze gekauft ✓");
  openStreak();
}
function restToggle(d) {
  const r = S.freeze.rest,
    i = r.indexOf(d);
  if (i >= 0) r.splice(i, 1);
  else {
    if (r.length >= 2) return toast("Höchstens 2 Ruhetage pro Woche");
    r.push(d);
  }
  S.freeze.restSince = today();
  save();
  pushSync();
  openStreak();
}
function openStreak() {
  const st = streakNow(),
    f = S.freeze;
  toastModal(`<h2 style="margin-top:0">🔥 Deine Streak: ${st} Tag${st === 1 ? "" : "e"}</h2>
    <p class="small mut">Rekord: ${S.streak.best} Tage. Die Streak wächst mit jedem Tag, an dem du mindestens eine Lektion abschließt.</p>
    <div class="card" style="margin-top:10px"><b>🧊 Streak-Freeze: ${f.n} / 2</b>
      <p class="small mut">Verpasst du einen Tag, wird automatisch ein Freeze eingesetzt und deine Streak bleibt erhalten. Alle 7 Streak-Tage bekommst du einen geschenkt – oder kaufst einen für ${FREEZE_PRICE} XP.</p>
      <div style="font-size:30px;letter-spacing:6px">${"🧊".repeat(f.n)}${"⬜".repeat(2 - f.n)}</div>
      <button class="btn sm" style="margin-top:8px" ${f.n >= 2 || S.xp < FREEZE_PRICE ? "disabled" : ""} onclick="freezeBuy()">Freeze kaufen (${FREEZE_PRICE} XP)</button>
      ${
        f.used.length
          ? `<p class="small mut">Zuletzt eingesetzt: ${f.used
              .slice(-5)
              .reverse()
              .map((d) => new Date(d + "T00:00").toLocaleDateString("de-DE"))
              .join(", ")}</p>`
          : ""
      }
    </div>
    <div class="card" style="margin-top:10px"><b>😴 Ruhetage (max. 2)</b>
      <p class="small mut">An Ruhetagen musst du nicht lernen – die Streak läuft trotzdem weiter und es kommen keine Erinnerungen. Gilt ab heute.</p>
      <div class="restdays">${[1, 2, 3, 4, 5, 6, 7].map((d) => `<button class="choice ${f.rest.includes(d) ? "sel" : ""}" onclick="restToggle(${d})" title="${WD_LONG[d]}">${WD[d]}</button>`).join("")}</div>
      ${isRestDay(today()) ? '<p class="small" style="color:var(--green)">✓ Heute ist Ruhetag – genieß ihn!</p>' : ""}
    </div>
    <div class="center" style="margin-top:12px"><button class="btn" onclick="closeModal()">Alles klar</button></div>`);
}

/* ===================== 🍅 Fokus-Timer (Pomodoro) ===================== */
let FOCUS_T = null;
function focusLeft() {
  const r = S.focus.run;
  if (!r) return 0;
  return r.paused != null ? r.paused : Math.max(0, r.end - Date.now());
}
function mmss(ms) {
  const s = Math.ceil(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
function focusStart(mode) {
  const len = mode === "break" ? S.focus.brk : S.focus.work;
  S.focus.run = { mode, end: Date.now() + len * 60000, len, paused: null };
  save();
  focusLoop();
  if (V.view === "fokus") renderFocus();
}
function focusPause() {
  const r = S.focus.run;
  if (!r || r.paused != null) return;
  r.paused = focusLeft();
  save();
  renderFocus();
}
function focusResume() {
  const r = S.focus.run;
  if (!r || r.paused == null) return;
  r.end = Date.now() + r.paused;
  r.paused = null;
  save();
  focusLoop();
  renderFocus();
}
function focusStop() {
  S.focus.run = null;
  save();
  clearInterval(FOCUS_T);
  document.title = BASE_TITLE;
  if (V.view === "fokus") renderFocus();
}
function focusLoop() {
  clearInterval(FOCUS_T);
  FOCUS_T = setInterval(focusTick, 1000);
  focusTick();
}
function focusTick() {
  const r = S.focus.run;
  if (!r) {
    clearInterval(FOCUS_T);
    return;
  }
  if (r.paused == null && Date.now() >= r.end) return focusDone();
  const left = focusLeft();
  if (r.paused == null)
    document.title = (r.mode === "work" ? "🍅 " : "☕ ") + mmss(left) + " – Lernhub";
  const el = $("focusClock");
  if (el) el.textContent = mmss(left);
  const ring = $("focusRing");
  if (ring) ring.style.setProperty("--p", (100 - (100 * left) / (r.len * 60000)).toFixed(1) + "%");
  const mini = $("focusMini");
  if (mini) mini.textContent = mmss(left);
}
function focusBeep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ac.createOscillator(),
        g = ac.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ac.destination);
      g.gain.setValueAtTime(0.2, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.3);
      o.start(ac.currentTime + t);
      o.stop(ac.currentTime + t + 0.3);
    });
  } catch (e) {}
}
function focusDone() {
  const r = S.focus.run;
  S.focus.run = null;
  clearInterval(FOCUS_T);
  document.title = BASE_TITLE;
  let msg;
  if (r.mode === "work") {
    if (S.focus.day !== today()) {
      S.focus.day = today();
      S.focus.today = 0;
    }
    S.focus.sessions++;
    S.focus.min += r.len;
    S.focus.today += r.len;
    msg = `🍅 ${r.len} Minuten Fokus geschafft! Jetzt ${S.focus.brk} Minuten Pause.`;
    save();
    focusStart("break");
  } else {
    msg = "☕ Pause vorbei – bereit für die nächste Runde?";
    save();
  }
  focusBeep();
  toast(msg, 6000);
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Lernhub", { body: msg, tag: "lernhub-focus" });
    } catch (e) {}
  }
  if (V.view === "fokus") renderFocus();
}
function focusMini() {
  const r = S.focus.run;
  if (!r) return "";
  return `<button class="btn ghost" onclick="go('fokus')">${r.mode === "work" ? "🍅" : "☕"} <span id="focusMini">${mmss(focusLeft())}</span>${r.paused != null ? " ⏸" : ""}</button>`;
}
function renderFocus() {
  const r = S.focus.run,
    f = S.focus,
    left = r ? focusLeft() : f.work * 60000;
  const todayMin = f.day === today() ? f.today : 0;
  const pct = r ? 100 - (100 * left) / (r.len * 60000) : 0;
  $("app").innerHTML = `
  <div class="h1">🍅 Fokus-Timer</div>
  <p class="mut">Pomodoro-Technik: ${f.work} Minuten konzentriert arbeiten, ${f.brk} Minuten Pause. Handy weg, ein Tab, ein Thema.</p>
  <div class="focusbox">
    <div class="focusring ${r && r.mode === "break" ? "brk" : ""}" id="focusRing" style="--p:${pct.toFixed(1)}%"><div>
      <small>${r ? (r.mode === "work" ? "Fokus" : "Pause") + (r.paused != null ? " · pausiert" : "") : "Bereit"}</small>
      <b id="focusClock">${mmss(left)}</b>
      ${f.task ? `<small class="mut">${esc(f.task)}</small>` : ""}</div></div>
    <div class="quickbtns" style="justify-content:center">
      ${
        !r
          ? `<button class="btn g" onclick="focusStart('work')">▶️ Fokus starten</button><button class="btn ghost" onclick="focusStart('break')">☕ Pause</button>`
          : `${r.paused != null ? `<button class="btn g" onclick="focusResume()">▶️ Weiter</button>` : `<button class="btn" onclick="focusPause()">⏸ Pause</button>`}
          <button class="btn ghost" onclick="focusDone()">⏭ Überspringen</button><button class="btn r" onclick="focusStop()">⏹ Stopp</button>
          ${r.mode === "break" && typeof renderGames === "function" ? `<button class="btn" onclick="go('games')">🎮 Pausen-Spiel</button>` : ""}`
      }
    </div>
  </div>
  <div class="two" style="margin-top:14px">
    <div class="card"><b>⚙️ Einstellungen</b>
      <label class="fl" style="display:block;margin-top:10px">Woran arbeitest du?</label>
      <input class="fi" maxlength="120" placeholder="z. B. Subnetting üben" value="${esc(f.task)}" onchange="S.focus.task=this.value.slice(0,120);save()">
      <label class="fl" style="display:block;margin-top:10px">Fokus-Zeit</label>
      <div>${[15, 25, 45, 50].map((m) => `<button class="choice ${f.work === m ? "sel" : ""}" onclick="S.focus.work=${m};save();renderFocus()">${m} Min</button>`).join("")}</div>
      <label class="fl" style="display:block;margin-top:10px">Pause</label>
      <div>${[5, 10, 15].map((m) => `<button class="choice ${f.brk === m ? "sel" : ""}" onclick="S.focus.brk=${m};save();renderFocus()">${m} Min</button>`).join("")}</div>
    </div>
    <div class="card"><b>📊 Deine Fokus-Zeit</b>
      <div class="kpis" style="margin-top:8px">
        <div class="kpi"><small>Heute</small><b>${todayMin} Min</b></div>
        <div class="kpi"><small>Gesamt</small><b>${Math.floor(f.min / 60)} Std ${f.min % 60} Min</b></div>
        <div class="kpi"><small>Runden</small><b>${f.sessions} 🍅</b></div>
      </div>
      <p class="small mut">Der Timer läuft weiter, wenn du in andere Bereiche wechselst oder den Tab schließt. Am Ende gibt's einen Ton${"Notification" in window && Notification.permission === "granted" ? " und eine Benachrichtigung" : ""}.</p>
      <p class="small mut">Pomodoro-Technik® nach Francesco Cirillo.</p>
    </div>
  </div>`;
}

/* ===================== 📝 Prüfungs-Countdown ===================== */
const EXAM_RE =
  /^(?!\s*kein).*?(klassenarbeit|prüfung|pruefung|klausur|\btest\b|abschluss|\bgap\b|\bap ?[12]\b)/i;
function examsUpcoming() {
  const t = today(),
    list = [];
  (typeof EXT_TERMINE !== "undefined" ? EXT_TERMINE : []).forEach((x) => {
    if (EXAM_RE.test(x.titel || ""))
      list.push({ date: x.datum, title: x.titel, subj: x.fach || "" });
  });
  S.events.forEach((e) => {
    if (e.exam || EXAM_RE.test(e.title)) list.push({ date: e.date, title: e.title, subj: e.subj });
  });
  return list.filter((x) => x.date >= t).sort((a, b) => (a.date < b.date ? -1 : 1));
}
function examCountdownHTML() {
  const ex = examsUpcoming().filter((x) => dayDiff(x.date, today()) <= 90);
  if (!ex.length) return "";
  const n = ex[0],
    d = dayDiff(n.date, today());
  const hot = d <= 3,
    label = d === 0 ? "HEUTE" : d === 1 ? "MORGEN" : d + " Tage";
  return `<div class="card examcard ${hot ? "hot" : ""}" style="margin-top:14px">
    <div class="examnum"><b>${label}</b><small>${d > 1 ? "bis zur Prüfung" : ""}</small></div>
    <div style="flex:1;min-width:180px"><b>📝 ${esc(n.title)}</b>${n.subj ? ` <small class="mut">· ${esc(n.subj)}</small>` : ""}<br>
      <small class="mut">${new Date(n.date + "T00:00").toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}${d > 1 ? ` · ${Math.ceil(d / 7) > 1 ? "ca. " + Math.ceil(d / 7) + " Wochen" : "diese Woche"}` : ""}</small>
      ${
        ex.length > 1
          ? `<br><small class="mut">Danach: ${ex
              .slice(1, 3)
              .map((x) => esc(x.title) + " (" + esc(whenTxt(x.date)) + ")")
              .join(" · ")}</small>`
          : ""
      }
      <div class="quickbtns" style="margin-top:8px"><button class="btn g sm" onclick="continueLesson()">Jetzt dafür lernen</button><button class="btn ghost sm" onclick="go('fokus')">🍅 Fokus-Runde</button></div>
    </div></div>`;
}

/* ===================== 🏅 Abzeichen & Erfolge ===================== */
const BADGES = [
  {
    id: "lesson1",
    ic: "🐣",
    t: "Erste Schritte",
    d: "Erste Lektion abgeschlossen",
    v: () => S.stats.lessons,
    g: 1,
  },
  {
    id: "lesson10",
    ic: "📚",
    t: "Fleißig",
    d: "10 Lektionen abgeschlossen",
    v: () => S.stats.lessons,
    g: 10,
  },
  {
    id: "lesson50",
    ic: "🎓",
    t: "Streber (im guten Sinn)",
    d: "50 Lektionen abgeschlossen",
    v: () => S.stats.lessons,
    g: 50,
  },
  {
    id: "lesson100",
    ic: "🏛️",
    t: "Lernmaschine",
    d: "100 Lektionen abgeschlossen",
    v: () => S.stats.lessons,
    g: 100,
  },
  { id: "streak3", ic: "🔥", t: "Warmgelaufen", d: "3 Tage Streak", v: () => S.streak.best, g: 3 },
  {
    id: "streak7",
    ic: "📅",
    t: "Eine ganze Woche",
    d: "7 Tage Streak",
    v: () => S.streak.best,
    g: 7,
  },
  {
    id: "streak30",
    ic: "🌋",
    t: "Unaufhaltsam",
    d: "30 Tage Streak",
    v: () => S.streak.best,
    g: 30,
  },
  { id: "streak100", ic: "💯", t: "Legende", d: "100 Tage Streak", v: () => S.streak.best, g: 100 },
  { id: "xp100", ic: "⚡", t: "Aufgeladen", d: "100 XP gesammelt", v: () => S.xp, g: 100 },
  { id: "xp1000", ic: "🌟", t: "Tausender", d: "1.000 XP gesammelt", v: () => S.xp, g: 1000 },
  { id: "xp5000", ic: "🚀", t: "Überflieger", d: "5.000 XP gesammelt", v: () => S.xp, g: 5000 },
  {
    id: "correct100",
    ic: "✅",
    t: "Treffsicher",
    d: "100 Aufgaben richtig",
    v: () => S.stats.correct,
    g: 100,
  },
  {
    id: "correct500",
    ic: "🎯",
    t: "Scharfschütze",
    d: "500 Aufgaben richtig",
    v: () => S.stats.correct,
    g: 500,
  },
  {
    id: "focus1",
    ic: "🍅",
    t: "Erste Tomate",
    d: "1 Fokus-Runde geschafft",
    v: () => S.focus.sessions,
    g: 1,
  },
  {
    id: "focus25",
    ic: "🧘",
    t: "Zen-Meister",
    d: "25 Fokus-Runden geschafft",
    v: () => S.focus.sessions,
    g: 25,
  },
  {
    id: "note1",
    ic: "✍️",
    t: "Mitschreiber",
    d: "Erste Notiz angelegt",
    v: () => S.notes.length,
    g: 1,
  },
  {
    id: "note10",
    ic: "🗂️",
    t: "Archivar",
    d: "10 Notizen angelegt",
    v: () => S.notes.length,
    g: 10,
  },
  {
    id: "explain10",
    ic: "🧠",
    t: "Neugierig",
    d: "10 Fragen im Erklär-Modus",
    v: () => S.stats.exQ,
    g: 10,
  },
  {
    id: "freeze1",
    ic: "🧊",
    t: "Eiskalt gerettet",
    d: "Streak mit einem Freeze gerettet",
    v: () => S.stats.freezeUsed,
    g: 1,
  },
  {
    id: "plan1",
    ic: "🏫",
    t: "Durchgeplant",
    d: "Stundenplan eingerichtet",
    v: () => S.untis.ev.length + S.untis.week.length,
    g: 1,
  },
  {
    id: "char1",
    ic: "🧸",
    t: "Erschaffer",
    d: "Eigenen Charakter erstellt",
    v: () => S.chars.length,
    g: 1,
  },
  {
    id: "own1",
    ic: "🌍",
    t: "Eigener Weg",
    d: "Eigenes Fach angelegt",
    v: () => S.custom.subjects.length,
    g: 1,
  },
  {
    id: "duel1",
    ic: "⚔️",
    t: "Herausforderer",
    d: "Erstes Lern-Duell gespielt",
    v: () => S.stats.duelsPlayed,
    g: 1,
  },
  {
    id: "duelwin5",
    ic: "🏆",
    t: "Duell-Champion",
    d: "5 Lern-Duelle gewonnen",
    v: () => S.stats.duelWins,
    g: 5,
  },
  {
    id: "league1",
    ic: "🥈",
    t: "Aufsteiger",
    d: "In die Silber-Liga aufgestiegen",
    v: () => S.stats.leagueBest,
    g: 1,
  },
  {
    id: "league4",
    ic: "💎",
    t: "Edelstein",
    d: "Saphir-Liga oder höher erreicht",
    v: () => S.stats.leagueBest,
    g: 3,
  },
];
let BADGE_T = null;
function badgeCheck() {
  const fresh = BADGES.filter((b) => !S.badges[b.id] && (+b.v() || 0) >= b.g);
  if (!fresh.length) return;
  fresh.forEach((b) => {
    S.badges[b.id] = today();
  });
  save();
  const b = fresh[0];
  toast(
    fresh.length > 1
      ? `🏅 ${fresh.length} neue Erfolge freigeschaltet!`
      : `🏅 Erfolg freigeschaltet: ${b.ic} ${b.t}`,
    4500,
  );
  if (V.view !== "lesson") confetti(30);
  if (V.view === "erfolge") renderBadges();
}
function extraAfterSave() {
  clearTimeout(BADGE_T);
  BADGE_T = setTimeout(() => {
    freezeEarn();
    badgeCheck();
  }, 700);
}
function renderBadges() {
  const got = BADGES.filter((b) => S.badges[b.id]).length;
  $("app").innerHTML = `
  <div class="hero" style="background:linear-gradient(135deg,#f59e0b,#16a34a)">
    <h1>🏅 Erfolge</h1><p>${got} von ${BADGES.length} Abzeichen gesammelt. Jedes Abzeichen zeigt, was du schon geschafft hast.</p>
    ${mascotHTML("", 92).replace('class="mascot"', 'class="mascot hero-m"')}
  </div>
  <div class="bar" style="margin-top:12px"><i style="width:${Math.round((100 * got) / BADGES.length)}%"></i></div>
  <div class="badgegrid">${BADGES.map((b) => {
    const v = Math.min(b.g, +b.v() || 0),
      on = !!S.badges[b.id];
    return `<div class="medal ${on ? "on" : ""}"><div class="bic">${on ? b.ic : "🔒"}</div><b>${esc(b.t)}</b><small>${esc(b.d)}</small>
      ${on ? `<small class="mut">✓ ${new Date(S.badges[b.id] + "T00:00").toLocaleDateString("de-DE")}</small>` : `<div class="bar" style="height:7px;margin-top:6px"><i style="width:${Math.round((100 * v) / b.g)}%"></i></div><small class="mut">${v} / ${b.g}</small>`}</div>`;
  }).join("")}</div>`;
}

/* ===================== 📲 App installieren (PWA) & Push ===================== */
let PWA_EVT = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  PWA_EVT = e;
});
window.addEventListener("appinstalled", () => {
  PWA_EVT = null;
  toast("📲 Lernhub ist installiert ✓");
});
function pwaInstalled() {
  return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
function pwaCanSW() {
  return (
    "serviceWorker" in navigator &&
    (location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1")
  );
}
function pwaRegister() {
  if (location.protocol === "file:") return;
  const l = document.createElement("link");
  l.rel = "manifest";
  l.href = "manifest.webmanifest";
  document.head.appendChild(l);
  if (pwaCanSW())
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("Service Worker:", e));
}
async function pwaInstall() {
  if (PWA_EVT) {
    PWA_EVT.prompt();
    await PWA_EVT.userChoice;
    PWA_EVT = null;
    if (V.view === "plan") renderPlan();
    return;
  }
  toastModal(`<h2 style="margin-top:0">📲 Lernhub als App installieren</h2>
    ${location.protocol === "file:" ? '<p class="small" style="color:var(--red)">⚠️ Gerade ist Lernhub als Datei geöffnet. Installieren geht nur über die veröffentlichte https-Adresse (z. B. GitHub Pages).</p>' : ""}
    <p><b>Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</p>
    <p><b>iPhone/iPad (Safari):</b> Teilen-Symbol □↑ → „Zum Home-Bildschirm“. Push-Erinnerungen gehen auf dem iPhone nur so (ab iOS 16.4).</p>
    <p><b>PC (Chrome/Edge):</b> In der Adressleiste rechts auf das Installieren-Symbol ⊕ klicken.</p>
    <button class="btn" onclick="closeModal()">Alles klar</button>`);
}
function b64uBytes(s) {
  const p = "=".repeat((4 - (s.length % 4)) % 4);
  const b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}
function pushProblem() {
  if (!pwaCanSW() || !("PushManager" in window))
    return "Push geht nur auf der veröffentlichten https-Seite in einem aktuellen Browser (iPhone: erst als App installieren).";
  if (!cloudCfg() || !(window.LERNHUB_CLOUD || {}).vapidPublic)
    return "Push ist für diese Lernhub-Seite noch nicht eingerichtet (siehe README: „Push-Erinnerungen“).";
  if (!CLOUD || !CLOUD.nick)
    return "Für Push brauchst du ein Konto – unter 🏆 Bestenliste einloggen.";
  return "";
}
async function pushSubscribeSend(sub) {
  const j = sub.toJSON();
  await rpc("push_subscribe", {
    p_endpoint: j.endpoint,
    p_p256dh: j.keys.p256dh,
    p_auth: j.keys.auth,
    p_on: S.remind.on,
    p_from: S.remind.from,
    p_rest: S.freeze.rest,
  });
  S.push = { on: true, endpoint: j.endpoint };
  save();
}
async function pushEnable() {
  const why = pushProblem();
  if (why) return toast(why, 6000);
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted")
      return toast(
        "Benachrichtigungen nicht erlaubt – in den Browser-Einstellungen änderbar",
        5000,
      );
    S.remind.notify = true;
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64uBytes(window.LERNHUB_CLOUD.vapidPublic),
      }));
    await pushSubscribeSend(sub);
    toast("📲 Push-Erinnerungen an ✓ – auch wenn Lernhub zu ist", 4500);
  } catch (e) {
    toast("Push fehlgeschlagen: " + (e.message || e), 6000);
  }
  if (V.view === "plan") renderPlan();
}
async function pushDisable() {
  try {
    const reg = await navigator.serviceWorker.ready,
      sub = await reg.pushManager.getSubscription();
    if (sub) {
      await rpc("push_unsubscribe", { p_endpoint: sub.endpoint }).catch(() => {});
      await sub.unsubscribe();
    }
  } catch (e) {}
  S.push = { on: false, endpoint: "" };
  save();
  toast("Push-Erinnerungen aus");
  if (V.view === "plan") renderPlan();
}
/* Erinnerungs-Einstellungen (Zeit, an/aus, Ruhetage) zum Server spiegeln */
let PUSH_T = null;
function pushSync() {
  if (!S.push.on || pushProblem()) return;
  clearTimeout(PUSH_T);
  PUSH_T = setTimeout(async () => {
    try {
      const reg = await navigator.serviceWorker.ready,
        sub = await reg.pushManager.getSubscription();
      if (sub) await pushSubscribeSend(sub);
      else {
        S.push = { on: false, endpoint: "" };
        save();
      }
    } catch (e) {}
  }, 800);
}
function pwaCardHTML() {
  const inst = pwaInstalled(),
    why = pushProblem();
  return `<div class="card" style="margin-top:14px"><b>📲 App &amp; Push-Erinnerungen</b>
    <p class="small mut">Als App installiert startet Lernhub wie jede andere App vom Startbildschirm. Mit Push erinnert dich Pingulin 🐧 auch dann, wenn Lernhub komplett geschlossen ist – ab deiner Startzeit, immer öfter, bis das Tagesziel geschafft ist (nicht an Ruhetagen).</p>
    <div class="quickbtns">
      ${inst ? '<span class="pill g">✓ Als App installiert</span>' : `<button class="btn sm" onclick="pwaInstall()">📲 Als App installieren</button>`}
      ${
        S.push.on
          ? `<span class="pill g">✓ Push an</span><button class="btn ghost sm" onclick="pushDisable()">Push ausschalten</button>`
          : `<button class="btn g sm" ${why ? "disabled" : ""} onclick="pushEnable()">🔔 Push-Erinnerungen einschalten</button>`
      }
    </div>
    ${why && !S.push.on ? `<p class="small mut">ℹ️ ${esc(why)}</p>` : ""}
  </div>`;
}

/* ===================== Start ===================== */
function extraInit() {
  pwaRegister();
  streakRepair();
  if (S.focus.run) focusLoop();
  extraAfterSave();
  setInterval(streakRepair, 5 * 60000);
  if (S.untis.url && Date.now() - S.untis.at > 6 * 3600000)
    setTimeout(() => untisFetch(true), 5000);
  setTimeout(pushSync, 5000);
}
