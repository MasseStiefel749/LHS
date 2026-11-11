/* =========================================================================
   js/games.js – 🎮 Minispiele für die Lernpause.
   Snake, 2048, Lern-Memory, Reaktionstest, Tic-Tac-Toe, Binär-Blitz.
   Kein XP (Pause soll Pause bleiben) – nur lokale Bestwerte in S.games.
   ========================================================================= */
let GAMES = { cur: null, timers: [], key: null, raf: 0, g: null };
const GAME_LIST = [
  {
    id: "snake",
    ic: "🐍",
    name: "Snake",
    d: "Klassiker: Futter sammeln, nicht in dich selbst fahren.",
    best: (b) => (b ? `${b} Punkte` : ""),
  },
  {
    id: "g2048",
    ic: "🔢",
    name: "2048",
    d: "Gleiche Zahlen zusammenschieben bis zur 2048.",
    best: (b) => (b ? `${b} Punkte` : ""),
  },
  {
    id: "memory",
    ic: "🃏",
    name: "Lern-Memory",
    d: "Begriff + Erklärung finden – aus deinen Lernkarten.",
    best: (b) => (b ? `${b} Züge` : ""),
  },
  {
    id: "react",
    ic: "⚡",
    name: "Reaktionstest",
    d: "Warte auf Grün – und dann so schnell wie möglich tippen.",
    best: (b) => (b ? `${b} ms` : ""),
  },
  {
    id: "ttt",
    ic: "⭕",
    name: "Tic-Tac-Toe",
    d: "Du gegen die KI. Schaffst du ein Unentschieden?",
    best: (b) => (b && (b.w || b.d || b.l) ? `${b.w}S · ${b.d}U · ${b.l}N` : ""),
  },
  {
    id: "binary",
    ic: "💡",
    name: "Binär-Blitz",
    d: "Schalte die Bits, bis die Dezimalzahl stimmt. 60 Sekunden.",
    best: (b) => (b ? `${b} Zahlen` : ""),
  },
];

function gamesState() {
  if (!S.games || typeof S.games !== "object" || Array.isArray(S.games)) S.games = {};
  const g = S.games;
  if (!g.best || typeof g.best !== "object" || Array.isArray(g.best)) g.best = {};
  if (!g.best.ttt || typeof g.best.ttt !== "object") g.best.ttt = { w: 0, d: 0, l: 0 };
  ["w", "d", "l"].forEach((k) => {
    g.best.ttt[k] = Math.max(0, +g.best.ttt[k] || 0);
  });
  ["snake", "g2048", "memory", "react", "binary"].forEach((k) => {
    const v = +g.best[k];
    g.best[k] = isFinite(v) && v > 0 ? Math.round(v) : 0;
  });
  if (typeof g.played !== "number") g.played = 0;
  return g;
}
function gBest(k, v, lower) {
  const b = gamesState().best,
    old = b[k];
  if (!old || (lower ? v < old : v > old)) {
    b[k] = v;
    save();
    return true;
  }
  return false;
}
function gT(fn, ms) {
  const t = setTimeout(fn, ms);
  GAMES.timers.push(t);
  return t;
}
function gClean() {
  GAMES.timers.forEach(clearTimeout);
  GAMES.timers = [];
  if (GAMES.raf) cancelAnimationFrame(GAMES.raf);
  GAMES.raf = 0;
  if (GAMES.key) {
    window.removeEventListener("keydown", GAMES.key);
    GAMES.key = null;
  }
  GAMES.g = null;
}
function gKeys(fn) {
  GAMES.key = (e) => {
    if (
      V.view !== "games" ||
      /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")
    )
      return;
    fn(e);
  };
  window.addEventListener("keydown", GAMES.key);
}
function gSwipe(el, fn) {
  if (!el) return;
  let sx = 0,
    sy = 0;
  el.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    },
    { passive: true },
  );
  el.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false },
  );
  el.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0],
      dx = t.clientX - sx,
      dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : dy > 0 ? "d" : "u");
  });
}
const G_ARROWS = {
  ArrowUp: "u",
  ArrowDown: "d",
  ArrowLeft: "l",
  ArrowRight: "r",
  w: "u",
  s: "d",
  a: "l",
  d: "r",
  W: "u",
  S: "d",
  A: "l",
  D: "r",
};
function gCss(v, fb) {
  const c = getComputedStyle(document.body).getPropertyValue(v).trim();
  return c || fb;
}

