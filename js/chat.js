/* =========================================================================
   js/chat.js – 💬 Chat mit Freunden und dem Klassenchat.
   Läuft über die Supabase-Funktionen chat_* aus supabase/schema.sql.
   Nachrichten werden nur escaped angezeigt; Lesestand liegt lokal in S.chatRead.
   ========================================================================= */
let DMC = {
  peer: undefined,
  ov: null,
  msgs: [],
  last: 0,
  timer: 0,
  bg: 0,
  busy: false,
  err: "",
  sending: false,
  at: 0,
};
/* peer: undefined = Übersicht, null = Klassenchat, "Nick" = Direktnachricht */

function chatReadState() {
  if (!S.chatRead || typeof S.chatRead !== "object" || Array.isArray(S.chatRead)) S.chatRead = {};
  return S.chatRead;
}
function chatKey(peer) {
  return peer === null ? "class" : "u:" + String(peer).toLowerCase();
}
function chatReady() {
  return (
    typeof CLOUD !== "undefined" &&
    CLOUD &&
    CLOUD.nick &&
    typeof cloudCfg === "function" &&
    cloudCfg()
  );
}
function chatUnread() {
  if (!DMC.ov || !chatReady()) return 0;
  const r = chatReadState();
  let n = 0;
  const c = DMC.ov.class;
  if (c && c.last && !c.last.mine && c.last.id > (r["class"] || 0)) n++;
  (DMC.ov.friends || []).forEach((f) => {
    if (f.last_id && !f.mine && f.last_id > (r[chatKey(f.nickname)] || 0)) n++;
  });
  return n;
}
function chatTime(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return "";
  const hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const day = d.toDateString() === new Date().toDateString();
  return day ? hm : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + hm;
}
/* Links in Nachrichten klickbar machen (nach dem Escapen, nur http/https) */
function chatText(s) {
  return esc(s)
    .replace(
      /https?:\/\/[^\s<>"']+/g,
      (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${u}</a>`,
    )
    .replace(/\n/g, "<br>");
}

async function chatLoadOverview() {
  if (!chatReady() || DMC.busy) return;
  DMC.busy = true;
  try {
    DMC.ov = await rpc("chat_overview");
    DMC.err = "";
    DMC.at = Date.now();
  } catch (e) {
    DMC.err = e.message;
  }
  DMC.busy = false;
  const u = chatUnread();
  if (u !== DMC.unread) {
    DMC.unread = u;
    if (typeof renderNav === "function") renderNav();
  }
  if (V.view === "chat" && DMC.peer === undefined) chatPaintList();
}
async function chatLoadMsgs(reset) {
  if (!chatReady() || DMC.peer === undefined) return;
  const peer = DMC.peer;
  try {
    const rows = await rpc("chat_messages", { p_nick: peer, p_after: reset ? 0 : DMC.last });
    if (peer !== DMC.peer) return;
    if (reset) DMC.msgs = [];
    if (Array.isArray(rows) && rows.length) {
      const known = new Set(DMC.msgs.map((m) => m.id));
      rows.forEach((m) => {
        if (!known.has(m.id)) DMC.msgs.push(m);
      });
      DMC.msgs = DMC.msgs.slice(-200);
      DMC.last = Math.max(DMC.last, ...rows.map((m) => +m.id || 0));
      const r = chatReadState(),
        k = chatKey(peer);
      if (DMC.last > (r[k] || 0)) {
        r[k] = DMC.last;
        save();
        const u = chatUnread();
        if (u !== DMC.unread) {
          DMC.unread = u;
          if (typeof renderNav === "function") renderNav();
        }
      }
      chatPaintMsgs(reset);
    } else if (reset) chatPaintMsgs(true);
    DMC.err = "";
  } catch (e) {
    DMC.err = e.message;
    const el = $("dmErr");
    if (el) el.textContent = "⚠️ " + e.message;
  }
}

function renderChatView() {
  chatReadState();
  if (!chatReady()) {
    $("app").innerHTML = `<div class="h1">💬 Chat</div>
    <div class="card dmempty"><span style="font-size:48px">💬</span>
      <h2>Mit Freunden &amp; deiner Klasse schreiben</h2>
      <p class="mut">Dafür brauchst du ein Lernhub-Konto mit Spitznamen. Nachrichten gehen nur an bestätigte Freunde oder an deine Klasse.</p>
      ${typeof cloudCfg === "function" && cloudCfg() ? `<button class="btn g" onclick="go('konto')">🔐 Konto öffnen</button>` : `<p class="small mut">Das Konto ist in dieser Lernhub-Version nicht eingerichtet.</p>`}
    </div>`;
    return;
  }
  if (DMC.peer === undefined) {
    chatPaintList();
    if (Date.now() - DMC.at > 5000) chatLoadOverview();
    chatPoll();
    return;
  }
  const title =
    DMC.peer === null
      ? "🏫 " + (DMC.ov && DMC.ov.class ? DMC.ov.class.name : "Klassenchat")
      : "@" + DMC.peer;
  $("app").innerHTML = `<div class="dmwrap">
    <div class="dmhead"><button class="btn ghost" onclick="chatOpen(undefined)" aria-label="Zurück">‹</button><b>${esc(title)}</b>
      ${DMC.peer !== null ? `<button class="btn ghost sm" data-n="${esc(DMC.peer)}" onclick="go('board')" title="Freunde verwalten">👥</button>` : ""}</div>
    <div class="dmmsgs" id="dmMsgs" aria-live="polite"><p class="mut small" style="text-align:center">Lade …</p></div>
    <p class="small" id="dmErr" style="color:var(--red);margin:4px 0"></p>
    <form class="dmform" onsubmit="event.preventDefault();chatSend()">
      <textarea id="dmIn" class="ta" rows="1" maxlength="1000" placeholder="Nachricht …" aria-label="Nachricht" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();chatSend()}" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,140)+'px'"></textarea>
      <button class="btn g" id="dmSend" aria-label="Senden">➤</button>
    </form>
    <p class="small mut dmnote">Sei freundlich 🙂 Keine Passwörter oder privaten Daten teilen. Nachrichten werden nach 90 Tagen gelöscht.</p>
  </div>`;
  DMC.msgs.length ? chatPaintMsgs(true) : null;
  chatLoadMsgs(true);
  chatPoll();
  setTimeout(() => {
    const i = $("dmIn");
    if (i && matchMedia("(min-width:901px)").matches) i.focus();
  }, 50);
}
function chatPaintList() {
  if (V.view !== "chat" || DMC.peer !== undefined) return;
  const ov = DMC.ov,
    r = chatReadState();
  const row = (
    peerAttr,
    ic,
    name,
    last,
    unread,
    i,
  ) => `<button class="dmrow ${unread ? "unread" : ""}" style="--d:${i * 0.04}s" ${peerAttr}>
      <span class="dmav">${ic}</span><span class="dmtx"><b>${esc(name)}</b><small>${last ? esc((last.mine ? "Du: " : last.nick ? last.nick + ": " : "") + last.body) : "Noch keine Nachrichten"}</small></span>
      <span class="dmside">${last && last.at ? `<small>${esc(chatTime(last.at))}</small>` : ""}${unread ? `<i class="dmdot" aria-label="ungelesen"></i>` : ""}</span></button>`;
  let html = "";
  if (!ov) html = `<p class="mut">${DMC.err ? "⚠️ " + esc(DMC.err) : "Lade Unterhaltungen …"}</p>`;
  else {
    let i = 0;
    if (ov.class) {
      const l = ov.class.last;
      html += row(
        `onclick="chatOpen(null)"`,
        "🏫",
        ov.class.name,
        l,
        l && !l.mine && l.id > (r["class"] || 0),
        i++,
      );
    }
    (ov.friends || []).forEach((f) => {
      const l = f.last_id ? { body: f.body, at: f.at, mine: f.mine } : null;
      html += row(
        `data-n="${esc(f.nickname)}" onclick="chatOpen(this.dataset.n)"`,
        esc(f.nickname.slice(0, 1).toUpperCase()),
        f.nickname,
        l,
        l && !f.mine && f.last_id > (r[chatKey(f.nickname)] || 0),
        i++,
      );
    });
    if (!html)
      html = `<div class="card dmempty"><span style="font-size:44px">🤝</span><h2>Noch niemand zum Schreiben</h2>
      <p class="mut">Füge Freunde über ihren Spitznamen hinzu oder tritt mit einem Klassencode deiner Klasse bei.</p>
      <button class="btn g" onclick="SOC.sec='friends';go('board')">👥 Freunde finden</button> <button class="btn ghost" onclick="SOC.sec='class';go('board')">🏫 Klasse beitreten</button></div>`;
    else if (!ov.class)
      html += `<p class="small mut" style="margin-top:12px">🏫 Tipp: In einer Klasse (👥 Community → Klasse) bekommt ihr automatisch einen Klassenchat.</p>`;
  }
  $("app").innerHTML = `<div class="h1">💬 Chat</div>
    <p class="mut">Schreib mit deinen Lern-Freunden oder der ganzen Klasse. ${DMC.err && ov ? `<span style="color:var(--red)">⚠️ ${esc(DMC.err)}</span>` : ""}</p>
    <div class="dmlist">${html}</div>`;
}
function chatPaintMsgs(jump) {
  const box = $("dmMsgs");
  if (!box) return;
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  if (!DMC.msgs.length) {
    box.innerHTML = `<p class="mut small dmhello">👋 Schreib die erste Nachricht!</p>`;
    return;
  }
  let prevDay = "";
  box.innerHTML = DMC.msgs
    .map((m) => {
      const d = new Date(m.at),
        day = isNaN(d)
          ? ""
          : d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
      const sep = day !== prevDay ? `<div class="dmday">${esc(day)}</div>` : "";
      prevDay = day;
      return `${sep}<div class="dmb ${m.mine ? "me" : ""}" data-id="${+m.id}">
      ${!m.mine && DMC.peer === null ? `<small class="dmn">${esc(m.nick)}</small>` : ""}
      <div>${chatText(m.body)}</div>
      <small class="dmt">${esc(chatTime(m.at))}${m.mine ? ` · <a role="button" tabindex="0" onclick="chatDelete(${+m.id})" title="Löschen">🗑</a>` : ""}</small></div>`;
    })
    .join("");
  if (jump || near) box.scrollTop = box.scrollHeight;
}
function chatOpen(peer) {
  DMC.peer = peer;
  DMC.msgs = [];
  DMC.last = 0;
  DMC.err = "";
  clearTimeout(DMC.timer);
  renderChatView();
}
function chatPoll() {
  clearTimeout(DMC.timer);
  DMC.timer = setTimeout(
    async () => {
      if (V.view !== "chat") return;
      if (!document.hidden) {
        if (DMC.peer === undefined) await chatLoadOverview();
        else await chatLoadMsgs(false);
      }
      chatPoll();
    },
    DMC.peer === undefined ? 15000 : 4000,
  );
}
async function chatSend() {
  const inp = $("dmIn");
  if (!inp || DMC.sending) return;
  const body = inp.value.trim();
  if (!body) return;
  if (body.length > 1000) return toast("Maximal 1000 Zeichen");
  DMC.sending = true;
  const btn = $("dmSend");
  if (btn) btn.disabled = true;
  try {
    const res = await rpc("chat_send", { p_nick: DMC.peer, p_body: body });
    const msg = {
      sent: "",
      empty: "Leere Nachricht",
      not_friends: "Ihr seid (nicht mehr) befreundet.",
      no_class: "Du bist in keiner Klasse.",
      rate: "Langsam 🙂 – zu viele Nachrichten, kurz warten.",
    }[res];
    if (res === "sent") {
      inp.value = "";
      inp.style.height = "auto";
      await chatLoadMsgs(false);
      const b = $("dmMsgs");
      if (b) b.scrollTop = b.scrollHeight;
    } else toast(msg || String(res), 4000);
  } catch (e) {
    toast(e.message, 5000);
  }
  DMC.sending = false;
  if (btn) btn.disabled = false;
  inp.focus();
}
async function chatDelete(id) {
  if (!confirm("Nachricht löschen?")) return;
  try {
    await rpc("chat_delete", { p_id: id });
    DMC.msgs = DMC.msgs.filter((m) => +m.id !== id);
    chatPaintMsgs(false);
  } catch (e) {
    toast(e.message, 4000);
  }
}
function chatStop() {
  clearTimeout(DMC.timer);
  DMC.timer = 0;
}
/* Beim Ausloggen: nichts vom alten Konto stehen lassen */
function chatReset() {
  chatStop();
  Object.assign(DMC, { peer: undefined, ov: null, msgs: [], last: 0, err: "", at: 0, unread: 0 });
}
/* Hintergrund: alle 60 s Übersicht laden, damit das 💬-Badge in der Navigation stimmt */
function chatBg() {
  clearInterval(DMC.bg);
  DMC.bg = setInterval(() => {
    if (!document.hidden && chatReady() && V.view !== "chat") chatLoadOverview();
  }, 60000);
  setTimeout(() => {
    if (chatReady()) chatLoadOverview();
  }, 4000);
}
chatBg();
