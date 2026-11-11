/* =========================================================================
   content/videos.js – Kurzvideos für den 🎬 Wissens-Feed.
   Alle IDs am 11.11. über die offizielle YouTube-oEmbed-Schnittstelle geprüft
   (existiert + Einbetten erlaubt). Die Videos gehören ihren Urheber:innen
   und werden nur über den YouTube-Player (youtube-nocookie) eingebettet.
   Schema: { id, f: Fach-ID, t: Titel, by: Kanal, lang?: "en" }
   Neue Videos nur anhängen.
   ========================================================================= */
window.LERNHUB_VIDEOS = [
  /* ---- ITS ---- */
  {
    id: "aUQZUYIn_4s",
    f: "ITS",
    t: "Ohmsches Gesetz in einer Minute – warum brennt die LED durch?",
    by: "Tafeltutor",
  },
  { id: "fbYtaJjWmU0", f: "ITS", t: "Das Ohmsche Gesetz einfach erklärt", by: "Elektro Ratgeber" },
  {
    id: "eC76UZiPPyw",
    f: "ITS",
    t: "Mit diesem Trick merkst du dir das Ohmsche Gesetz",
    by: "die_elektroingenieurin",
  },
  { id: "IlgmDXmUmMQ", f: "ITS", t: "Ohmsches Gesetz", by: "Technik mit BoB" },
  {
    id: "MAJpisMWPlw",
    f: "ITS",
    t: "Volt und Ampere – erklärt mit einem Gartenschlauch",
    by: "Elektro-Ritter",
  },
  { id: "0zqgr82Zk7w", f: "ITS", t: "Was ist elektrische Spannung?", by: "Eltec" },
  { id: "iGB2aybdug0", f: "ITS", t: "Spannung ist nicht Strom", by: "unsichtbarerklaert" },
  {
    id: "8Wio6-8q_kw",
    f: "ITS",
    t: "Reihenschaltung: Strom, Spannung & Gesamtwiderstand",
    by: "ET-Flüsterer",
  },
  {
    id: "vv6HqMSPEwg",
    f: "ITS",
    t: "Heruntergefallenes Stromkabel: Warum auf einem Bein hüpfen? (Schrittspannung)",
    by: "Lukas Erklärt",
  },
  {
    id: "9ku-lpTjl7M",
    f: "ITS",
    t: "Die 5 Sicherheitsregeln – schnell und einfach",
    by: "Technik mit BoB",
  },
  {
    id: "nyLPIQVmsYk",
    f: "ITS",
    t: "Sicherheitsregel 4: Erden & Kurzschließen",
    by: "TOBI'S TOOL TIME",
  },
  { id: "8zRYLEO4K78", f: "ITS", t: "Das OSI-Modell", by: "hellintech" },
  {
    id: "xuan1dN9bKw",
    f: "ITS",
    t: "OSI-Modell: 7 Schichten am Beispiel einer HTTP-Anfrage",
    by: "KodeKloud",
    lang: "en",
  },
  { id: "IqUHnPpZmeU", f: "ITS", t: "Was ist eine IP-Adresse?", by: "hellintech" },
  { id: "koD9T8fww3M", f: "ITS", t: "Subnetzmasken erklärt", by: "infophreak", lang: "en" },
  {
    id: "dJ4ST_5UWgI",
    f: "ITS",
    t: "Aus einem Netz vier Teilnetze machen – Subnetting in 30 Sekunden",
    by: "Herr TU erklärt die IT",
  },
  {
    id: "vm_1KeVkk_I",
    f: "ITS",
    t: "Warum du dir keine IP-Adressen merken musst (DNS)",
    by: "Pascal-Tech21",
  },
  /* ---- SAE ---- */
  { id: "kNHDmgy_nDk", f: "SAE", t: "Was ist ein Compiler?", by: "Herr Programmierer" },
  { id: "b07z4eU6NIw", f: "SAE", t: "Interpreter vs. Compiler", by: "Curious Monkey", lang: "en" },
  {
    id: "bXZ1AzFjYAQ",
    f: "SAE",
    t: "Java als erste Programmiersprache?",
    by: "Herr Programmierer",
  },
  { id: "fXAgg7YKmW8", f: "SAE", t: "Wo ist der Cent hin? (Kommazahlen in Java)", by: "NullPunkt" },
  { id: "sjMpXwhnVvk", f: "SAE", t: "Hello World in Bash", by: "Asmr Coding", lang: "en" },
  { id: "wNUf3jEXS6E", f: "SAE", t: "Bash-Skript Grundlagen", by: "Keep On Coding", lang: "en" },
  {
    id: "Y4PjXqympYE",
    f: "SAE",
    t: "SQL in 30 Sekunden erklärt",
    by: "Fabian Rappert | Data Science Institute",
  },
  {
    id: "L6yCFiq9C7E",
    f: "SAE",
    t: "SQL-Basics in einer Minute",
    by: "Fabian Rappert | Data Science Institute",
  },
  { id: "IEll9VyLFS4", f: "SAE", t: "SQL-JOINs in unter einer Minute", by: "Christoph Schmidl" },
  {
    id: "Ch1sFjcd3cM",
    f: "SAE",
    t: "Die CIA-Triade in 40 Sekunden",
    by: "TechTZ Academy",
    lang: "en",
  },
  {
    id: "2FQyaaHd2h4",
    f: "SAE",
    t: "CIA-Triade: Vertraulichkeit, Integrität, Verfügbarkeit",
    by: "Cybersecurity Tutorials",
    lang: "en",
  },
  /* ---- BWL ---- */
  { id: "n8PQR0BnnN4", f: "BWL", t: "SWOT-Analyse kurz erklärt", by: "WirtschaftsJustus" },
  { id: "irPVUFG1xMU", f: "BWL", t: "SWOT-Analyse am Beispiel Starbucks", by: "Economic Snack" },
  { id: "JcMqnuAnHS0", f: "BWL", t: "SWOT: Stärke oder Chance?", by: "Fachwirt Hero" },
  {
    id: "1aN4-cBZBJU",
    f: "BWL",
    t: "In drei Schritten die Zielgruppe definieren",
    by: "blau direkt",
  },
  { id: "NPc8PxrFMp0", f: "BWL", t: "Problem, Zielgruppe & Lösung", by: "captureme" },
  {
    id: "bCdgfCzO_GI",
    f: "BWL",
    t: "Mit welcher Rechtsform starten?",
    by: "Heinz Woeber, Steuerberater",
  },
  { id: "vEIBQb8nleI", f: "BWL", t: "GbR vs. OHG", by: "Wir lieben Steuern" },
  { id: "DYCGzoXkB3c", f: "BWL", t: "Gründungsvergleich: GmbH vs. GbR", by: "orgaMAX" },
  /* ---- Deutsch ---- */
  {
    id: "CNbjbwQDc2M",
    f: "Deutsch",
    t: "das oder dass? Dieser Trick klappt immer",
    by: "Herr Unterschied",
  },
  { id: "KNo8l-kEA9M", f: "Deutsch", t: "Textanalyse", by: "einfachreden" },
  { id: "WLNLB9GeWh8", f: "Deutsch", t: "Tipp für die Gedichtanalyse", by: "Linda Weise" },
  /* ---- Lernmethoden ---- */
  { id: "5niLQpABC0Y", f: "LERN", t: "Die Active-Recall-Methode", by: "Studyflix" },
  { id: "C6b4-YX6cao", f: "LERN", t: "Active Recall einfach erklärt", by: "Jani Jäckel" },
  { id: "oNHBM3CxhU8", f: "LERN", t: "Active Recall & Spaced Repetition", by: "AvisQnect" },
  {
    id: "bdtSmj7NyYI",
    f: "LERN",
    t: "So vergisst du nichts mehr: Spaced Repetition",
    by: "Henry Hildebrandt",
  },
  { id: "_6l2102lr6c", f: "LERN", t: "Spaced Repetition – essenziell!", by: "Alinova" },
  { id: "NIb5QqCg4xY", f: "LERN", t: "Feynman-Methode: Wissenslücken finden", by: "StudoraCH" },
  { id: "7ZrO0rmNsGA", f: "LERN", t: "Die Feynman-Methode erklärt", by: "MatheMind" },
  { id: "YUaVXKhFDdY", f: "LERN", t: "Die Pomodoro-Technik in 20 Sekunden", by: "Stufe Eins" },
  { id: "K8ZQPKXj85A", f: "LERN", t: "Die Pomodoro-Technik fürs Lernen", by: "Studyflix" },
  {
    id: "PCXUn_90eIQ",
    f: "LERN",
    t: "Was tun in der Pomodoro-Pause?",
    by: "The Weekly Growth",
    lang: "en",
  },
  /* ---- Berufsenglisch ---- */
  {
    id: "vof91j4fm5E",
    f: "BE",
    t: "5 business expressions for when there's a problem",
    by: "BBC Learning English",
    lang: "en",
  },
  {
    id: "yuFj8DKV-04",
    f: "BE",
    t: "Business English: Asking if a time is suitable",
    by: "English Teacher Claire",
    lang: "en",
  },
  {
    id: "4DfR3JsCONA",
    f: "BE",
    t: "Stop saying „I have seen yesterday“",
    by: "Learn British English with Deacon Rigo",
    lang: "en",
  },
  {
    id: "o8S-4kL7a7c",
    f: "BE",
    t: "AT, IN & ON richtig benutzen",
    by: "English with Siri",
    lang: "en",
  },
  /* ---- Gemeinschaftskunde ---- */
  { id: "ZhbvgNxuHtk", f: "GK", t: "Was sind Erst- und Zweitstimme?", by: "ZDFheute Nachrichten" },
  {
    id: "EYlS3eaj3xw",
    f: "GK",
    t: "Das Grundgesetz in Shorts: die Präambel",
    by: "Dr. Michael Blume",
  },
  /* ---- Wirtschaftskunde ---- */
  { id: "CQF3eKdoI0E", f: "WK", t: "Was ist eigentlich Inflation?", by: "FinanzKopf" },
  {
    id: "vnRTFWFEoRk",
    f: "WK",
    t: "Was ist brutto und netto?",
    by: "Bausparkasse Schwäbisch Hall",
  },
  { id: "6wOeOyzongQ", f: "WK", t: "Brutto und Netto? – KiKA erklärt", by: "KiKA von ARD und ZDF" },
  {
    id: "Ecj16yN_TbQ",
    f: "WK",
    t: "Brutto vs. Netto: Was ist der Unterschied?",
    by: "Finanzadler",
  },
];
