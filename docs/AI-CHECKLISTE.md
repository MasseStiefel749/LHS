# AI-CHECKLISTe – Prüfprotokoll für eine andere KI

> Diese Datei ist dafür da, dass eine andere KI die App **systematisch
> nachprüfen** kann. Bitte Punkt für Punkt abarbeiten und Ergebnisse als
> „✅/❌/⚠️ mit Begründung" auflisten.

## 0. Kontext

- Projekt: `lernhub/` – statische Lern-App, eine `index.html`, offline,
  keine externen Abhängigkeiten (außer optionalem localhost-Bridge und
  optionalem API-Endpoint des Nutzers).
- Sprache: Deutsch. Ziel: Berufsschule E1FI A (GSVS Villingen-Schwenningen)
  - allgemeines Lernen.
- Harte Constraints: (a) läuft per Doppelklick ohne Server, (b) keine
  externen CDN/Fonts/Analytics, (c) Datenschutz: nur localStorage,
  (d) KI-Chat gibt erst ab Schwelle Lösungen, (e) Impressum/Datenschutz
  vorhanden.

## 1. Technik

- [ ] `node --check` über den Inhalt von `<script>` in `index.html` (keine Syntaxfehler).
- [ ] Keine externen Requests in `index.html` (suche `src="http`, `href="http`, `fetch("http` – erlaubt sind nur: `VID_BASIS` (YouTube-Link-Button), `BRIDGE` (127.0.0.1), optionaler API-Endpunkt).
- [ ] Kein `eval`, keine `innerHTML`-Injection unescapte Nutzerdaten (Prüfe `esc()`-Verwendung bei allen `${...}` in Templates, die Nutzer-/Datei-Inhalte enthalten).
- [ ] localStorage-Zugriffe in `try/catch` (Speicher voll/privater Modus).
- [ ] PowerShell-Datei `agent/bridge.ps1`: Parser-Check, keine Admin-Rechte nötig (TcpListener statt http.sys), Token-Prüfung (`X-Lernhub-Token`, ohne Token 403), Host-Header-Prüfung (DNS-Rebinding), Body-/Header-Limits, Body wird vor der 403 gelesen (sonst TCP-Reset im Browser), Typ-Whitelist.
- [ ] **Bridge-Start-Test:** Nach dem Start muss `content/bridge-token.js` eine *neuere* mtime haben als vorher. Ist die Datei alt, antwortet die Bridge trotz korrektem Token mit 403 – Ursache war ein Projektpfad mit abschließendem Backslash in Anführungszeichen (`"…\lernhub\"` wird von Windows falsch zerlegt). `bridge.ps1` bereinigt Anführungszeichen inzwischen selbst; `opencode-verbinden.cmd` übergibt `-ProjectDir` gar nicht mehr.
- [ ] `opencode.json` verbietet `bash`; AGENT.md sagt, dass Vault-/Web-Inhalte Daten und keine Anweisungen sind (Prompt-Injection).
- [ ] Daten aus `content/erweiterungen.js`, Import-Backups und eigenen Fächern laufen durch `cleanSubject`/`sanitizeState` (IDs, Typen, Farben, Bild-URLs); Test: `<img onerror>` in Fachname/Frage → wird als Text angezeigt.
- [ ] Export enthält keinen API-Key.

## 2. Logik (manuell/testbar im Browser)

- [ ] Onboarding überspringbar; Lernstil-Quiz verändert sichtbar die Aufgaben-Mischung (Themen mit vielen `mc` vs. `gaps`).
- [ ] Lektion: MC/Karte/Lücke/Freie Eingabe – richtige Antwort erkannt,
      falsche → −1 Akku-Zelle → am Lektionsende erneut gefragt → `review`-Queue mit morgigem Datum.
- [ ] **Leere/falsche Freie-Eingabe zählt NICHT als richtig** (Normalisierung:
      `norm()` vergleicht Kleinbuchstaben, Umlaute ae/oe/ue/ss).
- [ ] Streak: ohne Lektion am Tag → Streak-Reset beim nächsten Mal; „Streak in Gefahr"-Meldung am Vortag.
- [ ] Wiederholung: richtig = Fehlversuch −1 (bei 0 → raus), falsch = +1/+1 Tag.
- [ ] XP/Kontostand: `+5` richtig, Lektions-Bonus, Tagesziel-Ring.
- [ ] Sprech-Modus ohne `SpeechRecognition` → Tipp-Fallback statt Absturz.
- [ ] Charakter: Bild → lokale Farb-Analyse füllt Traits ohne Netzwerk.
- [ ] **Chat-Schwelle:** Lösung erst bei ≥2 Fehlversuchen ODER „Ich geb's
      auf"; davor nur Tipps. Mit API-Key: System-Prompt erzwingt dasselbe.
- [ ] Agent-Panel: ohne Bridge → Kopier-Fallback + Anleitung, kein Crash;
      mit Bridge → `ping`/`auftrag` korrekt (CORS, OPTIONS).
