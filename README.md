# 🧠 Lernhub – Lernen wie im Spiel

**Gamifizierte Lern-App für die Berufsschule (E1FI A, Gewerbliche Schulen
Villingen-Schwenningen) _und_ alles andere, das man lernen will.**
Streaks 🔥, XP ⚡, Akku 🔋, Duolingo-artiger Lernpfad, Sprech-Übungen mit
Mikrofon, Telefon-Dialoge mit eigenen Charakteren, Wiederholungen mit
Spaced Repetition – und ein OpenCode-Agent, der neuen Lernstoff besorgt,
wenn der ausgeht.

> **Für KI-Prüfer:** Die strukturierte Prüf-Anleitung liegt in
> [`docs/AI-CHECKLISTE.md`](docs/AI-CHECKLISTE.md). Veröffentlichungs-Schritte
> in [`docs/PUBLIKATION.md`](docs/PUBLIKATION.md).

---

## Quickstart (2 Wege)

**A) Nur lernen (sofort, offline):**
`index.html` doppelklick → fertig. Keine Installation, kein Internet nötig,
keine externen Bibliotheken. (Sprachausgabe/Mikrofon brauchen einen
Chromium-Browser wie Edge oder Chrome.)

**B) Mit Agent (OpenCode holt neuen Stoff):**

1. `opencode-verbinden.cmd` doppelklick (installiert OpenCode bei Bedarf über
   `npm install -g opencode-ai`) und startet die lokale Bridge auf Port 8799)
2. App **lokal** öffnen (Doppelklick auf `index.html`) → **🤖 Agent** → unten **Obsidian-Vault-Pfad**
   und **Schul-URL** eintragen → „Verbindung prüfen" → grüner Punkt
3. Auftrag schicken („Neue Aufgaben", „Prüfungsstoff", …) → währenddessen
   weiterlernen → „Neue Inhalte laden" → fertig

**C) Entwickeln mit Live-Neuladen:**
`lernhub-starten.cmd` doppelklick (oder `node dev-server.mjs --open`) → öffnet
`http://127.0.0.1:5500/`. Sobald eine HTML-, JS- oder CSS-Datei gespeichert wird,
lädt die Seite sich selbst neu (CSS ohne kompletten Neuladen). Nur lokal erreichbar,
keine Abhängigkeiten außer Node.js. Hinweis: `http://127.0.0.1:5500` hat einen
eigenen Browser-Speicher – Fortschritt aus der `file://`-Version per
⚙️ Einstellungen → 💾 Daten → „Exportieren (JSON)“ / „Importieren“ übernehmen.

---

## Funktionen – und wie sie funktionieren

### Lernpfad & Lektionen (Duolingo-Style)

- Fächer als Reiter (ITS, SAE, BWL, WK, GK, Deutsch, BE + eigene Fächer),
  Themen als **Knoten**: 🔒 gesperrt → ▶️ dran → 👑 geschafft. Gesperrte Themen sind nicht anklickbar; eine abgeschlossene Lektion schaltet das nächste frei (`LESSONS_TO_UNLOCK` im Code). Falsch beantwortete Aufgaben kommen am Ende der Lektion nochmal (max. 3×).
- Nach je 2 geschafften Themen erscheint ein **🎥 Video-Knoten** (öffnet eine
  YouTube-Suche in neuem Tab – nur ein Link, kein eingebettetes Video).
- **4 Aufgabenarten pro Thema:** Multiple Choice, Karteikarten (vom Umdrehen),
  Lückentext, freie Eingabe. Die **Gewichtung** richtet sich nach dem
  Start-Quiz (Lernstil: sehen/hören/tun).
