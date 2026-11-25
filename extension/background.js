/* Lernhub Begleiter – Hintergrund. Führt die Wünsche der Lernhub-KI im aktiven Tab aus:
   Tab öffnen, lesen, zeigen (eigener Mauszeiger), klicken, tippen. Nie in Passwortfeldern, nie ohne Erlaubnis.
   Läuft in Chrome, Edge, Brave, Opera (Seitenleiste = sidePanel) und Firefox (Seitenleiste = sidebarAction). */
const LH_PAGES = [/^https:\/\/massestiefel749\.github\.io\/LHS\//, /^http:\/\/(127\.0\.0\.1|localhost):(5500|5501)\//];
const isLernhub = (u) => LH_PAGES.some((r) => r.test(String(u || "")));
const ALL = ["https://*/*", "http://*/*"];
const FF = typeof browser !== "undefined" && browser.sidebarAction;
const panelOnClick = () => chrome.sidePanel && chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

chrome.runtime.onInstalled.addListener(() => {
  panelOnClick();
  chrome.contextMenus.create({ id: "lh-erklaeren", title: "Mit Lernhub-KI erklären", contexts: ["selection"] });
});
chrome.runtime.onStartup.addListener(panelOnClick);
if (FF) chrome.action.onClicked.addListener(() => browser.sidebarAction.toggle());

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "lh-erklaeren" || !tab) return;
  // Firefox verlangt das Öffnen sofort im Klick – vor jedem await
  if (FF) browser.sidebarAction.open().catch(() => {});
  else if (chrome.sidePanel) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  chrome.storage.session.set({ frage: String(info.selectionText || "").slice(0, 1500) });
});

/* Ziel = aktiver normaler Tab, sonst der zuletzt von der KI geöffnete, sonst der zuletzt benutzte (nie Lernhub selbst) */
async function target() {
  const tabs = (await chrome.tabs.query({})).filter((t) => /^https?:/.test(t.url || "") && !isLernhub(t.url));
  const [front] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const { ziel } = await chrome.storage.session.get("ziel");
  const hit = (front && tabs.find((t) => t.id === front.id)) || tabs.find((t) => t.id === ziel);
  return hit || tabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0] || null;
}

/* Läuft IM Tab – muss eigenständig sein */
function lhPage(mode, nr, text) {
  const HOST = "lh-begleiter-ueberlagerung";
  const vis = (el) => {
    const r = el.getBoundingClientRect(),
      s = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && s.visibility !== "hidden" && s.display !== "none";
  };
  const label = (el) =>
    (el.getAttribute("aria-label") || el.innerText || (el.type !== "password" && el.value) || el.placeholder || el.title || el.name || el.getAttribute("href") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  if (mode === "lesen") {
    document.querySelectorAll("[data-lh-n]").forEach((e) => e.removeAttribute("data-lh-n"));
    const out = [];
    let n = 0;
    const sel = 'a[href],button,input,textarea,select,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[contenteditable=""],[contenteditable=true]';
    for (const el of document.querySelectorAll(sel)) {
      if (n >= 100) break;
      if (el.type === "hidden" || el.disabled || !vis(el)) continue;
      el.setAttribute("data-lh-n", ++n);
      const tag = el.tagName.toLowerCase(),
        role = el.getAttribute("role");
      const kind =
        tag === "a" || role === "link"
          ? "Link"
          : tag === "select"
            ? "Auswahl"
            : el.type === "password"
              ? "Passwortfeld (tabu)"
              : /^(input|textarea)$/.test(tag) && !/^(button|submit|reset|checkbox|radio)$/.test(el.type)
                ? "Eingabefeld"
                : el.isContentEditable
                  ? "Textfeld"
                  : el.type === "checkbox" || role === "checkbox"
                    ? "Häkchen"
                    : "Knopf";
      out.push(`[${n}] ${kind}: ${label(el)}`);
    }
    return {
      titel: document.title,
      url: location.href,
      text: ((document.body && document.body.innerText) || "").replace(/\n{3,}/g, "\n\n").slice(0, 8000),
      elemente: out.join("\n"),
    };
  }
  const el = document.querySelector(`[data-lh-n="${Number(nr)}"]`);
  if (!el) return { error: "Element " + nr + " gibt es nicht (mehr) – lies den Tab neu" };
  el.scrollIntoView({ block: "center", behavior: "instant" });
  let host = document.getElementById(HOST);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST;
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const sh = host.attachShadow({ mode: "open" });
    sh.innerHTML = `<style>
      .c{position:fixed;left:0;top:0;transition:transform .6s cubic-bezier(.3,.9,.3,1);display:flex;gap:2px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}
      .c span{background:#7c5cff;color:#fff;font:700 12px system-ui,sans-serif;padding:3px 8px;border-radius:9px;margin-top:20px;max-width:260px}
      .h{position:fixed;border:3px solid #7c5cff;border-radius:8px;box-shadow:0 0 0 4px rgba(124,92,255,.25);transition:all .4s}</style>
      <div class="h"></div><div class="c"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 2l7 19 2.6-7.6L20 11z" fill="#7c5cff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span></div>`;
    document.documentElement.appendChild(host);
  }
  const sh = host.shadowRoot,
    r = el.getBoundingClientRect();
  const hl = sh.querySelector(".h"),
    cur = sh.querySelector(".c");
  Object.assign(hl.style, { left: r.left - 4 + "px", top: r.top - 4 + "px", width: r.width + 8 + "px", height: r.height + 8 + "px" });
  cur.style.transform = `translate(${Math.round(r.left + Math.min(r.width / 2, 40))}px,${Math.round(r.top + r.height / 2)}px)`;
  sh.querySelector("span").textContent = (mode === "zeigen" ? text : mode === "klicken" ? "klickt" : "tippt") || "Lernhub-KI";
  clearTimeout(window.__lhT);
  window.__lhT = setTimeout(() => host.remove(), 6000);
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  if (mode === "zeigen") return { ok: "gezeigt: " + label(el) };
  if (mode === "klicken")
    return wait(700).then(() => {
      el.focus();
      el.click();
      return { ok: "geklickt: " + label(el) };
    });
  if (mode === "tippen") {
    const ac = String(el.autocomplete || "");
    if (el.type === "password" || /password|cc-|one-time-code/.test(ac)) return { error: "In Passwort-/Zahlungsfelder tippt die KI nie" };
    return wait(700).then(() => {
      el.focus();
      if (el.isContentEditable) document.execCommand("insertText", false, text);
      else if (/^(INPUT|TEXTAREA)$/.test(el.tagName)) {
        const proto = el.tagName === "INPUT" ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, text);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else return { error: "Das ist kein Eingabefeld" };
      return { ok: "getippt in: " + label(el) };
    });
  }
  return { error: "Unbekannt" };
}