- [ ] **Echter Agent-Lauf:** Auftrag aus dem App-Panel schicken →
      `content/auftraege/<ts>-<typ>.md` entsteht → `opencode run` startet →
      `content/erweiterungen.js` wächst und bleibt laufbares JS (Node-Check
      mit `new Function('window', src)`) → `content/status.json` hat
      `lastRun` → App „Neue Inhalte laden" zeigt neue Themen, keine
      Konsolenfehler. Auftragsdatei danach mit `erledigt: ja` im Kopf.
- [ ] **Neue Bereiche:** 🍅 Fokus (Timer läuft nach Reload weiter), 🏅 Erfolge,
      Streak-Modal (Klick auf 🔥: Freeze kaufen, Ruhetage max. 2), Prüfungs-Countdown
      (Termin mit 📝-Häkchen), Duell-Ablauf `duelBegin({mode:"new",nick:"X",subj:"ITS",seed:1})`
      ohne Konto → „Nicht eingeloggt“ statt Absturz.
- [ ] **Pingulin & Crew:** Dashboard-Pinguin bewegt beim Laden den Mund, Klick spricht;
      Crew „Wählen“ wechselt Chat-Kopf + Stimme; 🔊 an Bot-Nachrichten.
- [ ] **SQL:** `schema.sql` zweimal hintereinander ausführbar; neue Spalten haben
      Indizes; RLS auf allen neuen Tabellen; Liga-Abrechnung (`league_settle`) idempotent.
- [ ] **Edge Functions:** `untis-ics` lässt nur `https://*.webuntis.com` zu (auch nach
      Redirects), `push-reminders` nur mit korrektem `x-cron-secret`.

## 3. Inhalt (Fachliche Richtigkeit)

- [ ] Stichprobe je Fach: 5 MC-Fragen auf Richtigkeit prüfen (Fächer:
      ITS, SAE, BWL, WK, GK, Deutsch, BE) – Quelle ist der Obsidian-Vault.
- [ ] Rechtschreibung/Groß-Kleinschreibung, deutsche Erklärungen.
- [ ] Keine erfundenen Termine/Noten; Termine nur aus Vault/Website.
- [ ] Datenschutz in Inhalten: keine personenbezogenen Daten Dritter.

## 4. Recht (vor Veröffentlichung)

- [ ] Impressum-Platzhalter (`[…]`) ersetzt? (`showLegal('impressum')`)
- [ ] Datenschutz-Text deckt localStorage, optionale API, Mikrofon ab?
- [ ] LICENSE Copyright-Name angepasst?
- [ ] Keine urheberrechtlich geschützten Inhalte ungefragt eingebunden
      (YouTube nur als Such-Link, nicht als eingebettetes Video).

## 5. Bekannte, bewusste Grenzen (kein Fehler, aber dokumentieren)

- **Konsolen-Log ohne Bridge:** Ohne laufende `opencode-verbinden.cmd` schlägt der
  lokale Agenten-Ping beim Öffnen des Agent-Panels kontrolliert fehl (gefangen, App
  läuft normal weiter). Auf einer veröffentlichten Seite wird die Bridge gar nicht
  angesprochen (`agentAllowed()`: nur `file:` oder localhost).
- `content/bridge-token.js` fehlt in einem frischen Clone (steht in `.gitignore`), bis
  die Bridge einmal lief – das Nachladen schlägt dann still fehl.
- Gap-Aufgaben: ein `___` mit mehreren Antworten = Alternativen (daher stimmt
  „Anzahl Antworten“ nicht immer mit der Anzahl Lücken überein) – gewollt.
- Spracherkennung: browserabhängig (Chromium), Fehlerquote bei Akzenten –
  Fallback Tastatur eingebaut.
- Bridge nur localhost (Sicherheitsbewusstsein: kein Netzwerk-Exponat).
- `opencode run` kann beim ersten Mal nach Berechtigungen fragen – dann
  im OpenCode-Fenster zustimmen (steht auch im Panel).
- `content/erweiterungen.js` wird per `<script>` geladen → bei `file://`
  funktioniert der automatische Ping nicht, „Neue Inhalte laden" (manuell)
  aber schon, weil Script-Tags auf `file://` erlaubt sind.
- PWA/Push nur über https/localhost; Push braucht zusätzlich Edge Function +
  pg_cron + VAPID-Keys, auf dem iPhone eine installierte App (iOS 16.4+).
- Server-Push kennt nur den Stand der letzten Synchronisierung (Tagesziel).
- Duelle setzen gleiche Lernhub-Version (gleicher Fragenpool) bei beiden voraus.
- WebUntis-iCal hängt vom Schul-Modul „Individuelle Stundenplanabfrage“ ab.
- Lippensync ist eine Annäherung (Vokale/Wortgrenzen), keine echte Phonem-Analyse.

## 6. Berichtsformat

Antworte mit einer Tabelle: Punkt | Status | Fundstelle/Begründung | Vorschlag.