function gamesStop() {
  gClean();
  GAMES.cur = null;
}
/* render() aus dem Router: laufendes Spiel nicht neu starten */
function gamesView() {
  if (GAMES.cur && GAMES.g && document.querySelector("#app .gstage")) return;
  renderGames();
}
function gamesHome() {
  gClean();
  GAMES.cur = null;
  renderGames();
}
function gamesOpen(id) {
  gClean();
  GAMES.cur = id;
  const g = gamesState();
  g.played++;
  save();
  renderGames();
}
function gHead(id) {
  const m = GAME_LIST.find((x) => x.id === id),
    b = gamesState().best[id],
    bs = m.best(b);
  return `<div class="ghead2"><button class="btn ghost" onclick="gamesHome()">‹ Spiele</button><b>${m.ic} ${esc(m.name)}</b><span class="gbest" id="gBest">${bs ? "🏆 " + esc(bs) : ""}</span></div>`;
}

function renderGames() {
  gamesState();
  if (GAMES.cur) {
    gClean();
    const fn = {
      snake: gSnake,
      g2048: g2048,
      memory: gMemory,
      react: gReact,
      ttt: gTTT,
      binary: gBinary,
    }[GAMES.cur];
    if (fn) return fn();
    GAMES.cur = null;
  }
  const best = S.games.best,
    brk = S.focus && S.focus.run && S.focus.run.mode === "break";
  $("app").innerHTML = `
  <div class="h1">🎮 Minispiele</div>
  <p class="mut">Kurze Pause, Kopf frei – danach lernt es sich besser. ${brk ? "☕ Deine Pomodoro-Pause läuft gerade." : "Tipp: Starte im 🍅 Fokus-Timer eine Pause."}</p>
  <div class="gamegrid">
    ${GAME_LIST.map((g, i) => {
      const bs = g.best(best[g.id]);
      return `<button class="gamecard" style="--d:${i * 0.05}s" onclick="gamesOpen('${g.id}')">
      <span class="gic">${g.ic}</span><b>${esc(g.name)}</b><small>${esc(g.d)}</small>${bs ? `<em>🏆 ${esc(bs)}</em>` : ""}</button>`;
    }).join("")}
  </div>
  <p class="small mut" style="margin-top:14px">🧠 Forschung: Kurze, echte Pausen (5–10 Min) helfen dem Gehirn, Gelerntes zu festigen. Danach geht's zurück an den Stoff!</p>`;
}

