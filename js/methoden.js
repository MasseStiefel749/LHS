/* =========================================================================
   js/methoden.js – 🧪 Lernmethoden: wissenschaftlich geprüfte Techniken
   mit interaktiven Werkzeugen, die direkt den Lernstoff der App benutzen.
   Grundlagen: Dunlosky et al. (2013), Roediger & Karpicke (2006),
   Cepeda et al. (2006), Bjork (1994), Paivio (1971), Pashler et al. (2008).
   ========================================================================= */
const METHODS = [
  {
    id: "recall",
    ic: "🧠",
    name: "Active Recall (Abrufüben)",
    ev: 3,
    tags: ["pruefung", "behalten"],
    kurz: "Statt nochmal lesen: dich selbst abfragen – aus dem Kopf, ohne Spickzettel.",
    wie: [
      "Karte ansehen, Antwort selbst formulieren (schreiben oder laut sagen).",
      "Erst DANN die Lösung aufdecken.",
      "Ehrlich bewerten: gewusst oder nicht?",
    ],
    warum:
      "Jeder Abruf stärkt die Erinnerungsspur. In Studien behielten Lernende nach einer Woche deutlich mehr, wenn sie sich abfragten statt nochmal zu lesen (Testing-Effekt).",
    quelle: "Roediger & Karpicke 2006; Dunlosky et al. 2013: „hoher Nutzen“",
  },
  {
    id: "leitner",
    ic: "🗃️",
    name: "Spaced Repetition (Leitner-Kasten)",
    ev: 3,
    tags: ["behalten", "pruefung"],
    kurz: "Wiederholen in wachsenden Abständen – kurz bevor du es vergisst.",
    wie: [
      "Alle Karten starten in Fach 1.",
      "Gewusst → ein Fach weiter (längere Pause).",
      "Nicht gewusst → zurück in Fach 1.",
      "Jeden Tag nur fällige Karten lernen.",
    ],
    warum:
      "Verteiltes Lernen schlägt Pauken am Stück – bei gleicher Lernzeit bleibt deutlich mehr hängen. Gegen die Vergessenskurve (Ebbinghaus) hilft rechtzeitiges Wiederholen.",
    quelle: "Leitner 1972; Cepeda et al. 2006; Dunlosky et al. 2013: „hoher Nutzen“",
  },
  {
    id: "feynman",
    ic: "🧒",
    name: "Feynman-Methode",
    ev: 2,
    tags: ["verstehen"],
    kurz: "Erklär es so, dass es ein 12-Jähriger versteht. Wo du hängst, ist deine Lücke.",
    wie: [
      "Thema wählen.",
      "In einfachen Worten erklären – ohne Fachchinesisch.",
      "Lücken finden und nachlesen.",
      "Vereinfachen, Beispiel ergänzen.",
    ],
    warum:
      "Sich selbst etwas erklären (Self-Explanation) zwingt dich, Zusammenhänge herzustellen, statt nur Wörter zu wiederholen.",
    quelle: "nach Richard Feynman; Self-Explanation: Dunlosky et al. 2013 „mittlerer Nutzen“",
  },
  {
    id: "blurting",
    ic: "🌪️",
    name: "Blurting (Alles rauslassen)",
    ev: 2,
    tags: ["pruefung", "behalten"],
    kurz: "Timer an, alles aufschreiben, was du noch weißt – dann mit dem Stoff vergleichen.",
    wie: [
      "Thema wählen, 3 Minuten Timer.",
      "Ohne nachzusehen alles aufschreiben.",
      "Vergleichen: Was fehlt? Das gezielt wiederholen.",
    ],
    warum:
      "Eine Form des freien Abrufs (Free Recall). Du siehst sofort, was wirklich sitzt – statt dich von „kommt mir bekannt vor“ täuschen zu lassen.",
    quelle: "Free Recall / Testing-Effekt, Roediger & Karpicke 2006",
  },
  {
    id: "interleave",
    ic: "🔀",
    name: "Interleaving (Mischen)",
    ev: 2,
    tags: ["pruefung", "verstehen"],
    kurz: "Themen mischen statt Block für Block – so wie in der Prüfung.",
    wie: [
      "Aufgaben aus mehreren Fächern/Themen mischen.",
      "Bei jeder Aufgabe erst erkennen: Welches Thema ist das?",
      "Dann lösen.",
    ],
    warum:
      "Fühlt sich schwerer an, trainiert aber genau das Unterscheiden, das in Prüfungen gefragt ist.",
    quelle: "Rohrer & Taylor 2007; Dunlosky et al. 2013: „mittlerer Nutzen“",
  },
  {
    id: "warum",
    ic: "❓",
    name: "Elaboration („Warum?“-Fragen)",
    ev: 2,
    tags: ["verstehen"],
    kurz: "Zu jeder Tatsache fragen: Warum ist das so? Wie hängt es mit dem zusammen, was ich schon weiß?",
    wie: [
      "Aussage lesen.",
      "Selbst eine Begründung formulieren.",
      "Mit der Erklärung vergleichen.",
    ],
    warum:
      "Neues wird an Vorwissen angeknüpft – dadurch wird es besser verstanden und leichter wiedergefunden.",
    quelle: "Elaborative Interrogation, Dunlosky et al. 2013: „mittlerer Nutzen“",
  },
  {
    id: "pomodoro",
    ic: "🍅",
    name: "Pomodoro-Technik",
    ev: 1,
    tags: ["konzentration"],
    kurz: "25 Minuten volle Konzentration, dann 5 Minuten echte Pause.",
    wie: [
      "Eine Aufgabe festlegen, Handy weg.",
      "25 Min arbeiten, ohne Unterbrechung.",
      "5 Min Pause – aufstehen, bewegen, ein Minispiel.",
      "Nach 4 Runden längere Pause.",
    ],
    warum:
      "Feste Zeitblöcke senken die Hürde anzufangen und schützen vor Ablenkung. Kurze Pausen beugen Ermüdung vor.",
    quelle: "Francesco Cirillo; Pausen & Aufmerksamkeit: Ariga & Lleras 2011",
  },
  {
    id: "loci",
    ic: "🏰",
    name: "Loci-Methode (Gedächtnispalast)",
    ev: 1,
    tags: ["behalten"],
    kurz: "Begriffe an Orten eines bekannten Wegs „ablegen“ und im Kopf abgehen.",
    wie: [
      "Einen Weg mit festen Orten wählen (z. B. deine Wohnung).",
      "Jedem Begriff einen Ort geben und ein verrücktes Bild ausdenken.",
      "Den Weg im Kopf ablaufen und die Begriffe einsammeln.",
    ],
    warum:
      "Räumliches Gedächtnis ist sehr stark. Gut für Listen und Reihenfolgen (z. B. OSI-Schichten, 5 Sicherheitsregeln).",
    quelle: "Antike Mnemotechnik; Bower 1970; Dresler et al. 2017",
  },
  {
    id: "cornell",
    ic: "📓",
    name: "Cornell-Notizen",
    ev: 1,
    tags: ["verstehen", "texte"],
    kurz: "Seite in drei Bereiche teilen: Notizen, Stichworte/Fragen, Zusammenfassung.",
    wie: [
      "Rechts: Mitschrift im Unterricht.",
      "Links danach: Stichworte und Prüfungsfragen.",
      "Unten: Zusammenfassung in 2–3 Sätzen.",
      "Später: rechte Seite abdecken und mit den Fragen abfragen.",
    ],
    warum: "Verbindet Mitschreiben mit Zusammenfassen und späterem Selbsttest.",
    quelle: "Walter Pauk, Cornell University (1950er)",
  },
  {
    id: "sq3r",
    ic: "📖",
    name: "SQ3R / 5-Schritt-Lesemethode",
    ev: 1,
    tags: ["texte", "verstehen"],
    kurz: "Texte in Schritten erschließen: Überblick, Fragen, Lesen, Wiedergeben, Wiederholen.",
    wie: [
      "Survey: Überblick (Titel, Überschriften).",
      "Question: Fragen an den Text stellen.",
      "Read: genau lesen, sparsam markieren.",
      "Recite: Hauptaussagen in eigenen Worten.",
      "Review: am Ende alles wiederholen.",
    ],
    warum:
      "Aktives Lesen statt Drüberlesen. Die 5-Schritt-Lesemethode aus Deutsch ist eine Variante davon.",
    quelle: "Francis P. Robinson 1946",
  },
  {
    id: "dual",
    ic: "🎨",
    name: "Dual Coding (Bild + Wort)",
    ev: 2,
    tags: ["verstehen", "behalten"],
    kurz: "Zu Begriffen eine Skizze, ein Diagramm oder eine Zeitleiste zeichnen.",
    wie: [
      "Begriff lesen.",
      "Eine einfache Skizze dazu zeichnen (Pfeile, Kästen, Symbole).",
      "Bild und Erklärung zusammen wiederholen.",
    ],
    warum: "Bild und Sprache werden getrennt gespeichert – zwei Wege zum selben Wissen.",
    quelle: "Paivio 1971; Mayer: Multimedia-Lernen",
  },
  {
    id: "mythen",
    ic: "🧯",
    name: "Lern-Mythen & wünschenswerte Erschwernisse",
    ev: 3,
    tags: ["pruefung", "verstehen", "behalten"],
    kurz: "Was sich leicht anfühlt, bringt oft wenig. Teste dein Wissen über Lernmythen.",
    wie: [
      "Anstrengung ist ein gutes Zeichen (Desirable Difficulties).",
      "Nicht zu früh an KI oder Lösungen auslagern (Cognitive Offloading).",
      "Markieren und nochmal lesen fühlen sich gut an, bringen aber wenig.",
    ],
    warum:
      "Unser Gefühl („kann ich schon“) täuscht oft. Abrufen, Verteilen und Mischen sind anstrengender – und genau deshalb wirksamer.",
    quelle: "Bjork 1994; Pashler et al. 2008; Dunlosky et al. 2013",
  },
];
const METH_SIT = [
  ["alle", "Alle"],
  ["pruefung", "🎯 Prüfung bald"],
  ["behalten", "🧲 Behalten"],
  ["verstehen", "💡 Verstehen"],
  ["konzentration", "🔕 Konzentration"],
  ["texte", "📄 Texte lesen"],
];
const LEITNER_DAYS = [0, 1, 2, 4, 8, 16];
let METH = { sit: "alle", open: null, tool: null };

