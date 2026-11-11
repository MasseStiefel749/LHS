/* 📣 Freunde einladen: Link mit ?ref=Spitzname (&k=Klassencode).
   Wer darüber kommt und sich anmeldet, schickt automatisch eine Freundschaftsanfrage bzw. tritt der Klasse bei. */
const INVITE_KEY = "lernhub_invite";
// Öffentliche Adresse (GitHub Pages); wird genutzt, wenn Lernhub lokal (file:// oder localhost) läuft.
const INVITE_URL = "https://massestiefel749.github.io/LHS/";
let INVITE = null;

(function inviteFromUrl() {
  const q = new URLSearchParams(location.search);
  const ref = (q.get("ref") || "").trim(),
    k = (q.get("k") || "").trim().toUpperCase();
  if (!q.has("ref") && !q.has("k")) {
    try {
      INVITE = JSON.parse(localStorage.getItem(INVITE_KEY) || "null");
    } catch (e) {
      INVITE = null;
    }
    return;
  }
  q.delete("ref");
  q.delete("k");
  const rest = q.toString();
  history.replaceState(null, "", location.pathname + (rest ? "?" + rest : "") + location.hash);
  const inv = { ref: NICK_RE.test(ref) ? ref : "", k: CLASS_CODE_RE.test(k) ? k : "" };
  if (!inv.ref && !inv.k) return;
  INVITE = { ...inv, fresh: true };
  localStorage.setItem(INVITE_KEY, JSON.stringify(inv));
  if (typeof KONTO !== "undefined" && KONTO.mode === "login") KONTO.mode = "register";
})();

function inviteBannerHTML() {
  if (!INVITE || (!INVITE.ref && !INVITE.k)) return "";
  const who = INVITE.ref
    ? `<b>${esc(INVITE.ref)}</b> hat dich eingeladen!`
    : "Du wurdest in eine Klasse eingeladen!";
  return `<div class="card invbanner"><span>👋</span><div>${who}<br><small class="mut">Erstell ein Konto – dann ${INVITE.ref ? "seid ihr direkt verbunden" : "bist du direkt in der Klasse"} und lernt zusammen.</small></div></div>`;
}

async function inviteApply() {
  const I = INVITE;
  if (!I || !CLOUD || !CLOUD.nick || !cloudCfg()) return;
  INVITE = null;
  localStorage.removeItem(INVITE_KEY);
  const msgs = [];
  let failed = false;
  if (I.ref && I.ref.toLowerCase() !== CLOUD.nick.toLowerCase()) {
    try {
      const r = await rpc("friend_request", { p_nick: I.ref });
      if (r === "sent") msgs.push(`Freundschaftsanfrage an ${I.ref} geschickt`);
      if (r === "accepted") msgs.push(`Du und ${I.ref} seid jetzt Freunde 🎉`);
    } catch (e) {
      failed ||= e instanceof TypeError;
      console.warn("Einladung:", e.message);
    }
  }
  if (I.k) {
    try {
      if ((await rpc("class_join", { p_code: I.k })) === "joined")
        msgs.push("Du bist jetzt in der Klasse 🏫");
    } catch (e) {
      failed ||= e instanceof TypeError;
      console.warn("Einladung:", e.message);
    }
  }
  // fetch wirft bei Netzwerkfehlern TypeError → beim nächsten Start nochmal versuchen
  if (failed) localStorage.setItem(INVITE_KEY, JSON.stringify({ ref: I.ref, k: I.k }));
  if (msgs.length) {
    toast(msgs.join(" · "), 6000);
    confetti(30);
  }
  boardLoad();
}

function inviteLink(withClass) {
  const base =
    location.protocol === "https:" && !/^(localhost|127\.)/.test(location.hostname)
      ? location.origin + location.pathname
      : INVITE_URL;
  const p = new URLSearchParams();
  if (CLOUD && CLOUD.nick) p.set("ref", CLOUD.nick);
  if (withClass && SOC.cls && SOC.cls.code) p.set("k", SOC.cls.code);
  const s = p.toString();
  return base + (s ? "?" + s : "");
}
function inviteText(withClass) {
  const cls = withClass && SOC.cls ? ` Unsere Klasse „${SOC.cls.name}“ ist auch schon drin.` : "";
  return `Ich lerne mit Lernhub für die Berufsschule 🧠 – Lernpfad, Streaks, Duelle, Lernvideos & Pausen-Spiele. Kostenlos und ohne Werbung.${cls} Komm dazu: ${inviteLink(withClass)}`;
}

function inviteOpen(withClass) {
  const canClass = !!(SOC.cls && SOC.cls.code);
  if (withClass === undefined) withClass = canClass;
  withClass = withClass && canClass;
  const link = inviteLink(withClass);
  const named = CLOUD && CLOUD.nick;
  toastModal(`<div class="invite">
    <h2 style="margin-top:0">📣 Freunde einladen</h2>
    <p>Zusammen lernt es sich leichter: Freunde siehst du in der Bestenliste, ihr könnt euch duellieren und chatten.</p>
    ${
      named
        ? `<p class="small mut">Wer über deinen Link ein Konto erstellt, schickt dir automatisch eine Freundschaftsanfrage${withClass ? " und kommt direkt in deine Klasse" : ""}.</p>`
        : `<p class="small mut">Tipp: Mit <a onclick="closeModal();go('konto')">Konto</a> wird dein Spitzname mitgeschickt – dann seid ihr nach der Anmeldung direkt verbunden.</p>`
    }
    ${canClass ? `<button class="choice ${withClass ? "sel" : ""}" onclick="inviteOpen(${!withClass})">${withClass ? "✅" : "⬜"} 🏫 Klasse „${esc(SOC.cls.name)}“ mitschicken</button>` : ""}
    <input class="fi invlink" readonly value="${esc(link)}" onclick="this.select()">
    <div class="invbtns">
      ${navigator.share ? `<button class="btn g" onclick="inviteShare(${withClass})">📲 Teilen</button>` : ""}
      <button class="btn invwa" onclick="inviteWhatsApp(${withClass})">💬 WhatsApp</button>
      <button class="btn ghost" onclick="copyText(inviteText(${withClass}))">📋 Kopieren</button>
    </div>
    <button class="btn ghost sm" style="margin-top:12px;width:100%" onclick="closeModal()">Schließen</button>
  </div>`);
}
async function inviteShare(withClass) {
  try {
    await navigator.share({ title: "Lernhub", text: inviteText(withClass) });
  } catch (e) {
    if (e.name !== "AbortError") copyText(inviteText(withClass));
  }
}
function inviteWhatsApp(withClass) {
  openUrl("https://wa.me/?text=" + encodeURIComponent(inviteText(withClass)));
}

window.addEventListener("load", () =>
  setTimeout(() => {
    if (!INVITE) return;
    if (CLOUD && CLOUD.nick) inviteApply();
    else if (INVITE.fresh && INVITE.ref)
      toast(`👋 ${INVITE.ref} hat dich zu Lernhub eingeladen!`, 5000);
  }, 1200),
);
