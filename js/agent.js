/* KI-Agent im Browser: eigene KI wählen (Key bleibt im Browser) und ein Agent, der selbst Aufgaben anlegt – ohne OpenCode.
   Alle Anbieter sprechen das OpenAI-Format und erlauben Aufrufe direkt aus dem Browser (CORS). */
const KI_PROVIDERS = [
  { id: "hub", name: "Lernhub-KI (kostenlos, ohne Key)" },
  {
    id: "gemini",
    name: "Google Gemini",
    note: "kostenloser Key mit Google-Konto",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.5-flash",
    key: "https://aistudio.google.com/apikey",
    ph: "AIza…",
  },
  {
    id: "groq",
    name: "Groq",
    note: "kostenloser Key, sehr schnell",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "openai/gpt-oss-120b",
    key: "https://console.groq.com/keys",
    ph: "gsk_…",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    note: "viele Modelle, einige kostenlos",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "openai/gpt-4o-mini",
    key: "https://openrouter.ai/keys",
    ph: "sk-or-…",
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    note: "kostenpflichtig",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    key: "https://platform.openai.com/api-keys",
    ph: "sk-…",
  },
  {
    id: "mistral",
    name: "Mistral",
    note: "aus Europa, kostenloser Testzugang",
    url: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    key: "https://console.mistral.ai/api-keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    note: "günstig",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    key: "https://platform.deepseek.com/api_keys",
    ph: "sk-…",
  },
  {
    id: "nvidia",
    name: "NVIDIA (build.nvidia.com)",
    note: "kostenloser Key mit NVIDIA-Konto · läuft über den Lernhub-Server oder die Bridge auf deinem PC, weil NVIDIA keine direkten Browser-Anfragen erlaubt",
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: "mistralai/mistral-large-4-1t-a52b",
    key: "https://build.nvidia.com/settings/api-keys",
    ph: "nvapi-…",
    relay: true,
    models: [
      "mistralai/mistral-large-4-1t-a52b",
      "moonshotai/kimi-k3.1-pro",
      "nvidia/nemotron-3-ultra-550b-a55b",
      "nvidia/nemotron-3.5-lightning-30b-a3b",
      "z-ai/glm-5.3-flash",
      "minimaxai/minimax-m3.1-flash",
      "google/gemma-3-12b-it",
    ],
  },
  {
    id: "ollama",
    name: "Ollama (auf deinem PC, ohne Key)",
    note: "läuft offline auf deinem Rechner",
    url: "http://localhost:11434/v1/chat/completions",
    model: "llama3.1",
    key: "https://ollama.com/download",
    nokey: true,
  },
  { id: "custom", name: "Eigener Endpunkt", note: "jede OpenAI-kompatible API" },
];
let KI_MODELS = [];

function kiProv() {
  const id = S.chat.provider;
  return (
    KI_PROVIDERS.find((p) => p.id === id) ||
    (S.chat.apiKey
      ? KI_PROVIDERS.find((p) => p.url === S.chat.endpoint) ||
        KI_PROVIDERS.find((p) => p.id === "custom")
      : KI_PROVIDERS[0])
  );
}
/* Key/Modell des aktuellen Anbieters merken – so bleiben alle eingerichteten KIs als Ersatz verfügbar */
function kiStash() {
  const cur = kiProv().id;
  if (cur === "hub") return;
  if (!S.chat.keys) S.chat.keys = {};
  if (S.chat.apiKey || cur === "ollama")
    S.chat.keys[cur] = { key: S.chat.apiKey, model: S.chat.model, endpoint: S.chat.endpoint };
  else delete S.chat.keys[cur];
}
function kiSetProvider(id) {
  const p = KI_PROVIDERS.find((x) => x.id === id);
  if (!p) return;
  kiStash();
  const k = (S.chat.keys || {})[id];
  S.chat.provider = id;
  S.chat.apiKey = (k && k.key) || "";
  if (id !== "hub") {
    S.chat.endpoint = p.url || (k && k.endpoint) || "";
    S.chat.model = (k && k.model) || p.model || "";
  }
  KI_MODELS = p.models ? [...p.models] : [];
  save();
  render();
}
function kiStatusText() {
  const oc = window.agentOn && agentOn() ? "<br>🖥️ OpenCode-Bridge auf diesem PC verbunden" : "";
  if (kiOwn())
    return `🔑 <b>Deine KI:</b> ${esc(kiProv().name)} · <span class="kbd">${esc(S.chat.model || "?")}</span>${oc}`;
  if (hubAI())
    return `✨ <b>Lernhub-KI</b> · kostenlos mit Tageslimit${CLOUD ? "" : " (mit Konto mehr)"}${oc}`;
  return `⛔ <b>Keine KI eingerichtet</b> – wähle einen Anbieter und trag deinen Key ein${oc}`;
}
function kiStatPaint() {
  const el = document.getElementById("kiStat");
  if (el) el.innerHTML = kiStatusText();
  renderTop();
}
function kiSetKey(v) {
  S.chat.apiKey = String(v || "").trim().slice(0, 300);
  kiStash();
  save();
  kiStatPaint();
}
function kiSetField(k, v) {
  v = String(v || "").trim().slice(0, 300);
  if (k === "endpoint" && v && !kiEndpointOk(v)) {
    toast("Der Endpunkt muss mit https:// beginnen (http nur für localhost)");
    return render();
  }
  S.chat[k] = v;
  kiStash();
  save();
  kiStatPaint();
}
function kiOff() {
  if (S.chat.keys) delete S.chat.keys[kiProv().id];
  S.chat.apiKey = "";
  S.chat.provider = "hub";
  save();
  render();
  toast(hubAI() ? "Key gelöscht – jetzt arbeitet die Lernhub-KI" : "Key gelöscht");
}