/* ---------------- 🐍 Snake ---------------- */
function gSnake() {
  const N = 17;
  GAMES.g = {
    N,
    body: [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ],
    dir: "r",
    next: "r",
    food: null,
    score: 0,
    run: false,
    over: false,
    ms: 150,
  };
  $("app").innerHTML = `${gHead("snake")}
  <div class="gstage">
    <div class="gscore">Punkte: <b id="snScore">0</b></div>
    <canvas id="snCv" class="gcanvas" width="340" height="340" aria-label="Snake-Spielfeld"></canvas>
    <p class="small mut" id="snMsg">Pfeiltasten / WASD oder wischen. Tippe zum Start.</p>
    <div class="dpad"><button onclick="snDir('u')" aria-label="hoch">▲</button><button onclick="snDir('l')" aria-label="links">◀</button><button onclick="snDir('d')" aria-label="runter">▼</button><button onclick="snDir('r')" aria-label="rechts">▶</button></div>
  </div>`;
  const cv = $("snCv"),
    dpr = window.devicePixelRatio || 1;
  cv.width = cv.height = Math.round(340 * dpr);
  snFood();
  snDraw();
  cv.addEventListener("click", () => {
    if (!GAMES.g.run) snStart();
  });
  gSwipe(cv, snDir);
  gKeys((e) => {
    const d = G_ARROWS[e.key];
    if (d) {
      e.preventDefault();
      snDir(d);
    } else if (e.key === " ") {
      e.preventDefault();
      if (!GAMES.g.run) snStart();
    }
  });
}
function snFood() {
  const g = GAMES.g;
  let p;
  do {
    p = { x: Math.floor(Math.random() * g.N), y: Math.floor(Math.random() * g.N) };
  } while (g.body.some((b) => b.x === p.x && b.y === p.y));
  g.food = p;
}
function snDir(d) {
  const g = GAMES.g;
  if (!g || GAMES.cur !== "snake") return;
  const opp = { u: "d", d: "u", l: "r", r: "l" };
  if (g.over) {
    gSnake();
    GAMES.g.next = d;
    snStart();
    return;
  }
  if (d !== opp[g.dir]) g.next = d;
  if (!g.run) snStart();
}
function snStart() {
  const g = GAMES.g;
  if (g.run || g.over) return;
  g.run = true;
  const m = $("snMsg");
  if (m) m.textContent = "Los!";
  snTick();
}
function snTick() {
  const g = GAMES.g;
  if (!g || !g.run) return;
  g.dir = g.next;
  const h = g.body[0],
    mv = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[g.dir],
    n = { x: h.x + mv[0], y: h.y + mv[1] };
  const ate = n.x === g.food.x && n.y === g.food.y;
  const bodyCheck = ate ? g.body : g.body.slice(0, -1);
  if (
    n.x < 0 ||
    n.y < 0 ||
    n.x >= g.N ||
    n.y >= g.N ||
    bodyCheck.some((b) => b.x === n.x && b.y === n.y)
  ) {
    g.run = false;
    g.over = true;
    snDraw();
    const rec = g.score > 0 && gBest("snake", g.score);
    const m = $("snMsg");
    if (m)
      m.innerHTML = `💥 Game over – ${g.score} Punkte${rec ? " · <b>Neuer Rekord! 🏆</b>" : ""}. Richtung drücken für neue Runde.`;
    if (rec) {
      const b = $("gBest");
      if (b) b.textContent = "🏆 " + g.score + " Punkte";
    }
    return;
  }
  g.body.unshift(n);
  if (ate) {
    g.score++;
    const s = $("snScore");
    if (s) {
      s.textContent = g.score;
      s.classList.remove("pop");
      void s.offsetWidth;
      s.classList.add("pop");
    }
    g.ms = Math.max(70, g.ms - 3);
    snFood();
  } else g.body.pop();
  snDraw();
  gT(snTick, g.ms);
}
function snDraw() {
  const g = GAMES.g,
    cv = $("snCv");
  if (!g || !cv) return;
  const c = cv.getContext("2d"),
    W = cv.width,
    s = W / g.N;
  c.fillStyle = gCss("--card", "#fff");
  c.fillRect(0, 0, W, W);
  c.fillStyle = gCss("--line", "#e6e8f5");
  for (let y = 0; y < g.N; y++)
    for (let x = 0; x < g.N; x++) if ((x + y) % 2) c.fillRect(x * s, y * s, s, s);
  c.font = `${Math.round(s * 0.85)}px system-ui`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("🍎", g.food.x * s + s / 2, g.food.y * s + s / 2 + 1);
  const pri = gCss("--pri", "#7c5cff"),
    gr = gCss("--green", "#2ecc71");
  g.body.forEach((b, i) => {
    c.fillStyle = i === 0 ? pri : gr;
    const p = s * 0.08,
      r = s * 0.3;
    c.beginPath();
    if (c.roundRect) c.roundRect(b.x * s + p, b.y * s + p, s - 2 * p, s - 2 * p, r);
    else c.rect(b.x * s + p, b.y * s + p, s - 2 * p, s - 2 * p);
    c.fill();
  });
  if (g.over) {
    c.fillStyle = "rgba(0,0,0,.35)";
    c.fillRect(0, 0, W, W);
  }
}