function methState() {
  if (!S.meth || typeof S.meth !== "object" || Array.isArray(S.meth)) S.meth = {};
  const m = S.meth;
  if (!m.leitner || typeof m.leitner !== "object" || Array.isArray(m.leitner)) m.leitner = {};
  if (
    !Array.isArray(m.places) ||
    m.places.length !== 5 ||
    m.places.some((p) => typeof p !== "string")
  )
    m.places = ["Haustür", "Flur", "Küche", "Sofa", "Bett"];
  if (!m.used || typeof m.used !== "object" || Array.isArray(m.used)) m.used = {};
  return m;
}
/* Alle Themen (optional nur solche mit Karten / MC) */
function methTopics(need) {
  const out = [];
  allSubjectIds().forEach((sid) => {
    const s = subjById(sid);
    if (!s) return;
    (s.topics || []).forEach((t) => {
      if (!need || (Array.isArray(t[need]) && t[need].length))
        out.push({ sid, sname: s.name || sid, t });
    });
  });
  return out;
}
function methTopicSelect(id, need, onchange) {
  const list = methTopics(need),
    groups = {};
  list.forEach((x) => {
    (groups[x.sname] = groups[x.sname] || []).push(x);
  });
  const cur = METH.tool && METH.tool.tid;
  return `<select class="fi" id="${id}" onchange="${onchange}">${Object.keys(groups)
    .map(
      (g) =>
        `<optgroup label="${esc(g)}">${groups[g].map((x) => `<option value="${esc(x.t.id)}" ${x.t.id === cur ? "selected" : ""}>${esc(x.t.name)}</option>`).join("")}</optgroup>`,
    )
    .join("")}</select>`;
}
function methFirstTopic(need) {
  const l = methTopics(need);
  return l.length ? l[Math.floor(Math.random() * l.length)].t.id : null;
}
function methStars(n) {
  return `<span class="evstars" title="Wirksamkeit laut Forschung">${"●".repeat(n)}${"○".repeat(3 - n)}</span>`;
}