async function handle(msg, sender) {
  const fromPanel = sender.url && sender.url.startsWith(chrome.runtime.getURL(""));
  if (sender.id !== chrome.runtime.id || (!fromPanel && !isLernhub(sender.url))) return { error: "Nicht erlaubt" };
  const { klick } = await chrome.storage.local.get("klick");
  const zugriff = await chrome.permissions.contains({ origins: ALL });
  const cmd = msg && msg.cmd;
  if (cmd === "hallo") return { ok: true, klick: !!klick, zugriff, oeffnen: true };
  const a = (msg && msg.args) || {};
  // Neuer Tab im Hintergrund – Lernhub bleibt vorne, die KI kann ihn danach lesen
  if (cmd === "oeffnen") {
    let u;
    try {
      u = new URL(String(a.url || ""));
    } catch (e) {
      return { error: "Ungültige Adresse" };
    }
    if (u.protocol !== "https:") return { error: "Nur https-Adressen" };
    const t = await chrome.tabs.create({ url: u.href, active: false });
    await chrome.storage.session.set({ ziel: t.id });
    return { ok: "geöffnet: " + u.href };
  }
  if (!["lesen", "zeigen", "klicken", "tippen"].includes(cmd)) return { error: "Unbekannter Befehl" };
  if ((cmd === "klicken" || cmd === "tippen") && !klick) return { error: "Klicken & Tippen ist in der Lernhub-Seitenleiste ausgeschaltet" };
  if (!zugriff) return { error: "Tab-Zugriff ist nicht erlaubt – in der Lernhub-Seitenleiste auf „Tabs lesen erlauben“ tippen" };
  const tab = await target();
  if (!tab) return { error: "Kein passender Tab offen (nur normale Webseiten)" };
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: lhPage,
      args: [cmd, Math.max(0, Math.round(+a.nr || 0)), String(a.text || "").slice(0, 2000)],
    });
    return (res && res.result) || { error: "Keine Antwort vom Tab" };
  } catch (e) {
    return { error: "Auf dieser Seite geht das nicht: " + String(e.message || e).slice(0, 160) };
  }
}
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  handle(msg, sender).then(reply, (e) => reply({ error: String(e.message || e) }));
  return true;
});
