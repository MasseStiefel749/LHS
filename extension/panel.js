/* Lernhub Begleiter – Seitenleiste: Lernhub im iframe + Schalter für die Erlaubnisse */
const ALL = ["https://*/*", "http://*/*"];
const $ = (id) => document.getElementById(id);
const frame = $("lh");
const src = $("src");
let origin = "";

function load(hash) {
  const base = src.value;
  origin = new URL(base).origin;
  frame.src = base + "#ws" + (hash || "");
}
async function paintPerm() {
  $("perm").hidden = await chrome.permissions.contains({ origins: ALL });
}
async function askFrage() {
  const { frage } = await chrome.storage.session.get("frage");
  if (!frage) return;
  await chrome.storage.session.remove("frage");
  load("?ki=" + encodeURIComponent(frage));
}

/* Falls das Content-Script im iframe fehlt, leitet das Panel die Wünsche der Seite weiter */
window.addEventListener("message", (e) => {
  if (e.source !== frame.contentWindow || e.origin !== origin || !e.data || e.data.lhExt !== "req") return;
  const { id, cmd, args } = e.data;
  chrome.runtime
    .sendMessage({ cmd, args })
    .then((r) => frame.contentWindow.postMessage(Object.assign({}, r || {}, { lhExt: "res", id }), origin))
    .catch((err) => frame.contentWindow.postMessage({ lhExt: "res", id, error: String((err && err.message) || err) }, origin));
});

(async () => {
  const st = await chrome.storage.local.get(["src", "klick"]);
  if (st.src && [...src.options].some((o) => o.value === st.src)) src.value = st.src;
  $("klick").checked = !!st.klick;
  await paintPerm();
  const { frage } = await chrome.storage.session.get("frage");
  if (frage) await askFrage();
  else load();
})();
src.onchange = () => {
  chrome.storage.local.set({ src: src.value });
  load();
};
$("klick").onchange = (e) => chrome.storage.local.set({ klick: e.target.checked });
$("perm").onclick = async () => {
  await chrome.permissions.request({ origins: ALL }).catch(() => false);
  paintPerm();
};
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === "session" && ch.frage && ch.frage.newValue) askFrage();
});
