/* =========================================================================
   content/erweiterungen.js – wird vom OpenCode-Agenten beschrieben (nicht manuell).
   Schema (siehe AGENT.md im Projektordner):
   window.LERNHUB_EXT = {
     subjects: [ { id, name, color, topics:[ {id,name,mc[],cards[],gaps[],free[]} ] } ],
     sprachen: { "Englisch": { flag, vok:[{de,en}], calls:[{title,lines:[{bot,expect[]}]}] } },
     schulen:  [ "Name der weiteren Schule" ],
     termine:  [ { datum, titel, fach } ]
   }
   Die App bindet die Datei beim Start ein (script-Tag) – danach Neuladen genügt.
   ========================================================================= */
window.LERNHUB_EXT = {
  subjects: [
    {
      id: "ITS",
      name: "ITS – Systeme & Netze",
      color: "#2563eb",
      topics: [
        {
          id: "hardware",
          name: "PC-Hardware & Speicher",
          mc: [
            {
              q: "Welcher Speicher ist flüchtig und verliert beim Ausschalten seine Daten?",
              c: ["RAM", "ROM", "BIOS", "SSD"],
              a: 0,
              w: "Das RAM (Arbeitsspeicher) ist flüchtig; es hält Programme und Daten nur, solange der PC läuft.",
            },
            {
              q: "Was enthält das BIOS/UEFI im ROM?",
              c: [
                "Das Initialisierungsprogramm mit POST und Bootreihenfolge",
                "Die Benutzerdateien",
                "Das Betriebssystem",
                "Die Anwendungsprogramme",
              ],
              a: 0,
              w: "BIOS/UEFI startet den Rechner: Hardware-Test (POST), Bootreihenfolge, dann wird das Betriebssystem geladen.",
            },
            {
              q: "Woraus besteht die Zentraleinheit?",
              c: [
                "Prozessor und Hauptspeicher",
                "Monitor und Tastatur",
                "SSD und Netzteil",
                "Maus und Drucker",
              ],
              a: 0,
              w: "Die Zentraleinheit = CPU (Steuerwerk + Rechenwerk) + Hauptspeicher (RAM + ROM).",
            },
            {
              q: "Warum steigert man die CPU-Leistung heute über mehr Kerne statt über höheren Takt?",
              c: [
                "Höherer Takt erzeugt zu viel Abwärme",
                "Mehr Kerne sind immer teurer",
                "Takt lässt sich nicht messen",
                "Kerne verbrauchen keinen Strom",
              ],
              a: 0,
              w: "Ab etwa 5 GHz ist die Abwärme das Hauptproblem. Mehr Kerne bringen Leistung bei weniger Energie.",
            },
            {
              q: "Welche Aussage über die Festplatte (HDD) stimmt?",
              c: [
                "Sie hat bewegliche Teile und ist empfindlich gegen Stöße",
                "Sie hat keine beweglichen Teile",
                "Sie ist stoßunempfindlich wie eine SSD",
                "Sie verliert ohne Strom nach Minuten alle Daten",
              ],
              a: 0,
              w: "HDDs arbeiten mechanisch mit Magneten und Platten – dadurch stoßempfindlich, aber langlebig für Lagerung.",
            },
            {
              q: "Wofür steht EVA?",
              c: [
                "Eingabe, Verarbeitung, Ausgabe",
                "Eingabe, Verteilung, Ausgabe",
                "Elektronik, Verarbeitung, Anschluss",
                "Eingabe, Verarbeitung, Analyse",
              ],
              a: 0,
              w: "EVA beschreibt die Kernfunktion jedes Computers: Eingabe → Verarbeitung → Ausgabe.",
            },
          ],
          cards: [
            {
              f: "RAM",
              b: "Flüchtiger Arbeitsspeicher – hält aktive Programme und Daten nur während des Betriebs.",
            },
            { f: "ROM", b: "Nur lesbarer Systemspeicher – enthält BIOS/UEFI und den Bootloader." },
            { f: "EVA-Prinzip", b: "Eingabe → Verarbeitung → Ausgabe." },
            { f: "Hauptspeicher", b: "Besteht aus RAM und ROM." },
            { f: "Zentraleinheit", b: "Prozessor (Steuerwerk + Rechenwerk) + Hauptspeicher." },
            {
              f: "HDD",
              b: "Mechanische Festplatte: bewegliche Teile, stoßempfindlich, Daten bleiben ohne Strom über Jahre erhalten.",
            },
            {
              f: "SSD",
              b: "Keine beweglichen Teile, stoßunempfindlich, aber begrenzte Schreibzyklen (Wear-Leveling).",
            },
            {
              f: "BIOS/UEFI",
              b: "Initialisierungsprogramm im ROM: POST → Bootreihenfolge → Betriebssystem.",
            },
          ],
          gaps: [
            { t: "Das BIOS/UEFI liegt im ___.", a: ["rom", "systemspeicher"] },
            {
              t: "Die Zentraleinheit besteht aus Prozessor und ___.",
              a: ["hauptspeicher", "arbeitsspeicher"],
            },
            {
              t: "Der Arbeitsspeicher ist ___ und verliert beim Ausschalten seine Daten.",
              a: ["fluechtig", "flüchtig"],
            },
            { t: "Das ___-Prinzip lautet Eingabe, Verarbeitung, Ausgabe.", a: ["eva"] },
            { t: "Die ___ ist ein Langzeitspeicher ohne bewegliche Teile.", a: ["ssd"] },
          ],
          free: [
            {
              q: "Nenne den Unterschied zwischen RAM und ROM.",
              a: [
                "RAM ist flüchtiger Arbeitsspeicher, ROM ist nur lesbar und enthält BIOS/UEFI",
                "RAM flüchtig, ROM nicht flüchtig und nur lesbar",
              ],
              w: "RAM hält Daten nur bei Strom, ROM ist dauerhaft und nur lesbar.",
            },
            {
              q: "Erkläre kurz das EVA-Prinzip.",
              a: ["Eingabe, Verarbeitung, Ausgabe", "EVA bedeutet Eingabe Verarbeitung Ausgabe"],
              w: "Jeder Computer nimmt Eingaben entgegen, verarbeitet sie und gibt Ergebnisse aus.",
            },
          ],
        },
        {
          id: "pc_aufbau",
          name: "PC-Aufbau & Bus-Systeme",
          mc: [
            {
              q: "Welcher Bus ist bidirektional?",
              c: ["Datenbus", "Adressbus", "Steuerbus", "Taktbus"],
              a: 0,
              w: "Der Datenbus überträgt Daten hin und zurück und ist daher bidirektional.",
            },
            {
              q: "Welche Aufgabe hat der Adressbus?",
              c: [
                "Er gibt die 'Hausnummer' der Baugruppe an",
                "Er überträgt die Nutzdaten",
                "Er überträgt Lesen/Schreiben-Signale",
                "Er liefert die Taktfrequenz",
              ],
              a: 0,
              w: "Der Adressbus adressiert die Baugruppe bzw. Speicherzelle – vergleichbar mit einer Hausnummer.",
            },
            {
              q: "Woraus besteht der Systembus?",
              c: [
                "Datenbus, Adressbus und Steuerbus",
                "Nur Datenbus",
                "Netzwerk- und USB-Bus",
                "Cache und Register",
              ],
              a: 0,
              w: "Der Systembus ist die Summe aus Daten-, Adress- und Steuerbus.",
            },
            {
              q: "Welche Reihenfolge beschreibt die Von-Neumann-Struktur grob?",
              c: [
                "Eingabe → Prozessor → Arbeitsspeicher → Ausgabe",
                "Ausgabe → Eingabe → Prozessor",
                "Prozessor → Ausgabe → Eingabe",
                "Netzwerk → Prozessor → Drucker",
              ],
              a: 0,
              w: "Bei Von Neumann werden Programm und Daten im Arbeitsspeicher gehalten und vom Prozessor verarbeitet.",
            },
            {
              q: "Welche Busse sind unidirektional?",
              c: [
                "Adress- und Steuerbus",
                "Daten- und Adressbus",
                "Nur der Datenbus",
                "Alle Busse",
              ],
              a: 0,
              w: "Adress- und Steuerbus gehen nur vom Prozessor zu den Baugruppen; der Datenbus ist bidirektional.",
            },
            {
              q: "Wozu dient der ASCII-Code?",
              c: [
                "Zur genormten Darstellung von Zeichen",
                "Zur Berechnung des Widerstands",
                "Zur IP-Adressvergabe",
                "Zur Steuerung der CPU-Taktung",
              ],
              a: 0,
              w: "ASCII ist ein international genormter Zeichensatz (7/8 Bit) für Buchstaben, Ziffern und Sonderzeichen.",
            },
          ],
          cards: [
            { f: "Datenbus", b: "Bidirektional, der dickste Bus – überträgt die Daten." },
            {
              f: "Adressbus",
              b: "Unidirektional (Prozessor → Baugruppe) – 'Hausnummer' der Baugruppe.",
            },
            {
              f: "Steuerbus",
              b: "Unidirektional (Prozessor → Baugruppe) – signalisiert Lesen/Schreiben.",
            },
            { f: "Systembus", b: "Datenbus + Adressbus + Steuerbus." },
            {
              f: "Von Neumann",
              b: "Programm und Daten liegen im Arbeitsspeicher; Prozessor + Speicher bilden das Zentrum.",
            },
            { f: "ASCII", b: "Genormter Zeichensatz, international gültig, 7/8 Bit." },
          ],
          gaps: [
            {
              t: "Der ___ ist der einzige Bus, der Daten in beide Richtungen überträgt.",
              a: ["datenbus"],
            },
            { t: "Der Adressbus und der Steuerbus sind ___.", a: ["unidirektional"] },
            { t: "Der Systembus besteht aus Datenbus, Adressbus und ___.", a: ["steuerbus"] },
            { t: "Der ___ Code ist ein international genormter Zeichensatz.", a: ["ascii"] },
            {
              t: "Die Von-Neumann-Struktur hält das Programm im ___ fest.",
              a: ["arbeitsspeicher", "hauptspeicher"],
            },
          ],
          free: [
            {
              q: "Erkläre den Unterschied zwischen Datenbus und Adressbus.",
              a: [
                "Der Datenbus überträgt Daten bidirektional, der Adressbus nennt unidirektional die Zieladresse der Baugruppe",
                "Datenbus bidirektional für Daten, Adressbus unidirektional für Adressen",
              ],
              w: "Datenbus = Daten hin und zurück; Adressbus = nur Prozessor gibt die Adresse vor.",
            },
            {
              q: "Nenne die drei Busse des Systembusses und ihre Übertragungsrichtung.",
              a: [
                "Datenbus bidirektional, Adressbus und Steuerbus unidirektional",
                "Datenbus, Adressbus, Steuerbus; nur der Datenbus ist bidirektional",
              ],
              w: "Nur der Datenbus ist bidirektional, Adress- und Steuerbus sind unidirektional.",
            },
          ],
        },
        {
          id: "elektrotechnik",
          name: "Elektrotechnik Grundlagen",
          mc: [
            {
              q: "Wie lautet das Ohmsche Gesetz?",
              c: ["R = U / I", "R = U · I", "R = I / U", "R = P / U"],
              a: 0,
              w: "Der Widerstand ergibt sich aus Spannung geteilt durch Stromstärke: R = U / I.",
            },
            {
              q: "Wie lautet die erste der 5 Sicherheitsregeln?",
              c: [
                "Freischalten",
                "Gegen Wiedereinschalten sichern",
                "Spannungsfreiheit feststellen",
                "Erden und kurzschließen",
              ],
              a: 0,
              w: "Reihenfolge: 1. Freischalten, 2. gegen Wiedereinschalten sichern, 3. Spannungsfreiheit feststellen, 4. erden/kurzschließen, 5. benachbarte Teile abdecken.",
            },
            {
              q: "Ab welcher Stromstärke gilt Strom als lebensgefährlich?",
              c: ["Ab etwa 50 mA", "Ab etwa 5 mA", "Ab etwa 500 mA", "Ab etwa 5 A"],
              a: 0,
              w: "Ab etwa 50 mA kann es zu Muskelverkrampfung und Herzkammerflimmern kommen – lebensgefährlich.",
            },
            {
              q: "Wie misst man die Spannung?",
              c: [
                "Mit dem Voltmeter parallel zum Verbraucher",
                "Mit dem Amperemeter in Reihe",
                "Mit dem Multimeter in Reihe",
                "Indem man den Stromkreis auftrennt",
              ],
              a: 0,
              w: "Das Voltmeter wird parallel geschaltet, das Amperemeter dagegen in Reihe.",
            },
            {
              q: "Wie berechnet man die Stromdichte J?",
              c: ["J = I / A", "J = I · A", "J = U / I", "J = R / I"],
              a: 0,
              w: "Stromdichte = Stromstärke geteilt durch den Leiterquerschnitt: J = I / A.",
            },
            {
              q: "Wie groß ist die Elementarladung e?",
              c: ["1,602 · 10⁻¹⁹ C", "1,602 · 10⁻⁶ C", "9,81 C", "3,14 C"],
              a: 0,
              w: "Die Elementarladung beträgt e = 1,602176634 · 10⁻¹⁹ C – die Ladung eines Elektrons bzw. Protons.",
            },
            {
              q: "Gleichartige elektrische Ladungen ...",
              c: ["stoßen sich ab", "ziehen sich an", "sind neutral", "löschen sich aus"],
              a: 0,
              w: "Gleichartige Ladungen stoßen sich ab, ungleichartige ziehen sich an.",
            },
            {
              q: "Was besagt die technische Stromrichtung?",
              c: [
                "Sie zeigt in Schaltplänen von Plus nach Minus",
                "Sie zeigt immer von Minus nach Plus",
                "Sie ist identisch mit dem Elektronenfluss",
                "Sie gilt nur bei Wechselstrom",
              ],
              a: 0,
              w: "In Schaltplänen fließt der technische Strom von Plus nach Minus; die Elektronen bewegen sich umgekehrt.",
            },
          ],
          cards: [
            { f: "Ohmsches Gesetz", b: "R = U / I – Einheit Ohm (Ω)." },
            { f: "Stromstärke", b: "I = Q / t – Einheit Ampere (A), 1 A = 1 C/s." },
            { f: "Elektrische Leistung", b: "P = U · I." },
            {
              f: "Stromdichte",
              b: "J = I / A – je größer der Strom und kleiner der Querschnitt, desto mehr Wärme.",
            },
            { f: "Leitwert", b: "G = 1 / R = I / U – Einheit Siemens (S)." },
            {
              f: "5 Sicherheitsregeln",
              b: "Freischalten → gegen Wiedereinschalten sichern → Spannungsfreiheit feststellen → erden/kurzschließen → benachbarte Teile abdecken.",
            },
            {
              f: "Gefahrengrenze",
              b: "Ab etwa 50 mA lebensgefährlich; über 50 V AC bzw. 120 V DC lebensgefährlich.",
            },
            { f: "Messgeräte", b: "Voltmeter parallel, Amperemeter in Reihe." },
          ],
          gaps: [
            { t: "Das Ohmsche Gesetz lautet R = U / ___.", a: ["i"] },
            { t: "Die Stromstärke berechnet man mit I = ___ / t.", a: ["q"] },
            { t: "Die elektrische Leistung ist P = U · ___.", a: ["i"] },
            { t: "Das Voltmeter wird ___ zum Verbraucher geschaltet.", a: ["parallel"] },
            { t: "Ab etwa ___ mA gilt ein Strom als lebensgefährlich.", a: ["50"] },
            { t: "Die erste Sicherheitsregel lautet: ___.", a: ["freischalten"] },
          ],
          free: [
            {
              q: "Nenne die 5 Sicherheitsregeln in der richtigen Reihenfolge.",
              a: [
                "Freischalten, gegen Wiedereinschalten sichern, Spannungsfreiheit feststellen, erden und kurzschließen, benachbarte Teile abdecken",
                "1 Freischalten 2 gegen Wiedereinschalten sichern 3 Spannungsfreiheit feststellen 4 erden und kurzschließen 5 benachbarte Teile abdecken",
              ],
              w: "Die Reihenfolge ist sicherheitsentscheidend und muss eingehalten werden.",
            },
            {
              q: "Ein Gerät hat 230 V und 40 Ω. Berechne den Strom.",
              a: ["5,75 a", "5.75 a", "5,75a", "5.75a"],
              w: "I = U / R = 230 V / 40 Ω = 5,75 A.",
            },
          ],
        },
        {
          id: "netzwerk_befehle",
          name: "Netzwerk-Grundlagen & Befehle",
          mc: [
            {
              q: "Welcher Befehl zeigt alle IP-Konfigurationen an?",
              c: ["ipconfig /all", "ping", "tracert", "nslookup"],
              a: 0,
              w: "ipconfig /all listet IP-Adresse, Subnetzmaske, Gateway und DNS-Server auf.",
            },
            {
              q: "Wofür steht DNS?",
              c: [
                "Domain Name System",
                "Digital Network Service",
                "Data Node System",
                "Direct Network Switch",
              ],
              a: 0,
              w: "DNS übersetzt Domainnamen wie example.com in IP-Adressen.",
            },
            {
              q: "Welcher Befehl prüft die Erreichbarkeit eines Hosts?",
              c: ["ping", "ipconfig", "netstat", "tracert"],
              a: 0,
              w: "ping sendet Testpakete an einen Host und zeigt, ob er antwortet.",
            },
            {
              q: "Welche Subnetzmaske gehört zu /24?",
              c: ["255.255.255.0", "255.255.0.0", "255.0.0.0", "255.255.255.255"],
              a: 0,
              w: "/24 bedeutet 24 gesetzte Bits: 255.255.255.0 mit 254 nutzbaren Hosts.",
            },
            {
              q: "Wie viele nutzbare Hosts hat ein /24-Netz?",
              c: ["254", "256", "255", "512"],
              a: 0,
              w: "2^8 = 256 Adressen, minus Netz- und Broadcastadresse ergibt 254 nutzbare Hosts.",
            },
            {
              q: "Welche OSI-Schicht liegt auf Platz 3?",
              c: ["Netzwerk", "Transport", "Sicherung", "Physik"],
              a: 0,
              w: "Schicht 3 ist die Netzwerkschicht – hier arbeitet das IP-Protokoll.",
            },
            {
              q: "Welches Protokoll arbeitet auf OSI-Schicht 4?",
              c: ["TCP/UDP", "IP", "HTTP", "Ethernet"],
              a: 0,
              w: "Auf der Transportschicht (4) arbeiten TCP und UDP.",
            },
            {
              q: "Was macht nslookup?",
              c: [
                "Es fragt DNS-Namen und IP-Adressen ab",
                "Es misst die Bandbreite",
                "Es installiert Treiber",
                "Es formatiert die Festplatte",
              ],
              a: 0,
              w: "nslookup dient zur DNS-Abfrage, also zur Auflösung von Namen in IP-Adressen.",
            },
          ],
          cards: [
            { f: "ipconfig /all", b: "Zeigt die komplette IP-Konfiguration des Clients." },
            { f: "ping", b: "Prüft die Erreichbarkeit eines Hosts." },
            { f: "tracert", b: "Zeigt den Weg (die Hops) zum Ziel." },
            { f: "nslookup", b: "Fragt DNS-Einträge ab." },
            { f: "netstat -ano", b: "Zeigt offene Verbindungen und Ports." },
            { f: "/24", b: "255.255.255.0 – 254 nutzbare Hosts." },
            {
              f: "OSI-Schichten",
              b: "1 Physik, 2 Sicherung, 3 Netz (IP), 4 Transport (TCP/UDP), 5-7 Anwendung.",
            },
          ],
          gaps: [
            { t: "Der Befehl ___ prüft, ob ein Host erreichbar ist.", a: ["ping"] },
            { t: "Die Subnetzmaske von /24 lautet 255.255.255.___.", a: ["0"] },
            { t: "Ein /24-Netz hat ___ nutzbare Hosts.", a: ["254"] },
            { t: "___ übersetzt Domainnamen in IP-Adressen.", a: ["dns"] },
            { t: "Auf OSI-Schicht 3 arbeitet das Protokoll ___.", a: ["ip"] },
          ],
          free: [
            {
              q: "Nenne drei Netzwerkbefehle und was sie tun.",
              a: [
                "ping prüft Erreichbarkeit, ipconfig zeigt IP-Konfiguration, nslookup fragt DNS ab",
                "ipconfig, ping, tracert: IP anzeigen, Erreichbarkeit prüfen, Weg verfolgen",
              ],
              w: "Alle drei gehören zum Grundwerkzeug der Netzwerkdiagnose.",
            },
            {
              q: "Erkläre kurz, was ein /24-Subnetz ist.",
              a: [
                "Ein Netz mit 24 Bit Netzanteil und der Maske 255.255.255.0 mit 254 nutzbaren Hosts",
                "/24 bedeutet 255.255.255.0 und 254 Hosts",
              ],
              w: "Die ersten 24 Bit legen das Netz fest, die letzten 8 Bit adressieren die Hosts.",
            },
          ],
        },
        {
          id: "zahlensysteme",
          name: "Zahlensysteme & Boolsche Algebra",
          mc: [
            {
              q: "Wie lautet die Binärzahl 1101 im Dezimalsystem?",
              c: ["13", "11", "9", "14"],
              a: 0,
              w: "1101 = 8 + 4 + 0 + 1 = 13. Merke aus dem ITS-Spickzettel: 1101 = 13.",
            },
            {
              q: "Wie groß ist der Hexadezimalwert 0xFF?",
              c: ["255", "15", "16", "128"],
              a: 0,
              w: "FF = 15 · 16 + 15 = 255 – das sind 2 hoch 8 minus 1.",
            },
            {
              q: "Wie viele Bit hat ein Byte?",
              c: ["8", "4", "16", "32"],
              a: 0,
              w: "Ein Byte besteht aus 8 Bit und hat damit 2 hoch 8 = 256 mögliche Werte.",
            },
            {
              q: "Welche Ziffern benutzt das Hexadezimalsystem?",
              c: ["0 bis 9 und A bis F", "nur 0 und 1", "0 bis 7", "0 bis 9 und G bis L"],
              a: 0,
              w: "Hex ist das 16er-System: Ziffern 0–9 plus die Buchstaben A bis F.",
            },
            {
              q: "Welche boolsche Operation ergibt 1, wenn beide Eingaben 1 sind?",
              c: ["UND (AND)", "ODER (OR)", "NEGATION (NOT)", "XOR"],
              a: 0,
              w: "UND ist nur wahr (1), wenn beide Operanden wahr (1) sind.",
            },
            {
              q: "Was macht die NEGATION?",
              c: [
                "Sie kehrt das Ergebnis um: aus 1 wird 0",
                "Sie addiert beide Werte",
                "Sie speichert den Wert dauerhaft",
                "Sie misst die Spannung",
              ],
              a: 0,
              w: "Die Negation invertiert den Wahrheitswert: 1 wird 0 und 0 wird 1.",
            },
            {
              q: "In welchem Zahlensystem arbeitet die Digitalechnik grundlegend?",
              c: ["Binär", "Dezimal", "Hexadezimal", "Oktal"],
              a: 0,
              w: "Computer speichern und rechnen mit Binärzahlen, also mit den Zuständen 0 und 1.",
            },
            {
              q: "Wie lautet die Dezimalzahl 13 im Binärsystem?",
              c: ["1101", "1011", "1110", "1001"],
              a: 0,
              w: "8 + 4 + 0 + 1 = 13, also 1101 – der Gegenwert zur ersten Frage.",
            },
            {
              q: "Wie lautet die Binärzahl 1011 im Dezimalsystem?",
              c: ["11", "9", "13", "14"],
              a: 0,
              w: "1011 = 8 + 0 + 2 + 1 = 11 – die Stellen stehen für die Zweierpotenzen 8, 4, 2, 1.",
            },
            {
              q: "Welche boolsche Operation ergibt 1, wenn genau eine der beiden Eingaben 1 ist?",
              c: ["XOR (exklusives ODER)", "UND (AND)", "ODER (OR)", "NEGATION (NOT)"],
              a: 0,
              w: "XOR liefert 1 nur bei ungleichen Eingaben: 0 XOR 1 = 1, aber 1 XOR 1 = 0.",
            },
            {
              q: "Wann ist das Ergebnis der Operation ODER (OR) gleich 0?",
              c: [
                "Wenn beide Eingaben 0 sind",
                "Wenn mindestens eine Eingabe 1 ist",
                "Wenn die Eingaben verschieden sind",
                "Wenn beide Eingaben 1 sind",
              ],
              a: 0,
              w: "ODER ergibt 0 nur im einzigen Fall 0 ODER 0 – in allen anderen Kombinationen 1.",
            },
            {
              q: "Was macht die ALU im Rechenwerk der CPU?",
              c: [
                "Sie führt arithmetische und logische Operationen aus",
                "Sie speichert Programme dauerhaft",
                "Sie übersetzt IP-Adressen",
                "Sie erzeugt das Bild auf dem Monitor",
              ],
              a: 0,
              w: "ALU = arithmetisch-logische Einheit: rechnet (+ − × ÷) und prüft logische Operationen wie UND, ODER, NEGATION.",
            },
          ],
          cards: [
            { f: "Binärsystem", b: "Nur 0 und 1 – Grundlage der Digitaltechnik; 1101 = 13." },
            { f: "Byte", b: "8 Bit – 256 mögliche Werte (2 hoch 8)." },
            { f: "Hexadezimalsystem", b: "Ziffern 0–9 und A–F; 0xFF = 255." },
            { f: "2 hoch 8", b: "256 – z. B. 256 Adressen, davon 254 nutzbar im /24-Netz." },
            { f: "UND (AND)", b: "Nur 1, wenn beide Eingaben 1 sind." },
            { f: "NEGATION (NOT)", b: "Kehrt um: aus 1 wird 0, aus 0 wird 1." },
            {
              f: "ODER (OR)",
              b: "Ergebnis 1, sobald mindestens eine Eingabe 1 ist; nur 0 bei 0 ODER 0.",
            },
            {
              f: "XOR (exklusives ODER)",
              b: "1, wenn die Eingaben verschieden sind; 1 XOR 1 = 0.",
            },
            {
              f: "ALU",
              b: "Arithmetisch-logische Einheit im Rechenwerk der CPU – führt + − × ÷ und UND/ODER/NEGATION aus.",
            },
          ],
          gaps: [
            { t: "Die Binärzahl 1101 entspricht der Dezimalzahl ___.", a: ["13"] },
            { t: "Ein Byte besteht aus ___ Bit.", a: ["8", "acht"] },
            { t: "Der Hexadezimalwert 0xFF entspricht ___ im Dezimalsystem.", a: ["255"] },
            { t: "Nach der 9 folgen im Hexadezimalsystem die Buchstaben bis ___.", a: ["f"] },
            { t: "2 hoch 8 ergibt ___.", a: ["256"] },
            { t: "Die Binärzahl 1011 entspricht der Dezimalzahl ___.", a: ["11"] },
            { t: "1 XOR 1 ergibt ___.", a: ["0", "null"] },
            {
              t: "Die ___ ist die arithmetisch-logische Einheit im Rechenwerk der CPU.",
              a: ["alu"],
            },
          ],
          free: [
            {
              q: "Wandle die Dezimalzahl 13 in das Binärsystem um.",
              a: ["1101", "1101 bin"],
              w: "8 + 4 + 0 + 1 = 13, also 1101.",
            },
            {
              q: "Erkläre kurz, was die boolsche Operation UND macht.",
              a: [
                "Das Ergebnis ist nur 1, wenn beide Eingaben 1 sind",
                "UND ergibt 1, wenn beide Operanden wahr sind",
              ],
              w: "Bei UND müssen beide Bedingungen gleichzeitig erfüllt sein.",
            },
            {
              q: "Wandle die Dezimalzahl 11 in das Binärsystem um.",
              a: ["1011", "1011 bin", "8 + 2 + 1 = 1011"],
              w: "8 + 2 + 1 = 11, also 1011 – Stellenwerte von rechts: 1, 2, 4, 8.",
            },
            {
              q: "Erkläre kurz, wann das Ergebnis von XOR (exklusives ODER) 1 ist.",
              a: [
                "XOR ergibt 1, wenn genau eine der beiden Eingaben 1 ist, also wenn die Eingaben verschieden sind",
                "Wenn die Eingaben unterschiedlich sind, ist das Ergebnis 1",
              ],
              w: "XOR prüft Ungleichheit: 0 XOR 1 = 1, 1 XOR 1 = 0.",
            },
          ],
        },
        {
          id: "pc_montage_esd",
          name: "PC-Montage & ESD-Schutz",
          mc: [
            {
              q: "Was macht man vor Arbeitsbeginn an einem PC zuerst?",
              c: [
                "Die Verbindung zum Versorgungsnetz trennen",
                "Das Netzteil auf maximale Leistung stellen",
                "Alle Lüfter abklemmen",
                "Das Betriebssystem neu installieren",
              ],
              a: 0,
              w: "Regel 1 der PC-Komponenten-Behandlung: Vor Arbeitsbeginn die Verbindung zum Versorgungsnetz trennen.",
            },
            {
              q: "Wozu dient ein geerdetes Armband bei der PC-Montage?",
              c: [
                "Es leitet elektrostatische Ladung ab und schützt Bauteile",
                "Es misst die Spannung im Netzteil",
                "Es kühlt den Prozessor",
                "Es speichert die BIOS-Einstellungen",
              ],
              a: 0,
              w: "Elektrostatische Entladung kann empfindliche Bauteile zerstören – das Armband leitet die Ladung ab.",
            },
            {
              q: "Wie fasst man Platinen beim Einbau richtig an?",
              c: [
                "Nur an den Kanten, ohne Bauteile oder Kontakte zu berühren",
                "An den Goldkontakten",
                "An den Kondensatoren",
                "Beliebig, Hauptsache trockene Hände",
              ],
              a: 0,
              w: "Regel 5: Platinen nur an den Kanten anfassen – Bauteile und Kontakte nicht berühren.",
            },
            {
              q: "Warum darf man Platinen nicht durchbiegen?",
              c: [
                "Es entstehen Mikrorisse, die später zu Ausfällen führen",
                "Die Farbe platzt ab",
                "Das BIOS wird gelöscht",
                "Die Garantie erlischt sofort",
              ],
              a: 0,
              w: "Regel 9: Platinen nicht durchbiegen – Mikrorisse können die Leiterbahnen beschädigen.",
            },
          ],
          cards: [
            {
              f: "ESD-Schutz",
              b: "Geerdetes Armband tragen und Komponenten auf einer antistatischen Matte ablegen.",
            },
            {
              f: "Platinen anfassen",
              b: "Nur an den Kanten – nie Bauteile oder Kontakte berühren.",
            },
            {
              f: "Vor dem Einbau",
              b: "Komponenten auf Beschädigungen prüfen und bis zum Einbau in der Originalverpackung lassen.",
            },
          ],
          gaps: [
            {
              t: "Vor Arbeitsbeginn trennt man die Verbindung zum ___.",
              a: ["versorgungsnetz", "stromnetz"],
            },
            { t: "Platinen fasst man nur an den ___ an.", a: ["kanten"] },
            { t: "Beim Einbau drückt man ICs vorsichtig in den ___.", a: ["sockel"] },
          ],
          free: [
            {
              q: "Nenne drei Regeln für die Behandlung von PC-Komponenten.",
              a: [
                "Verbindung zum Versorgungsnetz trennen, geerdetes Armband tragen, Platinen nur an den Kanten anfassen",
                "Strom trennen, ESD-Armband nutzen, antistatische Matte verwenden, keine Gewalt",
              ],
              w: "Die Regeln 1–10 aus dem Arbeitsblatt schützen Mensch und empfindliche Elektronik.",
            },
            {
              q: "Warum ist ESD-Schutz bei der PC-Montage wichtig?",
              a: [
                "Elektrostatische Entladungen können empfindliche Bauteile wie CPU oder RAM zerstören",
                "Weil statische Aufladung elektronische Bauteile beschädigen kann",
              ],
              w: "Schon kleine Entladungen sind für Chips unsichtbar, aber schädlich – daher Armband und antistatische Matte.",
            },
          ],
        },
        {
          id: "stromkreis_ladung_leistung",
          name: "Stromkreis, Ladung & Leistung",
          mc: [
            {
              q: "Aus welchen drei Grundbestandteilen besteht ein einfacher Stromkreis?",
              c: [
                "Stromquelle, Leitung und Verbraucher",
                "Prozessor, Arbeitsspeicher und SSD",
                "Schalter, Sicherung und Steckdose",
                "Pluspol, Minuspol und Schutzleiter",
              ],
              a: 0,
              w: "Der Grundstromkreis besteht aus Stromquelle (Erzeugung), Leitung (Weiterleitung) und Verbraucher (Umwandlung).",
            },
            {
              q: "Wie lautet die Formel für die elektrische Stromstärke?",
              c: ["I = Q / t", "I = U · R", "I = P · U", "I = R / U"],
              a: 0,
              w: "Stromstärke ist Ladung pro Zeit: I = Q / t, Einheit 1 A = 1 C/s.",
            },
            {
              q: "Wie berechnet man die elektrische Leistung?",
              c: ["P = U · I", "P = U / I", "P = I / U", "P = R · I"],
              a: 0,
              w: "Die elektrische Leistung ergibt sich aus Spannung mal Stromstärke: P = U · I (Einheit Watt).",
            },
            {
              q: "Was beschreibt der Leitwert G?",
              c: [
                "G = 1 / R = I / U, Einheit Siemens (S)",
                "G = R · I, Einheit Ohm (Ω)",
                "G = U · I, Einheit Watt (W)",
                "G = Q / t, Einheit Ampere (A)",
              ],
              a: 0,
              w: "Der Leitwert ist der Kehrwert des Widerstands: G = 1 / R = I / U, Einheit Siemens (S).",
            },
            {
              q: "Wie berechnet man die Ladungsmenge Q aus der Anzahl der Elementarladungen?",
              c: ["Q = n · e", "Q = n / e", "Q = e / n", "Q = n · U"],
              a: 0,
              w: "Jede Ladungsmenge ist ein ganzzahliges Vielfaches der Elementarladung e: Q = n · e.",
            },
            {
              q: "Welche Einheit entspricht 1 Coulomb (C)?",
              c: ["1 A·s", "1 V·A", "1 Ω·s", "1 W/s"],
              a: 0,
              w: "Ladung ist Strom mal Zeit: 1 C = 1 A·s (Amperesekunde).",
            },
            {
              q: "Was ist ein aktiver Zweipol?",
              c: ["Eine Stromquelle", "Ein Verbraucher", "Eine Leitung", "Ein Schalter"],
              a: 0,
              w: "Aktiver Zweipol = Stromquelle (Erzeugung); passiver Zweipol = Verbraucher inklusive Leitung.",
            },
            {
              q: "Wie entsteht die Spannung in einem Piezo-Element?",
              c: [
                "Durch Druck oder Zug an Quarz bzw. Tourmalin",
                "Durch Licht auf Silizium",
                "Durch eine chemische Reaktion",
                "Durch Induktion in einer Spule",
              ],
              a: 0,
              w: "Piezoelektrizität: mechanischer Druck oder Zug an Quarz/Tourmalin erzeugt eine Spannung.",
            },
          ],
          cards: [
            {
              f: "Stromkreis",
              b: "Stromquelle, Leitung und Verbraucher – Strom fließt nur im geschlossenen Kreis.",
            },
            {
              f: "Elektrische Spannung",
              b: "Potentialdifferenz zweier Punkte, Einheit Volt (V); Spannung entsteht nur zwischen zwei Polen.",
            },
            {
              f: "Signalgeschwindigkeit",
              b: "50–90 % der Lichtgeschwindigkeit; die Elektronen selbst bewegen sich nur unter 1 mm/s.",
            },
          ],
          gaps: [
            {
              t: "Ein einfacher Stromkreis besteht aus Stromquelle, Leitung und ___.",
              a: ["verbraucher"],
            },
            { t: "Der Leitwert hat die Einheit ___.", a: ["siemens"] },
            { t: "Bei einer Solarzelle entsteht Spannung durch ___.", a: ["licht"] },
          ],
          free: [
            {
              q: "Nenne die drei Grundbestandteile eines Stromkreises und ihre Aufgabe.",
              a: [
                "Die Stromquelle erzeugt die Spannung, die Leitung leitet den Strom weiter, der Verbraucher wandelt die elektrische Energie um",
                "Stromquelle, Leitung, Verbraucher: erzeugen, weiterleiten, umwandeln",
              ],
              w: "Merksatz aus Arbeitsblatt 1–5: Quelle – Leitung – Verbraucher.",
            },
            {
              q: "Ein Gerät hat 230 V und 100 W. Berechne die Stromstärke.",
              a: ["0,43 a", "0.43 a", "ca. 0,4 a", "0,4 a"],
              w: "I = P / U = 100 W / 230 V ≈ 0,43 A.",
            },
          ],
        },
        {
          id: "ka1_pc_begriffe",
          name: "KA1: Begriffe, Komponenten & Software",
          mc: [
            {
              q: "Was versteht man unter Peripherie?",
              c: [
                "Geräte außerhalb der Zentraleinheit, z. B. Tastatur, Monitor, Drucker",
                "Prozessor und Arbeitsspeicher",
                "Das Betriebssystem",
                "Das BIOS/UEFI",
              ],
              a: 0,
              w: "Peripherie = alle Geräte, die an die Zentraleinheit (CPU + Hauptspeicher) angeschlossen werden: Eingabe-, Ausgabe- und Speichergeräte.",
            },
            {
              q: "Welches Gerät ist ein reines Eingabegerät?",
              c: ["Scanner", "Monitor", "Drucker", "Lautsprecher"],
              a: 0,
              w: "Der Scanner liest Daten ein. Monitor, Drucker und Lautsprecher geben Daten aus.",
            },
            {
              q: "Welches Gerät ist ein Ausgabegerät?",
              c: ["Beamer", "Maus", "Mikrofon", "Webcam"],
              a: 0,
              w: "Der Beamer gibt ein Bild aus. Maus, Mikrofon und Webcam sind Eingabegeräte.",
            },
            {
              q: "Welches Gerät ist Ein- UND Ausgabegerät?",
              c: ["Touchscreen", "Tastatur", "Drucker", "Scanner"],
              a: 0,
              w: "Ein Touchscreen zeigt das Bild an (Ausgabe) und erkennt Berührungen (Eingabe).",
            },
            {
              q: "Welches Programm gehört zur Systemsoftware?",
              c: ["Windows 11", "Microsoft Word", "Mozilla Firefox", "GIMP"],
              a: 0,
              w: "Systemsoftware (Betriebssystem, Treiber, Dienstprogramme) betreibt den Rechner. Word, Firefox und GIMP sind Anwendungssoftware.",
            },
            {
              q: "Was ist ein Treiber?",
              c: [
                "Software, mit der das Betriebssystem ein Gerät ansteuert",
                "Ein Bauteil auf dem Mainboard",
                "Ein Kabel für den Drucker",
                "Ein Virenscanner",
              ],
              a: 0,
              w: "Der Treiber ist der 'Übersetzer' zwischen Betriebssystem und Hardware.",
            },
            {
              q: "Was ist Firmware?",
              c: [
                "Fest im Gerät gespeicherte Software, z. B. BIOS/UEFI",
                "Software, die eine Firma kauft",
                "Ein Anwendungsprogramm für Büros",
                "Ein Teil des Netzteils",
              ],
              a: 0,
              w: "Firmware steckt dauerhaft im Gerät (ROM/Flash) und steuert es grundlegend – z. B. BIOS/UEFI, Router-Firmware.",
            },
            {
              q: "Wie viele Bit hat ein Byte?",
              c: ["8", "4", "16", "1024"],
              a: 0,
              w: "1 Byte = 8 Bit. Ein Bit ist die kleinste Informationseinheit (0 oder 1).",
            },
            {
              q: "Wie viele Byte sind 1 KiB (Kibibyte)?",
              c: ["1024 Byte", "1000 Byte", "1024 Bit", "8 Byte"],
              a: 0,
              w: "Binärpräfix: 1 KiB = 2¹⁰ = 1024 Byte. Dezimal (SI): 1 kB = 1000 Byte.",
            },
            {
              q: "In welcher Einheit gibt man die Taktfrequenz einer CPU an?",
              c: ["Hertz (z. B. GHz)", "Byte (z. B. GB)", "Watt (W)", "Volt (V)"],
              a: 0,
              w: "Takt = Schwingungen pro Sekunde, Einheit Hertz. 3 GHz = 3 Milliarden Takte pro Sekunde.",
            },
          ],
          cards: [
            {
              f: "Hardware",
              b: "Alle anfassbaren Teile des Computers: Gehäuse, Mainboard, CPU, RAM, Laufwerke, Peripherie.",
            },
            {
              f: "Software",
              b: "Programme und Daten – nicht anfassbar. Unterteilt in Systemsoftware und Anwendungssoftware.",
            },
            {
              f: "Systemsoftware",
              b: "Betreibt den Rechner: Betriebssystem, Treiber, Dienstprogramme.",
            },
            {
              f: "Anwendungssoftware",
              b: "Programme für Aufgaben des Nutzers: Textverarbeitung, Browser, Bildbearbeitung, Spiele.",
            },
            {
              f: "Firmware",
              b: "Fest im Gerät gespeicherte Software (ROM/Flash), z. B. BIOS/UEFI.",
            },
            {
              f: "Treiber",
              b: "Software, mit der das Betriebssystem ein bestimmtes Gerät ansteuert.",
            },
            {
              f: "Peripherie",
              b: "Geräte außerhalb der Zentraleinheit: Eingabe (Tastatur, Maus, Scanner), Ausgabe (Monitor, Drucker), Speicher (USB-Stick, ext. Festplatte).",
            },
            { f: "Bit / Byte", b: "Bit = 0 oder 1. 1 Byte = 8 Bit." },
            {
              f: "kB vs. KiB",
              b: "1 kB = 1000 Byte (dezimal), 1 KiB = 1024 Byte (binär). Genauso MB/MiB, GB/GiB.",
            },
            { f: "Taktfrequenz", b: "Arbeitsgeschwindigkeit der CPU in Hertz – z. B. 3,5 GHz." },
          ],
          gaps: [
            { t: "Ein Byte besteht aus ___ Bit.", a: ["8", "acht"] },
            { t: "1 KiB sind ___ Byte.", a: ["1024"] },
            {
              t: "Ein ___ ist ein Programm, mit dem das Betriebssystem ein Gerät ansteuert.",
              a: ["treiber", "geraetetreiber"],
            },
            { t: "Word und Firefox gehören zur ___software.", a: ["anwendungs", "anwender"] },
            { t: "BIOS/UEFI ist ein Beispiel für ___.", a: ["firmware"] },
          ],
          free: [
            {
              q: "Ist ein Drucker ein Eingabe-, Ausgabe- oder Speichergerät?",
              a: ["Ausgabegerät", "Ausgabe"],
              w: "Der Drucker gibt Daten auf Papier aus. (Multifunktionsgeräte mit Scanner sind zusätzlich Eingabegeräte.)",
            },
            {
              q: "Wie viele Bit sind 4 Byte?",
              a: ["32", "32 Bit"],
              w: "4 · 8 Bit = 32 Bit.",
            },
            {
              q: "Zu welcher Softwareart gehört ein Gerätetreiber?",
              a: ["Systemsoftware", "System"],
              w: "Treiber gehören wie das Betriebssystem zur Systemsoftware.",
            },
          ],
        },
        {
          id: "ka1_hw_konfiguration",
          name: "KA1: Hardware-Aufbau & Konfiguration",
          mc: [
            {
              q: "Welches Bauteil verbindet alle Komponenten im PC miteinander?",
              c: [
                "Das Mainboard (Hauptplatine)",
                "Das Netzteil",
                "Die Grafikkarte",
                "Der Arbeitsspeicher",
              ],
              a: 0,
              w: "Auf dem Mainboard sitzen CPU-Sockel, RAM-Slots, Chipsatz, Steckplätze und Anschlüsse – es verbindet alles.",
            },
            {
              q: "Was ist der Chipsatz?",
              c: [
                "Steuert auf dem Mainboard den Datenverkehr zwischen CPU, Speicher und Schnittstellen",
                "Ein Satz Ersatz-Chips für die CPU",
                "Der Zwischenspeicher der Festplatte",
                "Die Software des Druckers",
              ],
              a: 0,
              w: "Der Chipsatz ist die 'Verkehrszentrale' des Mainboards und bestimmt u. a., welche CPUs und Schnittstellen möglich sind.",
            },
            {
              q: "Woran muss ein neuer Prozessor passen?",
              c: [
                "An Sockel und Chipsatz des Mainboards",
                "An die Farbe des Gehäuses",
                "An die Größe des Monitors",
                "An die Tastatur",
              ],
              a: 0,
              w: "CPU und Mainboard müssen beim Sockel (z. B. AM5, LGA1700) und Chipsatz/BIOS-Unterstützung zusammenpassen.",
            },
            {
              q: "Was ist der Cache?",
              c: [
                "Ein sehr schneller, kleiner Zwischenspeicher in der CPU",
                "Ein großer Langzeitspeicher",
                "Ein Lüfter für die CPU",
                "Ein Anschluss für Grafikkarten",
              ],
              a: 0,
              w: "Der Cache (L1, L2, L3) hält häufig gebrauchte Daten direkt an der CPU, damit sie nicht auf das langsamere RAM warten muss.",
            },
            {
              q: "In welchen Steckplatz kommt heute eine Grafikkarte?",
              c: ["PCI Express x16", "SATA", "DIMM-Slot", "USB-C"],
              a: 0,
              w: "Grafikkarten nutzen den PCIe-x16-Steckplatz mit den meisten Datenleitungen (Lanes).",
            },
            {
              q: "Welche Anbindung ist für SSDs am schnellsten?",
              c: ["M.2 mit NVMe (über PCIe)", "SATA", "USB 2.0", "IDE"],
              a: 0,
              w: "NVMe-SSDs laufen direkt über PCIe-Lanes und sind ein Vielfaches schneller als SATA.",
            },
            {
              q: "Was bringt Dual-Channel beim Arbeitsspeicher?",
              c: [
                "Zwei gleiche Module werden parallel angesprochen – mehr Bandbreite",
                "Doppelt so viel Speicherplatz auf einem Modul",
                "Der PC braucht keinen Cache mehr",
                "Der RAM speichert auch ohne Strom",
              ],
              a: 0,
              w: "Bei Dual-Channel arbeiten zwei Speicherkanäle gleichzeitig. Dafür am besten zwei gleiche Module in die passenden Slots stecken.",
            },
            {
              q: "Welche Aussage zu RAM-Modulen stimmt?",
              c: [
                "DDR4- und DDR5-Module sind nicht gegeneinander austauschbar",
                "Jedes RAM-Modul passt in jedes Mainboard",
                "Laptops nutzen dieselben Module wie Desktop-PCs",
                "RAM wird per SATA-Kabel angeschlossen",
              ],
              a: 0,
              w: "Jede DDR-Generation hat eine andere Kerbe und Spannung. Laptops nutzen kleinere SO-DIMMs.",
            },
            {
              q: "Wo stellt man die Bootreihenfolge ein?",
              c: ["Im BIOS/UEFI-Setup", "Im Druckertreiber", "Im Netzteil", "Im Browser"],
              a: 0,
              w: "Bootreihenfolge, Uhrzeit, Lüfter, Secure Boot usw. stellt man im BIOS/UEFI ein (meist Entf/F2 beim Start).",
            },
            {
              q: "Was ist ATX?",
              c: [
                "Ein Formfaktor (Normgröße) für Mainboards, Gehäuse und Netzteile",
                "Ein Prozessor-Hersteller",
                "Ein Grafikkarten-Anschluss",
                "Ein Betriebssystem",
              ],
              a: 0,
              w: "ATX legt Maße, Befestigungspunkte und Anschlüsse fest. Kleinere Varianten: Micro-ATX, Mini-ITX.",
            },
            {
              q: "Ein PC braucht 400 W, das Netzteil hat einen Wirkungsgrad von 80 %. Wie viel Leistung nimmt es aus der Steckdose auf?",
              c: ["500 W", "320 W", "480 W", "400 W"],
              a: 0,
              w: "η = P_ab / P_zu → P_zu = P_ab / η = 400 W / 0,8 = 500 W. Die 100 W Differenz werden zu Wärme.",
            },
            {
              q: "Was sollte man zwischen CPU und Kühler auftragen?",
              c: ["Wärmeleitpaste", "Kleber", "Isolierband", "Nichts – Luft isoliert am besten"],
              a: 0,
              w: "Wärmeleitpaste füllt winzige Unebenheiten, damit die Wärme gut zum Kühler fließt.",
            },
          ],
          cards: [
            {
              f: "Mainboard",
              b: "Hauptplatine: verbindet CPU, RAM, Laufwerke, Erweiterungskarten und Anschlüsse.",
            },
            {
              f: "Chipsatz",
              b: "Steuert den Datenverkehr auf dem Mainboard; bestimmt unterstützte CPUs und Schnittstellen.",
            },
            {
              f: "CPU-Sockel",
              b: "Steckplatz für den Prozessor – CPU und Sockel müssen zusammenpassen.",
            },
            {
              f: "Cache (L1–L3)",
              b: "Schneller Zwischenspeicher in der CPU. L1 = am kleinsten und schnellsten, L3 = größer und langsamer.",
            },
            {
              f: "Kerne & Threads",
              b: "Kerne = eigenständige Recheneinheiten. Threads = gleichzeitig bearbeitbare Aufgabenstränge (z. B. 8 Kerne / 16 Threads).",
            },
            {
              f: "DIMM / SO-DIMM",
              b: "RAM-Module für Desktop (DIMM) bzw. Laptop (SO-DIMM, kleiner).",
            },
            { f: "Dual-Channel", b: "Zwei gleiche RAM-Module parallel → höhere Bandbreite." },
            {
              f: "PCI Express (PCIe)",
              b: "Schneller serieller Steckplatz für Erweiterungskarten; x16 für Grafikkarten.",
            },
            {
              f: "SATA vs. NVMe",
              b: "SATA: ältere Anbindung für HDD/SSD (~550 MB/s). NVMe über M.2/PCIe: mehrere GB/s.",
            },
            {
              f: "Wirkungsgrad η",
              b: "η = P_ab / P_zu. Der Rest wird zu Wärme. Bei Netzteilen zeigt das '80 PLUS'-Siegel einen guten Wirkungsgrad.",
            },
            {
              f: "POST",
              b: "Power-On Self Test: BIOS/UEFI prüft beim Start die Hardware, bevor das Betriebssystem geladen wird.",
            },
            {
              f: "Formfaktor ATX",
              b: "Norm für Maße von Mainboard, Gehäuse und Netzteil (auch Micro-ATX, Mini-ITX).",
            },
          ],
          gaps: [
            { t: "Die CPU steckt auf dem Mainboard im ___.", a: ["sockel", "cpusockel"] },
            { t: "Zwischen CPU und Kühler kommt ___.", a: ["waermeleitpaste", "wärmeleitpaste"] },
            { t: "Laptops nutzen kleinere RAM-Module, sogenannte ___.", a: ["sodimm", "so-dimm"] },
            {
              t: "Der Wirkungsgrad ist das Verhältnis von abgegebener zu ___ Leistung.",
              a: ["zugefuehrter", "zugeführter", "aufgenommener"],
            },
            {
              t: "Grafikkarten stecken heute im ___-x16-Steckplatz.",
              a: ["pcie", "pciexpress", "pci express"],
            },
          ],
          free: [
            {
              q: "Ein Netzteil gibt 600 W ab und hat einen Wirkungsgrad von 90 %. Wie viel Leistung nimmt es auf?",
              a: ["666,67 W", "666,7 W", "667 W", "666,67", "666,7", "667"],
              w: "P_zu = P_ab / η = 600 W / 0,9 ≈ 666,7 W.",
            },
            {
              q: "Ein Netzteil nimmt 500 W auf und gibt 425 W ab. Wie groß ist der Wirkungsgrad in Prozent?",
              a: ["85 %", "85", "85 Prozent", "0,85"],
              w: "η = P_ab / P_zu = 425 W / 500 W = 0,85 = 85 %.",
            },
            {
              q: "Welcher kleine, sehr schnelle Zwischenspeicher sitzt direkt in der CPU?",
              a: ["Cache", "Cache-Speicher"],
              w: "Der Cache (L1/L2/L3) beschleunigt den Zugriff auf häufig gebrauchte Daten.",
            },
          ],
        },
        {
          id: "ka1_ladung_strom",
          name: "KA1: Ladung & Stromstärke rechnen",
          mc: [
            {
              q: "Ein Strom von 2 A fließt 10 s lang. Welche Ladung wird transportiert?",
              c: ["20 C", "5 C", "0,2 C", "12 C"],
              a: 0,
              w: "Q = I · t = 2 A · 10 s = 20 As = 20 C.",
            },
            {
              q: "In 5 Minuten fließen 600 C. Wie groß ist die Stromstärke?",
              c: ["2 A", "120 A", "0,5 A", "3000 A"],
              a: 0,
              w: "Zeit in Sekunden umrechnen: 5 min = 300 s. I = Q / t = 600 C / 300 s = 2 A.",
            },
            {
              q: "Ein Ladegerät liefert 2 A. Wie lange dauert es, bis 3600 C geflossen sind?",
              c: ["1800 s (30 min)", "7200 s (2 h)", "3600 s (1 h)", "180 s (3 min)"],
              a: 0,
              w: "t = Q / I = 3600 C / 2 A = 1800 s = 30 min.",
            },
            {
              q: "Wie viele Elektronen ergeben zusammen eine Ladung von 1 C?",
              c: ["ca. 6,24 · 10¹⁸", "ca. 1,6 · 10⁻¹⁹", "ca. 1000", "ca. 6,24 · 10⁶"],
              a: 0,
              w: "n = Q / e = 1 C / 1,602 · 10⁻¹⁹ C ≈ 6,24 · 10¹⁸ Elektronen.",
            },
            {
              q: "Wie viel sind 250 mA in Ampere?",
              c: ["0,25 A", "2,5 A", "25 A", "0,025 A"],
              a: 0,
              w: "1 A = 1000 mA → 250 mA : 1000 = 0,25 A.",
            },
            {
              q: "Welche Ladung steckt in einem Akku mit 3000 mAh?",
              c: ["10 800 C", "3000 C", "180 C", "3,6 C"],
              a: 0,
              w: "3000 mAh = 3 Ah = 3 A · 3600 s = 10 800 As = 10 800 C.",
            },
            {
              q: "Welche Wirkung des elektrischen Stroms tritt IMMER auf?",
              c: [
                "Die magnetische Wirkung",
                "Die Lichtwirkung",
                "Die chemische Wirkung",
                "Die physiologische Wirkung",
              ],
              a: 0,
              w: "Jeder fließende Strom erzeugt ein Magnetfeld. Licht-, chemische und physiologische Wirkung treten nur unter bestimmten Bedingungen auf.",
            },
            {
              q: "Welche Stromwirkung nutzt eine Schmelzsicherung?",
              c: ["Wärmewirkung", "Magnetische Wirkung", "Chemische Wirkung", "Lichtwirkung"],
              a: 0,
              w: "Bei zu großem Strom wird der Schmelzdraht so heiß, dass er durchschmilzt und den Stromkreis unterbricht.",
            },
            {
              q: "In welche Richtung bewegen sich die Elektronen im Leiter?",
              c: [
                "Vom Minuspol zum Pluspol",
                "Vom Pluspol zum Minuspol",
                "Sie stehen still",
                "Hin und her mit Lichtgeschwindigkeit",
              ],
              a: 0,
              w: "Physikalische Stromrichtung: Elektronen von Minus nach Plus. Die technische Stromrichtung (Schaltpläne) ist umgekehrt: Plus → Minus.",
            },
            {
              q: "Was passiert bei einem Kurzschluss?",
              c: [
                "Der Strom fließt fast ohne Widerstand – sehr hoher Strom, die Sicherung löst aus",
                "Es fließt gar kein Strom mehr",
                "Die Spannung verdoppelt sich gefahrlos",
                "Der Verbraucher arbeitet effizienter",
              ],
              a: 0,
              w: "Beim Kurzschluss werden die Pole ohne Verbraucher verbunden. Der Widerstand ist winzig, der Strom riesig – Brandgefahr.",
            },
            {
              q: "Was kennzeichnet Gleichstrom (DC)?",
              c: [
                "Der Strom fließt immer in dieselbe Richtung",
                "Der Strom ändert 50-mal pro Sekunde die Richtung",
                "Es fließt nur bei Licht Strom",
                "Er kommt nur aus der Steckdose",
              ],
              a: 0,
              w: "Gleichstrom (z. B. Batterie, Akku, Netzteil-Ausgang) hat eine feste Richtung. Wechselstrom aus der Steckdose wechselt die Richtung (50 Hz).",
            },
            {
              q: "Wo herrscht Elektronenüberschuss?",
              c: ["Am Minuspol", "Am Pluspol", "Im Verbraucher", "In der Sicherung"],
              a: 0,
              w: "Minuspol = Elektronenüberschuss, Pluspol = Elektronenmangel. Dieser Unterschied ist die Spannung.",
            },
          ],
          cards: [
            { f: "Ladung Q", b: "Einheit Coulomb (C). 1 C = 1 A · 1 s = 1 As." },
            {
              f: "Elementarladung e",
              b: "e ≈ 1,602 · 10⁻¹⁹ C – Ladung eines Elektrons (negativ) bzw. Protons (positiv).",
            },
            {
              f: "Q = n · e",
              b: "Ladung = Anzahl der Elektronen mal Elementarladung. Umgestellt: n = Q / e.",
            },
            {
              f: "I = Q / t",
              b: "Stromstärke = Ladung pro Zeit. Umgestellt: Q = I · t und t = Q / I.",
            },
            {
              f: "Umrechnen",
              b: "1 A = 1000 mA, 1 mA = 1000 µA. Zeit immer in Sekunden: 1 min = 60 s, 1 h = 3600 s.",
            },
            { f: "mAh → C", b: "1 mAh = 3,6 As = 3,6 C. Beispiel: 2000 mAh = 7200 C." },
            {
              f: "Wirkungen des Stroms",
              b: "Wärme, Licht, magnetisch (immer!), chemisch, physiologisch (auf Lebewesen).",
            },
            {
              f: "Stromrichtung",
              b: "Physikalisch: Elektronen von − nach +. Technisch (Schaltpläne): von + nach −.",
            },
            {
              f: "Plus- und Minuspol",
              b: "Minuspol = Elektronenüberschuss, Pluspol = Elektronenmangel.",
            },
            {
              f: "Gleich- vs. Wechselstrom",
              b: "DC: feste Richtung (Batterie). AC: wechselt die Richtung, in Deutschland 50 Hz (Steckdose).",
            },
            {
              f: "Kurzschluss",
              b: "Pole ohne Verbraucher verbunden → kaum Widerstand, sehr hoher Strom, Sicherung löst aus.",
            },
          ],
          gaps: [
            { t: "1 Coulomb entspricht 1 ___.", a: ["as", "amperesekunde"] },
            {
              t: "Eine Schmelzsicherung nutzt die ___ des Stroms.",
              a: ["waermewirkung", "wärmewirkung"],
            },
            { t: "Am Minuspol herrscht Elektronen___.", a: ["ueberschuss", "überschuss"] },
            { t: "0,5 A sind ___ mA.", a: ["500"] },
            { t: "Die Elektronen fließen vom ___ zum Pluspol.", a: ["minuspol", "minus"] },
            { t: "Die ___ Wirkung des Stroms tritt immer auf.", a: ["magnetische"] },
          ],
          free: [
            {
              q: "Ein Strom von 0,5 A fließt 2 Minuten lang. Berechne die Ladung Q.",
              a: ["60 C", "60 As", "Q = 60 C", "60 Coulomb"],
              w: "t = 2 min = 120 s. Q = I · t = 0,5 A · 120 s = 60 As = 60 C.",
            },
            {
              q: "Ein Akku hat 2000 mAh, das Gerät braucht 250 mA. Wie viele Stunden hält der Akku?",
              a: ["8 h", "8 Stunden", "t = 8 h", "8"],
              w: "t = Q / I = 2000 mAh / 250 mA = 8 h.",
            },
            {
              q: "Wie viel sind 0,04 A in Milliampere?",
              a: ["40 mA", "40"],
              w: "0,04 A · 1000 = 40 mA.",
            },
            {
              q: "Wie heißt die Einheit der elektrischen Ladung?",
              a: ["Coulomb", "C", "As", "Amperesekunde"],
              w: "Coulomb (C); 1 C = 1 As.",
            },
          ],
        },
        {
          id: "ka1_probe",
          name: "📝 Probe-Klassenarbeit 19.11. (gemischt)",
          mc: [
            {
              q: "Welches Bauteil gehört NICHT zur Zentraleinheit?",
              c: ["Festplatte", "Prozessor", "RAM", "ROM"],
              a: 0,
              w: "Zentraleinheit = CPU + Hauptspeicher (RAM + ROM). Die Festplatte ist ein externer Massenspeicher.",
            },
            {
              q: "Ein 230-V-Gerät nimmt 2,5 A auf. Welche Leistung hat es?",
              c: ["575 W", "92 W", "232,5 W", "57,5 W"],
              a: 0,
              w: "P = U · I = 230 V · 2,5 A = 575 W.",
            },
            {
              q: "Welcher Speicher ist am schnellsten?",
              c: ["L1-Cache", "RAM", "SSD", "HDD"],
              a: 0,
              w: "Reihenfolge (schnell → langsam): Register, L1-, L2-, L3-Cache, RAM, SSD, HDD.",
            },
            {
              q: "Was tust du als Erstes, bevor du eine Komponente in einen PC einbaust?",
              c: [
                "Netzstecker ziehen und ESD-Schutz (geerdetes Armband) anlegen",
                "Den PC einschalten, um zu sehen, ob er läuft",
                "Die Platine an den Kontakten festhalten",
                "Das Betriebssystem deinstallieren",
              ],
              a: 0,
              w: "Erst vom Netz trennen, dann gegen elektrostatische Entladung schützen.",
            },
            {
              q: "Welche Software ist Anwendungssoftware?",
              c: ["Excel", "Windows", "Grafiktreiber", "UEFI"],
              a: 0,
              w: "Excel löst eine Nutzer-Aufgabe (Tabellenkalkulation). Windows und Treiber sind Systemsoftware, UEFI ist Firmware.",
            },
            {
              q: "Was läuft beim Einschalten des PCs zuerst?",
              c: ["BIOS/UEFI mit POST", "Das Betriebssystem", "Der Browser", "Der Virenscanner"],
              a: 0,
              w: "Zuerst testet BIOS/UEFI die Hardware (POST), dann wird nach Bootreihenfolge das Betriebssystem geladen.",
            },
            {
              q: "Welche Ladung hat ein Elektron?",
              c: [
                "Negativ, −1,602 · 10⁻¹⁹ C",
                "Positiv, +1,602 · 10⁻¹⁹ C",
                "Keine Ladung",
                "Negativ, −1 C",
              ],
              a: 0,
              w: "Elektronen sind negativ geladen, Protonen positiv, Neutronen neutral.",
            },
            {
              q: "Welche Aufgabe hat der Verbraucher im Stromkreis?",
              c: [
                "Er wandelt elektrische Energie in eine andere Energieform um",
                "Er erzeugt die Spannung",
                "Er leitet den Strom nur weiter",
                "Er speichert die Elektronen dauerhaft",
              ],
              a: 0,
              w: "Quelle erzeugt, Leitung leitet weiter, Verbraucher wandelt um (z. B. in Licht, Wärme, Bewegung).",
            },
            {
              q: "Welche Formel ist richtig umgestellt?",
              c: ["t = Q / I", "t = I / Q", "t = Q · I", "t = I − Q"],
              a: 0,
              w: "Aus I = Q / t folgt Q = I · t und t = Q / I.",
            },
            {
              q: "Wofür steht der Wert 50 mA in der Elektrotechnik besonders?",
              c: [
                "Ab etwa diesem Strom wird es für den Menschen lebensgefährlich",
                "Das ist der Strom einer Steckdose",
                "Das ist die Spannung einer Batterie",
                "So viel braucht jede CPU",
              ],
              a: 0,
              w: "Ab ca. 50 mA durch den Körper drohen Herzkammerflimmern und Muskelverkrampfung.",
            },
          ],
          cards: [
            {
              f: "Klassenarbeit BT-ITS",
              b: "Do 19.11.2026, 5.+6. Stunde. Mitbringen: nicht-programmierbarer Taschenrechner, kariertes Papier DIN A4.",
            },
            {
              f: "Stoff Teil 1: PC-Technik",
              b: "Begriffe, Komponenten/Peripherie/Software (AB 1–6, Bl. 6.1), Behandlung von PC-Komponenten (AB 7), Hardware-Aufbau & Konfiguration (AB 8–12.1, Bl. 12.2).",
            },
            {
              f: "Stoff Teil 2: Elektrotechnik",
              b: "Stromkreis (AB 1–5), Ladung (AB 6–8, Bl. 9), Stromstärke (AB 10–14, Bl. 15).",
            },
            {
              f: "Formel-Spickzettel",
              b: "I = Q / t · Q = I · t · t = Q / I · Q = n · e · e ≈ 1,602 · 10⁻¹⁹ C · P = U · I · R = U / I · η = P_ab / P_zu",
            },
            {
              f: "Rechenweg in der KA",
              b: "1. Gegeben/Gesucht notieren 2. Einheiten umrechnen (s, A) 3. Formel hinschreiben und umstellen 4. Einsetzen mit Einheiten 5. Ergebnis unterstreichen.",
            },
          ],
          gaps: [
            { t: "Q = I · ___", a: ["t"] },
            { t: "n = Q / ___", a: ["e"] },
            { t: "Ein Elektron ist ___ geladen.", a: ["negativ"] },
            {
              t: "Vor dem Einrechnen wird die Zeit immer in ___ umgerechnet.",
              a: ["sekunden", "s"],
            },
          ],
          free: [
            {
              q: "Durch eine LED fließen 20 mA eine Stunde lang. Wie groß ist die transportierte Ladung?",
              a: ["72 C", "72 As", "Q = 72 C", "72 Coulomb"],
              w: "I = 0,02 A, t = 3600 s. Q = I · t = 0,02 A · 3600 s = 72 As = 72 C.",
            },
            {
              q: "Durch einen Leiter fließen 1,2 C in 0,4 s. Berechne die Stromstärke.",
              a: ["3 A", "I = 3 A", "3 Ampere", "3"],
              w: "I = Q / t = 1,2 C / 0,4 s = 3 A.",
            },
            {
              q: "Bei 4 A sollen 2400 C fließen. Wie viele Minuten dauert das?",
              a: ["10 min", "10 Minuten", "600 s", "10"],
              w: "t = Q / I = 2400 C / 4 A = 600 s = 10 min.",
            },
            {
              q: "Wie viele Elektronen fließen bei einer Ladung von 60 C? (Ergebnis in Zehnerpotenz)",
              a: [
                "3,75 · 10^20",
                "3,74 · 10^20",
                "3,7 · 10^20",
                "3,75 * 10^20",
                "3,74 * 10^20",
                "3.75e20",
              ],
              w: "n = Q / e = 60 C / 1,602 · 10⁻¹⁹ C ≈ 3,75 · 10²⁰ Elektronen.",
            },
          ],
        },
      ],
    },
    {
      id: "SAE",
      name: "SAE – Softwareentwicklung",
      color: "#7c3aed",
      topics: [
        {
          id: "java",
          name: "Java Grundlagen",
          mc: [
            {
              q: "Wie lautet das Motto von Java?",
              c: [
                "Write Once, Run Anywhere",
                "Fast, Faster, Fastest",
                "Just Do It",
                "Code Once, Compile Everywhere",
              ],
              a: 0,
              w: "Java-Bytecode läuft auf jeder Plattform mit JVM – daher 'Write Once, Run Anywhere'.",
            },
            {
              q: "Wie hieß Java ursprünglich?",
              c: ["Oak", "Pine", "Maple", "Cedar"],
              a: 0,
              w: "James Gosling startete 1991 bei Sun die Entwicklung von Oak; daraus wurde Java.",
            },
            {
              q: "Welche Aussage über JDK, JRE und JVM ist richtig?",
              c: [
                "Das JDK enthält das JRE und die JVM",
                "Die JVM enthält das JDK und das JRE",
                "Das JRE enthält das JDK, aber nicht die JVM",
                "JDK und JRE sind dasselbe",
              ],
              a: 0,
              w: "Es gilt JDK ⊃ JRE ⊃ JVM: Das Development Kit enthält alles zum Entwickeln und Ausführen.",
            },
            {
              q: "Was macht die JVM?",
              c: [
                "Sie interpretiert Bytecode und führt ihn aus",
                "Sie schreibt den Quellcode",
                "Sie ersetzt das Betriebssystem",
                "Sie kompiliert Java zu HTML",
              ],
              a: 0,
              w: "Die Java Virtual Machine führt den Bytecode aus und sorgt so für Plattformunabhängigkeit.",
            },
            {
              q: "Wofür ist die Garbage Collection zuständig?",
              c: [
                "Sie gibt nicht mehr genutzten Speicher frei",
                "Sie löscht den Quellcode",
                "Sie kompiliert das Programm",
                "Sie installiert die JVM",
              ],
              a: 0,
              w: "Die Garbage Collection räumt automatisch nicht mehr benötigte Objekte im Speicher auf.",
            },
            {
              q: "Wie ist Java typisiert?",
              c: ["Stark und statisch", "Schwach und dynamisch", "Untypisiert", "Nur dynamisch"],
              a: 0,
              w: "Java prüft Typen bereits zur Kompilierzeit – stark und statisch typisiert.",
            },
            {
              q: "Wer übernahm 2010 Sun Microsystems?",
              c: ["Oracle", "Microsoft", "Google", "IBM"],
              a: 0,
              w: "2010 übernahm Oracle Sun Microsystems und betreut Java seither weiter.",
            },
            {
              q: "Wofür steht JRE?",
              c: [
                "Java Runtime Environment",
                "Java Rapid Editor",
                "Java Real Engine",
                "Java Runtime Extension",
              ],
              a: 0,
              w: "Das JRE ist die Laufzeitumgebung mit Bibliotheken und JVM zum Ausführen von Java-Programmen.",
            },
          ],
          cards: [
            {
              f: "JVM",
              b: "Java Virtual Machine – führt Bytecode aus, ermöglicht Plattformunabhängigkeit.",
            },
            { f: "JRE", b: "Java Runtime Environment – Laufzeitumgebung mit Bibliotheken + JVM." },
            {
              f: "JDK",
              b: "Java Development Kit – zum Entwickeln, enthält javac, jdb, JRE und JVM.",
            },
            { f: "JDK ⊃ JRE ⊃ JVM", b: "Das JDK enthält das JRE, das JRE enthält die JVM." },
            { f: "Garbage Collection", b: "Automatische Freigabe nicht mehr genutzten Speichers." },
            {
              f: "Java-Historie",
              b: "1991 Oak bei Sun, 1995/96 Java 1.0, 2010 Übernahme durch Oracle.",
            },
          ],
          gaps: [
            { t: "Java hieß ursprünglich ___.", a: ["oak"] },
            { t: "Der Java-Compiler heißt ___.", a: ["javac"] },
            { t: "Die ___ führt den Bytecode aus.", a: ["jvm"] },
            { t: "Zum Ausführen von Java-Programmen genügt das ___.", a: ["jre"] },
            {
              t: "Nicht mehr genutzter Speicher wird durch die ___ Collection freigegeben.",
              a: ["garbage"],
            },
          ],
          free: [
            {
              q: "Erkläre den Unterschied zwischen JDK, JRE und JVM.",
              a: [
                "Das JDK ist zum Entwickeln und enthält JRE und JVM, das JRE ist die Laufzeitumgebung und enthält die JVM, die den Bytecode ausführt",
                "JDK enthält JRE und JVM; JRE enthält JVM; JVM führt Bytecode aus",
              ],
              w: "Merke: JDK ⊃ JRE ⊃ JVM.",
            },
            {
              q: "Warum ist Java plattformunabhängig?",
              a: [
                "Weil der Quellcode zu Bytecode kompiliert wird, der auf jeder Plattform mit JVM läuft",
                "Der Bytecode läuft überall, wo eine JVM installiert ist",
              ],
              w: "Nicht der Maschinencode, sondern der plattformneutrale Bytecode wird verteilt.",
            },
          ],
        },
        {
          id: "eclipse",
          name: "Eclipse IDE",
          mc: [
            {
              q: "Was ist Eclipse?",
              c: [
                "Eine kostenlose, quelloffene IDE",
                "Ein Betriebssystem",
                "Ein Datenbanksystem",
                "Ein Netzwerkprotokoll",
              ],
              a: 0,
              w: "Eclipse ist eine kostenlose, quelloffene integrierte Entwicklungsumgebung, ursprünglich für Java.",
            },
            {
              q: "Welche Tastenkombination startet die Autovervollständigung?",
              c: ["Strg + Leertaste", "Strg + S", "Alt + F4", "Strg + Alt + Entf"],
              a: 0,
              w: "Strg + Leertaste (macOS: ⌘ + Leertaste) öffnet die Code-Vorschläge.",
            },
            {
              q: "Welches Kürzel erzeugt System.out.println()?",
              c: ["sysout", "main", "println", "soutp"],
              a: 0,
              w: "Das Kürzel sysout wird per Autovervollständigung zu System.out.println().",
            },
            {
              q: "Wo legt man den Workspace fest?",
              c: ["Beim ersten Start von Eclipse", "Im BIOS", "In der Java-Klasse", "Im Browser"],
              a: 0,
              w: "Der Workspace ist das Verzeichnis für Projekte und .metadata und wird beim ersten Start gewählt.",
            },
            {
              q: "Was bewirkt Refactor > Rename?",
              c: [
                "Alle Aufrufe werden automatisch umbenannt",
                "Das Projekt wird gelöscht",
                "Der Code wird kompiliert",
                "Die IDE wird neu gestartet",
              ],
              a: 0,
              w: "Rename benennt eine Klasse, Methode oder Variable um und passt alle Aufrufe automatisch an.",
            },
            {
              q: "Was zeigt eine rot unterstrichene Stelle im Code?",
              c: [
                "Einen Fehler, der nicht kompiliert",
                "Nur eine Warnung",
                "Eine erfolgreiche Kompilierung",
                "Einen Kommentar",
              ],
              a: 0,
              w: "Rot = Fehler, der das Kompilieren verhindert; Gelb = Warnung, kompiliert aber mit Hinweis.",
            },
          ],
          cards: [
            { f: "Workspace", b: "Verzeichnis mit den Projekten und dem .metadata-Ordner." },
            { f: "Java-Projekt anlegen", b: "File > New > Java Project → Name → Finish." },
            {
              f: "Klasse anlegen",
              b: "Rechtsklick aufs Projekt > New > Class → Häkchen bei public static void main.",
            },
            { f: "Ausführen", b: "File > Save, dann Run > Run." },
            { f: "Autovervollständigung", b: "Strg + Leertaste; Kürzel main und sysout." },
            { f: "Refactoring", b: "Refactor > Rename benennt alle Aufrufe automatisch um." },
            {
              f: "Eclipse im Jahr",
              b: "Offizielle IDE fürs ganze Jahr; VS Code erlaubt, aber Support nur für Eclipse.",
            },
          ],
          gaps: [
            {
              t: "Die Autovervollständigung in Eclipse startet man mit Strg + ___.",
              a: ["leertaste"],
            },
            { t: "Das Kürzel ___ erzeugt System.out.println().", a: ["sysout"] },
            { t: "Ein neues Java-Projekt legt man über File > New > Java ___ an.", a: ["project"] },
            { t: "Der Ordner mit den Quelldateien heißt ___.", a: ["src"] },
            { t: "Mit Refactor > ___ werden alle Aufrufe automatisch umbenannt.", a: ["rename"] },
          ],
          free: [
            {
              q: "Beschreibe, wie du in Eclipse ein neues Java-Projekt mit einer Klasse anlegst.",
              a: [
                "File New Java Project, Namen eingeben, Finish, dann Rechtsklick New Class, Namen eingeben und main-Häkchen setzen",
                "Neues Java Project anlegen, dann New Class mit public static void main",
              ],
              w: "Ablauf: Workspace → Projekt → Klasse → kompilieren → ausführen.",
            },
            {
              q: "Was ist der Unterschied zwischen Fehlern und Warnungen in Eclipse?",
              a: [
                "Fehler sind rot und verhindern das Kompilieren, Warnungen sind gelb und der Code kompiliert trotzdem",
                "Rot bedeutet Fehler und kompiliert nicht, gelb bedeutet Warnung und kompiliert",
              ],
              w: "Warnungen zeigen problematischen Code, verhindern aber nicht den Build.",
            },
          ],
        },
        {
          id: "datenbanken_sql",
          name: "Datenbanken & SQL (LF5)",
          mc: [
            {
              q: "Welcher SQL-Befehl liest Daten aus einer Tabelle?",
              c: ["SELECT", "INSERT", "UPDATE", "DELETE"],
              a: 0,
              w: "SELECT fragt Daten ab – zusammen mit WHERE kann man filtern.",
            },
            {
              q: "Welcher SQL-Befehl fügt eine neue Zeile ein?",
              c: ["INSERT", "SELECT", "UPDATE", "DELETE"],
              a: 0,
              w: "INSERT legt einen neuen Datensatz in die Tabelle ein.",
            },
            {
              q: "Welcher SQL-Befehl ändert vorhandene Werte?",
              c: ["UPDATE", "SELECT", "INSERT", "JOIN"],
              a: 0,
              w: "UPDATE passt bestehende Zeilen an (meist mit einer WHERE-Bedingung).",
            },
            {
              q: "Welcher SQL-Befehl löscht Zeilen?",
              c: ["DELETE", "SELECT", "UPDATE", "CREATE"],
              a: 0,
              w: "DELETE entfernt Datensätze – die Tabelle selbst bleibt bestehen.",
            },
            {
              q: "Was macht ein JOIN?",
              c: [
                "Er verknüpft mehrere Tabellen über gemeinsame Felder",
                "Er löscht eine Tabelle",
                "Er sichert die Datenbank",
                "Er berechnet Durchschnitte",
              ],
              a: 0,
              w: "Mit JOIN verbindet man Tabellen, z. B. Kunden und Bestellungen über eine gemeinsame ID.",
            },
            {
              q: "Wofür steht das ER-Modell?",
              c: [
                "Entity-Relationship-Modell – Entitäten und ihre Beziehungen",
                "Electronic Runtime-Modell",
                "Error Reporting-Modell",
                "Encoding Rule-Modell",
              ],
              a: 0,
              w: "Das ER-Modell beschreibt Daten als Entitäten (Datensätze) und Beziehungen – Grundlage für die Tabellen.",
            },
            {
              q: "Bis zu welcher Normalform normalisiert man in der Regel?",
              c: [
                "3. Normalform (3NF)",
                "1. Normalform",
                "10. Normalform",
                "Es wird nicht normalisiert",
              ],
              a: 0,
              w: "In der Schule geht es bis zur 3. Normalform – sie vermeidet Redundanzen und Abhängigkeiten.",
            },
            {
              q: "Welcher Schlüssel kennzeichnet eine Zeile eindeutig?",
              c: ["Primärschlüssel", "Fremdschlüssel", "Sortierschlüssel", "Suchschlüssel"],
              a: 0,
              w: "Der Primärschlüssel (PRIMARY KEY) ist eindeutig und nicht leer – er identifiziert jeden Datensatz.",
            },
          ],
          cards: [
            { f: "SELECT", b: "Liest Daten aus einer Tabelle." },
            { f: "INSERT", b: "Fügt eine neue Zeile ein." },
            { f: "UPDATE", b: "Ändert vorhandene Werte." },
            { f: "DELETE", b: "Löscht Zeilen aus einer Tabelle." },
            { f: "JOIN", b: "Verknüpft mehrere Tabellen über gemeinsame Felder." },
            {
              f: "ER-Modell",
              b: "Entity-Relationship-Modell: Entitäten und Beziehungen – Grundlage des Tabellenaufbaus.",
            },
            {
              f: "3. Normalform",
              b: "Normalisierung bis 3NF – vermeidet Doppelungen und Abhängigkeiten.",
            },
            {
              f: "Primärschlüssel",
              b: "Eindeutiger Schlüssel, der jede Zeile einer Tabelle identifiziert.",
            },
          ],
          gaps: [
            { t: "Mit ___ liest man Daten aus einer Tabelle.", a: ["select"] },
            { t: "___ fügt eine neue Zeile in eine Tabelle ein.", a: ["insert"] },
            { t: "Die ___ verknüpft zwei Tabellen über gemeinsame Felder.", a: ["join"] },
            { t: "Man normalisiert eine Datenbank bis zur ___ Normalform.", a: ["3", "dritten"] },
            {
              t: "Das ___-Modell beschreibt Entitäten und Beziehungen.",
              a: ["er", "entity-relationship"],
            },
          ],
          free: [
            {
              q: "Nenne die vier wichtigsten SQL-Befehle und ihre Bedeutung.",
              a: [
                "SELECT liest aus, INSERT fügt ein, UPDATE ändert, DELETE löscht",
                "select auslesen, insert einfuegen, update aendern, delete loeschen",
              ],
              w: "Diese vier Befehle bilden das Grundgerüst von LF5.",
            },
            {
              q: "Was ist der Zweck der Normalisierung?",
              a: [
                "Doppelungen und Abhängigkeiten vermeiden, damit sich Daten nicht widersprechen",
                "Redundanzen vermeiden und Daten konsistent halten",
              ],
              w: "Normalisierung bis 3NF sorgt dafür, dass jede Information nur einmal gespeichert wird.",
            },
          ],
        },
        {
          id: "it_sicherheit_cia",
          name: "IT-Sicherheit & Schutzbedarf (LF4)",
          mc: [
            {
              q: "Wofür steht CIA im IT-Sicherheitskontext?",
              c: [
                "Vertraulichkeit, Integrität, Verfügbarkeit",
                "Crypt, Identity, Access",
                "Computer, Internet, Anwendung",
                "Code, IP, Anwendung",
              ],
              a: 0,
              w: "CIA = Confidentiality, Integrity, Availability – die drei Schutzziele der Informationssicherheit.",
            },
            {
              q: "Was bedeutet Vertraulichkeit?",
              c: [
                "Nur berechtigte Personen haben Zugriff auf die Daten",
                "Daten bleiben jederzeit verfügbar",
                "Daten sind korrekt und vollständig",
                "Daten werden häufig gesichert",
              ],
              a: 0,
              w: "Vertraulichkeit verhindert, dass Unberechtigte Daten lesen dürfen – z. B. durch Passwörter und Rechte.",
            },
            {
              q: "Was bedeutet Integrität?",
              c: [
                "Daten sind korrekt und wurden nicht unerlaubt verändert",
                "Daten sind immer abrufbar",
                "Daten sind nur für Admins sichtbar",
                "Daten liegen auf zwei Servern",
              ],
              a: 0,
              w: "Integrität heißt: Daten sind vollständig, richtig und dürfen nur autorisiert geändert werden.",
            },
            {
              q: "Was bedeutet Verfügbarkeit?",
              c: [
                "Dienste und Daten sind jederzeit nutzbar",
                "Daten sind verschlüsselt",
                "Daten sind nur lokal gespeichert",
                "Daten sind gelöscht, wenn niemand sie braucht",
              ],
              a: 0,
              w: "Verfügbarkeit bedeutet, dass Systeme und Daten bei Bedarf auch tatsächlich erreichbar sind.",
            },
            {
              q: "Was ist Social Engineering?",
              c: [
                "Menschen werden durch Täuschung zu Daten oder Handlungen verleitet",
                "Ein Virus verbreitet sich automatisch",
                "Ein Programm rechnet besonders schnell",
                "Die Überlastung eines Netzwerks",
              ],
              a: 0,
              w: "Social Engineering zielt auf den Menschen ab, z. B. gefälschte Mails, um an Passwörter zu kommen.",
            },
            {
              q: "Was ist Malware?",
              c: [
                "Schädliche Software",
                "Ein Betriebssystem",
                "Ein Sicherheitsstandard",
                "Ein Verschlüsselungsverfahren",
              ],
              a: 0,
              w: "Malware (Viren, Trojaner, Spyware) ist Software, die Schaden anrichten soll – dagegen helfen Virenschutz und Updates.",
            },
            {
              q: "Wofür steht DSGVO?",
              c: [
                "Datenschutz-Grundverordnung",
                "Datensicherheits-Gesetz für Verantwortliche",
                "Digitaler Schutz globaler Verbindungen",
                "Deutsches Standardverfahren für Verbraucher",
              ],
              a: 0,
              w: "Die DSGVO regelt den Schutz personenbezogener Daten in der EU – Teil des Grundschutzes.",
            },
            {
              q: "Welche Maßnahme schützt vor Datenverlust bei einem Defekt?",
              c: [
                "Regelmäßiges Backup",
                "Ein größerer Monitor",
                "Mehr Arbeitsspeicher",
                "Ein höherer Prozessortakt",
              ],
              a: 0,
              w: "Backups sichern Daten kopienweise – sie sind eine Kernmaßnahme des IT-Grundschutzes.",
            },
          ],
          cards: [
            { f: "CIA", b: "Vertraulichkeit, Integrität, Verfügbarkeit – die drei Schutzziele." },
            { f: "Vertraulichkeit", b: "Nur Berechtigte dürfen auf Daten zugreifen." },
            { f: "Integrität", b: "Daten sind korrekt und werden nicht unerlaubt verändert." },
            { f: "Verfügbarkeit", b: "Daten und Dienste sind jederzeit nutzbar." },
            { f: "Malware", b: "Schädliche Software – Viren, Trojaner, Spyware." },
            {
              f: "Social Engineering",
              b: "Menschen per Täuschung (z. B. Fake-Mail) zu Daten oder Handlungen verleiten.",
            },
            { f: "DSGVO", b: "Datenschutz-Grundverordnung der EU für personenbezogene Daten." },
            { f: "Backup", b: "Regelmäßige Datensicherung – schützt vor Datenverlust." },
          ],
          gaps: [
            {
              t: "Die drei Schutzziele der IT-Sicherheit sind Vertraulichkeit, Integrität und ___.",
              a: ["verfuegbarkeit", "verfügbarkeit"],
            },
            {
              t: "Nur berechtigte Personen dürfen Daten lesen – das sichert die ___.",
              a: ["vertraulichkeit"],
            },
            {
              t: "Daten dürfen nicht unerlaubt verändert werden – das ist die ___.",
              a: ["integritaet", "integrität"],
            },
            { t: "Schädliche Software heißt ___.", a: ["malware"] },
            { t: "Die ___ regelt den Schutz personenbezogener Daten in der EU.", a: ["dsgvo"] },
          ],
          free: [
            {
              q: "Erkläre die drei Ziele CIA mit je einem kurzen Beispiel.",
              a: [
                "Vertraulichkeit: nur Berechtigte lesen die Daten; Integrität: Daten werden nicht verändert; Verfügbarkeit: Systeme sind jederzeit nutzbar",
                "CIA = Zugriff nur für Berechtigte, unveränderte Daten, erreichbare Dienste",
              ],
              w: "Diese drei Fragen stellt man bei jeder Schutzbedarfsanalyse.",
            },
            {
              q: "Was gehört laut Lernfeld 4 alles zur Schutzbedarfsanalyse?",
              a: [
                "Bedrohungen wie Malware, Social Engineering und physische Gefahren erkennen, Sicherheitsrichtlinien und Maßnahmen empfehlen, DSGVO-Grundlagen beachten",
                "Gefahren einschaetzen, Massnahmen vorschlagen und Richtlinien festlegen",
              ],
              w: "LF4: Schutzbedarf feststellen, Risiken bewerten, Maßnahmen empfehlen.",
            },
          ],
        },
      ],
    },
    {
      id: "BWL",
      name: "BWL – Betriebswirtschaft",
      color: "#059669",
      topics: [
        {
          id: "firmennamen",
          name: "Firmennamen & Rechtsformen",
          mc: [
            {
              q: "Was ist eine Personenfirma?",
              c: [
                "Der Name des Gründers steht im Firmennamen",
                "Die Sache selbst wird benannt",
                "Ein frei erfundener Name",
                "Eine Kombination aus mehreren Teilen",
              ],
              a: 0,
              w: "Bei der Personenfirma wird der Name des Gründers bzw. Inhabers verwendet, z. B. Adidas (Adi Dassler).",
            },
            {
              q: "Welche Firma ist ein Beispiel für eine Personenfirma?",
              c: ["Adidas (Adi Dassler)", "Deutsche Bank", "The Boeing Company", "IKEA"],
              a: 0,
              w: "Adidas geht auf den Gründernamen Adi Dassler zurück – eine klassische Personenfirma.",
            },
            {
              q: "Was bedeutet e.K.?",
              c: [
                "Eingetragener Kaufmann",
                "Einzelhandelskaufmann",
                "Erweiterte Kapitalgesellschaft",
                "Eingetragene Kommanditgesellschaft",
              ],
              a: 0,
              w: "e.K. steht für 'eingetragener Kaufmann' – nicht für Einzelhandelskaufmann.",
            },
            {
              q: "Welche Firma gilt als Fantasiefirma?",
              c: ["The Boeing Company", "Deutsche Bank", "Metzgerei Müller", "Adidas"],
              a: 0,
              w: "The Boeing Company ist ein frei erfundener, kreativer Name – eine Fantasiefirma.",
            },
            {
              q: "Was ist eine Sachfirma?",
              c: [
                "Der Firmenname benennt die Sache bzw. das Gewerbe",
                "Der Name des Gründers steht im Fokus",
                "Ein frei erfundener Name",
                "Eine Mischung aus Region und Person",
              ],
              a: 0,
              w: "Die Sachfirma beschreibt die Sache selbst, z. B. Deutsche Bank oder Metzgerei.",
            },
            {
              q: "Welche Rechtsform gehört zu den Personengesellschaften?",
              c: ["OHG", "GmbH", "AG", "UG"],
              a: 0,
              w: "Die OHG (Offene Handelsgesellschaft) ist eine Personengesellschaft; GmbH, AG und UG sind Kapitalgesellschaften.",
            },
            {
              q: "Was besagt die Firmenwahrheit?",
              c: [
                "Der Firmenname darf keine falschen Angaben erwecken",
                "Der Name muss frei erfunden sein",
                "Der Name muss den Gründer enthalten",
                "Der Name muss wöchentlich wechseln",
              ],
              a: 0,
              w: "Firmenwahrheit bedeutet: Der Name darf nicht über Größe, Art oder Umfang des Betriebs täuschen.",
            },
            {
              q: "Welcher Rechtsformzusatz steht bei einer Aktiengesellschaft?",
              c: ["AG", "GmbH", "OHG", "e.K."],
              a: 0,
              w: "Die Aktiengesellschaft trägt den Rechtsformzusatz 'AG'.",
            },
          ],
          cards: [
            { f: "Personenfirma", b: "Gründer-/Inhabername, z. B. Adidas, Haribo, Audi." },
            { f: "Sachfirma", b: "Benennt die Sache/das Gewerbe, z. B. Deutsche Bank." },
            { f: "Fantasiefirma", b: "Frei erfundener Name, z. B. The Boeing Company, edeka." },
            { f: "Mischfirma", b: "Kombination verschiedener Teile, z. B. IKEA." },
            { f: "e.K.", b: "Eingetragener Kaufmann – Rechtsformzusatz." },
            { f: "Firmenwahrheit", b: "Der Name darf keine falschen Angaben erwecken." },
            { f: "Rechtsformzusatz", b: "Steht immer hinten: GmbH, AG, OHG, e.K., GbR." },
            {
              f: "Wirecard",
              b: "Bilanzfälschung um 2020 – Beispiel für Verstoß gegen die Firmenwahrheit.",
            },
          ],
          gaps: [
            { t: "e.K. steht für eingetragener ___.", a: ["kaufmann"] },
            { t: "Die ___ muss immer als Zusatz im Firmennamen stehen.", a: ["rechtsform"] },
            {
              t: "Bei einer ___ steht der Name des Gründers im Firmennamen.",
              a: ["personenfirma"],
            },
            { t: "IKEA ist ein Beispiel für eine ___.", a: ["mischfirma"] },
            {
              t: "Die ___ verlangt, dass der Firmenname keine falschen Angaben erweckt.",
              a: ["firmenwahrheit"],
            },
          ],
          free: [
            {
              q: "Erkläre den Unterschied zwischen Personenfirma und Sachfirma mit je einem Beispiel.",
              a: [
                "Personenfirma nutzt den Gründernamen wie Adidas, Sachfirma benennt die Sache wie Deutsche Bank",
                "Personenfirma = Gründername, Sachfirma = Sache bzw. Gewerbe",
              ],
              w: "Personenfirma = wer, Sachfirma = was.",
            },
            {
              q: "Nenne die vier Arten von Firmennamen und je ein Beispiel.",
              a: [
                "Personenfirma Adidas, Sachfirma Deutsche Bank, Fantasiefirma Boeing, Mischfirma IKEA",
                "Personen-, Sach-, Fantasie- und Mischfirma",
              ],
              w: "Die vier Grundarten werden in BWL unterschieden.",
            },
          ],
        },
        {
          id: "firmengrundsaetze",
          name: "Firmengrundsätze & Wirecard",
          mc: [
            {
              q: "Was verlangt die Firmenklarheit?",
              c: [
                "Der Name muss Inhaber und Rechtsform klar erkennen lassen",
                "Der Name muss frei erfunden sein",
                "Der Name muss jedes Jahr wechseln",
                "Der Name muss das Gründungsdatum enthalten",
              ],
              a: 0,
              w: "Firmenklarheit: Wer steckt hinter der Firma und welche Rechtsform hat sie – das muss sofort erkennbar sein.",
            },
            {
              q: "Was besagt die Firmenschlüssigkeit?",
              c: [
                "Der Name passt zum Geschäftszweig des Unternehmens",
                "Der Name enthält immer eine Abkürzung",
                "Der Name wird beim Inhaberwechsel neu vergeben",
                "Der Name ist frei erfunden",
              ],
              a: 0,
              w: "Schlüssigkeit: Die Firma muss zum Gegenstand und zur Art des Geschäfts passen.",
            },
            {
              q: "Was bedeutet Firmenbeständigkeit?",
              c: [
                "Die Firma bleibt grundsätzlich bestehen, auch wenn der Inhaber wechselt",
                "Die Firma wird bei jedem Verkauf neu vergeben",
                "Der Name muss monatlich geprüft werden",
                "Die Firma existiert nur ein Jahr",
              ],
              a: 0,
              w: "Beständigkeit: Grundsätzlich bleibt die Firma unverändert, auch bei einem Eigentümerwechsel.",
            },
            {
              q: "Fall Schwarzwald Automaten: Was muss am Firmennamen stehen?",
              c: [
                "der Rechtsformzusatz, z. B. e.K.",
                "die Gründungszahl",
                "der Name des Geschäftsführers im Klartext",
                "eine Register-Nummer im Namen",
              ],
              a: 0,
              w: "Die Rechtsform steht immer hinten – bei einem Einzelunternehmen z. B. e.K. (eingetragener Kaufmann).",
            },
            {
              q: "Was sollte man vor einer Firmengründung prüfen lassen?",
              c: [
                "ob ein ähnlicher Firmenname schon existiert (Namensrecherche)",
                "den Kurs der Aktien",
                "die Farbe des Logos",
                "den Stundenplan der Schule",
              ],
              a: 0,
              w: "Namensrecherche vor der Gründung. Ähnlichkeit in einer anderen Branche ist meist unkritisch.",
            },
            {
              q: "Um welche Rechtsform handelte es sich bei Wirecard?",
              c: [
                "Aktiengesellschaft",
                "Personenfirma",
                "Offene Handelsgesellschaft",
                "Eingetragener Kaufmann",
              ],
              a: 0,
              w: "Wirecard war eine Aktiengesellschaft und Zahlungsdienstleister – der deutsche PayPal-Vergleich.",
            },
            {
              q: "Wie viel Geld hat Wirecard erfunden (Finanzskandal 2020)?",
              c: [
                "ca. 7 Milliarden Euro",
                "ca. 700 Millionen Euro",
                "ca. 1 Milliarde Euro",
                "ca. 70 Milliarden Euro",
              ],
              a: 0,
              w: "In den Büchern fehlten rund 7 Milliarden Euro, die nie existiert haben – Kurs auf Null.",
            },
            {
              q: "Welcher Firmengrundsatz wird durch Wirecard verletzt?",
              c: ["Firmenwahrheit", "Firmenklarheit", "Firmenbeständigkeit", "Firmenschlüssigkeit"],
              a: 0,
              w: "Die Bücher durften nicht über die wahren Verhältnisse täuschen – das ist der Verstoß gegen die Firmenwahrheit.",
            },
          ],
          cards: [
            { f: "Firmenklarheit", b: "Der Name lässt Inhaber und Rechtsform klar erkennen." },
            {
              f: "Firmenwahrheit",
              b: "Der Name darf keine falschen Angaben über den Betrieb erwecken.",
            },
            { f: "Firmenschlüssigkeit", b: "Der Name passt zum Geschäftszweig des Unternehmens." },
            {
              f: "Firmenbeständigkeit",
              b: "Die Firma bleibt grundsätzlich bestehen, auch bei Inhaberwechsel.",
            },
            {
              f: "Namensrecherche",
              b: "Prüfung vor der Gründung, ob ein ähnlicher Name schon existiert.",
            },
            {
              f: "Wirecard",
              b: "AG, Zahlungsdienstleister, Finanzskandal 2020: ca. 7 Mrd. Euro erfunden – Verstoß gegen die Firmenwahrheit.",
            },
          ],
          gaps: [
            {
              t: "Die Firmen___ sorgt dafür, dass der Name zum Geschäftszweig passt.",
              a: ["schluessigkeit", "schlüßigkeit"],
            },
            {
              t: "Die Firmen___ verlangt, dass der Name keine falschen Angaben erweckt.",
              a: ["wahrheit"],
            },
            {
              t: "Bei Wirecard wurden rund 7 Milliarden Euro erfunden – ein Fall der Firmen___.",
              a: ["wahrheit"],
            },
            {
              t: "Vor der Gründung prüft man die ___, ob ein ähnlicher Name schon existiert.",
              a: ["namensrecherche", "recherche"],
            },
            { t: "Die Rechtsform steht immer ___ im Firmennamen.", a: ["hinten"] },
          ],
          free: [
            {
              q: "Erkläre die vier Firmengrundsätze in je einem Satz.",
              a: [
                "Klarheit: Inhaber und Rechtsform erkennen; Wahrheit: keine falschen Angaben; Schlüssigkeit: Name passt zum Geschäft; Beständigkeit: Name bleibt bestehen",
                "Firmenklarheit, Firmenwahrheit, Firmenschluessigkeit und Firmenbestaendigkeit",
              ],
              w: "Diese vier Begriffe werden in der Klassenarbeit den Definitionen zugeordnet.",
            },
            {
              q: "Was ist am Fall Wirecard prüfungsrelevant?",
              a: [
                "Wirecard war eine AG; der Finanzskandal um 2020 gilt als Beispiel für den Verstoß gegen die Firmenwahrheit",
                "Buecher gefaelscht, ca. 7 Milliarden Euro erfunden, Kurs auf Null",
              ],
              w: "Das Beispiel zeigt: Firmenwahrheit ist kein Theorie-Thema, sondern hat echte Folgen.",
            },
          ],
        },
      ],
    },
    {
      id: "WK",
      name: "WK – Wirtschaftskompetenz",
      color: "#d97706",
      topics: [
        {
          id: "ausbildung_arbeitsrecht",
          name: "Ausbildung, Pflichten & Orga",
          mc: [
            {
              q: "Welches Gesetz regelt das Berichtsheft?",
              c: ["BBiG (§13/§43)", "StGB", "DSGVO", "Grundgesetz"],
              a: 0,
              w: "Das Berufsbildungsgesetz (BBiG) verpflichtet nach §13/§43 zum Führen des Berichtshefts.",
            },
            {
              q: "Was passiert, wenn man kein Berichtsheft führt?",
              c: [
                "Man wird nicht zur Abschlussprüfung zugelassen",
                "Es passiert nichts",
                "Man bekommt eine bessere Note",
                "Man muss es nur mündlich erzählen",
              ],
              a: 0,
              w: "Das Berichtsheft ist Zulassungsvoraussetzung für die Abschlussprüfung.",
            },
            {
              q: "Bis wann muss eine Fehlzeit in Teilzeit schriftlich entschuldigt werden?",
              c: [
                "Innerhalb von 6 Werktagen mit Betriebsstempel",
                "Innerhalb von 3 Monaten",
                "Gar nicht",
                "Nur mündlich am letzten Tag",
              ],
              a: 0,
              w: "In Teilzeit gilt eine Frist von 6 Werktagen; der Betrieb muss stempeln und unterschreiben.",
            },
            {
              q: "Was passiert bei einer Klassenarbeit ohne Entschuldigung?",
              c: ["Note 6", "Note 1", "Die Arbeit wird automatisch nachgeschrieben", "Nichts"],
              a: 0,
              w: "Eine unentschuldigte Fehlzeit bei einer Klassenarbeit wird mit Note 6 bewertet.",
            },
            {
              q: "Wie viel kostet das D-Ticket JugendBW pro Monat?",
              c: ["45 €", "9 €", "100 €", "0 €"],
              a: 0,
              w: "Das D-Ticket JugendBW kostet 45 € pro Monat und gilt bundesweit im Nahverkehr.",
            },
            {
              q: "Wer unterschreibt das Berichtsheft monatlich?",
              c: ["Der Ausbilder", "Der Klassenlehrer", "Die IHK", "Der Betriebsrat"],
              a: 0,
              w: "Das Berichtsheft muss monatlich vom Ausbilder unterschrieben werden.",
            },
            {
              q: "Wann wird das digitale IHK-Berichtsheft eingestellt?",
              c: ["31.12.2026", "01.01.2026", "31.07.2027", "Nie"],
              a: 0,
              w: "Das digitale IHK-Berichtsheft wird zum 31.12.2026 eingestellt – Word/PDF-Dateien sichern.",
            },
            {
              q: "Welches Ticket gilt bundesweit im Nahverkehr?",
              c: ["D-Ticket JugendBW", "Schülerticket Bayern", "BahnCard 100", "Ferienpass"],
              a: 0,
              w: "Das D-Ticket JugendBW berechtigt bundesweit zur Nutzung des Nahverkehrs.",
            },
          ],
          cards: [
            {
              f: "Berichtsheft",
              b: "Pflicht nach BBiG §13/§43 – ohne Berichtsheft keine Zulassung zur Abschlussprüfung.",
            },
            {
              f: "Fehlzeit",
              b: "Vorher Betrieb und Schule informieren, danach schriftlich entschuldigen.",
            },
            {
              f: "Entschuldigungsfrist",
              b: "3 Werktage, in Teilzeit 6 Werktage mit Betriebsstempel.",
            },
            { f: "Klassenarbeit ohne Entschuldigung", b: "Wird mit Note 6 bewertet." },
            { f: "Berichtsheft-Unterschrift", b: "Monatlich vom Ausbilder unterschreiben lassen." },
            { f: "D-Ticket JugendBW", b: "45 € pro Monat, bundesweit Nahverkehr." },
            {
              f: "Digitales IHK-Berichtsheft",
              b: "Wird zum 31.12.2026 eingestellt – Daten sichern.",
            },
          ],
          gaps: [
            { t: "Ohne ___ keine Zulassung zur Abschlussprüfung.", a: ["berichtsheft"] },
            {
              t: "Bei Teilzeit muss die schriftliche Entschuldigung innerhalb von ___ Werktagen vorliegen.",
              a: ["6", "sechs"],
            },
            { t: "Das D-Ticket JugendBW kostet ___ Euro pro Monat.", a: ["45"] },
            {
              t: "Eine Klassenarbeit ohne Entschuldigung wird mit Note ___ bewertet.",
              a: ["6", "sechs"],
            },
            { t: "Das Berichtsheft wird monatlich vom ___ unterschrieben.", a: ["ausbilder"] },
          ],
          free: [
            {
              q: "Warum ist das Berichtsheft so wichtig?",
              a: [
                "Es ist Pflicht nach BBiG und Voraussetzung für die Zulassung zur Abschlussprüfung",
                "Ohne Berichtsheft keine Zulassung zur Prüfung",
              ],
              w: "Es dokumentiert die Ausbildung und ist gesetzliche Pflicht.",
            },
            {
              q: "Was musst du tun, wenn du krank bist und nicht zur Berufsschule kannst?",
              a: [
                "Betrieb und Schule vor Unterrichtsbeginn informieren und die Fehlzeit fristgerecht schriftlich entschuldigen",
                "Vorher anrufen, dann schriftlich entschuldigen mit Betriebsstempel",
              ],
              w: "Wichtig: vorher melden und die Fristen (3 bzw. 6 Werktage) einhalten.",
            },
          ],
        },
        {
          id: "pruefungen_wiso",
          name: "Prüfungen: Teil 1, Teil 2 & WiSo",
          mc: [
            {
              q: "Wie lange dauert die Prüfung Teil 1 der Abschlussprüfung?",
              c: ["90 Minuten", "60 Minuten", "120 Minuten", "45 Minuten"],
              a: 0,
              w: "Teil 1 ist schriftlich, dauert 90 Minuten und zählt mit 20 % zur Gesamtnote.",
            },
            {
              q: "Wie viel Prozent der Gesamtnote macht Teil 1 aus?",
              c: ["20 %", "50 %", "10 %", "80 %"],
              a: 0,
              w: "Teil 1 = 20 %, Teil 2 = 80 % der Gesamtnote der Abschlussprüfung.",
            },
            {
              q: "Was ist das Thema von Teil 1?",
              c: [
                "Einrichten eines IT-gestützten Arbeitsplatzes",
                "Ein Servernetz konfigurieren",
                "Ein Softwareprojekt entwickeln",
                "Ein Betrieb gründen",
              ],
              a: 0,
              w: "Teil 1 fragt die ersten 18 Monate ab (LF1–LF6): Bedarf ermitteln, Hard/Software wählen, konfigurieren, testen, dokumentieren.",
            },
            {
              q: "Wie viele Punkte braucht man in Teil 1 ungefähr, um sicher zu sein?",
              c: ["mind. 50 Punkte", "mind. 20 Punkte", "mind. 75 Punkte", "genau 100 Punkte"],
              a: 0,
              w: "Mit mindestens 50 Punkten ist man in Teil 1 sicher – die Note zählt aber trotzdem zur Gesamtnote.",
            },
            {
              q: "Wie lange dauert die WiSo-Prüfung in Teil 2?",
              c: ["60 Minuten", "90 Minuten", "45 Minuten", "120 Minuten"],
              a: 0,
              w: "Die WiSo-Prüfung dauert 60 Minuten und ist Multiple Choice – sie macht 10 % von Teil 2 aus.",
            },
            {
              q: "Was enthält die WiSo-Prüfung?",
              c: [
                "Wirtschaft, Gesellschaft und Arbeitsrecht",
                "Nur Betriebswirtschaft",
                "Nur Mathematik",
                "Programmieren und Netzwerke",
              ],
              a: 0,
              w: "WiSo = Wirtschafts- und Sozialkunde: Wirtschaft, Gesellschaft und Arbeitsrecht – Wissen aus WK, BWL und GK.",
            },
            {
              q: "Wie viel Prozent von Teil 2 macht die Projektarbeit aus?",
              c: ["50 %", "20 %", "10 %", "80 %"],
              a: 0,
              w: "Die Projektarbeit sind 50 % von Teil 2 (SI/DPA/DV 40 Std., AE 80 Std.) plus Doku, 15 Min Präsentation und 15 Min Fachgespräch.",
            },
            {
              q: "Wie viele schriftliche Fachprüfungen mit je 90 Minuten gibt es in Teil 2?",
              c: ["2", "1", "3", "4"],
              a: 0,
              w: "Zwei Fachprüfungen à 90 Minuten, jede zu 10 % – zusammen mit WiSo (10 %) und der Projektarbeit.",
            },
          ],
          cards: [
            {
              f: "Teil 1",
              b: "90 Min schriftlich, 20 %, Thema: Einrichten eines IT-gestützten Arbeitsplatzes (LF1–LF6).",
            },
            { f: "Teil 1 sicher", b: "Mindestens 50 Punkte – zählt trotzdem zur Gesamtnote." },
            {
              f: "Teil 2",
              b: "80 % der Gesamtnote: Projektarbeit 50 %, 2 Fachprüfungen je 90 Min, WiSo 60 Min.",
            },
            {
              f: "WiSo-Prüfung",
              b: "60 Min Multiple Choice zu Wirtschaft, Gesellschaft und Arbeitsrecht (10 %).",
            },
            {
              f: "Bestehensregel",
              b: "Gesamt ausreichend, Teil 2 ausreichend, mind. 3 Bereiche ausreichend, keiner ungenügend.",
            },
            {
              f: "Berufsschul-Abschluss BW",
              b: "Noten aus den Lernfeldern plus Deutsch, GK und WK.",
            },
          ],
          gaps: [
            { t: "Teil 1 der Abschlussprüfung dauert ___ Minuten.", a: ["90"] },
            { t: "Die WiSo-Prüfung in Teil 2 dauert ___ Minuten.", a: ["60"] },
            { t: "Teil 2 besteht zu 50 % aus der Projekt___.", a: ["arbeit"] },
            {
              t: "Die WiSo-Prüfung behandelt Wirtschaft, Gesellschaft und ___.",
              a: ["arbeitsrecht"],
            },
            {
              t: "Ohne geführtes Berichtsheft gibt es keine ___ zur Abschlussprüfung.",
              a: ["zulassung"],
            },
          ],
          free: [
            {
              q: "Woraus besteht Teil 2 der Abschlussprüfung?",
              a: [
                "Projektarbeit mit Doku, Präsentation und Fachgespräch, zwei Fachprüfungen zu je 90 Minuten und die WiSo-Prüfung über 60 Minuten",
                "Teil 2 = 80 Prozent: Projekt 50 Prozent, 2 Fachprüfungen und WiSo je 10 Prozent",
              ],
              w: "Teil 2 macht 80 % der Gesamtnote aus.",
            },
            {
              q: "Was ist das Thema von Teil 1 und wie lange dauert er?",
              a: [
                "Einrichten eines IT-gestützten Arbeitsplatzes, 90 Minuten schriftlich",
                "Teil 1 dauert 90 Minuten und behandelt das Einrichten eines IT-Arbeitsplatzes aus LF1 bis LF6",
              ],
              w: "Stoff der ersten 18 Monate: Bedarf ermitteln, Hardware/Software wählen, konfigurieren, testen, datenschutzkonform einweisen und protokollieren.",
            },
          ],
        },
      ],
    },
    {
      id: "Deutsch",
      name: "Deutsch – Kommunikation",
      color: "#db2777",
      topics: [
        {
          id: "sachtexte",
          name: "Sachtexte & Textarbeit",
          mc: [
            {
              q: "Was ist ein Sachtext?",
              c: [
                "Ein Text, der Fakten und Wahrheit vermittelt",
                "Ein Gedicht",
                "Ein fiktiver Roman",
                "Ein Drama",
              ],
              a: 0,
              w: "Sachtexte wie Berichte, Protokolle oder Anleitungen vermitteln faktenbezogene Informationen.",
            },
            {
              q: "Welcher Text ist ein Sachtext?",
              c: ["Ein Bericht", "Ein Liebesgedicht", "Ein Fantasy-Roman", "Eine Ballade"],
              a: 0,
              w: "Der Bericht ist sachlich und faktenorientiert – ein klassischer Sachtext.",
            },
            {
              q: "Was ist eine Ballade?",
              c: [
                "Eine Mischung aus Lyrik, Epik und Dramatik",
                "Ein reiner Sachtext",
                "Ein Protokoll",
                "Eine E-Mail an Kunden",
              ],
              a: 0,
              w: "Die Ballade vereint Merkmale von Lyrik, Epik und Dramatik.",
            },
            {
              q: "Wie bewertet man einen literarischen Text?",
              c: [
                "Nach ästhetischen und emotionalen Kriterien",
                "Nur nach Wahrheitsgehalt",
                "Nach der Anzahl der Fakten",
                "Nur nach der Rechtschreibung",
              ],
              a: 0,
              w: "Bei literarischen Texten zählen Ästhetik, Wirkung und Emotion, nicht nur Fakten.",
            },
            {
              q: "Was ist der erste Schritt der Textarbeit?",
              c: [
                "Überfliegen von Titel und Zwischenüberschriften",
                "Alles auswendig lernen",
                "Jedes Wort nachschlagen",
                "Sofort die Inhaltsangabe schreiben",
              ],
              a: 0,
              w: "Erst überfliegen, um das Thema zu erfassen, dann genau lesen.",
            },
            {
              q: "Wie viel des Textes sollte man markieren?",
              c: ["Etwa 10-20 %", "100 %", "50 %", "Gar nichts"],
              a: 0,
              w: "Nur Stichwörter und etwa 10-20 % markieren – sonst geht die Übersicht verloren.",
            },
            {
              q: "Welcher Satz stammt aus einer guten Textantwort?",
              c: [
                "According to the text (line X)...",
                "I think maybe...",
                "Hi, ...",
                "u gonna ...",
              ],
              a: 0,
              w: "Antworten im Vollsatz mit Textbeleg sind in Textarbeit und BE gefragt.",
            },
            {
              q: "Was gehört NICHT in eine formelle Enquiry-Mail?",
              c: ["SMS-Sprache wie 'u' und 'gonna'", "Ein Betreff", "Eine Anrede", "Ein Gruß"],
              a: 0,
              w: "Formelle Mails brauchen Betreff, Anrede, Grund, Details, Bitte und Gruß – keine SMS-Sprache.",
            },
          ],
          cards: [
            {
              f: "Sachtext",
              b: "Fakten und Wahrheit, z. B. Bericht, Protokoll, Anleitung, Rezept.",
            },
            { f: "Literarischer Text", b: "Fiktiv: Lyrik, Prosa, Drama; Ballade als Mischform." },
            {
              f: "Textarbeit Schritt 1",
              b: "Überfliegen: Titel, Zwischenüberschriften, ersten Satz je Absatz.",
            },
            {
              f: "Textarbeit Schritt 2",
              b: "Genau lesen: unbekannte Wörter im Kontext verstehen.",
            },
            { f: "Textarbeit Schritt 3", b: "Markieren: nur 10-20 %, Stichwörter, andere Farbe." },
            { f: "Textarbeit Schritt 4", b: "Sinnabschnitte bilden." },
            {
              f: "Textarbeit Schritt 5",
              b: "Hauptaussagen je Abschnitt in eigenen Worten formulieren.",
            },
            {
              f: "Textbeleg",
              b: "Antwort im Vollsatz mit Beleg: 'According to the text (line X)...'.",
            },
          ],
          gaps: [
            { t: "Ein Text, der Fakten vermittelt, heißt ___.", a: ["sachtext"] },
            { t: "Eine ___ ist eine Mischung aus Lyrik, Epik und Dramatik.", a: ["ballade"] },
            { t: "Man markiert nur etwa 10-20 ___ des Textes.", a: ["prozent"] },
            { t: "Sachtexte bewertet man nach Wahrheitsgehalt und ___.", a: ["struktur", "form"] },
            {
              t: "Der erste Schritt der Textarbeit ist das ___.",
              a: ["ueberfliegen", "überfliegen"],
            },
          ],
          free: [
            {
              q: "Nenne die 5 Schritte der Textarbeit.",
              a: [
                "Überfliegen, genau lesen, markieren, Sinnabschnitte bilden, Hauptaussagen in eigenen Worten formulieren",
                "1 überfliegen 2 genau lesen 3 markieren 4 sinnabschnitte 5 hauptaussagen",
              ],
              w: "Diese Methode gilt für Klassenarbeiten und Textanalyse.",
            },
            {
              q: "Was ist der Unterschied zwischen Sachtext und literarischem Text?",
              a: [
                "Sachtexte sind faktenbasiert und wahr, literarische Texte sind fiktiv und werden ästhetisch bewertet",
                "Sachtext vermittelt Fakten, literarischer Text ist erfunden",
              ],
              w: "Sachtext = Wahrheitsgehalt/Struktur; literarisch = ästhetisch/emotional.",
            },
          ],
        },
        {
          id: "textarten_grenzfaelle",
          name: "Textarten, Grenzfälle & Klassenarbeit",
          mc: [
            {
              q: "Welcher Grenzfall ist ein Sachtext?",
              c: ["Eine E-Mail an einen Kunden", "Ein Liebesbrief", "Ein Gedicht", "Ein Drama"],
              a: 0,
              w: "E-Mail an Kunden = Sachtext, Liebesbrief = literarisch – Grenzfälle muss man in der Klassenarbeit erkennen können.",
            },
            {
              q: "Wie wird eine Autobiografie eingeordnet?",
              c: [
                "Sachtext, der aber 'schwindeln' darf",
                "Reiner literarischer Text",
                "Protokoll",
                "Werbe-Mail",
              ],
              a: 0,
              w: "Autobiografie ist ein Sachtext – darf aber davon abweichen, z. B. Goethe 'Dichtung und Wahrheit'.",
            },
            {
              q: "Welche Textsorten stehen in der Berufsschule im 1. und 2. Jahr im Vordergrund?",
              c: ["Sachtexte", "Literarische Texte", "Nur Gedichte", "Nur Dramen"],
              a: 0,
              w: "In der Berufsschule arbeitet man vor allem mit Sachtexten; literarische Texte kommen eher im 3. Jahr.",
            },
            {
              q: "Wie ist die Deutschprüfung am Ende der 3 Jahre aufgebaut?",
              c: [
                "Text + Fragen = 50 %, die andere Hälfte praxisnah",
                "Nur ein Aufsatz",
                "Nur Grammatik",
                "100 % Multiple Choice",
              ],
              a: 0,
              w: "50 % Textverständnis mit Fragen, die andere Hälfte praxisnah – vergleichbar mit den Berufen Dachdecker/Installateur.",
            },
            {
              q: "Was passiert, wenn Abgaben KI-generiert sind?",
              c: [
                "Täuschungsversuch mit Note 6",
                "Man bekommt eine bessere Note",
                "Nichts, KI ist erlaubt",
                "Die Arbeit wird ungültig, aber ohne Note",
              ],
              a: 0,
              w: "KI in Abgaben und Klassenarbeiten zählt wie ein Spickzettel: Täuschungsversuch, Note 6.",
            },
            {
              q: "Was ist zu Hause erlaubt und sogar empfohlen?",
              c: [
                "KI zum Üben und Erklären, z. B. Musterbrief korrigieren lassen",
                "KI-Text direkt als Abgabe",
                "KI während der Klassenarbeit",
                "KI für alle Hausaufgaben",
              ],
              a: 0,
              w: "Erlaubt: KI zum Lernen, Erklären und Korrigieren. Verboten: KI-Inhalte in Abgaben und Klassenarbeiten.",
            },
            {
              q: "Wie viele Klassenarbeiten pro Halbjahr gibt es in dieser Klasse?",
              c: ["2", "4", "1", "3"],
              a: 0,
              w: "2 Klassenarbeiten = 2/3 der schriftlichen Note, 1/3 sind Abgaben (Gruppenarbeit, Briefe, Präsentationen).",
            },
            {
              q: "Wie viel Prozent der Gesamtnote ist die Mitarbeit?",
              c: ["20 %", "50 %", "10 %", "0 %"],
              a: 0,
              w: "20 % der Gesamtnote kommen aus Mitarbeit: mitdenken, melden, Handy weg – die Qualität der Beiträge zählt.",
            },
          ],
          cards: [
            {
              f: "Sachtext",
              b: "Fakten und Wahrheit: Bericht, Protokoll, Erörterung, Anleitung, Rezept, Biografie, Kündigung, Werbe-Mail, Tweet.",
            },
            {
              f: "Literarischer Text",
              b: "Fiktiv: Lyrik (Gedichte), Prosa (alles Nicht-Lyrik), Drama/Drehbuch; Ballade = Mischform.",
            },
            { f: "Grenzfall E-Mail", b: "An den Kunden = Sachtext, an die Liebe = literarisch." },
            {
              f: "Autobiografie",
              b: "Sachtext, der aber abweichen darf – z. B. Goethe 'Dichtung und Wahrheit'.",
            },
            {
              f: "KI-Regel",
              b: "KI-Inhalte in Abgaben/Klassenarbeiten = Täuschungsversuch, Note 6. Üben und Erklären ist erlaubt.",
            },
            {
              f: "Bewertung",
              b: "Sachtext: Wahrheitsgehalt + Struktur; literarisch: ästhetisch, emotional, Unterhaltung.",
            },
            {
              f: "Mitarbeit",
              b: "20 % der Gesamtnote – Qualität der Beiträge zählt mehr als Quantität.",
            },
            {
              f: "Prüfungsformat",
              b: "Text + Fragen = 50 %, andere Hälfte praxisnah am Ende der 3 Jahre.",
            },
          ],
          gaps: [
            {
              t: "Eine E-Mail an einen Kunden gilt als ___, ein Liebesbrief als literarisch.",
              a: ["sachtext"],
            },
            {
              t: "KI-generierte Inhalte in Abgaben gelten als Täuschungsversuch und werden mit Note ___ bewertet.",
              a: ["6", "sechs"],
            },
            { t: "Die Mitarbeit macht 20 ___ der Gesamtnote aus.", a: ["prozent", "%"] },
            { t: "Die erste Klassenarbeit dieser Klasse ist nicht vor ___.", a: ["dezember"] },
            {
              t: "In der Berufsschule stehen im 1. und 2. Jahr die ___ im Vordergrund.",
              a: ["sachtexte"],
            },
          ],
          free: [
            {
              q: "Was unterscheidet Sachtext und literarischen Text? Nenne je einen Grenzfall.",
              a: [
                "Sachtexte sind faktenbasiert und werden nach Wahrheit und Struktur bewertet, literarische Texte sind fiktiv und werden ästhetisch bewertet; Grenzfall: E-Mail an Kunden ist Sachtext, Liebesbrief ist literarisch",
                "Sachtext = Fakten, literarisch = fiktiv; Autobiografie ist ein Sachtext, der schwindeln darf",
              ],
              w: "Grenzfälle kommen in der Klassenarbeit fast immer vor.",
            },
            {
              q: "Was passiert bei KI-Nutzung in Abgaben – und was ist erlaubt?",
              a: [
                "KI-generierte Inhalte sind ein Täuschungsversuch und werden mit Note 6 bewertet; erlaubt ist KI zum Üben und Erklären zu Hause",
                "Verboten in Abgaben, erlaubt zum Lernen und Korrigierenlassen",
              ],
              w: "Grund der Regel: KI wiegt vor, du lernst nichts – selbst machen bleibt im Hirn.",
            },
          ],
        },
      ],
    },
    {
      id: "BE",
      name: "BE – Berufliches Englisch",
      color: "#0891b2",
      topics: [
        {
          id: "grammatik_zeiten",
          name: "Grammatik & Höflichkeit",
          mc: [
            {
              q: "Wie lautet die 3. Person Singular von 'configure' im Simple Present?",
              c: ["configures", "configure", "configured", "configuring"],
              a: 0,
              w: "Im Simple Present hängt man bei he/she/it ein -s an: he configures.",
            },
            {
              q: "Wie bildet man das Simple Past von 'install'?",
              c: ["installed", "installs", "installing", "install"],
              a: 0,
              w: "Regelmäßige Verben bilden das Simple Past mit -ed: installed.",
            },
            {
              q: "Welcher Satz steht im Passive?",
              c: [
                "The network is configured",
                "I configure the network",
                "He configures it",
                "They configure the network",
              ],
              a: 0,
              w: "Im Passive steht das Objekt im Vordergrund: The network is configured.",
            },
            {
              q: "Wie bildet man das Simple Future?",
              c: ["will + Verb", "do + Verb", "am + Verb-ing", "have + Verb"],
              a: 0,
              w: "Das Simple Future wird mit will + Grundform gebildet.",
            },
            {
              q: "Was ist eine höfliche Bitte?",
              c: ["Could you please ...?", "Give me ...!", "You must ...", "Do it now!"],
              a: 0,
              w: "Could you please ...? bzw. Would you ...? gelten als höfliche Bitten.",
            },
            {
              q: "Wie fragt man im Simple Present nach der 3. Person?",
              c: ["Does he configure?", "Do he configure?", "Is he configure?", "He configures?"],
              a: 0,
              w: "Bei he/she/it verwendet man does + Grundform: Does he configure?",
            },
          ],
          cards: [
            { f: "Present", b: "I configure / he configures; Fragen mit do/does." },
            { f: "Past", b: "I installed, did, was/were." },
            { f: "Future", b: "will + Verb." },
            { f: "Passive", b: "The client was installed / The network is configured." },
            { f: "Höflichkeit", b: "Could you please ...? / Would you ...?" },
          ],
          gaps: [
            { t: "He ___ (configure) the network every day.", a: ["configures"] },
            { t: "The client was ___ (install) yesterday.", a: ["installed"] },
            { t: "Tomorrow I ___ send you the quotation.", a: ["will"] },
            { t: "___ you please send us a quotation?", a: ["could", "would"] },
            { t: "The network ___ configured.", a: ["is"] },
          ],
          free: [
            {
              q: "Schreibe eine höfliche Bitte auf Englisch, in der du um ein Angebot bittest.",
              a: ["Could you please send us a quotation?", "Would you please send us a quotation?"],
              w: "Höfliche Bitten beginnen mit Could/Would you please ...?",
            },
            {
              q: "Bilde das Passive von 'I install the client'.",
              a: ["The client is installed", "The client is installed by me"],
              w: "Passive: The client is installed (by me).",
            },
          ],
        },
        {
          id: "enquiry_mail",
          name: "Enquiry-Mail & Textbeleg",
          mc: [
            {
              q: "Welche Reihenfolge hat eine formelle Geschäftsmail?",
              c: [
                "Betreff, Anrede, Grund, Details, Bitte, Gruß",
                "Anrede, Betreff, Gruß, Details",
                "Gruß, Anrede, Betreff, Details",
                "Nur Gruß und Betreff",
              ],
              a: 0,
              w: "Immer: Betreff + Anrede + Grund + Details + Bitte + Gruß – das ist die Struktur, nach der korrigiert wird.",
            },
            {
              q: "Welche Anrede ist im Zweifel immer sicher?",
              c: ["Dear Sir or Madam", "Hi", "Hello guys", "Yo"],
              a: 0,
              w: "Kein 'Hi' – entweder Dear Sir or Madam oder Dear Mr/Ms + Name.",
            },
            {
              q: "Was gehört NICHT in eine formelle Enquiry-Mail?",
              c: [
                "SMS-Sprache wie 'u' und 'gonna'",
                "Ein Betreff",
                "Eine Bitte um ein Angebot",
                "Das Datum",
              ],
              a: 0,
              w: "SMS-Sprache gibt Abzug – schreiben Sie vollständig und formell.",
            },
            {
              q: "Wie schreibt man ein Datum auf Englisch?",
              c: ["2 November 2026", "02.11.2026", "2026/11/02", "11/02/2026"],
              a: 0,
              w: "Englisches Datum ohne Punkte: Tag Monat Jahr – z. B. 2 November 2026.",
            },
            {
              q: "Welcher Satz ist eine höfliche Bitte um ein Angebot?",
              c: [
                "Could you please send us a quotation?",
                "Send us a quotation!",
                "You must send it now.",
                "We want the price.",
              ],
              a: 0,
              w: "Could you please ...? / Would you ...? sind die höflichen Bitten – vor allem in Enquiry-Mails.",
            },
            {
              q: "Welcher Satz eröffnet eine Anfrage mit Katalogbezug?",
              c: [
                "With reference to your catalogue, we are interested in ...",
                "Dear Mr Smith",
                "Best regards",
                "Please restart your client",
              ],
              a: 0,
              w: "Opening-Baustein aus dem Kasten: 'With reference to your catalogue/website, we are interested in ...'.",
            },
            {
              q: "Wie beginnt eine Textantwort im Vollsatz?",
              c: [
                "According to the text (line X) ...",
                "I think maybe ...",
                "Hi, ...",
                "u gonna ...",
              ],
              a: 0,
              w: "Antwort immer im Vollsatz mit Textbeleg – so holt man Punkte bei true/false und offenen Fragen.",
            },
            {
              q: "Welche Fragen leiten das erste Lesen eines Textes?",
              c: ["Who, what, when, where, why", "How much, how many", "Which colour", "Why not"],
              a: 0,
              w: "Die W-Fragen (who/what/when/where/why) geben schnell den Überblick – unbekannte Wörter aus dem Kontext raten.",
            },
          ],
          cards: [
            { f: "Mail-Aufbau", b: "Betreff, Anrede, Grund, Details, Bitte, Gruß." },
            {
              f: "Anrede/Gruß",
              b: "Dear Sir or Madam → Yours faithfully; kein 'Hi', kein SMS-Englisch.",
            },
            { f: "Höfliche Bitte", b: "Could you please send us a quotation?" },
            { f: "Opening-Satz", b: "With reference to your catalogue, we are interested in ..." },
            {
              f: "Textbeleg",
              b: "According to the text (line X) ... – immer im Vollsatz antworten.",
            },
            {
              f: "Ticket-Formulierungen",
              b: "I received your service request No. ... / The error occurs when ... / I have fixed it / The ticket is now closed.",
            },
            { f: "Englisches Datum", b: "2 November 2026 – ohne Punkte zwischen den Zahlen." },
          ],
          gaps: [
            { t: "Statt 'Hi' lautet die sichere Anrede 'Dear Sir or ___'.", a: ["madam"] },
            {
              t: "Eine Textantwort beginnt im Vollsatz mit 'According to the ___ (line X)'.",
              a: ["text"],
            },
            { t: "Unbekannte Wörter versteht man am besten im ___.", a: ["kontext"] },
            { t: "Beim ersten Lesen fragt man: who, what, when, where, ___?", a: ["why"] },
            {
              t: "Die Bitte in der Enquiry-Mail lautet: 'Could you please send us a ___?'.",
              a: ["quotation"],
            },
          ],
          free: [
            {
              q: "Schreibe den Aufbau einer formellen Enquiry-Mail und nenne einen No-Go.",
              a: [
                "Betreff, Anrede, Grund, Details, Bitte, Gruß; No-Go ist SMS-Sprache wie u und gonna",
                "Dear Sir or Madam, Grund der Anfrage, Could you please send us a quotation, Thank you, Yours faithfully – kein Hi",
              ],
              w: "Klassenarbeit ist auf Papier – Muster-Mail am besten einmal handschriftlich üben.",
            },
            {
              q: "Wie beantwortest du eine Textaufgabe richtig?",
              a: [
                "Im Vollsatz mit Textbeleg: According to the text (line X) ... – vorher die W-Fragen und die Markierung der Stichwörter nutzen",
                "Vollsatz plus Beleg aus dem Text, Namen und Zahlen markieren",
              ],
              w: "Wer nur 'true' oder 'yes' hinkritzelt, bekommt keine Punkte.",
            },
          ],
        },
      ],
    },
    {
      id: "GK",
      name: "GK – Gemeinschaftskunde",
      color: "#65a30d",
      topics: [
        {
          id: "grundgesetz_demokratie",
          name: "Grundgesetz, Demokratie & Wahlen",
          mc: [
            {
              q: "Was steht in Artikel 1 des Grundgesetzes?",
              c: [
                "Die Würde des Menschen ist unantastbar",
                "Die Bundesrepublik ist ein Bundesstaat",
                "Jeder hat das Recht auf Bildung",
                "Das Eigentum wird gewahrt",
              ],
              a: 0,
              w: "Artikel 1 Absatz 1 GG: Die Würde des Menschen ist unantastbar – die wichtigste Grundrechtsnorm.",
            },
            {
              q: "Welches Grundrecht schützt Meinungs- und Pressefreiheit?",
              c: ["Artikel 5", "Artikel 1", "Artikel 14", "Artikel 20"],
              a: 0,
              w: "Artikel 5 GG gewährleistet Meinungsfreiheit, Informationsfreiheit und Pressefreiheit.",
            },
            {
              q: "Wie alt muss man für die Bundestagswahl sein?",
              c: ["18", "16", "21", "14"],
              a: 0,
              w: "Gewählt wird ab 18 Jahren – das Wahlrecht ist im Grundgesetz festgelegt.",
            },
            {
              q: "Welches Gremium wird direkt von den Bürgerinnen und Bürgern gewählt?",
              c: [
                "Der Bundestag",
                "Der Bundesrat",
                "Das Bundesverfassungsgericht",
                "Die Bundesregierung",
              ],
              a: 0,
              w: "Der Bundestag wird gewählt; die Bundesregierung wird aus dem Bundestag gebildet, der Bundesrat vertritt die Länder.",
            },
            {
              q: "Was ist der Bundesrat?",
              c: [
                "Die Vertretung der Länder (Länderkammer)",
                "Das gewählte Parlament",
                "Die Bundesregierung",
                "Das Verfassungsgericht",
              ],
              a: 0,
              w: "Im Bundesrat sitzen die Regierungen der Länder – er ist die Vertretung der Länder auf Bundesebene.",
            },
            {
              q: "Was beschreibt der Sozialstaatsgrundsatz?",
              c: [
                "Der Staat sichert Grundabsicherung und gleiche Chancen",
                "Es gibt nur freie Märkte ohne Staat",
                "Nur Polizei und Armee werden finanziert",
                "Alle Steuern entfallen",
              ],
              a: 0,
              w: "Sozialstaat (Art. 20 Abs. 1 GG): Der Staat soll für soziale Gerechtigkeit sorgen – Grundlage z. B. der Sozialversicherung.",
            },
            {
              q: "Was bedeutet Demokratie in einem Satz?",
              c: [
                "Die Herrschaft des Volkes, ausgeübt über Wahlen und Abstimmungen",
                "Die Herrschaft eines einzelnen Herrschers",
                "Reine Marktwirtschaft ohne Wahlen",
                "Nur Gerichtsurteile",
              ],
              a: 0,
              w: "Demokratie = Volkherrschaft: Organe werden gewählt, Grundrechte schützen Minderheiten.",
            },
            {
              q: "Wie nennt man die Aufteilung der Staatsmacht?",
              c: [
                "Gewaltenteilung: Legislative, Exekutive, Judikative",
                "Gewaltenteilung: Bund, Länder, Gemeinden",
                "Arbeitgeber, Arbeitnehmer, Staat",
                "Regierung, Kirche, Armee",
              ],
              a: 0,
              w: "Legislative (Gesetze), Exekutive (Regierung/Verwaltung) und Judikative (Justiz) kontrollieren sich gegenseitig.",
            },
          ],
          cards: [
            { f: "Artikel 1 GG", b: "Die Würde des Menschen ist unantastbar." },
            { f: "Artikel 5 GG", b: "Meinungs-, Informations- und Pressefreiheit." },
            { f: "Bundestag", b: "Von den Bürgerinnen und Bürgern gewähltes Parlament." },
            { f: "Bundesrat", b: "Vertretung der Länder (Länderkammer) – nicht direkt gewählt." },
            {
              f: "Sozialstaat",
              b: "Art. 20 Abs. 1 GG: Staatliches Handeln für soziale Gerechtigkeit und Grundabsicherung.",
            },
            {
              f: "Gewaltenteilung",
              b: "Legislative, Exekutive, Judikative – gegenseitige Kontrolle der Staatsmacht.",
            },
            { f: "Wahlalter Bundestag", b: "Ab 18 Jahren." },
          ],
          gaps: [
            {
              t: "Die Würde des Menschen ist unantastbar – das steht in Artikel ___ des Grundgesetzes.",
              a: ["1", "eins"],
            },
            { t: "Artikel 5 GG schützt die Meinungs- und ___.", a: ["pressefreiheit"] },
            {
              t: "Die Bürger wählen den ___, die Länder sind im Bundesrat vertreten.",
              a: ["bundestag"],
            },
            { t: "Der Bundesrat ist die Vertretung der ___.", a: ["laender", "länder"] },
            { t: "Für die Bundestagswahl muss man ___ Jahre alt sein.", a: ["18", "achtzehn"] },
          ],
          free: [
            {
              q: "Erkläre den Unterschied zwischen Bundestag und Bundesrat.",
              a: [
                "Der Bundestag wird direkt von den Buergern gewaehlt, der Bundesrat vertritt die Regierungen der Laender",
                "Bundestag = gewaehltes Parlament, Bundesrat = Laenderkammer",
              ],
              w: "Merksatz: Bundestag = gewählt, Bundesrat = Länder.",
            },
            {
              q: "Was bedeutet der Sozialstaatsgrundsatz im Grundgesetz?",
              a: [
                "Der Staat muss fuer soziale Gerechtigkeit sorgen, z. B. ueber die Sozialversicherung",
                "Gerechte Verteilung und Grundabsicherung als Staatsaufgabe",
              ],
              w: "Artikel 20 Absatz 1 GG – neben Demokratie und Rechtsstaat ein Grundpfeiler der Ordnung.",
            },
          ],
        },
        {
          id: "soziales_medien",
          name: "Soziale Absicherung, Demografie & Medien",
          mc: [
            {
              q: "Welche fünf Zweige hat die Sozialversicherung?",
              c: [
                "Kranken-, Pflege-, Unfall-, Renten- und Arbeitslosenversicherung",
                "Kranken-, Haftpflicht-, Rechtschutz-, Auto- und Hausratversicherung",
                "Renten-, Lebens-, Unfall-, Auto- und Hausratversicherung",
                "Nur Kranken- und Rentenversicherung",
              ],
              a: 0,
              w: "Die gesetzliche Sozialversicherung umfasst fünf Zweige: Kranken, Pflege, Unfall, Rente und Arbeitslosigkeit.",
            },
            {
              q: "Wer trägt die Beiträge zur Sozialversicherung?",
              c: [
                "Arbeitgeber und Arbeitnehmer meist je zur Hälfte",
                "Nur die Arbeitnehmer",
                "Nur der Staat",
                "Niemand – alles wird durch Steuern bezahlt",
              ],
              a: 0,
              w: "Die Beiträge werden paritätisch geteilt – je zur Hälfte von Arbeitgeber und Arbeitnehmer.",
            },
            {
              q: "Was beschreibt Demografie?",
              c: [
                "Altersstruktur und Bevölkerungsentwicklung",
                "Das Bruttoinlandsprodukt",
                "Das Wahlverhalten",
                "Das Klima einer Region",
              ],
              a: 0,
              w: "Demografie untersucht, wie alt die Menschen sind und wie sich die Bevölkerung verändert (z. B. alternde Gesellschaft).",
            },
            {
              q: "Was meint Migration?",
              c: [
                "Zuzug und Abwanderung von Menschen",
                "Der tägliche Schulweg",
                "Die Produktion im Betrieb",
                "Der Handel zwischen Ländern",
              ],
              a: 0,
              w: "Migration = Zuzug von Menschen in ein Land oder Abzug daraus – ein Kernthema des 1. Jahrgangs.",
            },
            {
              q: "Welches Gesetz schützt personenbezogene Daten in Europa?",
              c: ["DSGVO", "StGB", "BBiG", "HGB"],
              a: 0,
              w: "Die Datenschutz-Grundverordnung (DSGVO) regelt den Schutz personenbezogener Daten – Thema Medien/Datenschutz.",
            },
            {
              q: "Wozu dient die Arbeitslosenversicherung?",
              c: [
                "Sie sichert das Einkommen bei Jobverlust",
                "Sie zahlt die Krankheitskosten",
                "Sie finanziert das Auto",
                "Sie bezahlt das Studium",
              ],
              a: 0,
              w: "Bei Arbeitslosigkeit springt die Arbeitslosenversicherung mit Geldleistungen ein – ein Zweig der Sozialversicherung.",
            },
            {
              q: "Wie nennt man die Angst vor dem Wohlstandsverfall durch weniger Kinder und ältere Bevölkerung?",
              c: ["Demografischer Wandel", "Konjunkturzyklus", "Inflation", "Globalisierung"],
              a: 0,
              w: "Demografischer Wandel: weniger Geburten + höhere Lebenserwartung → alternde Gesellschaft.",
            },
            {
              q: "Warum ist Datenschutz in der Schule ein Thema?",
              c: [
                "Weil personenbezogene Daten vor Missbrauch geschützt werden müssen",
                "Weil Speicherplatz knapp ist",
                "Weil Internet langsam ist",
                "Weil Notebooks teuer sind",
              ],
              a: 0,
              w: "Personenbezogene Daten (Noten, Adressen, Fotos) dürfen nur zweckgebunden und sicher verarbeitet werden.",
            },
          ],
          cards: [
            {
              f: "Sozialversicherung",
              b: "Fünf Zweige: Kranken-, Pflege-, Unfall-, Renten- und Arbeitslosenversicherung.",
            },
            {
              f: "Paritätische Beiträge",
              b: "Arbeitgeber und Arbeitnehmer zahlen die Beiträge meist je zur Hälfte.",
            },
            { f: "Demografie", b: "Altersstruktur und Bevölkerungsentwicklung." },
            {
              f: "Demografischer Wandel",
              b: "Weniger Geburten, mehr Ältere – die Bevölkerung wird älter.",
            },
            { f: "Migration", b: "Zuzug und Abwanderung von Menschen." },
            { f: "DSGVO", b: "Schützt personenbezogene Daten in der EU vor Missbrauch." },
          ],
          gaps: [
            {
              t: "Zur Sozialversicherung gehören Kranken-, Pflege-, Unfall-, Renten- und ___versicherung.",
              a: ["arbeitslosen"],
            },
            {
              t: "Die Beiträge zur Sozialversicherung teilen sich Arbeitgeber und ___ meist je zur Hälfte.",
              a: ["arbeitnehmer"],
            },
            {
              t: "Altersstruktur und Bevölkerungsentwicklung beschreibt die ___.",
              a: ["demografie"],
            },
            { t: "Zuzug und Abwanderung von Menschen nennt man ___.", a: ["migration"] },
            { t: "Personenbezogene Daten schützt die ___ in der EU.", a: ["dsgvo"] },
          ],
          free: [
            {
              q: "Nenne die fünf Zweige der Sozialversicherung.",
              a: [
                "Kranken-, Pflege-, Unfall-, Renten- und Arbeitslosenversicherung",
                "krankenversicherung, pflegeversicherung, unfallversicherung, rentenversicherung, arbeitslosenversicherung",
              ],
              w: "Diese fünf Zweige gehören zur Sozialversicherung, die im 1. Jahrgang dran kommt.",
            },
            {
              q: "Was bedeutet demografischer Wandel und warum ist er ein gesellschaftliches Problem?",
              a: [
                "Es werden weniger Kinder geboren und die Bevoelkerung wird aelter – weniger Erwerbstaetige finanzieren immer mehr Rentner",
                "Weniger Geburten und hoehere Lebenserwartung fuehren zu einer alternden Gesellschaft",
              ],
              w: "Typisches Urteilsthema in GK: Problem erkennen und Handlungsvorschlag nennen.",
            },
          ],
        },
      ],
    },
  ],
  sprachen: {
    Englisch: {
      flag: "🇬🇧",
      lang: "en-US",
      vok: [
        { de: "der Kunde", en: "the customer" },
        { de: "die Anfrage", en: "the enquiry" },
        { de: "das Angebot", en: "the quotation" },
        { de: "die Lieferung", en: "the delivery" },
        { de: "die Zahlung", en: "the payment" },
        { de: "die Bestellung", en: "the order" },
        { de: "die Lieferzeit", en: "the delivery time" },
        { de: "die Zahlungsbedingungen", en: "the payment terms" },
        { de: "der Arbeitsplatz", en: "the workplace" },
        { de: "der Client", en: "the client" },
        { de: "das Netzwerk", en: "the network" },
        { de: "das Ticket", en: "the ticket" },
        { de: "die Software", en: "the software" },
        { de: "die Hardware", en: "the hardware" },
        { de: "die Sicherung / das Backup", en: "the backup" },
        { de: "die Berechtigung", en: "the permission" },
        { de: "die Rechnung", en: "the invoice" },
        { de: "die Garantie", en: "the warranty" },
        { de: "der Rabatt", en: "the discount" },
        { de: "die Versandkosten", en: "the delivery costs" },
        { de: "der Betreff", en: "the subject" },
        { de: "die Anrede", en: "the salutation" },
        { de: "der Fehler", en: "the error" },
        { de: "die Störung", en: "the fault" },
        { de: "mit freundlichen Grüßen", en: "Yours faithfully" },
      ],
      calls: [
        {
          title: "Enquiry – ein Angebot anfragen",
          lines: [
            {
              bot: "Good morning, this is Anna from Ferndale Ltd. I would like to make an enquiry about your laptops.",
              expect: ["enquiry", "laptop", "information"],
            },
            {
              bot: "We are planning to equip two new office workplaces. Could you please send us a quotation?",
              expect: ["quotation", "office", "workplace"],
            },
            {
              bot: "Our requirements are an i5 CPU, 16 GB RAM and a 512 GB SSD.",
              expect: ["requirements", "ram", "ssd", "cpu"],
            },
            {
              bot: "Could you also include prices, delivery time and payment terms?",
              expect: ["prices", "delivery", "payment"],
            },
            {
              bot: "We would need the goods by 2 November 2026. Is that possible?",
              expect: ["november", "possible", "delivery"],
            },
            {
              bot: "Thank you very much. We look forward to your reply.",
              expect: ["thank", "reply", "forward"],
            },
          ],
        },
        {
          title: "IT-Support – Ticket aufnehmen",
          lines: [
            {
              bot: "Hello, this is the IT service desk. How can I help you?",
              expect: ["help", "service", "desk"],
            },
            {
              bot: "Could you describe the error and tell me your ticket number?",
              expect: ["error", "ticket", "number"],
            },
            {
              bot: "When does the error occur? Does it happen every time you start the client?",
              expect: ["error", "occur", "client", "start"],
            },
            {
              bot: "I will configure your network settings and replace the cable. Please restart your client and test it.",
              expect: ["configure", "network", "restart", "test"],
            },
            {
              bot: "I have fixed the problem. The ticket is now closed.",
              expect: ["fixed", "closed", "ticket"],
            },
            { bot: "You are welcome. Have a nice day.", expect: ["welcome", "day"] },
          ],
        },
      ],
    },
  },
  schulen: ["Gewerbliche Schulen Villingen-Schwenningen (GSVS)"],
  termine: [
    { datum: "2026-12-23", titel: "Weihnachtsferien bis 09.01.2027", fach: "Ferien" },
    { datum: "2027-01-21", titel: "BWL test1", fach: "BWL" },
    { datum: "2027-01-25", titel: "WK test1", fach: "WK" },
    { datum: "2027-02-01", titel: "Halbjahreszeugnis", fach: "Schule" },
    { datum: "2027-02-04", titel: "Fasnet / bewegliche Ferientage", fach: "Ferien" },
    { datum: "2027-03-22", titel: "Bewegliche Ferientage vor Ostern", fach: "Ferien" },
    { datum: "2027-05-10", titel: "WK test2", fach: "WK" },
    { datum: "2027-05-17", titel: "Pfingstferien bis 29.05.2027", fach: "Ferien" },
    { datum: "2027-07-21", titel: "Jahreszeugnis", fach: "Schule" },
    { datum: "2027-07-28", titel: "Letzter Schultag", fach: "Schule" },
    { datum: "2027-07-29", titel: "Sommerferien bis 11.09.2027", fach: "Ferien" },
    {
      datum: "2026-11-10",
      titel: "Keine Berufsschule bis 12.11. (Abschlussprüfungen anderer Klassen)",
      fach: "Schule",
    },
    { datum: "2026-12-08", titel: "BS-Schlusskonferenz", fach: "Schule" },
    { datum: "2026-12-17", titel: "BS-Entlassfeier", fach: "Schule" },
    { datum: "2027-01-19", titel: "GLK 2 (13:45-17:00)", fach: "Schule" },
    {
      datum: "2026-11-19",
      titel: "1. Klassenarbeit BT-ITS (5.+6. Std.) – Taschenrechner + kariertes Papier",
      fach: "ITS",
    },
  ],
};