function renderMethoden() {
  methState();
  if (METH.open) return renderMethod(METH.open);
  const list = METHODS.filter((m) => METH.sit === "alle" || m.tags.includes(METH.sit));
  $("app").innerHTML = `
  <div class="h1">🧪 Lernmethoden</div>
  <p class="mut">Wissenschaftlich untersuchte Techniken – jede mit einem Werkzeug, das direkt deinen Lernstoff benutzt. ${methStars(3)} = sehr gut belegt.</p>
  <div class="methsit">${METH_SIT.map(([k, l]) => `<button class="${METH.sit === k ? "on" : ""}" onclick="METH.sit='${k}';renderMethoden()">${l}</button>`).join("")}</div>
  <div class="methgrid">${list
    .map(
      (m, i) => `
    <button class="methcard" style="--d:${i * 0.035}s" onclick="methOpen('${m.id}')">
      <span class="mic2">${m.ic}</span><b>${esc(m.name)}</b><small>${esc(m.kurz)}</small>
      <span class="methfoot">${methStars(m.ev)}${S.meth.used[m.id] ? `<span class="pill g">${S.meth.used[m.id]}× genutzt</span>` : ""}</span>
    </button>`,
    )
    .join("")}</div>
  <div class="card" style="margin-top:16px"><b>💡 Faustregel</b>
    <p class="small" style="margin:6px 0 0">Am wirksamsten ist die Kombination: <b>dich selbst abfragen</b> + <b>verteilt wiederholen</b> + <b>Themen mischen</b>. Markieren und mehrfach lesen fühlen sich produktiv an, bringen laut Forschung aber am wenigsten.</p></div>`;
}
function methOpen(id) {
  METH.open = id;
  METH.tool = null;
  window.scrollTo(0, 0);
  renderMethoden();
}
function methBack() {
  METH.open = null;
  METH.tool = null;
  renderMethoden();
}
function methUsed(id) {
  const m = methState();
  m.used[id] = (m.used[id] || 0) + 1;
  save();
}

function renderMethod(id) {
  const m = METHODS.find((x) => x.id === id);
  if (!m) {
    METH.open = null;
    return renderMethoden();
  }
  $("app").innerHTML = `
  <button class="btn ghost sm" onclick="methBack()">‹ Alle Methoden</button>
  <div class="methhead"><span>${m.ic}</span><div><div class="h1" style="margin:0">${esc(m.name)}</div>${methStars(m.ev)} <small class="mut">${esc(m.quelle)}</small></div></div>
  <div class="two">
    <div class="card"><b>So geht's</b><ol class="methsteps">${m.wie.map((w) => `<li>${esc(w)}</li>`).join("")}</ol></div>
    <div class="card"><b>Warum es wirkt</b><p class="small" style="line-height:1.6">${esc(m.warum)}</p></div>
  </div>
  <div class="card methtool" id="methTool" style="margin-top:14px"></div>`;
  methTool(id);
}
function methTool(id) {
  const box = $("methTool");
  if (!box) return;
  const fn = {
    recall: toolRecall,
    leitner: toolLeitner,
    feynman: toolFeynman,
    blurting: toolBlurt,
    interleave: toolInterleave,
    warum: toolWarum,
    pomodoro: toolPomodoro,
    loci: toolLoci,
    cornell: toolCornell,
    sq3r: toolSQ3R,
    dual: toolDual,
    mythen: toolMythen,
  }[id];
  if (fn) fn(box);
}
function methPickTopic(sel, id) {
  METH.tool = { tid: $(sel).value };
  methTool(id);
}
function methNeedContent(box) {
  box.innerHTML = `<p class="mut">Für dieses Werkzeug gibt es noch keinen passenden Lernstoff.</p>`;
}