/* ---------------- 🔢 2048 ---------------- */
function g2048() {
  GAMES.g = { b: Array(16).fill(0), score: 0, over: false, won: false, fresh: -1, merged: [] };
  g2Add();
  g2Add();
  $("app").innerHTML = `${gHead("g2048")}
  <div class="gstage">
    <div class="gscore">Punkte: <b id="g2Score">0</b> <button class="btn ghost sm" onclick="g2048()">↺ Neu</button></div>
    <div class="g2" id="g2"></div>
    <p class="small mut" id="g2Msg">Pfeiltasten / WASD oder wischen.</p>
  </div>`;
  g2Draw();
  gSwipe($("g2"), g2Move);
  gKeys((e) => {
    const d = G_ARROWS[e.key];
    if (d) {
      e.preventDefault();
      g2Move(d);
    }
  });
}
function g2Add() {
  const g = GAMES.g,
    free = g.b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!free.length) return;
  const i = free[Math.floor(Math.random() * free.length)];
  g.b[i] = Math.random() < 0.9 ? 2 : 4;
  g.fresh = i;
}
function g2Lines(d) {
  const L = [];
  for (let k = 0; k < 4; k++) {
    const line = [];
    for (let j = 0; j < 4; j++) {
      const idx =
        d === "l"
          ? k * 4 + j
          : d === "r"
            ? k * 4 + (3 - j)
            : d === "u"
              ? j * 4 + k
              : (3 - j) * 4 + k;
      line.push(idx);
    }
    L.push(line);
  }
  return L;
}
function g2Move(d) {
  const g = GAMES.g;
  if (!g || GAMES.cur !== "g2048" || g.over) return;
  let moved = false;
  g.merged = [];
  g2Lines(d).forEach((line) => {
    const vals = line.map((i) => g.b[i]).filter(Boolean),
      out = [];
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        const v = vals[i] * 2;
        out.push(v);
        g.score += v;
        if (v === 2048 && !g.won) {
          g.won = true;
          toast("🎉 2048 geschafft!");
        }
        g.merged.push(line[out.length - 1]);
        i++;
      } else out.push(vals[i]);
    }
    line.forEach((idx, j) => {
      const v = out[j] || 0;
      if (g.b[idx] !== v) moved = true;
      g.b[idx] = v;
    });
  });
  if (!moved) return;
  g2Add();
  g2Draw();
  if (!g2CanMove()) {
    g.over = true;
    const rec = gBest("g2048", g.score);
    const m = $("g2Msg");
    if (m)
      m.innerHTML = `Keine Züge mehr – ${g.score} Punkte${rec ? " · <b>Neuer Rekord! 🏆</b>" : ""}`;
  } else if (g.score) {
    const b = gamesState().best.g2048;
    if (g.score > b) {
      gBest("g2048", g.score);
      const e = $("gBest");
      if (e) e.textContent = "🏆 " + g.score + " Punkte";
    }
  }
}
function g2CanMove() {
  const b = GAMES.g.b;
  for (let i = 0; i < 16; i++) {
    if (!b[i]) return true;
    if (i % 4 < 3 && b[i] === b[i + 1]) return true;
    if (i < 12 && b[i] === b[i + 4]) return true;
  }
  return false;
}
function g2Draw() {
  const g = GAMES.g,
    el = $("g2");
  if (!el) return;
  el.innerHTML = g.b
    .map(
      (v, i) =>
        `<div class="g2c ${v ? "v" + Math.min(v, 4096) : ""} ${i === g.fresh ? "new" : ""} ${g.merged.includes(i) ? "mrg" : ""}">${v || ""}</div>`,
    )
    .join("");
  const s = $("g2Score");
  if (s) s.textContent = g.score;
}