- **Akku 🔋:** Jeder Fehlversuch kostet eine Zelle (abschaltbar). Alle **20 Minuten lädt eine Zelle nach** (wie bei Duolingo), am neuen Tag ist er voll. Leer = Countdown, Erklär-Modus (kostet keinen Akku) oder Modus
  „Ohne Akku-Limit" anbieten. **Design:** dunkel (Boot.dev-Stil), hell umschaltbar in den Einstellungen. **Streak 🔥:** Tag ohne Lektion = 0; die Startseite
  erinnert („Streak in Gefahr!"), das ist bewusst der Wiederkommungs-Haken.
- **XP & Tagesziel:** +5 pro richtiger Aufgabe, Bonus am Lektionsende,
  Fortschritts-Ring oben rechts.

### Wiederholen (Spaced Repetition)

- Falsch beantwortete Aufgaben landen in `S.review` mit Fehlversuch-Zähler und
  Fälligkeitsdatum (+1 Tag). Richtig beantwortete rutschen einen Tag nach
  hinten, entfernen sich bei 0 Fehlversuchen. Runde = max. 10 fällige Aufgaben.

### Sprechen & Anrufen 🗣️

- **Aussprache:** Vokabel zeigen → 🎙️ sprechen → Web Speech API
  (`SpeechRecognition`) vergleicht per Normalisierung + Levenshtein-Ähnlichkeit
  (>0.72 = ok). Ohne Mikrofon-Unterstützung automatisch Tipp-Eingabe.
- **Call-Modus:** Charakter spricht eine Zeile (Text-to-Speech), man antwortet
  laut oder getippt; Stichwort-Score ≥0.34 = ok, ab 3. Versuch hilft der
  Charakter weiter. 3 Szenarien (Restaurant, Weg, IT-Support) sind eingebaut,
  weitere generiert der Agent.

### Charaktere 🧸

- Eigene Begleiter: Name, Emoji **oder eigenes Bild/Video** (≤5 MB).
- **Lokale Analyse** (offline): Farbe/Helligkeit/Sättigung des Bildes →
  Persönlichkeits-Regler, Farbwelt, Stimmlage. Video → Standbild → gleiches.
- **Optionale KI-Analyse:** mit eigenem API-Key schickt die App das Bild an
  den gewählten Endpunkt und lässt Name/Persönlichkeit/Stimme erzeugen.
- Aktiver Charakter moderiert ✨-Chat und 📞-Anrufe (Stimme über TTS).

### ✨ KI-Chat (nur Tipps – Lösung erst ab Schwelle)

- **Offline (ohne Key):** regelbasiert aus den Lerndaten. Antwortschlüssel:
  Tipp 1 (allgemein) → Tipp 2 (enger, z. B. erste Buchstaben) → Lösung erst
  bei **≥2 Fehlversuchen** oder „🙋 Ich geb's auf".
- **Mit API-Key (optional):** OpenAI-kompatibler Endpunkt (OpenAI, lokaler
  Ollama-Server …) – gleiche Regeln als System-Prompt, Key bleibt lokal.
- Schnellaktionen: „Erklär das Thema", „Wo stehe ich?", „Was ist fällig?",
  „Test mich".

### 🤖 OpenCode-Agent (wenn der Stoff ausgeht)

```
App (index.html)
   │  POST http://127.0.0.1:8799/auftrag   (nur localhost, Header X-Lernhub-Token)
   ▼
agent/bridge.ps1  (PowerShell, TcpListener – keine Admin-Rechte)
   │  prüft Token + Host-Header, schreibt content/auftraege/<ts>-<typ>.md
   │  startet:  opencode run "… bearbeite … nach AGENT.md …"
   │  (nur der Vault-Ordner wird zum Lesen freigegeben, bash ist verboten)
   ▼
OpenCode (lokal installiert)
   │  liest AGENT.md → recherchiert Obsidian-Vault + gewerbeschule-vs.de
   │  schreibt content/erweiterungen.js + content/status.json
   ▼
App → „Neue Inhalte laden" → neue Themen/Übungen erscheinen
```

- **Installationserkennung:** `opencodeopencode-ai`, Windows-Support).
- **Sicherheit:** Die Bridge erzeugt bei jedem Start ein geheimes Token
  (`content/bridge-token.js`, nicht in Git) – ohne Token wird kein Auftrag angenommen,
  fremde Webseiten können also keine Jobs einreihen. Die App spricht die Bridge nur an,
  wenn sie lokal (`file://`/localhost) läuft, nie von einer veröffentlichten Seite aus und
  installiert es bei Bedarf über npm (`@opencode/cli`, Windows-Support).
- **Verbindungs-Prompt** steht im 🤖-Panel zum Kopieren (für den manuellen
  Weg: `opencode` im Projektordner starten, Prompt einfügen).
- **🔓 Vollzugriff (optional, Standard aus):** Beim Start fragt `opencode-verbinden.cmd`
  „Vollzugriff erlauben? [J/N]“. Bei **J** zeigt das Agent-Panel ein Feld für PC-Aufträge
  (Befehle ausführen, Programme installieren, Dateien überall ändern). Jeder solche Auftrag
  erscheint zuerst als Windows-Dialog am PC; erst nach „Ja“ startet `agent/vollzugriff.ps1`
  OpenCode mit erweiterten Rechten in einem sichtbaren Fenster (nur für diesen Lauf).
  Ohne J lehnt die Bridge PC-Aufträge ab, und `bash` bleibt per `opencode.json` verboten.
