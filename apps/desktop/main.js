// Lernhub als Desktop-App (Windows, macOS, Linux): dieselbe Web-App, offline aus dem Programmordner.
const { app, BrowserWindow, protocol, net, shell, session } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// Feste Herkunft app://lernhub – sonst gingen gespeicherte Lernstände bei einem anderen Port verloren
const ORIGIN = "app://lernhub";
const WWW = path.join(__dirname, "www");
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

function openOutside(url) {
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) shell.openExternal(url);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 480,
    backgroundColor: "#14112b",
    autoHideMenuBar: true,
    icon: path.join(WWW, "icons", "icon-512.png"),
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    openOutside(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (url.startsWith(ORIGIN + "/")) return;
    e.preventDefault();
    openOutside(url);
  });
  win.loadURL(ORIGIN + "/index.html");
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    const w = BrowserWindow.getAllWindows()[0];
    if (w) {
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });
  app.whenReady().then(() => {
    protocol.handle("app", (req) => {
      const u = new URL(req.url);
      if (u.host !== "lernhub") return new Response("", { status: 404 });
      const rel = decodeURIComponent(u.pathname === "/" ? "/index.html" : u.pathname);
      const file = path.normalize(path.join(WWW, rel));
      if (!file.startsWith(WWW + path.sep)) return new Response("", { status: 403 });
      return net.fetch(pathToFileURL(file).toString());
    });
    // Mikrofon, Benachrichtigungen, Zugriff auf die Bridge am PC usw. nur für die eigene App
    const own = (url) => String(url || "").startsWith(ORIGIN + "/");
    session.defaultSession.setPermissionRequestHandler((wc, perm, cb, details) => cb(perm === "fullscreen" || own(details.requestingUrl || wc.getURL())));
    // YouTube spielt eingebettete Videos nur mit einer echten https-Herkunft ab (app:// zählt nicht) – Musik & Video brauchen das
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ["https://www.youtube-nocookie.com/*", "https://www.youtube.com/*"] },
      (d, cb) => {
        if (!/^https:/i.test(d.requestHeaders.Referer || "")) d.requestHeaders.Referer = "https://massestiefel749.github.io/";
        cb({ requestHeaders: d.requestHeaders });
      },
    );
    session.defaultSession.setPermissionCheckHandler((wc, perm, origin) => own((origin || "") + "/"));
    createWindow();
    app.on("activate", () => {
      if (!BrowserWindow.getAllWindows().length) createWindow();
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