/* ---------------- 🃏 Lern-Memory ---------------- */
const MEM_FALLBACK = [
  ["DNS", "Löst Namen in IP-Adressen auf"],
  ["RAM", "Flüchtiger Arbeitsspeicher"],
  ["CPU", "Prozessor – rechnet"],
  ["LAN", "Lokales Netzwerk"],
  ["HTTP", "Protokoll fürs Web"],
  ["SSD", "Speicher ohne bewegliche Teile"],
  ["Ohm", "Einheit des Widerstands"],
  ["Byte", "8 Bit"],
];
function memPairs() {
  const pool = [];
  allSubjectIds().forEach((sid) => {
    const s = subjById(sid);
    ((s && s.topics) || []).forEach((t) => {
      (t.cards || []).forEach((c) => {
        const f = String(c.f || "").trim(),
          b = String(c.b || "").trim();
        if (f.length >= 2 && f.length <= 40 && b.length >= 2 && b.length <= 70)
          pool.push({ f, b, tid: t.id, tn: t.name });
      });
    });
  });
  const learned = pool.filter(
    (p) => S.progress && S.progress[p.tid] && S.progress[p.tid].lessons > 0,
  );
  const src = learned.length >= 6 ? learned : pool;
  if (src.length < 6)
    return {
      pairs: shuffle(MEM_FALLBACK)
        .slice(0, 6)
        .map(([f, b]) => ({ f, b })),
      from: "IT-Grundbegriffe",
    };
  const tids = [...new Set(src.map((p) => p.tid))],
    pick = [];
  shuffle(tids).forEach((tid) => {
    if (pick.length < 6) {
      const own = shuffle(src.filter((p) => p.tid === tid));
      own.slice(0, Math.min(3, 6 - pick.length)).forEach((p) => {
        if (!pick.some((x) => norm(x.f) === norm(p.f))) pick.push(p);
      });
    }
  });
  return {
    pairs: pick.slice(0, 6),
    from: [...new Set(pick.map((p) => p.tn))].slice(0, 3).join(", "),
  };
}
function gMemory() {
  const { pairs, from } = memPairs();
  const cards = shuffle(
    pairs.flatMap((p, i) => [
      { k: i, txt: p.f, t: "f" },
      { k: i, txt: p.b, t: "b" },
    ]),
  );
  GAMES.g = { cards, open: [], done: new Set(), moves: 0, lock: false, pairs: pairs.length };
  $("app").innerHTML = `${gHead("memory")}
  <div class="gstage">
    <div class="gscore">Züge: <b id="memMoves">0</b> · Paare: <b id="memPairs">0/${pairs.length}</b> <button class="btn ghost sm" onclick="gMemory()">↺ Neu</button></div>
    <p class="small mut">Aus: ${esc(from)}</p>
    <div class="memgrid" id="memGrid">${cards.map((c, i) => `<button class="memc ${c.t}" data-i="${i}" onclick="memFlip(${i})" aria-label="Karte ${i + 1}"><span class="mfront">?</span><span class="mback">${esc(c.txt)}</span></button>`).join("")}</div>
    <p class="small mut" id="memMsg">Finde jeweils Begriff 🟣 und Erklärung 🟢.</p>
  </div>`;
}
function memFlip(i) {
  const g = GAMES.g;
  if (!g || g.lock || g.done.has(i) || g.open.includes(i)) return;
  const el = document.querySelector(`.memc[data-i="${i}"]`);
  if (!el) return;
  el.classList.add("flip");
  g.open.push(i);
  if (g.open.length < 2) return;
  g.moves++;
  $("memMoves").textContent = g.moves;
  const [a, b] = g.open,
    ca = g.cards[a],
    cb = g.cards[b];
  if (ca.k === cb.k && a !== b) {
    g.done.add(a);
    g.done.add(b);
    g.open = [];
    [a, b].forEach((x) => document.querySelector(`.memc[data-i="${x}"]`).classList.add("ok"));
    $("memPairs").textContent = `${g.done.size / 2}/${g.pairs}`;
    if (g.done.size === g.cards.length) {
      const rec = gBest("memory", g.moves, true);
      $("memMsg").innerHTML =
        `🎉 Geschafft in ${g.moves} Zügen${rec ? " · <b>Neuer Rekord! 🏆</b>" : ""}`;
      if (rec) {
        const e = $("gBest");
        if (e) e.textContent = "🏆 " + g.moves + " Züge";
      }
    }
  } else {
    g.lock = true;
    gT(() => {
      [a, b].forEach((x) => {
        const e = document.querySelector(`.memc[data-i="${x}"]`);
        if (e) {
          e.classList.remove("flip");
        }
      });
      g.open = [];
      g.lock = false;
    }, 900);
  }
}

