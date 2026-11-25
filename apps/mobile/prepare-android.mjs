// Erzeugt/aktualisiert das Android-Projekt (apps/mobile/android) aus der Web-App.
// Start: npm run android  (danach: cd android && ./gradlew assembleDebug)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const AND = path.join(DIR, "android");
const RES = path.join(AND, "app", "src", "main", "res");
const run = (cmd) => execSync(cmd, { cwd: DIR, stdio: "inherit" });

if (!fs.existsSync(AND)) run("npx cap add android");
run("npx cap sync android");

// Rechte für Mikrofon (Diktieren, Aussprache) und Kamera (Fotos im Arbeitsplatz)
const manPath = path.join(AND, "app", "src", "main", "AndroidManifest.xml");
let man = fs.readFileSync(manPath, "utf8");
for (const p of ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS", "CAMERA"]) {
  const line = `<uses-permission android:name="android.permission.${p}" />`;
  if (!man.includes(line)) man = man.replace("</manifest>", `    ${line}\n</manifest>`);
}
fs.writeFileSync(manPath, man);

// Version aus package.json (wird in der CI aus dem Release-Tag gesetzt)
const ver = JSON.parse(fs.readFileSync(path.join(DIR, "package.json"), "utf8")).version;
const [a, b, c] = ver.split(".").map((n) => parseInt(n, 10) || 0);
const gradlePath = path.join(AND, "app", "build.gradle");
let gradle = fs.readFileSync(gradlePath, "utf8");
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${a * 10000 + b * 100 + c}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${ver}"`);
fs.writeFileSync(gradlePath, gradle);

// Lernhub-Symbol statt Capacitor-Logo, Startbildschirm einfarbig
const icon = path.join(DIR, "www", "icons", "icon-192.png");
for (const d of fs.readdirSync(RES)) {
  const full = path.join(RES, d);
  if (d === "mipmap-anydpi-v26") {
    fs.rmSync(full, { recursive: true, force: true });
    continue;
  }
  if (d.startsWith("mipmap-"))
    for (const f of ["ic_launcher.png", "ic_launcher_round.png"])
      if (fs.existsSync(path.join(full, f))) fs.copyFileSync(icon, path.join(full, f));
  if (d.startsWith("drawable")) fs.rmSync(path.join(full, "splash.png"), { force: true });
}
fs.mkdirSync(path.join(RES, "drawable"), { recursive: true });
fs.writeFileSync(
  path.join(RES, "drawable", "splash.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item><color android:color="#14112b" /></item>
    <item android:width="160dp" android:height="160dp" android:gravity="center" android:drawable="@mipmap/ic_launcher" />
</layer-list>
`,
);
console.log(`Android-Projekt bereit (Version ${ver})`);
