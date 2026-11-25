/* Lernhub Begleiter – Brücke zwischen der Lernhub-Seite und der Erweiterung.
   Nimmt nur Nachrichten vom eigenen Fenster an und antwortet nur an dieselbe Herkunft. */
window.addEventListener("message", (e) => {
  if (e.source !== window || e.origin !== location.origin || !e.data || e.data.lhExt !== "req") return;
  const { id, cmd, args } = e.data;
  if (typeof cmd !== "string" || cmd.length > 20) return;
  chrome.runtime
    .sendMessage({ cmd, args: args && typeof args === "object" ? args : {} })
    .then((r) => window.postMessage(Object.assign({}, r || {}, { lhExt: "res", id }), location.origin))
    .catch((err) => window.postMessage({ lhExt: "res", id, error: String((err && err.message) || err) }, location.origin));
});