/* ---------------- ⚡ Reaktionstest ---------------- */
function gReact() {
  GAMES.g = { st: "idle", t0: 0, times: [], round: 0 };
  $("app").innerHTML = `${gHead("react")}
  <div class="gstage">
    <button class="reactpad" id="rp" onpointerdown="reactHit(event)"><b id="rpT">Tippen zum Start</b><small id="rpS">5 Runden – Durchschnitt zählt</small></button>
    <div class="reacttimes" id="rpTimes"></div>
  </div>`;
  gKeys((e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      reactHit(e);
    }
  });
}
function reactSet(cls, t, s) {
  const p = $("rp");
  if (!p) return;
  p.className = "reactpad " + cls;
  $("rpT").textContent = t;
  $("rpS").textContent = s || "";
}
function reactHit(e) {
  const g = GAMES.g;
  if (!g || GAMES.cur !== "react") return;
  if (e && e.preventDefault) e.preventDefault();
  if (g.st === "idle" || g.st === "shown" || g.st === "early") {
    if (g.st === "idle" && g.round >= 5) {
      g.times = [];
      g.round = 0;
      $("rpTimes").innerHTML = "";
    }
    g.st = "wait";
    reactSet("wait", "Warte auf Grün …", "nicht zu früh tippen!");
    gT(
      () => {
        if (g.st !== "wait") return;
        g.st = "go";
        g.t0 = performance.now();
        reactSet("go", "JETZT!");
      },
      1200 + Math.random() * 2800,
    );
  } else if (g.st === "wait") {
    GAMES.timers.forEach(clearTimeout);
    GAMES.timers = [];
    g.st = "early";
    reactSet("early", "Zu früh! 😅", "Tippen für neuen Versuch");
  } else if (g.st === "go") {
    const ms = Math.round(performance.now() - g.t0);
    g.times.push(ms);
    g.round++;
    $("rpTimes").innerHTML = g.times.map((t) => `<span>${t} ms</span>`).join("");
    if (g.round >= 5) {
      const avg = Math.round(g.times.reduce((a, b) => a + b, 0) / g.times.length),
        rec = gBest("react", avg, true);
      g.st = "idle";
      reactSet(
        "done",
        `Ø ${avg} ms ${avg < 250 ? "⚡" : avg < 350 ? "👍" : "🐢"}`,
        rec ? "Neuer Rekord! 🏆 – Tippen für neue Serie" : "Tippen für neue Serie",
      );
      if (rec) {
        const e = $("gBest");
        if (e) e.textContent = "🏆 " + avg + " ms";
      }
    } else {
      g.st = "shown";
      reactSet("shown", `${ms} ms`, `Runde ${g.round}/5 – tippen für weiter`);
    }
  }
}

