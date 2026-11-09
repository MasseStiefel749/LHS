# PUBLIKATION – Lernhub veröffentlichen (GitHub + optional GitHub Pages)

Schritt-für-Schritt, damit am Ende nichts gegen Regeln verstößt.

## 1. Vor dem Upload: Pflicht-Checks

1. **Impressum ausfüllen** (in der App: Fußzeile → Impressum, oder
   `showLegal('impressum')`): Platzhalter `[Dein Vor- und Nachname]`,
   `[Straße]`, `[PLZ Ort]`, `[E-Mail]` durch echte Daten ersetzen.
   Ohne diese Angaben ist eine öffentliche Website in Deutschland unzulässig
   (§ 5 DDG). _Hinweis: Wenn du minderjährig bist, kläre das kurz mit deinen
   Eltern – rechtlich haftet i. d. R. die Person, die veröffentlicht._
2. **Datenschutz-Text** anpassen, falls du Dinge änderst (Standard deckt
   localStorage, optionale API, Mikrofon ab).
3. **LICENSE** anpassen: Copyright-Zeile mit deinem Namen.
4. **Pfade im Code anpassen:** In `index.html` (`defaultState`) steht der
   Vault-Pfad deines PCs als Standard (`vaultPath`) und die Schul-URL
   (`schoolUrl`). Für ein öffentliches Repo den `vaultPath`-Default auf `""`
   setzen (und `schoolUrl` prüfen) – Nutzer tragen ihre eigenen Werte im
   Agent-Panel ein.
5. **Persönliche Daten aus dem Repo:** Prüfe, ob im Projekt etwas
   Privates steckt, das nicht öffentlich sein soll (z. B. volle Namen von
   Dritten in Dateien unter `content/` oder `docs/`). Der Obsidian-Vault
   selbst ist **nicht** Teil des Repos (liegt außerhalb) – gut so.
6. **Bestenliste (optional):** Wenn `content/cloud-config.js` ausgefüllt ist,
   verarbeitet Supabase E-Mail, Spitzname und Lernzahlen – und mit dem
   Cloud-Speicher den kompletten Lernstand (inkl. Notizen) der angemeldeten Person. Dann im
   Datenschutz-Text Supabase als Auftragsverarbeiter nennen, EU-Region wählen
   und den AVV/DPA von Supabase akzeptieren (Dashboard → Legal). Nur den
   **anon**-Key committen, niemals den `service_role`-Key.
   Bei Push zusätzlich: nur den **VAPID-Public-Key** in `cloud-config.js`; den
   Private Key und `CRON_SECRET` ausschließlich per `supabase secrets set`.
   `supabase/push-cron.sql` **nicht** mit eingesetztem Secret committen.
   Im Datenschutz-Text stehen Ligen/Klassen/Duelle, Push und der Untis-Proxy
   schon drin – nur anpassen, wenn du etwas daran änderst.
8. **Duolingo-Credit** (App: Charaktere, Lernlinks, „Wie funktioniert’s“; README)
   nicht entfernen – Lernhub nutzt keine Duolingo-Grafiken oder -Namen als eigene.
7. **README** kurz gegenlesen (Name, Klasse, Schule sind bewusst drin –
   wenn du das nicht willst, anonymisieren).

## 2. Repository anlegen & hochladen

```powershell
cd "C:\Users\S-Lasarzewski\Documents\Default Project\lernhub"
git init
git add .
git commit -m "Lernhub v1.0"
# Repo auf github.com anlegen (README, .gitignore nicht vergessen), dann:
git remote add origin https://github.com/<DEIN-BENUTZERNAME>/lernhub.git
git branch -M main
git push -u origin main
```

Optional: GitHub Desktop oder das `gh`-CLI (`gh repo create lernhub --private --source=. --push`).

## 3. Öffentlich als Website (GitHub Pages)

1. Repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch**
2. Branch `main`, Ordner `/ (root)` → Save
3. Nach ~1 Min: `https://<benutzername>.github.io/lernhub/`
4. Dort läuft alles außer dem Agenten (der ist absichtlich nur lokal:
   auf der veröffentlichten Seite wird die Bridge nie angesprochen).
   Mikrofon funktioniert nur unter **HTTPS** – GitHub Pages liefert das. ✅
5. **Als App installieren / Push** geht ebenfalls nur über HTTPS – nach dem
   Hochladen die Seite öffnen → „App installieren“. Bei Updates `CACHE` in `sw.js`
   hochzählen (z. B. `lernhub-v3`), damit alle die neue Version bekommen.

## 4. Nach dem Upload prüfen

- [ ] Seite lädt, keine Konsolenfehler (F12)
- [ ] Impressum öffentlich sichtbar und ausgefüllt
- [ ] Kein API-Key im Repo (die Einstellung liegt nur im localStorage,
      aber trotzdem: nie Keys in Dateien committen)
- [ ] `content/bridge-token.js` ist nicht im Repo (steht in `.gitignore`)
- [ ] `content/auftraege/` enthält keine privaten Nachrichten? (Sonst
      `.gitignore` ergänzen)
- [ ] Repo bei Bedarf **private** halten – Lern-Apps müssen nicht öffentlich
      sein; GitHub Pages geht auch mit privatem Repo (Pro).

## 5. Updates später

```powershell
git add .
git commit -m "Beschreibung"
git push
```

Die App selbst braucht kein Build – jede Änderung an `index.html` ist live,
sobald gepusht (bei Pages mit Cache-Hint: Browser-Hard-Reload).
