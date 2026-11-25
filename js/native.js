/* Lernhub als Android-App (Capacitor): Downloads (Backups, Notizen, Dateien) landen über "Teilen" auf dem Gerät.
   Im Browser und in der Desktop-App macht diese Datei nichts. */
(function () {
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return;
  const blobs = new Map();
  const makeUrl = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    const url = makeUrl(obj);
    if (obj instanceof Blob) {
      blobs.set(url, obj);
      if (blobs.size > 20) blobs.delete(blobs.keys().next().value);
    }
    return url;
  };
  const toBase64 = (blob) =>
    new Promise((ok, fail) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result).split(",")[1] || "");
      r.onerror = fail;
      r.readAsDataURL(blob);
    });
  async function saveAndShare(href, name) {
    const { Filesystem, Share } = cap.Plugins;
    const blob = href.startsWith("data:") ? await (await fetch(href)).blob() : blobs.get(href);
    if (!blob) throw new Error("Datei nicht gefunden");
    const path = (name || "lernhub-datei").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
    const res = await Filesystem.writeFile({ path, data: await toBase64(blob), directory: "CACHE" });
    await Share.share({ title: path, files: [res.uri] });
  }
  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || "";
    if (this.hasAttribute("download") && /^(blob|data):/.test(href)) {
      saveAndShare(href, this.getAttribute("download")).catch((e) => {
        if (!/cancel/i.test(String(e && e.message))) typeof toast === "function" && toast("Speichern ging nicht: " + (e.message || e));
      });
      return;
    }
    return click.call(this);
  };
})();