- **Ohne Bridge** kopiert die App den fertigen Auftrag in die Zwischenablage
  und zeigt die 3-Schritte-Anleitung – es geht also immer.

### Eigenes Fach (allgemeines Lernen)

➕ auf der Startseite: Name + Zeilen im Format `Frage | Antwort` → fertiges
Fach mit MC, Karteikarten, Fortschritt im selben Pfad-System.

### 🏠 Dashboard

Startseite mit Streak, Tages-XP, Akku, fälligen Wiederholungen, Wochen-XP + Platz
unter Freunden, Tages-Quests, heutigem Stundenplan, nächsten Terminen, letzten
Notizen und einem Willkommen-zurück-Banner nach 2+ Tagen Pause.

### 🧠 Erklär-Modus

Jedes Thema Schritt für Schritt erklärt (Begriffe, Merksätze, Beispiele) – ohne
Akku-Verbrauch. Daneben ein Chat: offline regelbasiert („einfacher“, „Beispiel“,
„warum?“, „quiz mich“, Stichwortsuche), mit eigenem Key echte KI
(OpenAI-kompatibel, z. B. Ollama: `http://localhost:11434/v1/chat/completions`).
Antworten lassen sich als Notiz speichern.

### 📝 Notizen

Suchen, bearbeiten (speichert automatisch), als `.md` herunterladen. Zeilen im
Format `Frage | Antwort` werden per Klick zu einem eigenen Lernfach.

### 📅 Planer, Untis & Erinnerungen

- **Untis (WebUntis, Schritt für Schritt – steht auch im Planer):**
  1. WebUntis **im Browser** öffnen: webuntis.com → Schule „Gewerbliche Schulen
     Villingen-Schwenningen“ suchen → mit dem Schul-Login anmelden.
  2. Links **„Mein Stundenplan“**.
  3. Unter dem Stundenplan, neben der Legende, auf die **drei Punkte ⋯**.
  4. **„iCal-Abo verwalten“** → Format **„Standard“** → **„Link erstellen“**.
  5. **„Link kopieren“** → im Planer einfügen → **🔄 Laden**.

  Fehlt die Option, hat die Schule das Modul „Individuelle Stundenplanabfrage“
  für Schüler nicht freigeschaltet → Lehrkraft fragen oder Plan selbst eintragen.
  Klappt „Laden“ nicht (CORS), läuft der Abruf mit Konto automatisch über die
  Edge Function `untis-ics` (speichert nichts, erlaubt nur `https://*.webuntis.com`),
  sonst `.ics` herunterladen und importieren. Der Link ist wie ein Passwort und lässt
  sich in WebUntis mit „Link deaktivieren“ ungültig machen. Lernhub lädt ihn beim
  Öffnen automatisch neu (höchstens alle 6 h) und übernimmt 90 Tage voraus.
- **Termine:** Klassenarbeiten/Abgaben eintragen (Häkchen „📝 Prüfung“ → Countdown
  auf dem Dashboard); Schultermine kommen automatisch dazu.
- **Erinnerungen:** Ab der eingestellten Uhrzeit erinnert Lernhub, bis das Tagesziel
  geschafft ist – je später, desto öfter (60 → 30 → 15 → 5 Min.). Im Tab-Titel,
  als Leiste und (falls erlaubt) als Browser-Benachrichtigung. **Grenze:** Das klappt
  nur, solange ein Lernhub-Tab offen ist – außer mit **📲 Push** (siehe unten). Zusätzlich gibt es einen
  **Kalender-Export (.ics)** mit täglichen Weckern fürs Handy. An 😴 Ruhetagen ist Ruhe.

### 🔗 Lernlinks

Kuratierte kostenlose Quellen mit Credits: simpleclub, Lehrer Schmidt, Studyflix,
Khan Academy, Elektronik-Kompendium, MDN, W3Schools, Duden, LEO. Die
simpleclub-Empfehlung ist eine **unbezahlte** Empfehlung (keine Kooperation).

### 🏆 Konto, Freunde & Bestenliste (optional, Supabase)

- Freiwillig: Konto mit E-Mail + Passwort, sichtbar ist nur ein **Spitzname**.
- Rangliste nur mit **bestätigten Freunden** (Anfrage per Spitzname → annehmen).
- Gesendet werden nur Zahlen (~200 Byte): XP, Wochen-XP, Streak, Lektionen,
  Aufgaben, Fehler, Hinweise – automatisch 5 s nach einer Änderung.
  **Fehler und Hinweise sehen Freunde nur, wenn man es erlaubt** (sonst 🔒).