/* ---- 🧠 Active Recall ---- */
function toolRecall(box) {
  const T =
    METH.tool && METH.tool.kind === "recall"
      ? METH.tool
      : (METH.tool = {
          kind: "recall",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          i: 0,
          show: false,
          ok: 0,
          n: 0,
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  if (!T.order) T.order = shuffle(tp.cards.map((_, i) => i));
  if (T.i >= T.order.length) {
    methUsed("recall");
    box.innerHTML = `<b>🎉 Runde fertig!</b><p>${T.ok} von ${T.n} gewusst.</p>${T.ok < T.n ? `<p class="small mut">Die anderen Karten kommen in den Leitner-Kasten – so wiederholst du sie im richtigen Abstand.</p>` : ""}
      <button class="btn" onclick="METH.tool={kind:'recall',tid:METH.tool.tid,i:0,ok:0,n:0};methTool('recall')">Nochmal</button>`;
    return;
  }
  const c = tp.cards[T.order[T.i]];
  box.innerHTML = `<div class="toolhead"><b>🧠 Selbst abfragen</b>${methTopicSelect("rcSel", "cards", "METH.tool={kind:'recall',tid:this.value,i:0,ok:0,n:0};methTool('recall')")}</div>
    <div class="bar" style="margin:10px 0"><i style="width:${Math.round((100 * T.i) / T.order.length)}%"></i></div>
    <div class="recallq">${esc(c.f)}</div>
    ${
      T.show
        ? `<div class="recalla">${esc(c.b)}</div>
      <p class="small mut center">Hattest du es (sinngemäß)?</p>
      <div class="quickbtns"><button class="btn r" onclick="recallRate(false)">✖ Nicht gewusst</button><button class="btn g" onclick="recallRate(true)">✔ Gewusst</button></div>`
        : `<textarea class="ta" id="rcIn" placeholder="Deine Antwort aus dem Kopf … (optional – laut sagen geht auch)"></textarea>
       <button class="btn" style="margin-top:10px;width:100%" onclick="METH.tool.show=true;methTool('recall')">Lösung aufdecken</button>`
    }`;
}
function recallRate(ok) {
  const T = METH.tool,
    tp = topicById(T.tid),
    idx = T.order[T.i];
  T.n++;
  if (ok) {
    T.ok++;
    addXP(2);
  }
  leitnerMove(T.tid + "|" + idx, ok);
  T.i++;
  T.show = false;
  methTool("recall");
}

/* ---- 🗃️ Leitner ---- */
function leitnerMove(key, ok) {
  const L = methState().leitner,
    e = L[key] || { b: 1 };
  e.b = ok ? Math.min(5, e.b + 1) : 1;
  e.d = dayStr(LEITNER_DAYS[e.b]);
  L[key] = e;
  save();
}
function leitnerDue(tid) {
  const L = methState().leitner,
    t = today(),
    tp = topicById(tid);
  if (!tp) return [];
  return tp.cards
    .map((_, i) => i)
    .filter((i) => {
      const e = L[tid + "|" + i];
      return !e || e.d <= t;
    });
}
function toolLeitner(box) {
  const T =
    METH.tool && METH.tool.kind === "leitner"
      ? METH.tool
      : (METH.tool = {
          kind: "leitner",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          show: false,
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  const L = methState().leitner,
    boxes = [0, 0, 0, 0, 0, 0];
  tp.cards.forEach((_, i) => {
    const e = L[T.tid + "|" + i];
    boxes[e ? e.b : 1]++;
  });
  const due = leitnerDue(T.tid);
  if (T.cur == null || !due.includes(T.cur))
    T.cur = due.length ? due[Math.floor(Math.random() * due.length)] : null;
  const c = T.cur != null ? tp.cards[T.cur] : null;
  box.innerHTML = `<div class="toolhead"><b>🗃️ Dein Leitner-Kasten</b>${methTopicSelect("ltSel", "cards", "METH.tool={kind:'leitner',tid:this.value};methTool('leitner')")}</div>
    <div class="leitner">${[1, 2, 3, 4, 5].map((b) => `<div class="lbox ${c && (L[T.tid + "|" + T.cur] || { b: 1 }).b === b ? "cur" : ""}"><b>${boxes[b]}</b><small>Fach ${b}</small><i>${LEITNER_DAYS[b]} T</i></div>`).join("")}</div>
    <p class="small mut">${due.length} Karte${due.length === 1 ? "" : "n"} heute fällig · Fach 5 = sitzt sicher.</p>
    ${
      c
        ? `<div class="recallq">${esc(c.f)}</div>
      ${
        T.show
          ? `<div class="recalla">${esc(c.b)}</div><div class="quickbtns"><button class="btn r" onclick="leitnerRate(false)">✖ Zurück in Fach 1</button><button class="btn g" onclick="leitnerRate(true)">✔ Ein Fach weiter</button></div>`
          : `<button class="btn" style="width:100%" onclick="METH.tool.show=true;methTool('leitner')">Erst überlegen – dann aufdecken</button>`
      }`
        : `<div class="center" style="padding:16px"><span style="font-size:40px">✅</span><p><b>Für heute alles erledigt!</b><br><small class="mut">Morgen kommen die nächsten Karten.</small></p></div>`
    }`;
}
function leitnerRate(ok) {
  const T = METH.tool;
  leitnerMove(T.tid + "|" + T.cur, ok);
  if (ok) addXP(2);
  methUsed("leitner");
  T.cur = null;
  T.show = false;
  methTool("leitner");
}

/* ---- Begriffe eines Themas, für Feynman/Blurting ---- */
function methTerms(tp) {
  const set = new Map();
  (tp.cards || []).forEach((c) => {
    String(c.f)
      .split(/[\/,(]| – | - /)
      .forEach((p) => {
        const w = p.replace(/[)?.:]/g, "").trim();
        if (w.length >= 3 && w.length <= 40 && !set.has(norm(w))) set.set(norm(w), w);
      });
  });
  return [...set.entries()].slice(0, 24);
}
function methCover(text, terms) {
  const n = norm(text);
  return terms.map(([k, w]) => ({
    w,
    hit:
      k.length >= 3 &&
      (n.includes(k) || (k.length > 8 && n.includes(k.slice(0, Math.ceil(k.length * 0.7))))),
  }));
}

/* ---- 🧒 Feynman ---- */
function toolFeynman(box) {
  const T =
    METH.tool && METH.tool.kind === "feynman"
      ? METH.tool
      : (METH.tool = {
          kind: "feynman",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          txt: "",
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  box.innerHTML = `<div class="toolhead"><b>🧒 Erklär's einem 12-Jährigen</b>${methTopicSelect("fySel", "cards", "METH.tool={kind:'feynman',tid:this.value,txt:''};methTool('feynman')")}</div>
    <p class="small mut">Schreib eine Erklärung zu <b>${esc(tp.name)}</b> – einfache Wörter, kurze Sätze, ein Beispiel aus dem Alltag.</p>
    <textarea class="ta" id="fyIn" style="min-height:150px" maxlength="4000" placeholder="Stell dir vor, du erklärst es deinem kleinen Bruder …">${esc(T.txt || "")}</textarea>
    <button class="btn" style="margin-top:10px" onclick="feynmanCheck()">🔍 Lücken finden</button>
    <div id="fyOut"></div>`;
}
function feynmanCheck() {
  const T = METH.tool,
    tp = topicById(T.tid),
    txt = $("fyIn").value;
  T.txt = txt;
  const words = txt.trim().split(/\s+/).filter(Boolean),
    sent = txt.split(/[.!?]+/).filter((s) => s.trim()).length || 1;
  const long = [
    ...new Set(words.filter((w) => w.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length >= 14)),
  ].slice(0, 6);
  const cov = methCover(txt, methTerms(tp)),
    hits = cov.filter((c) => c.hit).length;
  const avg = Math.round(words.length / sent);
  if (words.length >= 25) methUsed("feynman");
  $("fyOut").innerHTML = `<div class="feyres">
    <div class="kpis"><div class="kpi"><small>Wörter</small><b>${words.length}</b></div><div class="kpi"><small>Ø Wörter/Satz</small><b>${avg}</b></div><div class="kpi"><small>Kernbegriffe</small><b>${hits}/${cov.length}</b></div></div>
    ${words.length < 25 ? `<p class="small">✏️ Noch etwas kurz – versuch mindestens 3–4 Sätze.</p>` : ""}
    ${avg > 20 ? `<p class="small">✂️ Deine Sätze sind lang (Ø ${avg} Wörter). Kürzer = verständlicher.</p>` : ""}
    ${long.length ? `<p class="small">🧩 Schwere Wörter – kannst du die einfacher sagen? ${long.map((w) => `<span class="tag">${esc(w)}</span>`).join("")}</p>` : ""}
    <p class="small"><b>Abgedeckt:</b> ${
      cov
        .filter((c) => c.hit)
        .map((c) => `<span class="tag ok">${esc(c.w)}</span>`)
        .join("") || "–"
    }</p>
    <p class="small"><b>Fehlt vielleicht:</b> ${
      cov
        .filter((c) => !c.hit)
        .map((c) => `<span class="tag">${esc(c.w)}</span>`)
        .join("") || "Nichts – stark! 💪"
    }</p>
    <p class="small mut">Lies die fehlenden Punkte nach und erklär nochmal. Das ist der Feynman-Kreislauf.</p></div>`;
}

/* ---- 🌪️ Blurting ---- */
let BLURT_T = null;
function toolBlurt(box) {
  const T =
    METH.tool && METH.tool.kind === "blurt"
      ? METH.tool
      : (METH.tool = {
          kind: "blurt",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          end: 0,
          done: false,
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  const run = T.end > Date.now() && !T.done;
  box.innerHTML = `<div class="toolhead"><b>🌪️ Blurting</b>${run ? "" : methTopicSelect("blSel", "cards", "clearInterval(BLURT_T);METH.tool={kind:'blurt',tid:this.value,end:0};methTool('blurting')")}</div>
    <p class="small mut">Thema: <b>${esc(tp.name)}</b>. Schreib in 3 Minuten alles auf, was dir einfällt – Stichworte reichen. Nicht nachsehen!</p>
    <div class="blurtclock" id="blClock">${run ? mmss(T.end - Date.now()) : "03:00"}</div>
    <textarea class="ta" id="blIn" style="min-height:150px" maxlength="4000" ${T.done ? "disabled" : ""} placeholder="Los geht's …">${esc(T.txt || "")}</textarea>
    <div class="quickbtns">${!run && !T.done ? `<button class="btn" onclick="blurtStart()">▶️ 3 Minuten starten</button>` : ""}${run ? `<button class="btn g" onclick="blurtEnd()">Fertig – vergleichen</button>` : ""}${T.done ? `<button class="btn ghost" onclick="METH.tool={kind:'blurt',tid:METH.tool.tid,end:0};methTool('blurting')">Nochmal</button>` : ""}</div>
    <div id="blOut"></div>`;
  if (T.done) blurtShow();
}
function blurtStart() {
  const T = METH.tool;
  T.end = Date.now() + 180000;
  T.done = false;
  T.txt = "";
  methTool("blurting");
  const i = $("blIn");
  if (i) i.focus();
  clearInterval(BLURT_T);
  BLURT_T = setInterval(() => {
    const c = $("blClock");
    if (!c || METH.tool !== T) {
      clearInterval(BLURT_T);
      return;
    }
    const left = T.end - Date.now();
    c.textContent = mmss(Math.max(0, left));
    if (left <= 0) blurtEnd();
  }, 500);
}
function blurtEnd() {
  clearInterval(BLURT_T);
  const T = METH.tool;
  const i = $("blIn");
  if (i) T.txt = i.value;
  T.done = true;
  methUsed("blurting");
  methTool("blurting");
}
function blurtShow() {
  const T = METH.tool,
    tp = topicById(T.tid),
    cov = methCover(T.txt || "", methTerms(tp)),
    hits = cov.filter((c) => c.hit).length;
  const pct = cov.length ? Math.round((100 * hits) / cov.length) : 0;
  if (pct >= 50) addXP(3);
  $("blOut").innerHTML =
    `<div class="feyres"><b>${pct}% der Kernbegriffe erwischt</b><div class="bar" style="margin:8px 0"><i style="width:${pct}%"></i></div>
    <p class="small"><b>Gewusst:</b> ${
      cov
        .filter((c) => c.hit)
        .map((c) => `<span class="tag ok">${esc(c.w)}</span>`)
        .join("") || "–"
    }</p>
    <p class="small"><b>Nochmal ansehen:</b> ${
      cov
        .filter((c) => !c.hit)
        .map((c) => `<span class="tag">${esc(c.w)}</span>`)
        .join("") || "Nichts 🎉"
    }</p>
    <button class="btn sm" onclick="METH.open='recall';METH.tool={kind:'recall',tid:METH.tool.tid,i:0,ok:0,n:0};renderMethoden()">🧠 Lücken mit Active Recall üben</button></div>`;
}

/* ---- 🔀 Interleaving ---- */
function toolInterleave(box) {
  let T = METH.tool && METH.tool.kind === "mix" ? METH.tool : null;
  if (!T) {
    const bySubj = {};
    methTopics("mc").forEach((x) => {
      (bySubj[x.sid] = bySubj[x.sid] || []).push(x);
    });
    const sids = shuffle(Object.keys(bySubj)),
      items = [];
    for (let r = 0; items.length < 8 && r < 20; r++)
      sids.forEach((sid) => {
        if (items.length >= 8) return;
        const x = bySubj[sid][Math.floor(Math.random() * bySubj[sid].length)];
        const qi = Math.floor(Math.random() * x.t.mc.length);
        items.push({ sname: x.sname, tname: x.t.name, q: x.t.mc[qi] });
      });
    T = METH.tool = { kind: "mix", items: shuffle(items), i: 0, ok: 0, ans: null, guess: null };
  }
  if (!T.items.length) return methNeedContent(box);
  if (T.i >= T.items.length) {
    methUsed("interleave");
    box.innerHTML = `<b>🔀 Gemischte Runde fertig: ${T.ok}/${T.items.length}</b><p class="small mut">Merkst du's? Mischen ist anstrengender – genau das macht es wirksam.</p><button class="btn" onclick="METH.tool=null;methTool('interleave')">Neue Mischung</button>`;
    return;
  }
  const it = T.items[T.i],
    opts = T.opts || (T.opts = shuffle(it.q.c.map((c, i) => ({ c, i }))));
  const subs = T.subs || (T.subs = shuffle([...new Set(T.items.map((x) => x.sname))]));
  box.innerHTML = `<div class="toolhead"><b>🔀 Gemischte Aufgaben</b><span class="pill">${T.i + 1}/${T.items.length}</span></div>
    ${
      T.guess == null
        ? `<p class="small"><b>Schritt 1:</b> Aus welchem Fach ist diese Frage?</p><div class="recallq" style="font-size:16px">${esc(it.q.q)}</div>
      <div class="mixsubs">${subs.map((s) => `<button class="choice" onclick="mixGuess(this.textContent)">${esc(s)}</button>`).join("")}</div>`
        : `<p class="small">${T.guess === it.sname ? "✅ Richtig erkannt" : "↪️ Das war " + esc(it.sname)}: <i>${esc(it.tname)}</i></p>
      <div class="recallq" style="font-size:16px">${esc(it.q.q)}</div>
      ${opts.map((o) => `<button class="opt ${T.ans != null ? (o.i === 0 ? "correct" : o.i === T.ans ? "wrong" : "") : ""}" ${T.ans != null ? "disabled" : ""} onclick="mixAns(${o.i})">${esc(o.c)}</button>`).join("")}
      ${T.ans != null ? `<div class="fb show ${T.ans === 0 ? "ok" : "bad"}">${esc(it.q.w || "")}</div><button class="btn" style="margin-top:10px;width:100%" onclick="mixNext()">Weiter</button>` : ""}`
    }`;
}
function mixGuess(s) {
  METH.tool.guess = s;
  methTool("interleave");
}
function mixAns(i) {
  const T = METH.tool;
  T.ans = i;
  if (i === 0) {
    T.ok++;
    addXP(3);
  }
  methTool("interleave");
}
function mixNext() {
  const T = METH.tool;
  T.i++;
  T.ans = null;
  T.guess = null;
  T.opts = null;
  methTool("interleave");
}

/* ---- ❓ Warum-Fragen ---- */
function toolWarum(box) {
  let T = METH.tool && METH.tool.kind === "warum" ? METH.tool : null;
  if (!T) {
    const l = methTopics("mc").flatMap((x) =>
      x.t.mc.filter((q) => q.w && q.w.length > 30).map((q) => ({ q, tname: x.t.name })),
    );
    T = METH.tool = { kind: "warum", list: shuffle(l).slice(0, 10), i: 0, show: false };
  }
  if (!T.list.length) return methNeedContent(box);
  const it = T.list[T.i % T.list.length];
  box.innerHTML = `<div class="toolhead"><b>❓ Warum ist das so?</b><span class="pill">${esc(it.tname)}</span></div>
    <div class="recallq" style="font-size:16px">${esc(it.q.q)}<br><span style="color:var(--green)">→ ${esc(it.q.c[0])}</span></div>
    <textarea class="ta" placeholder="Begründe in eigenen Worten: Warum stimmt das? Was weißt du schon, das dazu passt?"></textarea>
    ${
      T.show
        ? `<div class="recalla">💡 ${esc(it.q.w)}</div><p class="small mut">Passt deine Begründung? Wenn nicht: Was war der Denkfehler?</p>
      <button class="btn" onclick="METH.tool.i++;METH.tool.show=false;methUsed('warum');methTool('warum')">Nächste Aussage</button>`
        : `<button class="btn" style="margin-top:10px" onclick="METH.tool.show=true;methTool('warum')">Erklärung vergleichen</button>`
    }`;
}

/* ---- 🍅 Pomodoro ---- */
function toolPomodoro(box) {
  const r = S.focus && S.focus.run;
  box.innerHTML = `<b>🍅 Direkt loslegen</b>
    <p class="small mut">${r ? `Dein Timer läuft gerade (${r.mode === "work" ? "Fokus" : "Pause"}).` : "Der Fokus-Timer zählt deine Runden und erinnert dich an die Pause."} In der Pause warten 🎮 Minispiele auf dich.</p>
    <div class="quickbtns"><button class="btn g" onclick="${r ? "" : "focusStart('work');"}methUsed('pomodoro');go('fokus')">${r ? "⏱ Zum Timer" : "▶️ 25-Minuten-Fokus starten"}</button><button class="btn ghost" onclick="go('games')">🎮 Pausen-Spiele</button></div>`;
}

/* ---- 🏰 Loci ---- */
function toolLoci(box) {
  const P = methState().places;
  const T =
    METH.tool && METH.tool.kind === "loci"
      ? METH.tool
      : (METH.tool = {
          kind: "loci",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          step: 0,
          imgs: ["", "", "", "", ""],
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  if (!T.items) T.items = shuffle(tp.cards.map((c) => String(c.f))).slice(0, 5);
  const n = T.items.length;
  if (T.step === 0) {
    box.innerHTML = `<div class="toolhead"><b>🏰 1. Dein Weg</b>${methTopicSelect("lcSel", "cards", "METH.tool={kind:'loci',tid:this.value,step:0,imgs:['','','','','']};methTool('loci')")}</div>
      <p class="small mut">5 Orte auf einem Weg, den du im Schlaf kennst (Wohnung, Schulweg …).</p>
      ${P.map((p, i) => `<input class="fi" maxlength="40" value="${esc(p)}" onchange="methState().places[${i}]=this.value.trim().slice(0,40)||'Ort ${i + 1}';save()">`).join("")}
      <button class="btn" style="margin-top:10px" onclick="METH.tool.step=1;methTool('loci')">Weiter: Begriffe ablegen</button>`;
  } else if (T.step === 1) {
    box.innerHTML = `<b>🏰 2. Begriffe ablegen</b><p class="small mut">Denk dir zu jedem Ort ein verrücktes, lebendiges Bild mit dem Begriff aus – je absurder, desto besser.</p>
      ${T.items.map((it, i) => `<div class="locirow"><span class="locip">📍 ${esc(P[i])}</span><b>${esc(it)}</b><input class="fi" maxlength="160" placeholder="Bild: z. B. ein Ohm-Zeichen blockiert die Haustür …" value="${esc(T.imgs[i])}" oninput="METH.tool.imgs[${i}]=this.value"></div>`).join("")}
      <button class="btn" style="margin-top:10px" onclick="METH.tool.step=2;METH.tool.ans=[];methTool('loci')">Weg ablaufen – testen</button>`;
  } else {
    const done = T.ans.length >= n;
    box.innerHTML = `<b>🏰 3. Weg im Kopf ablaufen</b><p class="small mut">Was liegt an diesem Ort?</p>
      ${T.items.map((it, i) => (i < T.ans.length ? `<div class="locirow"><span class="locip">📍 ${esc(P[i])}</span>${T.ans[i].ok ? "✅" : "❌"} <b>${esc(it)}</b>${T.ans[i].ok ? "" : ` <small class="mut">(du: ${esc(T.ans[i].v || "–")})</small>`}</div>` : "")).join("")}
      ${
        done
          ? `<p><b>${T.ans.filter((a) => a.ok).length}/${n} gefunden.</b></p><button class="btn" onclick="METH.tool={kind:'loci',tid:METH.tool.tid,step:0,imgs:['','','','','']};methTool('loci')">Neue Begriffe</button>`
          : `<div class="locirow"><span class="locip">📍 ${esc(P[T.ans.length])}</span><input class="fi" id="lcIn" maxlength="80" placeholder="Begriff …" onkeydown="if(event.key==='Enter')lociAns()"></div><button class="btn" style="margin-top:8px" onclick="lociAns()">Prüfen</button>`
      }`;
    const i = $("lcIn");
    if (i) i.focus();
  }
}
function lociAns() {
  const T = METH.tool,
    v = $("lcIn").value,
    want = T.items[T.ans.length];
  const nv = norm(v),
    nw = norm(want);
  const ok = !!nv && (nv === nw || freeMatch(nv, nw) || (nv.length >= 4 && nw.includes(nv)));
  T.ans.push({ v, ok });
  if (ok) addXP(2);
  if (T.ans.length >= T.items.length) methUsed("loci");
  methTool("loci");
}

/* ---- 📓 Cornell ---- */
function toolCornell(box) {
  const T =
    METH.tool && METH.tool.kind === "cornell"
      ? METH.tool
      : (METH.tool = { kind: "cornell", title: "", cue: "", notes: "", sum: "" });
  box.innerHTML = `<b>📓 Cornell-Vorlage</b>
    <input class="fi" maxlength="120" placeholder="Thema / Stunde" value="${esc(T.title)}" oninput="METH.tool.title=this.value">
    <div class="cornell">
      <div><label class="fl">❓ Stichworte & Fragen</label><textarea class="ta" maxlength="2000" oninput="METH.tool.cue=this.value" placeholder="Was könnte gefragt werden?">${esc(T.cue)}</textarea></div>
      <div><label class="fl">✍️ Notizen</label><textarea class="ta" maxlength="6000" oninput="METH.tool.notes=this.value" placeholder="Mitschrift …">${esc(T.notes)}</textarea></div>
    </div>
    <label class="fl">🧾 Zusammenfassung (2–3 Sätze)</label><textarea class="ta" maxlength="1000" oninput="METH.tool.sum=this.value">${esc(T.sum)}</textarea>
    <button class="btn" style="margin-top:10px" onclick="cornellSave()">📝 In Notizen speichern</button>`;
}
function cornellSave() {
  const T = METH.tool;
  if (!(T.notes || "").trim() && !(T.cue || "").trim()) {
    toast("Schreib erst etwas in die Vorlage");
    return;
  }
  if (!Array.isArray(S.notes)) S.notes = [];
  const body = `❓ STICHWORTE & FRAGEN\n${T.cue.trim()}\n\n✍️ NOTIZEN\n${T.notes.trim()}\n\n🧾 ZUSAMMENFASSUNG\n${T.sum.trim()}`;
  S.notes.unshift({
    id: "n" + Date.now(),
    title: (T.title.trim() || "Cornell-Notiz").slice(0, 120),
    body: body.slice(0, 9000),
    subj: "",
    upd: Date.now(),
  });
  methUsed("cornell");
  save();
  toast("In Notizen gespeichert ✓");
  METH.tool = null;
  methTool("cornell");
}

/* ---- 📖 SQ3R ---- */
const SQ3R_STEPS = [
  [
    "S",
    "Survey – Überblick",
    "Titel, Überschriften, Bilder, ersten und letzten Absatz überfliegen. Worum geht's vermutlich?",
  ],
  ["Q", "Question – Fragen", "Schreib 2–3 Fragen auf, die der Text beantworten soll."],
  [
    "R",
    "Read – Lesen",
    "Genau lesen, Absatz für Absatz. Sparsam markieren, unbekannte Wörter klären.",
  ],
  ["R", "Recite – Wiedergeben", "Buch zu! Beantworte deine Fragen in eigenen Worten."],
  [
    "R",
    "Review – Wiederholen",
    "Alles nochmal überfliegen und die Hauptaussagen in max. 5 Sätzen festhalten.",
  ],
];
function toolSQ3R(box) {
  const T =
    METH.tool && METH.tool.kind === "sq3r"
      ? METH.tool
      : (METH.tool = { kind: "sq3r", step: 0, txt: ["", "", "", "", ""] });
  box.innerHTML = `<b>📖 Geführtes Lesen</b><div class="sqsteps">${SQ3R_STEPS.map((s, i) => `<button class="${i === T.step ? "on" : ""} ${i < T.step ? "done" : ""}" onclick="METH.tool.step=${i};methTool('sq3r')">${s[0]}</button>`).join("")}</div>
    <div class="sqbody"><b>${esc(SQ3R_STEPS[T.step][1])}</b><p class="small">${esc(SQ3R_STEPS[T.step][2])}</p>
    <textarea class="ta" maxlength="3000" oninput="METH.tool.txt[${T.step}]=this.value" placeholder="Deine Notizen zu diesem Schritt …">${esc(T.txt[T.step])}</textarea></div>
    <div class="quickbtns">${T.step > 0 ? `<button class="btn ghost" onclick="METH.tool.step--;methTool('sq3r')">Zurück</button>` : ""}
    ${T.step < 4 ? `<button class="btn" onclick="METH.tool.step++;methTool('sq3r')">Weiter</button>` : `<button class="btn g" onclick="sq3rDone()">✅ Fertig – in Notizen</button>`}</div>`;
}
function sq3rDone() {
  const T = METH.tool;
  if (!Array.isArray(S.notes)) S.notes = [];
  const body = SQ3R_STEPS.map((s, i) => `${s[1].toUpperCase()}\n${(T.txt[i] || "").trim()}`).join(
    "\n\n",
  );
  S.notes.unshift({
    id: "n" + Date.now(),
    title: "Lesenotiz (SQ3R)",
    body: body.slice(0, 9000),
    subj: "",
    upd: Date.now(),
  });
  methUsed("sq3r");
  save();
  addXP(3);
  toast("Lesenotiz gespeichert ✓");
  METH.tool = null;
  methTool("sq3r");
}

/* ---- 🎨 Dual Coding: Skizzenblock ---- */
function toolDual(box) {
  const T =
    METH.tool && METH.tool.kind === "dual"
      ? METH.tool
      : (METH.tool = {
          kind: "dual",
          tid: (METH.tool && METH.tool.tid) || methFirstTopic("cards"),
          i: 0,
        });
  const tp = topicById(T.tid);
  if (!tp) return methNeedContent(box);
  const c = tp.cards[T.i % tp.cards.length];
  box.innerHTML = `<div class="toolhead"><b>🎨 Skizze zum Begriff</b>${methTopicSelect("dcSel", "cards", "METH.tool={kind:'dual',tid:this.value,i:0};methTool('dual')")}</div>
    <div class="recallq" style="font-size:17px">${esc(c.f)}</div><p class="small mut center">${esc(c.b)}</p>
    <div class="dualpad"><canvas id="dcCv" width="700" height="360" aria-label="Zeichenfläche"></canvas></div>
    <div class="quickbtns"><button class="btn ghost" onclick="dualClear()">🧽 Löschen</button><button class="btn" onclick="METH.tool.i++;methUsed('dual');methTool('dual')">Nächster Begriff ›</button></div>`;
  dualInit();
}
function dualInit() {
  const cv = $("dcCv");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--pri") || "#7c5cff";
  let draw = false;
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * cv.width) / r.width,
      ((e.clientY - r.top) * cv.height) / r.height,
    ];
  };
  cv.onpointerdown = (e) => {
    draw = true;
    cv.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  cv.onpointermove = (e) => {
    if (!draw) return;
    const [x, y] = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  cv.onpointerup = cv.onpointercancel = () => {
    draw = false;
  };
}
function dualClear() {
  const cv = $("dcCv");
  if (cv) cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
}

/* ---- 🧯 Mythen-Check ---- */
const MYTHS = [
  [
    "Markieren mit Textmarker ist eine der wirksamsten Lernmethoden.",
    false,
    "Markieren hat laut großer Übersichtsstudie nur geringen Nutzen – es fühlt sich nur produktiv an.",
  ],
  [
    "Sich selbst abzufragen bringt mehr als den Stoff nochmal zu lesen.",
    true,
    "Testing-Effekt: Abrufen stärkt das Gedächtnis deutlich mehr als Wiederlesen.",
  ],
  [
    "Wer seinen „Lerntyp“ (visuell, auditiv …) kennt und nur so lernt, lernt besser.",
    false,
    "Dafür gibt es keinen Beleg. Besser: Inhalte passend zum Stoff darstellen, z. B. Bild + Wort (Dual Coding).",
  ],
  [
    "Viermal 30 Minuten verteilt bringt mehr als 2 Stunden am Stück.",
    true,
    "Spacing-Effekt: verteilt gelernt bleibt länger hängen.",
  ],
  [
    "Wenn sich Lernen leicht anfühlt, lerne ich besonders effektiv.",
    false,
    "Oft ist es umgekehrt: Wünschenswerte Erschwernisse (Abrufen, Mischen) fühlen sich schwer an, wirken aber besser.",
  ],
  [
    "Musik mit Text und Handy-Benachrichtigungen stören das Lernen kaum.",
    false,
    "Multitasking kostet Aufmerksamkeit – jede Unterbrechung macht das Wiedereinsteigen teuer.",
  ],
  [
    "Wer die KI sofort die Aufgabe lösen lässt, lernt dabei genauso viel.",
    false,
    "Cognitive Offloading: Wenn das Denken ausgelagert wird, fällt der Lernprozess weg. Erst selbst versuchen, dann KI zum Prüfen.",
  ],
  [
    "Schlaf nach dem Lernen hilft beim Behalten.",
    true,
    "Im Schlaf wird Gelerntes gefestigt (Gedächtniskonsolidierung).",
  ],
  [
    "Themen zu mischen (Interleaving) ist anfangs schwerer, aber in Prüfungen hilfreich.",
    true,
    "Man übt zu erkennen, welche Methode gerade gefragt ist.",
  ],
];
function toolMythen(box) {
  const T =
    METH.tool && METH.tool.kind === "myth"
      ? METH.tool
      : (METH.tool = {
          kind: "myth",
          order: shuffle(MYTHS.map((_, i) => i)),
          i: 0,
          ok: 0,
          ans: null,
        });
  if (T.i >= T.order.length) {
    methUsed("mythen");
    box.innerHTML = `<b>🧯 ${T.ok}/${T.order.length} richtig!</b><p class="small mut">${T.ok >= 7 ? "Du bist ein Lern-Profi." : "Jetzt weißt du, welche Methoden sich lohnen."}</p><button class="btn" onclick="METH.tool=null;methTool('mythen')">Nochmal</button>`;
    return;
  }
  const m = MYTHS[T.order[T.i]];
  box.innerHTML = `<div class="toolhead"><b>🧯 Mythos oder Fakt?</b><span class="pill">${T.i + 1}/${T.order.length}</span></div>
    <div class="recallq" style="font-size:17px">„${esc(m[0])}“</div>
    ${
      T.ans == null
        ? `<div class="quickbtns"><button class="btn r" onclick="mythAns(false)">🙅 Mythos</button><button class="btn g" onclick="mythAns(true)">✅ Fakt</button></div>`
        : `<div class="fb show ${T.ans === m[1] ? "ok" : "bad"}">${T.ans === m[1] ? "Richtig! " : "Nicht ganz. "}${m[1] ? "Fakt" : "Mythos"}: ${esc(m[2])}</div><button class="btn" style="margin-top:10px;width:100%" onclick="METH.tool.i++;METH.tool.ans=null;methTool('mythen')">Weiter</button>`
    }`;
}
function mythAns(v) {
  const T = METH.tool,
    m = MYTHS[T.order[T.i]];
  T.ans = v;
  if (v === m[1]) {
    T.ok++;
    addXP(1);
  }
  methTool("mythen");
}