/* ---------------- ⭕ Tic-Tac-Toe ---------------- */
const TTT_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
function gTTT(hard) {
  if (typeof hard !== "boolean") hard = GAMES.tttHard !== false;
  GAMES.tttHard = hard;
  GAMES.g = { b: Array(9).fill(""), over: false, hard };
  const r = gamesState().best.ttt;
  $("app").innerHTML = `${gHead("ttt")}
  <div class="gstage">
    <div class="gscore">Du ❌ gegen KI ⭕ ·
      <button class="choice ${!hard ? "sel" : ""}" onclick="gTTT(false)">Leicht</button><button class="choice ${hard ? "sel" : ""}" onclick="gTTT(true)">Schwer</button></div>
    <div class="ttt" id="ttt">${Array(9)
      .fill(0)
      .map(
        (_, i) =>
          `<button data-i="${i}" onclick="tttPlay(${i})" aria-label="Feld ${i + 1}"></button>`,
      )
      .join("")}</div>
    <p class="small mut" id="tttMsg">Du fängst an.</p>
    <p class="small mut">Bilanz: ${r.w} Siege · ${r.d} Unentschieden · ${r.l} Niederlagen</p>
  </div>`;
}
function tttWin(b) {
  for (const l of TTT_LINES) {
    if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { p: b[l[0]], l };
  }
  return b.every(Boolean) ? { p: "draw" } : null;
}
function tttMini(b, me) {
  const w = tttWin(b);
  if (w) return w.p === "O" ? 10 : w.p === "X" ? -10 : 0;
  let best = me ? -99 : 99;
  for (let i = 0; i < 9; i++)
    if (!b[i]) {
      b[i] = me ? "O" : "X";
      const v = tttMini(b, !me);
      b[i] = "";
      best = me ? Math.max(best, v) : Math.min(best, v);
    }
  return best;
}
function tttAI() {
  const g = GAMES.g,
    free = g.b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!g.hard && Math.random() < 0.45) return free[Math.floor(Math.random() * free.length)];
  let best = -99,
    mv = free[0];
  shuffle(free).forEach((i) => {
    g.b[i] = "O";
    const v = tttMini(g.b, false);
    g.b[i] = "";
    if (v > best) {
      best = v;
      mv = i;
    }
  });
  return mv;
}
function tttDraw() {
  const g = GAMES.g;
  document.querySelectorAll("#ttt button").forEach((el, i) => {
    el.textContent = g.b[i] === "X" ? "❌" : g.b[i] === "O" ? "⭕" : "";
    el.disabled = !!g.b[i] || g.over;
  });
}
function tttEnd(w) {
  const g = GAMES.g,
    r = gamesState().best.ttt;
  g.over = true;
  if (w.l)
    w.l.forEach((i) => document.querySelector(`#ttt button[data-i="${i}"]`).classList.add("win"));
  if (w.p === "X") {
    r.w++;
    $("tttMsg").innerHTML = "🎉 <b>Du hast gewonnen!</b>";
  } else if (w.p === "O") {
    r.l++;
    $("tttMsg").innerHTML = "🤖 Die KI gewinnt.";
  } else {
    r.d++;
    $("tttMsg").innerHTML = "🤝 Unentschieden – gegen die schwere KI ist das stark!";
  }
  save();
  tttDraw();
  $("tttMsg").innerHTML += ` <button class="btn sm" onclick="gTTT()">Nochmal</button>`;
}
function tttPlay(i) {
  const g = GAMES.g;
  if (!g || g.over || g.b[i] || g.ai) return;
  g.b[i] = "X";
  tttDraw();
  let w = tttWin(g.b);
  if (w) return tttEnd(w);
  g.ai = true;
  $("tttMsg").textContent = "🤖 KI denkt …";
  gT(() => {
    g.b[tttAI()] = "O";
    g.ai = false;
    tttDraw();
    const w2 = tttWin(g.b);
    if (w2) tttEnd(w2);
    else $("tttMsg").textContent = "Du bist dran.";
  }, 380);
}