- Keine Notizen, kein Stundenplan, keine Antworten gehen an Freunde.

**👤 Anmelde-Bildschirm & privater Cloud-Speicher (`js/konto.js`):**

- Beim ersten Start (wenn Supabase eingerichtet ist) erscheint „Willkommen bei
  Lernhub“: **Einloggen**, **Konto erstellen** (E-Mail, Passwort ≥ 8, Spitzname),
  **Passwort vergessen** (Mail-Link → neues Passwort) oder „Ohne Konto weiter“.
  Später jederzeit unter 👤 Konto.
- Mit Konto wird der **komplette Lernstand** (Fortschritt, Notizen, Termine,
  Stundenplan, eigene Fächer/Charaktere, Einstellungen) 8 s nach jeder Änderung
  und beim Verlassen der Seite in der Tabelle `user_state` gesichert – nur der
  Besitzer kann ihn lesen (RPC `state_load`/`state_save`, kein direkter Tabellenzugriff).
  **Nie hochgeladen:** API-Key, Untis-Link, Vault-Pfad, Push-Adresse.
- Anderes Gerät: einloggen → Stand wird geladen. Haben beide Geräte seit dem
  letzten Abgleich etwas geändert, fragt Lernhub, welcher Stand bleiben soll
  (`state_save` lehnt veraltete Stände mit `state_conflict` ab).
- „Abmelden & Gerät leeren“ für Schul-PCs, Passwort ändern, Konto löschen,
  Cloud-Speicher abschaltbar. Ohne Supabase zeigt 👤 Konto Backup-Export/-Import.

**Einrichten (einmal, für die ganze Klasse, kostenlos):**

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen.
2. **SQL Editor** → Inhalt von `supabase/schema.sql` einfügen → Run.
3. **Project Settings → API**: *Project URL* und *anon public key* in
   `content/cloud-config.js` eintragen (der anon key ist öffentlich gedacht;
   **nie** den `service_role`-Key eintragen).
4. **Authentication → Sign In / Providers → Email**: „Confirm email“ ausschalten
   *oder* unter *URL Configuration* die Site-URL auf die veröffentlichte Seite
   setzen (Bestätigungslinks funktionieren nicht mit `file://`).
5. **Authentication → URL Configuration → Redirect URLs**: die Adresse der
   App eintragen (z. B. `https://NAME.github.io/lernhub/index.html` und zum Testen
   `http://127.0.0.1:5500/index.html`) – sonst führen Bestätigungs- und
   „Passwort vergessen“-Links nicht zurück in die App.

Hinweise: Der Gratis-Plan pausiert ein Projekt nach ca. 1 Woche ohne Nutzung
(im Dashboard wieder starten). Zahlen kommen vom Browser und könnten
theoretisch gefälscht werden; der Server begrenzt sie, für eine Klassen-Rangliste
reicht das. Konto löschen entfernt Profil, Zahlen, Freundschaften und den
Cloud-Speicher sofort. Nach Updates `supabase/schema.sql` einfach erneut ausführen
(idempotent).

### 🏅 Wochenligen, 🏫 Klassen-Challenge, ⚔️ Lern-Duelle (mit Konto)

- **Ligen:** opt-in unter 🏆 Bestenliste → „Liga“. 10 Stufen (Bronze → 💎 Diamant).
  Montags (Berliner Zeit) wird abgerechnet: obere 30 % der Aktiven mit ≥ 50 XP
  steigen auf, die unteren 20 % (ab 5 Aktiven) und alle mit 0 XP steigen ab.
  Abrechnung passiert lazy in `league_settle()` beim ersten Aufruf der neuen Woche –
  kein Cron nötig. Sichtbar: Spitzname, Wochen-XP, Streak.
- **Klasse:** erstellen → 6-stelliger Code (ohne verwechselbare Zeichen) → teilen.
  Gemeinsames Wochenziel (150 XP × Mitglieder), Mitgliederliste, Klassen-Ranking
  (andere Klassen sehen nur Name, Größe, Ø-XP). Max. 1 Klasse pro Person.
- **Duelle:** Freund + Fach wählen → du spielst 5 Fragen, der Freund bekommt
  per Seed **dieselben** Fragen in derselben Reihenfolge. Punkte zählen, bei
  Gleichstand die Zeit. Offene Duelle verfallen nach 7 Tagen. Gleiche Fragen gibt
  es nur, wenn beide dieselbe Lernhub-Version haben.

