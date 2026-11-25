/* Lernhub-Werbung (Google AdSense): nur nach ausdrücklicher Zustimmung, gilt pro Gerät (wird nicht synchronisiert).
   Ohne Zustimmung lädt Lernhub kein Google-Skript. Anzeige als rechte Leiste nur auf breiten Bildschirmen. */
const ADS_KEY = "lernhub_ads_v1";
const ADS_WIDE = window.matchMedia("(min-width:1280px)");
let ADS = { asked: false, on: false, pers: false };
let ADS_LOADED = false;

function adsCfg() {
  const c = window.LERNHUB_ADS || {};
  return /^ca-pub-\d{10,20}$/.test(c.client || "") && /^\d{5,20}$/.test(c.slot || "") ? c : null;
}
function adsLoadPref() {
  try {
    const o = JSON.parse(localStorage.getItem(ADS_KEY) || "null");
    if (o && typeof o === "object") ADS = { asked: !!o.asked, on: o.on === true, pers: o.pers === true };
  } catch (e) {}
}
function adsStore() {
  try {
    localStorage.setItem(ADS_KEY, JSON.stringify(ADS));
  } catch (e) {}
}

function adsSet(on, pers) {
  pers = !!on && !!pers;
  const changed = ADS.on !== !!on || ADS.pers !== pers;
  ADS = { asked: true, on: !!on, pers };
  adsStore();
  closeModal();
  // Einmal geladen, lässt sich das Google-Skript nur per Neuladen entfernen bzw. umstellen
  if (ADS_LOADED && changed) return location.reload();
  adsMount();
  toast(on ? "Danke für deine Unterstützung 💛" : "Okay – keine Werbung.");
  if (V.view === "settings") render();
}

function adsAsk() {
  toastModal(`<h2 style="margin-top:0">💛 Lernhub unterstützen?</h2>
    <p>Lernhub ist kostenlos. Wenn du magst, zeigt Lernhub am rechten Rand eine Anzeige – damit bezahle ich Server und KI. Beim Lernen selbst stört sie nicht.</p>
    <p class="small mut">Freiwillig und jederzeit in den ⚙️ Einstellungen änderbar. Die Anzeige erscheint nur auf großen Bildschirmen (PC/Laptop).</p>
    <div class="center"><button class="btn g" onclick="adsAskPers()">Ja, gern 💛</button> <button class="btn ghost" onclick="adsSet(false)">Nein, danke</button></div>`);
}
function adsAskPers() {
  toastModal(`<h2 style="margin-top:0">🎯 Personalisierte Werbung?</h2>
    <p><b>Personalisiert:</b> Google darf Cookies setzen und Anzeigen nach deinen Interessen auswählen – das bringt dem Projekt etwas mehr. Nur ab 16 Jahren.</p>
    <p><b>Nicht personalisiert:</b> Anzeigen passend zur Seite, ohne Interessen-Profil. Google speichert trotzdem einige Daten (z. B. zum Zählen und gegen Betrug).</p>
    <div class="center"><button class="btn g" onclick="adsSet(true,true)">Personalisiert (ich bin mind. 16)</button> <button class="btn" onclick="adsSet(true,false)">Nicht personalisiert</button></div>
    <p class="center small"><a onclick="adsSet(false)">Doch keine Werbung</a></p>`);
}
/* Einmal fragen – erst wenn Onboarding, Tour und eine Lektion geschafft sind */
function adsMaybeAsk() {
  if (!adsCfg() || ADS.asked || !S.seenOnboard || !S.seenTour || (S.stats.lessons || 0) < 1) return;
  if (V.view !== "home" || !$("modal").classList.contains("hidden")) return;
  ADS.asked = true;
  adsStore();
  adsAsk();
}

function adsMount() {
  const c = adsCfg();
  const show = !!(c && ADS.on && ADS_WIDE.matches);
  let rail = $("adRail");
  document.body.classList.toggle("adrail", show);
  if (!show) {
    if (rail) rail.remove();
    return;
  }
  if (rail) return;
  if (!ADS_LOADED) {
    ADS_LOADED = true;
    (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = ADS.pers ? 0 : 1;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + c.client;
    document.head.appendChild(s);
  }
  rail = document.createElement("aside");
  rail.id = "adRail";
  rail.innerHTML = `<small class="mut">Anzeige · unterstützt Lernhub 💛</small>
    <ins class="adsbygoogle" style="display:inline-block;width:160px;height:600px" data-ad-client="${c.client}" data-ad-slot="${c.slot}"></ins>
    <a class="small mut" onclick="go('settings')">Werbung ändern</a>`;
  document.body.appendChild(rail);
  try {
    window.adsbygoogle.push({});
  } catch (e) {}
}

function adsCardHTML() {
  if (!adsCfg()) return "";
  const st = !ADS.on ? "aus" : ADS.pers ? "an · personalisiert" : "an · nicht personalisiert";
  return `<div class="card" style="margin-top:14px"><b>💛 Werbung (Lernhub unterstützen)</b>
    <p class="small mut">Freiwillig: Eine Anzeige am rechten Rand (nur auf großen Bildschirmen) finanziert Server und KI. Status: <b>${st}</b></p>
    <button class="choice ${!ADS.on ? "sel" : ""}" onclick="adsSet(false)">🚫 Aus – keine Werbung</button>
    <button class="choice ${ADS.on && !ADS.pers ? "sel" : ""}" onclick="adsSet(true,false)">💛 An – nicht personalisiert</button>
    <button class="choice ${ADS.on && ADS.pers ? "sel" : ""}" onclick="adsSet(true,true)">🎯 An – personalisiert (ab 16, bringt mehr)</button></div>`;
}

function adsInit() {
  adsLoadPref();
  adsMount();
  ADS_WIDE.addEventListener("change", adsMount);
}