/* ---------------- 💡 Binär-Blitz ---------------- */
function gBinary() {
  GAMES.g = { bits: Array(8).fill(0), target: 0, score: 0, end: 0, run: false };
  $("app").innerHTML = `${gHead("binary")}
  <div class="gstage">
    <div class="gscore">⏱ <b id="bnTime">60</b> s · Treffer: <b id="bnScore">0</b></div>
    <div class="bntarget"><small>Stelle diese Zahl binär dar</small><b id="bnTarget">–</b><small id="bnNow">aktuell: 0</small></div>
    <div class="bnbits" id="bnBits">${[128, 64, 32, 16, 8, 4, 2, 1].map((v, i) => `<button data-i="${i}" onclick="bnFlip(${i})" disabled><span>0</span><small>${v}</small></button>`).join("")}</div>
    <button class="btn g" id="bnGo" onclick="bnStart()">▶️ Start</button>
    <p class="small mut">Tastatur: 1–8 schalten die Bits (links = 128). Passt für 🖥️ IT-Systeme!</p>
  </div>`;
  gKeys((e) => {
    const n = +e.key;
    if (n >= 1 && n <= 8) {
      e.preventDefault();
      bnFlip(n - 1);
    } else if (e.key === "Enter" && !GAMES.g.run) {
      bnStart();
    }
  });
}
function bnNew() {
  const g = GAMES.g;
  let t;
  do {
    t =
      g.score < 4
        ? 1 + Math.floor(Math.random() * 31)
        : g.score < 9
          ? 1 + Math.floor(Math.random() * 127)
          : 1 + Math.floor(Math.random() * 255);
  } while (t === g.target);
  g.target = t;
  g.bits.fill(0);
  bnDraw();
}
function bnStart() {
  const g = GAMES.g;
  g.score = 0;
  g.run = true;
  g.end = Date.now() + 60000;
  $("bnScore").textContent = "0";
  $("bnGo").classList.add("hidden");
  document.querySelectorAll("#bnBits button").forEach((b) => (b.disabled = false));
  bnNew();
  bnTick();
}
function bnTick() {
  const g = GAMES.g;
  if (!g || !g.run) return;
  const left = Math.max(0, Math.ceil((g.end - Date.now()) / 1000));
  const t = $("bnTime");
  if (t) t.textContent = left;
  if (left <= 0) {
    g.run = false;
    document.querySelectorAll("#bnBits button").forEach((b) => (b.disabled = true));
    const rec = g.score > 0 && gBest("binary", g.score);
    $("bnTarget").textContent = `${g.score} ✔`;
    $("bnNow").innerHTML = rec ? "<b>Neuer Rekord! 🏆</b>" : "Zeit um!";
    if (rec) {
      const e = $("gBest");
      if (e) e.textContent = "🏆 " + g.score + " Zahlen";
    }
    const go = $("bnGo");
    go.textContent = "↺ Nochmal";
    go.classList.remove("hidden");
    return;
  }
  gT(bnTick, 250);
}
function bnFlip(i) {
  const g = GAMES.g;
  if (!g || !g.run) return;
  g.bits[i] ^= 1;
  bnDraw();
  const val = g.bits.reduce((a, b, k) => a + (b << (7 - k)), 0);
  if (val === g.target) {
    g.score++;
    $("bnScore").textContent = g.score;
    const tg = $("bnTarget");
    tg.classList.remove("pop");
    void tg.offsetWidth;
    tg.classList.add("pop");
    gT(bnNew, 220);
  }
}
function bnDraw() {
  const g = GAMES.g,
    val = g.bits.reduce((a, b, k) => a + (b << (7 - k)), 0);
  $("bnTarget").textContent = g.target;
  $("bnNow").textContent = "aktuell: " + val;
  document.querySelectorAll("#bnBits button").forEach((b, i) => {
    b.classList.toggle("on", !!g.bits[i]);
    b.firstElementChild.textContent = g.bits[i];
  });
}