### 🧊 Streak-Freeze & 😴 Ruhetage

Klick auf die 🔥 oben. Ein Freeze rettet automatisch einen verpassten Tag
(max. 2 auf Vorrat; alle 7 Streak-Tage einer geschenkt oder für 100 XP kaufen).
Bis zu 2 feste Ruhetage pro Woche zählen nicht als verpasst und pausieren Erinnerungen.

### 🍅 Fokus-Timer, 📝 Prüfungs-Countdown, 🏅 Erfolge

- Pomodoro (15/25/45/50 Min + Pause), läuft beim View-Wechsel und Tab-Schließen weiter.
- Countdown zur nächsten Prüfung (eigene Termine mit 📝-Häkchen oder Titel wie
  „Klassenarbeit“, „Prüfung“, „GAP“).
- Abzeichen für Streaks, XP, Lektionen, Fokus, Duelle, Ligen … (🏅 Erfolge).

### 📲 Als App installieren & Push-Erinnerungen

`manifest.webmanifest` + `sw.js` machen Lernhub installierbar (Chrome/Edge:
„App installieren“, iPhone: Teilen → „Zum Home-Bildschirm“). Das klappt nur über
**https** (oder localhost), nicht per `file://`.

**Echte Push-Erinnerungen auch bei geschlossenem Tab – einmalig einrichten:**

1. `supabase/schema.sql` erneut im SQL Editor ausführen (ist idempotent).
2. VAPID-Schlüssel erzeugen: `npx web-push generate-vapid-keys`.
   Den **Public Key** in `content/cloud-config.js` → `vapidPublic` eintragen.
3. Supabase CLI: `supabase login`, `supabase link --project-ref DEIN-PROJEKT`, dann
   ```
   supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… VAPID_SUBJECT=mailto:du@example.org CRON_SECRET=<langes-zufallswort>
   supabase functions deploy push-reminders --no-verify-jwt
   supabase functions deploy untis-ics
   ```
4. Dashboard → Database → Extensions: **pg_cron** und **pg_net** aktivieren.
5. `supabase/push-cron.sql` öffnen, `DEIN-PROJEKT` und `DEIN-CRON-SECRET` ersetzen,
   im SQL Editor ausführen (alle 15 Min.).
6. In der App: Planer oder Einstellungen → „🔔 Push-Erinnerungen einschalten“.

Der Server schickt ab der Startzeit eine Erinnerung (stündlich, ab 18 Uhr alle 30,
ab 20 Uhr alle 15 Min.), solange das Tagesziel laut letzter Synchronisierung offen ist.
iPhone: nur bei installierter App (iOS 16.4+). Push-Adressen werden nur für die
bekannten Push-Dienste (Google, Mozilla, Apple, Microsoft) akzeptiert.

### 🐧 Pingulin & die Crew

Pingulin, der Pinguin mit grünem Schal, ist das Maskottchen (Dashboard, Lektionsende,
Chat). Dazu Mia, Herr Bit, Oma Erna und Kemal – jede Figur mit eigener Stimme
(Sprachausgabe des Browsers, Stimme passend zum Geschlecht, eigene Tonhöhe/Tempo)
und Mund-Animation beim Sprechen (Lippensync über Vokale bzw. Wortgrenzen-Events).
Alle Figuren sind eigene SVG-Zeichnungen – eigene Charaktere können ein
Crew-Gesicht und eine bestimmte Stimme bekommen.

> **Credits:** Inspiriert von **Duolingo** (Lernpfad, Streaks, Herzen/Akku, Ligen,
> sprechende Figuren). Lernhub ist ein unabhängiges, nicht-kommerzielles Schulprojekt
> und nicht mit Duolingo verbunden. Duolingo® und Duo the Owl® sind Marken der
> Duolingo, Inc. Pingulin und die Crew sind eigene Figuren.

---

## Dateien im Projekt