/* Anbieter-Auswahl, Key, Modell – in den Einstellungen und im Agent-Panel */
function kiKeyFormHTML() {
  const p = kiProv();
  const own = p.id !== "hub";
  const opts = KI_PROVIDERS.map(
    (x) => `<option value="${x.id}" ${x.id === p.id ? "selected" : ""}>${esc(x.name)}</option>`,
  ).join("");
  let html = `<label class="fl">Anbieter</label><select class="fi" onchange="kiSetProvider(this.value)">${opts}</select>`;
  if (!own)
    return (
      html +
      `<p class="small mut">${cloudCfg() ? "Kostenlos und ohne Einrichtung. Für mehr Anfragen oder ein stärkeres Modell kannst du oben deinen eigenen Anbieter wählen." : "Die Lernhub-KI ist in dieser Version nicht eingerichtet – wähle oben einen Anbieter und trag deinen eigenen Key ein."}</p>`
    );
  if (p.key)
    html += `<p class="small mut">${esc(p.note)} · <a href="${p.key}" target="_blank" rel="noopener noreferrer">${p.nokey ? "Ollama herunterladen" : "Key holen"} ↗</a></p>`;
  if (p.nokey)
    html += `<p class="small mut">Ollama starten und ein Modell laden (z. B. <span class="kbd">ollama pull llama3.1</span>). Für die Online-Version einmal <span class="kbd">setx OLLAMA_ORIGINS ${esc(location.origin)}</span> ausführen und Ollama neu starten.</p>`;
  else
    html += `<label class="fl">API-Key (bleibt nur in diesem Browser)</label><input class="fi" type="password" autocomplete="off" spellcheck="false" value="${esc(S.chat.apiKey)}" placeholder="${esc(p.ph || "Key einfügen")}" onchange="kiSetKey(this.value)">`;
  if (p.id === "custom")
    html += `<label class="fl">Endpunkt (URL)</label><input class="fi" value="${esc(S.chat.endpoint)}" placeholder="https://…/v1/chat/completions" onchange="kiSetField('endpoint',this.value)">`;
  html += `<label class="fl">Modell</label><input class="fi" list="kiModels" value="${esc(S.chat.model)}" onchange="kiSetField('model',this.value)">
    <datalist id="kiModels">${(KI_MODELS.length ? KI_MODELS : p.models || []).map((m) => `<option value="${esc(m)}">`).join("")}</datalist>
    <div class="center" style="margin-top:10px"><button class="btn sm" onclick="kiTest()">Verbindung testen</button>
    <button class="btn ghost sm" onclick="kiOff()">Key löschen &amp; Lernhub-KI nutzen</button></div>`;
  return html;
}
function kiCardHTML() {
  const chain = kiChain();
  const backup = chain.length > 1
    ? `<p class="small mut">🛡️ Fällt eine KI aus, springt automatisch die nächste ein: ${chain.map((c) => esc(kiName(c.id))).join(" → ")}</p>`
    : `<p class="small mut">🛡️ Tipp: Richte zwei Anbieter ein (oben wechseln, Key eintragen) – fällt einer aus, springt der andere automatisch ein.</p>`;
  return `<div class="card" style="margin-top:14px">
    <b>🔑 Welche KI arbeitet?</b>
    <p id="kiStat" style="margin:6px 0 2px">${kiStatusText()}</p>
    ${kiKeyFormHTML()}
    ${backup}
    <p class="small mut">Jeder kann seinen eigenen Key nutzen. Er bleibt nur in diesem Browser, kommt nie in die Cloud oder ins Backup und geht direkt an den gewählten Anbieter (NVIDIA: über den Lernhub-Server bzw. die Bridge auf deinem PC weitergereicht, nirgends gespeichert).</p></div>`;
}
async function kiTest() {
  if (!aiReady()) return toast("Erst einen Key eintragen");
  toast("⏳ Teste die Verbindung …", 15000);
  const j = await aiPost({ messages: [{ role: "user", content: "Sag nur: ok" }], max_tokens: 40 }, { only: true });
  if (!j || !j.choices)
    return toast(
      "Fehler: " + String((j && j.error && j.error.message) || "Antwort unbekannt").slice(0, 200) + (kiProv().nokey ? " – läuft Ollama?" : ""),
      6000,
    );
  toast(hubAI() ? "Lernhub-KI funktioniert ✓" : "Deine KI funktioniert ✓");
  if (kiOwn()) kiLoadModels();
}
/* Modellnamen ändern sich oft – deshalb die Liste direkt beim Anbieter holen */
async function kiLoadModels() {
  if (kiProv().relay) return;
  const u = S.chat.endpoint.replace(/\/chat\/completions\/?$/, "/models");
  if (u === S.chat.endpoint || !kiEndpointOk(u)) return;
  try {
    const r = await fetch(u, {
      headers: S.chat.apiKey ? { Authorization: "Bearer " + S.chat.apiKey } : {},
    });
    const j = await r.json();
    const ids = (Array.isArray(j.data) ? j.data : [])
      .map((m) => String((m && m.id) || "").replace(/^models\//, ""))
      .filter((x) => x && x.length < 120);
    KI_MODELS = [...new Set(ids)].sort().slice(0, 300);
    const dl = document.getElementById("kiModels");
    if (dl) dl.innerHTML = KI_MODELS.map((m) => `<option value="${esc(m)}">`).join("");
  } catch (e) {}
}

/* ---------- Lern-Agent: liest den Lernstand, plant selbst und legt Aufgaben an ---------- */
const AG_MAX = 3;
const AG_KI = { wish: "", doc: null, log: [], made: [], done: "" };
const AG_IDEAS = [
  ["🔍", "Meine Schwächen üben", "Finde meine größten Schwächen und erstelle passende Übungen dazu."],
  ["🎯", "Prüfung vorbereiten", "Bereite mich auf meine nächsten Tests und Prüfungen vor: prüfungsnahe Aufgaben zu den wichtigsten Themen."],
  ["📈", "Mehr zum aktuellen Stoff", "Erstelle neue, etwas schwerere Übungen zu den Themen, an denen ich gerade arbeite."],
  ["🔁", "Gemischte Wiederholung", "Erstelle gemischte Wiederholungsaufgaben zu Themen, die ich schon abgeschlossen habe."],
];

function kiLernstand() {
  const desc = window.schoolDesc && schoolDesc();
  const lines = [`Schule: ${S.profile.school}, Klasse ${S.profile.klasse}${desc ? ", " + desc : ""}`, "Fächer:"];
  const due = {};
  S.review.forEach((r) => {
    due[r.tid] = (due[r.tid] || 0) + (r.fails || 1);
  });
  const weak = [];
  allSubjectIds().forEach((id) => {
    const s = subjById(id);
    if (!s || !Array.isArray(s.topics) || !s.topics.length) return;
    const done = s.topics.filter((t, i) => topicState(id, i) === "done").length;
    lines.push(`- ${s.name}: ${done}/${s.topics.length} Themen fertig, aktuell „${nextLessonFor(id).name}“`);
    s.topics.forEach((t) => {
      const w = Object.values((S.progress[t.id] || {}).wrong || {}).reduce((a, b) => a + (+b || 0), 0) + (due[t.id] || 0);
      if (w) weak.push([w, s.name, t.name]);
    });
  });
  weak.sort((a, b) => b[0] - a[0]);
  lines.push(
    weak.length
      ? "Schwächen (Anzahl Fehler):\n" + weak.slice(0, 8).map((w) => `- ${w[1]} › ${w[2]}: ${w[0]}`).join("\n")
      : "Schwächen: noch keine Fehler gespeichert.",
  );
  const t = today();
  const term = (typeof EXT_TERMINE !== "undefined" ? EXT_TERMINE : []).filter((x) => x.datum >= t).slice(0, 5);
  if (term.length) lines.push("Anstehende Termine:\n" + term.map((x) => `- ${x.datum}: ${x.titel}${x.fach ? " (" + x.fach + ")" : ""}`).join("\n"));
  return lines.join("\n").slice(0, 3500);
}

async function kiAgent(goal) {
  if (!aiReady()) return toast("Wähle oben eine KI – kostenlos die Lernhub-KI oder deinen eigenen Key");
  if (AGENT_BUSY) return toast("Moment – die KI arbeitet noch …");
  AGENT_BUSY = true;
  Object.assign(AG_KI, { log: [], made: [], done: "" });
  const step = (t) => {
    AG_KI.log.push(t);
    agKiPaint();
  };
  loadOn("ai", "🤖 Der Agent arbeitet …", activeChar().id);
  const sys = `Du bist der Lern-Agent der Lern-App Lernhub und arbeitest selbstständig. Vorgehen: Lies den Lernstand, entscheide, welche Themen dem Lernenden jetzt am meisten helfen (zuerst der Auftrag, sonst Schwächen, aktuelle Themen und anstehende Prüfungen), und rufe für jedes Thema einmal das Tool aufgaben_anlegen auf – ein Aufruf pro Antwort, höchstens ${AG_MAX} Themen. Nimm als fach den passenden Fachnamen aus dem Lernstand. Wenn du fertig bist, antworte ohne Tool in 2–3 Sätzen: was du angelegt hast und warum. ${KI_TASK_RULE}`;
  let user = `Lernstand:\n${kiLernstand()}\n\nAuftrag: ${goal}`;
  if (AG_KI.doc) user += docBlock(AG_KI.doc, 13000 - sys.length - user.length);
  const msgs = [
    { role: "system", content: sys },
    { role: "user", content: user },
  ];
  step("🔎 Lernstand gelesen – der Agent plant …");
  for (let i = 0; i <= AG_MAX; i++) {
    let j;
    try {
      j = await aiPost({ messages: msgs, max_tokens: 3500, tools: i < AG_MAX ? [KI_TOOLS[0]] : undefined });
    } catch (e) {
      j = { error: { message: e.message } };
    }
    const m = (j && j.choices && j.choices[0] && j.choices[0].message) || {};
    const call = (m.tool_calls || []).find((x) => x && x.function && x.function.name === "aufgaben_anlegen");
    if (!call) {
      AG_KI.done =
        String(m.content || "").trim().slice(0, 1200) ||
        (j && j.error ? "⚠️ " + String(j.error.message || "").slice(0, 200) : "");
      break;
    }
    let thema = "";
    try {
      thema = String(JSON.parse(call.function.arguments).thema || "").slice(0, 80);
    } catch (e) {}
    const res = kiAddTopic(call.function.arguments);
    if (res.startsWith("✅") && KI_NEW) AG_KI.made.push({ sid: KI_NEW.sid, tid: KI_NEW.tid, name: thema || "Neues Thema" });
    step(res);
    msgs.push({ role: "assistant", content: `Ich habe Aufgaben zu „${thema}“ angelegt.` });
    msgs.push({
      role: "user",
      content: `Ergebnis: ${res}\n${i + 1 < AG_MAX ? "Leg das nächste Thema an – oder, wenn das reicht, fasse ohne Tool kurz zusammen." : "Das reicht. Fasse jetzt ohne Tool kurz zusammen."}`,
    });
  }
  if (!AG_KI.done && AG_KI.made.length) AG_KI.done = `Fertig: ${AG_KI.made.length} neue Themen angelegt.`;
  if (!AG_KI.done) AG_KI.done = "⚠️ Der Agent hat nichts angelegt – formulier den Auftrag etwas genauer und versuch's nochmal.";
  AGENT_BUSY = false;
  loadOff("ai");
  agKiPaint();
  if (AG_KI.made.length) toast(`🤖 ${AG_KI.made.length} neue Themen sind da`);
}
function agKiRunHTML() {
  if (!AG_KI.log.length && !AG_KI.done) return "";
  const rows = AG_KI.log.map((t) => `<div class="small" style="margin:4px 0">${esc(t)}</div>`).join("");
  const play = AG_KI.made
    .map((m, i) => `<button class="btn g sm" onclick="agKiPlay(${i})">▶️ ${esc(m.name)}</button>`)
    .join(" ");
  return `<hr class="sep">${rows}${AG_KI.done ? `<p style="margin:8px 0">${esc(AG_KI.done)}</p>` : `<p class="small mut">⏳ arbeitet …</p>`}${play ? `<div class="center">${play}</div>` : ""}`;
}
function agKiPaint() {
  const el = document.getElementById("agKiRun");
  if (el) el.innerHTML = agKiRunHTML();
}
function agKiPlay(i) {
  const m = AG_KI.made[i];
  if (m && subjById(m.sid)) startLesson(m.sid, m.tid);
}
function agentKiHTML() {
  const d = AG_KI.doc;
  const ideas = AG_IDEAS.map(
    (x, i) => `<button class="btn ghost sm" onclick="agKiGo(${i})">${x[0]} ${esc(x[1])}</button>`,
  ).join(" ");
  return `<div class="card" style="margin-top:14px;border-color:var(--pri)">
    <b>🤖 Lern-Agent</b> <small class="mut">· läuft im Browser, auch am Handy – ohne OpenCode</small>
    <p class="small mut">Der Agent liest deinen Lernstand (Fächer, Fehler, Termine), entscheidet selbst, was dir fehlt, und legt bis zu ${AG_MAX} neue Themen mit Aufgaben an.</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${ideas}</div>
    <label class="fl">Oder eigener Auftrag</label><textarea class="ta" id="akWish" maxlength="600" placeholder="z. B. „Mach mir schwere Aufgaben zu Bruchrechnung“ oder „Aufgaben zur angehängten Mitschrift“">${esc(AG_KI.wish)}</textarea>
    <div class="center" style="margin-top:10px">
      <button class="btn ghost sm" onclick="$('akFile').click()">📎 ${d ? esc(d.name) : "Datei als Grundlage (optional)"}</button>${d ? ` <button class="btn ghost sm" onclick="AG_KI.doc=null;renderAgent()" title="Datei entfernen" aria-label="Datei entfernen">✕</button>` : ""}
      <input type="file" id="akFile" hidden accept="${DOC_ACCEPT}" onchange="agKiFile(this)">
      <button class="btn" onclick="agKiGo()">🤖 Agent starten</button></div>
    <div id="agKiRun">${agKiRunHTML()}</div>
    <p class="small mut">Neue Themen landen als eigenes Fach für <b>${esc(S.profile.school)}</b>${CLOUD ? " – mit deinem Konto auch in der Cloud" : ""}. Datei: PDF, Word, PowerPoint, Text oder Foto.</p></div>`;
}
async function agKiFile(inp) {
  const f = inp.files && inp.files[0];
  inp.value = "";
  if (!f) return;
  if (DOC_BUSY) return toast("Moment – die Datei wird noch gelesen …");
  DOC_BUSY = true;
  toast("⏳ " + f.name + " wird gelesen …", 60000);
  try {
    AG_KI.doc = await docRead(f, (s) => toast("⏳ " + s, 60000));
    toast("📎 " + AG_KI.doc.name + " ist bereit");
  } catch (e) {
    toast("⚠️ " + e.message, 4500);
  }
  DOC_BUSY = false;
  if (V.view === "agent") renderAgent();
}
async function agKiGo(i) {
  const w = document.getElementById("akWish");
  const wish = ((w && w.value) || "").trim().slice(0, 600);
  AG_KI.wish = wish;
  const idea = AG_IDEAS[i];
  const goal = idea ? idea[2] + (wish ? " Zusätzlich: " + wish : "") : wish;
  if (!goal && !AG_KI.doc) return toast("Schreib einen Auftrag, häng eine Datei an oder tipp eine Idee an");
  await kiAgent(goal || "Erstelle Übungen zum Inhalt der angehängten Datei.");
  if (AG_KI.made.length) {
    AG_KI.wish = "";
    AG_KI.doc = null;
    if (V.view === "agent" && !typingNow()) renderAgent();
  }
}