| Datei                      | Zweck                                                             |
| -------------------------- | ----------------------------------------------------------------- |
| `opencode.json`            | OpenCode-Rechte für dieses Projekt (`bash` verboten)              |
| `content/bridge-token.js`  | Wird von der Bridge erzeugt (geheim, in `.gitignore`)             |
| `index.html`               | **Komplette App** (CSS+JS inline, ~1 Datei, keine Abhängigkeiten) |
| `AGENT.md`                 | Arbeitsanweisung für den OpenCode-Agenten + Daten-Schema          |
| `opencode-verbinden.cmd`   | Installations-Check + Start von Bridge & Agent                    |
| `agent/bridge.ps1`         | Lokale HTTP-Bridge (127.0.0.1:8799)                               |
| `agent/vollzugriff.ps1`    | PC-Auftrag bestätigen lassen + OpenCode mit Vollzugriff starten   |
| `content/erweiterungen.js` | Agent-schreibt-hier-neue-Inhalte rein                             |
| `content/status.json`      | Agent-Status (Warteschlange, letzter Lauf)                        |
| `content/auftraege/`       | Aufträge aus der App                                              |
| `content/cloud-config.js`  | Supabase-URL + anon key (leer = keine Bestenliste)                |
| `js/plus.js`               | Dashboard, Erklär-Modus, Notizen, Planer/Untis, Erinnerungen, Links |
| `js/cloud.js`              | Konto-Sitzung, Freunde, Bestenliste (Supabase über `fetch`)       |
| `js/konto.js`              | Anmelde-Bildschirm, Passwort-Reset, privater Cloud-Speicher       |
| `js/mascot.js`             | Pingulin & Crew (SVG-Gesichter), Stimmen, Mund-Animation          |
| `js/extra.js`              | Streak-Freeze, Ruhetage, Fokus-Timer, Countdown, Erfolge, PWA/Push |
| `js/social.js`             | Ligen, Klassen, Duelle, Untis-Proxy-Aufruf                        |
| `css/extra.css`            | Styles für die neuen Bereiche                                     |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installierbare App + Push-Empfang                  |
| `supabase/functions/`      | Edge Functions `push-reminders` und `untis-ics`                   |
| `supabase/push-cron.sql`   | pg_cron-Job für Push (alle 15 Min.)                               |
| `supabase/schema.sql`      | Tabellen, Indizes, RLS und Funktionen für Supabase                |
| `README.md`                | Diese Doku                                                        |
| `docs/AI-CHECKLISTE.md`    | Prüfprotokoll für eine andere KI                                  |
| `docs/PUBLIKATION.md`      | GitHub + Impressum vor Veröffentlichung                           |
| `LICENSE`                  | MIT                                                               |

## Daten & Datenschutz

- Fortschritt, Notizen, Stundenplan und Termine liegen im `localStorage` des
  Browsers (Key `lernhub_state_v1`); keine Cookies, kein Tracking.
- **Optional:** Wer ein Konto anlegt, sendet E-Mail, Spitzname und Lernzahlen an
  Supabase (Auftragsverarbeiter, Server in der gewählten Region – EU wählen).
  Die Sitzung liegt unter `lernhub_cloud_v1`. Konto löschen = alles weg.
- **Optionaler Cloud-Speicher (mit Konto, abschaltbar):** der ganze Lernstand
  (ohne API-Key, Untis-Link, Vault-Pfad, Push-Adresse) in `user_state`, nur für
  den Besitzer lesbar. Abgleich-Infos unter `lernhub_sync_v1`.
- Der Untis-Link wird an den eigenen Untis-Server gesendet – nur falls das an CORS
  scheitert und man eingeloggt ist, einmalig über die Edge Function `untis-ics`
  (reicht weiter, speichert nichts).
- Liga/Klasse/Duelle/Push sind freiwillig und brauchen ein Konto. Push speichert
  Push-Adresse, Startzeit und Ruhetage; ausschalten löscht sie.
- Export/Import (JSON) in den Einstellungen. Der Export enthält **nie** den
  API-Key oder den Untis-Link; der Import wird vollständig bereinigt.
- Vault-Pfad und Schul-URL (Agent-Panel) bleiben im Browser.
- API-Key (optional) nur lokal, wird ausschließlich an den eingestellten
  Endpunkt gesendet. Mikrofon nur bei Sprechübungen.
- Impressum/Datenschutz sind in der App eingebaut – **vor öffentlicher
  Veröffentlichung die Platzhalter ausfüllen** (siehe `docs/PUBLIKATION.md`).

## Browser-Support

Chromium (Edge, Chrome, Brave) = voll (Mikrofon-Erkennung). Firefox/Safari =
alles außer Spracherkennung (Tipp-Fallback greift automatisch). Offline per
Doppelklick nutzbar; über `file://` läuft alles außer dem Agenten-Ping
(der braucht die Bridge).

## Lizenz

MIT – siehe `LICENSE`. Vor Veröffentlichung den Copyright-Namen anpassen.

