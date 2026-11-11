/* Eingebaute Grundfächer für alle Schulen: Deutsch, Mathe, Englisch je Stufen-Band.
   Weitere Themen kommen pro Bundesland/Schulart/Stufe aus der Cloud (OpenCode, siehe js/schulen.js).
   Format je Thema wie in AGENT.md (mc/cards/gaps/free). Nur anhängen – Fortschritt verweist auf Position. */
window.LERNHUB_SCHULFAECHER = {
  deutsch: {
    "1-2": {
      topics: [
        {
          id: "sf_de12_1",
          name: "Buchstaben, Silben & Reime",
          mc: [
            {
              q: "Welches Wort beginnt mit einem Selbstlaut (Vokal)?",
              c: ["Apfel", "Baum", "Haus", "Tisch"],
              a: 0,
              w: "A, E, I, O, U sind Selbstlaute – „Apfel“ beginnt mit A.",
            },
            {
              q: "Wie viele Silben hat „Ba-na-ne“?",
              c: ["3", "2", "4", "1"],
              a: 0,
              w: "Klatsch mit: Ba – na – ne = 3 Silben.",
            },
            {
              q: "Welcher Buchstabe ist ein Selbstlaut?",
              c: ["E", "B", "K", "M"],
              a: 0,
              w: "E gehört zu den Selbstlauten A, E, I, O, U.",
            },
            {
              q: "Welches Wort reimt sich auf „Haus“?",
              c: ["Maus", "Hund", "Hose", "Hand"],
              a: 0,
              w: "Haus – Maus: Das Ende klingt gleich.",
            },
            {
              q: "Was steht am Ende einer Frage?",
              c: ["Fragezeichen", "Punkt", "Ausrufezeichen", "Komma"],
              a: 0,
              w: "Fragen enden mit einem Fragezeichen: Wie heißt du?",
            },
          ],
          cards: [
            { f: "Selbstlaute (Vokale)", b: "A, E, I, O, U – sie klingen von allein." },
            { f: "Mitlaute (Konsonanten)", b: "Alle anderen Buchstaben, z. B. B, M, T, S." },
            {
              f: "Silbe",
              b: "Ein Sprechteil eines Wortes. Klatschen hilft: Ta-fel, Scho-ko-la-de.",
            },
          ],
          gaps: [
            { t: "Die Selbstlaute heißen A, E, I, O und ___.", a: ["U"] },
            { t: "Das erste Wort im Satz schreibt man ___.", a: ["groß", "gross"] },
          ],
          free: [
            {
              q: "Wie viele Silben hat „Scho-ko-la-de“?",
              a: ["4", "vier"],
              w: "Scho – ko – la – de = 4 Silben.",
            },
            {
              q: "Wie heißt das Satzzeichen am Ende einer Frage?",
              a: ["Fragezeichen"],
              w: "Das Fragezeichen: ?",
            },
          ],
        },
        {
          id: "sf_de12_2",
          name: "Nomen, Artikel & Verben",
          mc: [
            {
              q: "Welches Wort ist ein Nomen (Namenwort)?",
              c: ["Hund", "laufen", "schön", "und"],
              a: 0,
              w: "Nomen sind Namen für Menschen, Tiere, Dinge – man schreibt sie groß.",
            },
            {
              q: "Wie schreibt man Nomen?",
              c: ["groß", "klein", "immer in Großbuchstaben", "mit Punkt"],
              a: 0,
              w: "Nomen beginnen mit einem großen Buchstaben: der Ball.",
            },
            {
              q: "Welcher Artikel passt zu „Sonne“?",
              c: ["die", "der", "das", "den"],
              a: 0,
              w: "Es heißt: die Sonne.",
            },
            {
              q: "Was ist die Mehrzahl von „Kind“?",
              c: ["Kinder", "Kinds", "Kinden", "Kindes"],
              a: 0,
              w: "ein Kind – viele Kinder.",
            },
            {
              q: "Welches Wort ist ein Verb (Tunwort)?",
              c: ["springen", "Tisch", "rot", "die"],
              a: 0,
              w: "Verben sagen, was man tut: springen, lesen, malen.",
            },
          ],
          cards: [
            {
              f: "Nomen",
              b: "Namenwort für Menschen, Tiere, Pflanzen, Dinge. Groß geschrieben: Hund, Tisch.",
            },
            { f: "Artikel", b: "Begleiter des Nomens: der, die, das (oder ein, eine)." },
            { f: "Einzahl und Mehrzahl", b: "ein Ball – viele Bälle, eine Maus – viele Mäuse." },
          ],
          gaps: [
            { t: "___ Katze schläft auf dem Sofa.", a: ["Die"] },
            { t: "Ein Hund, zwei ___.", a: ["Hunde"] },
          ],
          free: [
            { q: "Welcher Artikel gehört zu „Auto“?", a: ["das"], w: "das Auto" },
            { q: "Wie heißt die Mehrzahl von „Maus“?", a: ["Mäuse"], w: "eine Maus – viele Mäuse" },
          ],
        },
      ],
    },
    "3-4": {
      topics: [
        {
          id: "sf_de34_1",
          name: "Wortarten",
          mc: [
            {
              q: "Welches Wort ist ein Adjektiv (Wiewort)?",
              c: ["schnell", "Haus", "rennen", "unter"],
              a: 0,
              w: "Adjektive sagen, wie etwas ist: schnell, groß, rot.",
            },
            {
              q: "Welches Wort ist ein Verb?",
              c: ["schreiben", "Schrift", "schriftlich", "Schreiber"],
              a: 0,
              w: "Verben (Tunwörter) kann man beugen: ich schreibe, du schreibst.",
            },
            {
              q: "Welches Wort ist ein Pronomen (Fürwort)?",
              c: ["sie", "Sonne", "sonnig", "sonnen"],
              a: 0,
              w: "Pronomen stehen für ein Nomen: er, sie, es, wir.",
            },
            {
              q: "„Der kleine Hund bellt laut.“ Welches Wort ist das Verb?",
              c: ["bellt", "Hund", "kleine", "laut"],
              a: 0,
              w: "„bellt“ sagt, was der Hund tut.",
            },
            {
              q: "Wie steigert man „gut“?",
              c: [
                "gut – besser – am besten",
                "gut – guter – am gutesten",
                "gut – mehr gut – am meisten gut",
                "gut – gütiger – am gütigsten",
              ],
              a: 0,
              w: "„gut“ wird unregelmäßig gesteigert.",
            },
          ],
          cards: [
            {
              f: "Adjektiv",
              b: "Wiewort: beschreibt, wie etwas ist. Kann gesteigert werden: klein – kleiner – am kleinsten.",
            },
            { f: "Verb", b: "Tunwort: wird gebeugt (konjugiert): ich gehe, du gehst, er geht." },
            {
              f: "Pronomen",
              b: "Fürwort: ersetzt ein Nomen – ich, du, er, sie, es, wir, ihr, sie.",
            },
          ],
          gaps: [
            { t: "groß – größer – am ___", a: ["größten"] },
            { t: "Ich ___ jeden Morgen zur Schule. (laufen)", a: ["laufe"] },
          ],
          free: [
            {
              q: "Wie heißt die Grundform (Infinitiv) von „du liest“?",
              a: ["lesen"],
              w: "Die Grundform endet meist auf -en: lesen.",
            },
            {
              q: "Wie heißt die erste Steigerungsform von „viel“?",
              a: ["mehr"],
              w: "viel – mehr – am meisten",
            },
          ],
        },
        {
          id: "sf_de34_2",
          name: "Zeitformen & Satzglieder",
          mc: [
            {
              q: "„Ich spielte Fußball.“ – Welche Zeitform ist das?",
              c: ["Präteritum", "Präsens", "Perfekt", "Futur"],
              a: 0,
              w: "Präteritum = einfache Vergangenheit, typisch für Geschichten.",
            },
            {
              q: "„Ich habe gespielt.“ – Welche Zeitform ist das?",
              c: ["Perfekt", "Präteritum", "Präsens", "Futur"],
              a: 0,
              w: "Perfekt = haben/sein + Partizip (gespielt).",
            },
            {
              q: "Was ist das Subjekt in „Die Katze fängt eine Maus.“?",
              c: ["Die Katze", "fängt", "eine Maus", "Maus"],
              a: 0,
              w: "Wer oder was fängt? – Die Katze.",
            },
            {
              q: "Mit welcher Frage findest du das Subjekt?",
              c: ["Wer oder was?", "Wen oder was?", "Wem?", "Wo?"],
              a: 0,
              w: "Subjekt: Wer oder was tut etwas?",
            },
            {
              q: "Was ist das Prädikat in „Tom isst einen Apfel.“?",
              c: ["isst", "Tom", "einen Apfel", "Apfel"],
              a: 0,
              w: "Das Prädikat ist das Verb des Satzes.",
            },
          ],
          cards: [
            { f: "Präsens", b: "Gegenwart: ich gehe." },
            { f: "Präteritum", b: "Einfache Vergangenheit: ich ging (in Geschichten)." },
            { f: "Perfekt", b: "Vergangenheit beim Erzählen: ich bin gegangen, ich habe gelesen." },
          ],
          gaps: [
            { t: "Präteritum von „ich gehe“: ich ___", a: ["ging"] },
            { t: "Perfekt: Ich ___ ein Buch gelesen.", a: ["habe"] },
          ],
          free: [
            {
              q: "Wie heißt „wir schwimmen“ im Präteritum?",
              a: ["wir schwammen", "schwammen"],
              w: "schwimmen – schwamm – geschwommen",
            },
            {
              q: "Nach welchem Satzglied fragt man mit „Wen oder was?“?",
              a: ["Akkusativobjekt", "Akkusativ"],
              w: "Wen oder was? → Akkusativobjekt",
            },
          ],
        },
      ],
    },
    "5-6": {
      topics: [
        {
          id: "sf_de56_1",
          name: "Die vier Fälle",
          mc: [
            {
              q: "Nach welchem Fall fragt „Wessen?“",
              c: ["Genitiv", "Dativ", "Akkusativ", "Nominativ"],
              a: 0,
              w: "Wessen? → Genitiv: das Fahrrad des Lehrers.",
            },
            {
              q: "„Ich helfe dem Mann.“ – In welchem Fall steht „dem Mann“?",
              c: ["Dativ", "Akkusativ", "Genitiv", "Nominativ"],
              a: 0,
              w: "Wem helfe ich? → Dativ.",
            },
            {
              q: "„Ich sehe den Baum.“ – In welchem Fall steht „den Baum“?",
              c: ["Akkusativ", "Dativ", "Genitiv", "Nominativ"],
              a: 0,
              w: "Wen oder was sehe ich? → Akkusativ.",
            },
            {
              q: "„Das Fahrrad des Lehrers“ – welcher Fall ist „des Lehrers“?",
              c: ["Genitiv", "Dativ", "Akkusativ", "Nominativ"],
              a: 0,
              w: "Wessen Fahrrad? → Genitiv.",
            },
            {
              q: "Welche Frage gehört zum Nominativ?",
              c: ["Wer oder was?", "Wem?", "Wessen?", "Wen oder was?"],
              a: 0,
              w: "Nominativ = Wer-Fall, darin steht das Subjekt.",
            },
          ],
          cards: [
            { f: "Nominativ", b: "Wer oder was? – der Hund" },
            { f: "Genitiv", b: "Wessen? – des Hundes" },
            { f: "Dativ", b: "Wem? – dem Hund" },
            { f: "Akkusativ", b: "Wen oder was? – den Hund" },
          ],
          gaps: [
            { t: "Ich gebe ___ Frau das Buch. (Dativ von „die Frau“)", a: ["der"] },
            { t: "Wir besuchen ___ Onkel. (Akkusativ von „der Onkel“)", a: ["den"] },
          ],
          free: [
            {
              q: "In welchem Fall steht das Subjekt?",
              a: ["Nominativ"],
              w: "Subjekt = Wer oder was? = Nominativ.",
            },
            {
              q: "Welcher Fall folgt auf „mit“?",
              a: ["Dativ"],
              w: "mit dem Ball, mit der Freundin → Dativ.",
            },
          ],
        },
        {
          id: "sf_de56_2",
          name: "Rechtschreibung: das/dass, s/ss/ß",
          mc: [
            {
              q: "Ich hoffe, ___ du kommst.",
              c: ["dass", "das", "daß", "des"],
              a: 0,
              w: "„dass“ leitet einen Nebensatz ein; man kann nicht „dieses/welches“ einsetzen.",
            },
            {
              q: "___ Buch, ___ ich lese, ist spannend.",
              c: ["Das – das", "Dass – das", "Das – dass", "Dass – dass"],
              a: 0,
              w: "Artikel und Relativpronomen: beides „das“ (ersetzbar durch „welches“).",
            },
            {
              q: "Welche Schreibung ist richtig?",
              c: ["Straße", "Strasse", "Strase", "Strahse"],
              a: 0,
              w: "Langer Vokal → ß: Straße.",
            },
            {
              q: "Nach einem langen Vokal steht für den scharfen s-Laut …",
              c: ["ß", "ss", "sss", "z"],
              a: 0,
              w: "Fuß, groß, Spaß – nach langem Vokal ß.",
            },
            {
              q: "Welches Wort ist richtig geschrieben?",
              c: ["Fluss", "Fluß", "Flus", "Fluhs"],
              a: 0,
              w: "Kurzer Vokal → ss: Fluss, Kuss, Schluss.",
            },
          ],
          cards: [
            {
              f: "das",
              b: "Artikel oder Relativpronomen – ersetzbar durch „dieses“ oder „welches“.",
            },
            { f: "dass", b: "Konjunktion – leitet einen Nebensatz ein: Ich weiß, dass …" },
            {
              f: "ss oder ß?",
              b: "Nach kurzem Vokal ss (Fluss), nach langem Vokal oder ei/au ß (Fuß, heiß).",
            },
          ],
          gaps: [
            { t: "Er weiß, ___ er recht hat.", a: ["dass"] },
            { t: "Das ist das Haus, ___ wir gekauft haben.", a: ["das"] },
          ],
          free: [
            {
              q: "Schreibt man nach kurzem Vokal „ss“ oder „ß“?",
              a: ["ss"],
              w: "kurz: Kuss, Fluss · lang: Fuß, Gruß",
            },
            {
              q: "Wenn man „welches“ einsetzen kann, schreibt man …?",
              a: ["das"],
              w: "Ersatzprobe: das ↔ welches/dieses.",
            },
          ],
        },
      ],
    },
    "7-8": {
      topics: [
        {
          id: "sf_de78_1",
          name: "Satzbau & Kommasetzung",
          mc: [
            {
              q: "Welcher Satz ist richtig?",
              c: [
                "Ich weiß, dass du kommst.",
                "Ich weiß dass du kommst.",
                "Ich weiß, das du kommst.",
                "Ich, weiß dass du kommst.",
              ],
              a: 0,
              w: "Vor „dass“ steht ein Komma, weil ein Nebensatz beginnt.",
            },
            {
              q: "Welche Konjunktion leitet einen Nebensatz ein?",
              c: ["weil", "und", "oder", "aber"],
              a: 0,
              w: "weil, dass, ob, wenn, als → Nebensatz (Verb am Ende).",
            },
            {
              q: "Wo steht im Nebensatz das gebeugte Verb?",
              c: ["am Ende", "an 2. Stelle", "am Anfang", "gar nicht"],
              a: 0,
              w: "…, weil ich krank bin.",
            },
            {
              q: "Welcher Satz ist richtig?",
              c: [
                "Ich kaufe Äpfel, Birnen und Bananen.",
                "Ich kaufe Äpfel, Birnen, und Bananen.",
                "Ich kaufe, Äpfel Birnen und Bananen.",
                "Ich kaufe Äpfel Birnen, und Bananen.",
              ],
              a: 0,
              w: "Bei Aufzählungen kein Komma vor „und“.",
            },
            {
              q: "Der Junge, ___ dort steht, ist mein Bruder.",
              c: ["der", "den", "dem", "dass"],
              a: 0,
              w: "Relativpronomen im Nominativ: der Junge, der …",
            },
          ],
          cards: [
            { f: "Hauptsatz", b: "Kann allein stehen, gebeugtes Verb an 2. Stelle." },
            {
              f: "Nebensatz",
              b: "Kann nicht allein stehen, Verb am Ende, wird mit Komma abgetrennt (weil, dass, wenn, ob).",
            },
            {
              f: "Relativsatz",
              b: "Beschreibt ein Nomen näher, beginnt mit der/die/das oder welche(r).",
            },
          ],
          gaps: [
            { t: "Die Frau, ___ ich geholfen habe, bedankte sich.", a: ["der"] },
            { t: "Ich komme nicht, ___ ich krank bin. (Grund)", a: ["weil", "da"] },
          ],
          free: [
            {
              q: "Wo steht im Nebensatz das gebeugte Verb?",
              a: ["am Ende", "Ende"],
              w: "…, dass er morgen kommt.",
            },
            {
              q: "Wie heißt ein Nebensatz, der ein Nomen mit „der/die/das“ näher beschreibt?",
              a: ["Relativsatz"],
              w: "Das Buch, das ich lese, …",
            },
          ],
        },
        {
          id: "sf_de78_2",
          name: "Aktiv/Passiv, indirekte Rede & Inhaltsangabe",
          mc: [
            {
              q: "Passiv von „Der Koch kocht die Suppe.“?",
              c: [
                "Die Suppe wird vom Koch gekocht.",
                "Die Suppe kocht der Koch.",
                "Die Suppe hat gekocht.",
                "Der Koch wird gekocht.",
              ],
              a: 0,
              w: "Passiv: werden + Partizip II, der Täter mit „von“.",
            },
            {
              q: "Womit bildet man das Vorgangspassiv?",
              c: [
                "werden + Partizip II",
                "sein + Infinitiv",
                "haben + Partizip II",
                "werden + Infinitiv",
              ],
              a: 0,
              w: "Das Fenster wird geöffnet.",
            },
            {
              q: "Welchen Modus nutzt man für die indirekte Rede?",
              c: ["Konjunktiv I", "Imperativ", "Futur", "Plusquamperfekt"],
              a: 0,
              w: "Er sagt, er sei krank.",
            },
            {
              q: "Konjunktiv I von „er hat“?",
              c: ["er habe", "er hätte", "er hatte", "er hat gehabt"],
              a: 0,
              w: "haben → er habe (Konjunktiv I).",
            },
            {
              q: "Was gehört in eine Inhaltsangabe?",
              c: [
                "Präsens, sachlich, keine wörtliche Rede",
                "Präteritum und Spannung",
                "Ich-Form und Gefühle",
                "Viele Ausrufe und Zitate",
              ],
              a: 0,
              w: "Inhaltsangabe: Präsens, eigene Worte, sachlich.",
            },
          ],
          cards: [
            { f: "Aktiv", b: "Der Handelnde (Täter) steht im Mittelpunkt: Tim repariert das Rad." },
            { f: "Passiv", b: "Die Handlung steht im Mittelpunkt: Das Rad wird repariert." },
            {
              f: "Inhaltsangabe",
              b: "Präsens, sachlich, eigene Worte, keine wörtliche Rede, wichtige W-Fragen in der Einleitung.",
            },
            { f: "Konjunktiv I", b: "Für indirekte Rede: Sie sagt, sie habe keine Zeit." },
          ],
          gaps: [
            { t: "Das Haus ___ 1990 gebaut. (Passiv, Präteritum)", a: ["wurde"] },
            { t: "Sie sagt, sie ___ keine Zeit. (Konjunktiv I von „haben“)", a: ["habe"] },
          ],
          free: [
            {
              q: "In welcher Zeitform schreibt man eine Inhaltsangabe?",
              a: ["Präsens"],
              w: "Inhaltsangaben stehen im Präsens.",
            },
            {
              q: "Wie heißt der Konjunktiv I von „er ist“?",
              a: ["er sei", "sei"],
              w: "Er sagt, er sei müde.",
            },
          ],
        },
      ],
    },
    "9-10": {
      topics: [
        {
          id: "sf_de910_1",
          name: "Erörterung & Argumentation",
          mc: [
            {
              q: "Wie ist ein vollständiges Argument aufgebaut?",
              c: [
                "These – Begründung – Beispiel",
                "Beispiel – These – Ende",
                "Einleitung – Schluss",
                "Frage – Antwort – Frage",
              ],
              a: 0,
              w: "Behauptung, Begründung und ein Beleg/Beispiel.",
            },
            {
              q: "Was macht eine dialektische Erörterung?",
              c: [
                "Pro und Contra abwägen",
                "Nur eine Seite betrachten",
                "Nur Beispiele sammeln",
                "Eine Geschichte erzählen",
              ],
              a: 0,
              w: "Dialektisch = beide Seiten, am Ende ein Fazit.",
            },
            {
              q: "Was gehört in den Schluss einer Erörterung?",
              c: [
                "Eigene begründete Meinung/Fazit",
                "Ganz neue Argumente",
                "Ein Zitat ohne Bezug",
                "Eine Inhaltsangabe",
              ],
              a: 0,
              w: "Im Schluss: abwägen, Stellung nehmen, evtl. Ausblick.",
            },
            {
              q: "Wie ordnet man Argumente meist?",
              c: ["Das stärkste zuletzt", "Zufällig", "Das schwächste zuletzt", "Alphabetisch"],
              a: 0,
              w: "Steigernd: Das überzeugendste Argument bleibt im Gedächtnis.",
            },
            {
              q: "Ein Gegenargument „entkräften“ heißt …",
              c: [
                "es widerlegen oder relativieren",
                "es ignorieren",
                "es wiederholen",
                "es nur zitieren",
              ],
              a: 0,
              w: "Man zeigt, warum es weniger stark ist.",
            },
          ],
          cards: [
            { f: "These", b: "Behauptung, die begründet werden muss." },
            { f: "Argument", b: "Begründung, gestützt durch Beleg oder Beispiel." },
            {
              f: "Lineare Erörterung",
              b: "Betrachtet nur eine Seite (z. B. nur Pro) und steigert die Argumente.",
            },
          ],
          gaps: [
            { t: "Ein Argument besteht aus These, Begründung und ___.", a: ["Beispiel", "Beleg"] },
            {
              t: "Die ___ Erörterung betrachtet Pro und Contra.",
              a: ["dialektische", "dialektisch"],
            },
          ],
          free: [
            {
              q: "Wie nennt man eine Behauptung, die begründet werden muss?",
              a: ["These"],
              w: "These → Begründung → Beispiel",
            },
            {
              q: "Wie heißt die Erörterung, die nur eine Seite beleuchtet?",
              a: ["lineare Erörterung", "linear", "steigernde Erörterung"],
              w: "Linear (steigernd) – im Gegensatz zur dialektischen (Pro/Contra).",
            },
          ],
        },
        {
          id: "sf_de910_2",
          name: "Stilmittel",
          mc: [
            {
              q: "„Er ist stark wie ein Bär.“",
              c: ["Vergleich", "Metapher", "Personifikation", "Alliteration"],
              a: 0,
              w: "Vergleich mit „wie“.",
            },
            {
              q: "„Das Leben ist eine Reise.“",
              c: ["Metapher", "Vergleich", "Anapher", "Ironie"],
              a: 0,
              w: "Bildhafte Übertragung ohne „wie“.",
            },
            {
              q: "„Die Sonne lacht.“",
              c: ["Personifikation", "Hyperbel", "Klimax", "Ellipse"],
              a: 0,
              w: "Ein Ding bekommt menschliche Eigenschaften.",
            },
            {
              q: "„Milch macht müde Männer munter.“",
              c: ["Alliteration", "Anapher", "Hyperbel", "Ellipse"],
              a: 0,
              w: "Gleicher Anfangslaut bei mehreren Wörtern.",
            },
            {
              q: "„Ich habe dir das schon tausendmal gesagt.“",
              c: ["Hyperbel (Übertreibung)", "Ironie", "Metapher", "Antithese"],
              a: 0,
              w: "Starke Übertreibung = Hyperbel.",
            },
          ],
          cards: [
            { f: "Anapher", b: "Wiederholung gleicher Wörter am Satz- oder Versanfang." },
            {
              f: "Rhetorische Frage",
              b: "Frage, auf die keine Antwort erwartet wird – soll überzeugen.",
            },
            {
              f: "Ironie",
              b: "Man meint das Gegenteil des Gesagten: „Na toll, schon wieder Regen.“",
            },
          ],
          gaps: [
            { t: "Ein Vergleich nutzt meist das Wort „___“.", a: ["wie", "als"] },
            { t: "Werden Wörter am Satzanfang wiederholt, heißt das ___.", a: ["Anapher"] },
          ],
          free: [
            {
              q: "Wie heißt die Übertreibung als Stilmittel?",
              a: ["Hyperbel"],
              w: "z. B. „Ich bin todmüde.“",
            },
            {
              q: "Wie heißt die Vermenschlichung von Dingen?",
              a: ["Personifikation", "Personifizierung"],
              w: "z. B. „Der Wind flüstert.“",
            },
          ],
        },
      ],
    },
    "11-13": {
      topics: [
        {
          id: "sf_de1113_1",
          name: "Literaturepochen",
          mc: [
            {
              q: "Welche Epoche stellt im 18. Jahrhundert die Vernunft in den Mittelpunkt?",
              c: ["Aufklärung", "Romantik", "Barock", "Expressionismus"],
              a: 0,
              w: "Aufklärung: „Sapere aude!“ – Habe Mut, dich deines eigenen Verstandes zu bedienen (Kant).",
            },
            {
              q: "Sehnsucht, Natur, Nacht und die „blaue Blume“ prägen die …",
              c: ["Romantik", "Aufklärung", "Naturalismus", "Klassik"],
              a: 0,
              w: "Die blaue Blume (Novalis) ist das Symbol der Romantik.",
            },
            {
              q: "Ideal von Humanität, Harmonie und Antike – welche Epoche?",
              c: ["Weimarer Klassik", "Naturalismus", "Barock", "Moderne"],
              a: 0,
              w: "Goethe und Schiller in Weimar.",
            },
            {
              q: "In welchem Jahr erschien Kafkas „Die Verwandlung“?",
              c: ["1915", "1775", "1848", "1960"],
              a: 0,
              w: "1915 – Literatur der Moderne/des Expressionismus.",
            },
            {
              q: "Gefühl, Genie und Rebellion gegen Regeln – welche Strömung?",
              c: ["Sturm und Drang", "Biedermeier", "Realismus", "Aufklärung"],
              a: 0,
              w: "Sturm und Drang (ca. 1767–1785), z. B. Goethes „Werther“.",
            },
          ],
          cards: [
            {
              f: "Barock (ca. 1600–1720)",
              b: "Vanitas (Vergänglichkeit), Memento mori, Carpe diem – geprägt vom Dreißigjährigen Krieg.",
            },
            {
              f: "Sturm und Drang (ca. 1767–1785)",
              b: "Gefühl statt Vernunft, Genie-Gedanke, Rebellion – junger Goethe und Schiller.",
            },
            {
              f: "Expressionismus (ca. 1910–1925)",
              b: "Großstadt, Krieg, Ich-Zerfall, starke Bilder – z. B. Georg Heym, Gottfried Benn.",
            },
          ],
          gaps: [
            { t: "Die blaue Blume ist ein Symbol der ___.", a: ["Romantik"] },
            { t: "„Faust“ wurde von Johann Wolfgang von ___ geschrieben.", a: ["Goethe"] },
          ],
          free: [
            {
              q: "Wer schrieb „Die Räuber“?",
              a: ["Schiller", "Friedrich Schiller"],
              w: "Friedrich Schiller, 1781 – Sturm und Drang.",
            },
            {
              q: "Welche Epoche folgte auf den Sturm und Drang?",
              a: ["Klassik", "Weimarer Klassik"],
              w: "Weimarer Klassik (ca. 1786–1805).",
            },
          ],
        },
        {
          id: "sf_de1113_2",
          name: "Sachtextanalyse & Rhetorik",
          mc: [
            {
              q: "Was gehört in die Einleitung einer Sachtextanalyse?",
              c: [
                "Autor, Titel, Textsorte, Erscheinungsjahr, Thema",
                "Die eigene Meinung",
                "Alle Zitate",
                "Eine Zusammenfassung des Schlusses",
              ],
              a: 0,
              w: "Basissatz mit den wichtigsten Angaben.",
            },
            {
              q: "Was will ein appellativer Text?",
              c: [
                "Den Leser zu etwas bewegen",
                "Nur informieren",
                "Nur Gefühle ausdrücken",
                "Nur unterhalten",
              ],
              a: 0,
              w: "Appell = Aufforderung, Überzeugung.",
            },
            {
              q: "Was ist eine Parataxe?",
              c: [
                "Aneinanderreihung von Hauptsätzen",
                "Verschachtelte Nebensätze",
                "Eine Wortneuschöpfung",
                "Ein Gegensatz",
              ],
              a: 0,
              w: "Kurze, gereihte Hauptsätze.",
            },
            {
              q: "Was ist eine Hypotaxe?",
              c: [
                "Satzgefüge mit Nebensätzen",
                "Eine Reihe von Hauptsätzen",
                "Eine Übertreibung",
                "Eine Frage ohne Antwort",
              ],
              a: 0,
              w: "Hauptsatz + untergeordnete Nebensätze.",
            },
            {
              q: "Was ist eine Antithese?",
              c: [
                "Gegenüberstellung von Gegensätzen",
                "Wiederholung am Satzanfang",
                "Übertreibung",
                "Frage ohne Antwort",
              ],
              a: 0,
              w: "z. B. „Himmel und Hölle“.",
            },
          ],
          cards: [
            { f: "Kommentar", b: "Meinungsbetonter, wertender Zeitungstext eines Journalisten." },
            { f: "Bericht", b: "Sachlich und informierend, beantwortet die W-Fragen." },
            { f: "Trikolon", b: "Dreigliedrige Aufzählung: „Ich kam, sah und siegte.“" },
          ],
          gaps: [
            { t: "Eine Folge einfacher Hauptsätze nennt man ___.", a: ["Parataxe"] },
            { t: "Ein ___ ist ein meinungsbetonter Zeitungstext.", a: ["Kommentar"] },
          ],
          free: [
            {
              q: "Wie heißt die Gegenüberstellung von Gegensätzen?",
              a: ["Antithese"],
              w: "z. B. „Krieg und Frieden“.",
            },
            {
              q: "Wie heißt ein Satzgefüge mit untergeordneten Nebensätzen?",
              a: ["Hypotaxe"],
              w: "Gegenteil: Parataxe.",
            },
          ],
        },
      ],
    },
  },

  mathe: {
    "1-2": {
      topics: [
        {
          id: "sf_ma12_1",
          name: "Plus & Minus bis 100",
          mc: [
            {
              q: "7 + 8 = ?",
              c: ["15", "14", "16", "13"],
              a: 0,
              w: "7 + 3 = 10, dann noch 5 → 15.",
            },
            {
              q: "45 + 30 = ?",
              c: ["75", "85", "65", "48"],
              a: 0,
              w: "4 Zehner + 3 Zehner = 7 Zehner, dazu 5 Einer.",
            },
            { q: "62 − 7 = ?", c: ["55", "56", "65", "54"], a: 0, w: "62 − 2 = 60, 60 − 5 = 55." },
            {
              q: "9 + __ = 20. Welche Zahl fehlt?",
              c: ["11", "10", "12", "29"],
              a: 0,
              w: "20 − 9 = 11.",
            },
            {
              q: "100 − 36 = ?",
              c: ["64", "74", "66", "136"],
              a: 0,
              w: "100 − 30 = 70, 70 − 6 = 64.",
            },
          ],
          cards: [
            { f: "Plus (Addition)", b: "Zusammenzählen: 3 + 4 = 7." },
            { f: "Minus (Subtraktion)", b: "Abziehen: 9 − 4 = 5." },
            { f: "Zehnerübergang", b: "Erst bis zur 10, dann weiter: 8 + 5 = 8 + 2 + 3 = 13." },
          ],
          gaps: [
            { t: "38 + 4 = ___", a: ["42"] },
            { t: "50 − 18 = ___", a: ["32"] },
          ],
          free: [
            { q: "Was ist das Doppelte von 35?", a: ["70"], w: "35 + 35 = 70" },
            {
              q: "Wie viel fehlt von 47 bis 100?",
              a: ["53"],
              w: "47 + 3 = 50, 50 + 50 = 100 → 53.",
            },
          ],
        },
        {
          id: "sf_ma12_2",
          name: "Einmaleins, Uhr & Geld",
          mc: [
            { q: "3 · 4 = ?", c: ["12", "7", "14", "9"], a: 0, w: "4 + 4 + 4 = 12." },
            {
              q: "6 · 5 = ?",
              c: ["30", "35", "25", "11"],
              a: 0,
              w: "5er-Reihe: 5, 10, 15, 20, 25, 30.",
            },
            { q: "24 : 4 = ?", c: ["6", "8", "5", "20"], a: 0, w: "4 · 6 = 24." },
            {
              q: "Wie viele Minuten hat eine Stunde?",
              c: ["60", "100", "24", "30"],
              a: 0,
              w: "1 Stunde = 60 Minuten.",
            },
            {
              q: "1 Euro sind wie viel Cent?",
              c: ["100", "10", "50", "1000"],
              a: 0,
              w: "1 € = 100 ct.",
            },
          ],
          cards: [
            { f: "Malnehmen", b: "4 · 3 = 3 + 3 + 3 + 3 = 12." },
            { f: "Teilen", b: "12 : 3 = 4 – 12 in 3 gleich große Teile." },
            { f: "Uhr", b: "Der große Zeiger zeigt die Minuten, der kleine die Stunden." },
          ],
          gaps: [
            { t: "7 · 8 = ___", a: ["56"] },
            { t: "Eine halbe Stunde hat ___ Minuten.", a: ["30"] },
          ],
          free: [
            { q: "9 · 9 = ?", a: ["81"], w: "Quadratzahl: 9 · 9 = 81." },
            { q: "Wie viel Cent sind 2 Euro?", a: ["200"], w: "2 · 100 ct = 200 ct." },
          ],
        },
      ],
    },
    "3-4": {
      topics: [
        {
          id: "sf_ma34_1",
          name: "Rechnen mit großen Zahlen",
          mc: [
            {
              q: "345 + 278 = ?",
              c: ["623", "613", "523", "633"],
              a: 0,
              w: "Schriftlich: 5+8=13 (3, Übertrag 1), 4+7+1=12 (2, Ü 1), 3+2+1=6.",
            },
            { q: "1000 − 457 = ?", c: ["543", "553", "643", "457"], a: 0, w: "457 + 543 = 1000." },
            { q: "25 · 4 = ?", c: ["100", "90", "125", "29"], a: 0, w: "4 · 25 = 100." },
            { q: "840 : 7 = ?", c: ["120", "110", "140", "12"], a: 0, w: "7 · 120 = 840." },
            {
              q: "Welche Zahl ist die größte?",
              c: ["100 100", "100 010", "99 999", "10 110"],
              a: 0,
              w: "Stellenwerte von links vergleichen.",
            },
          ],
          cards: [
            { f: "Stellenwerttafel", b: "M | HT | ZT | T | H | Z | E (Million … Einer)." },
            {
              f: "Schriftlich addieren",
              b: "Stellengerecht untereinander, von rechts rechnen, Übertrag notieren.",
            },
            { f: "Überschlag", b: "Erst runden, dann rechnen: 498 + 302 ≈ 500 + 300 = 800." },
          ],
          gaps: [
            { t: "4 · 125 = ___", a: ["500"] },
            { t: "3 476 auf Hunderter gerundet: ___", a: ["3500"] },
          ],
          free: [
            { q: "Wie viele Nullen hat eine Million?", a: ["6", "sechs"], w: "1 000 000" },
            { q: "636 : 6 = ?", a: ["106"], w: "600 : 6 = 100, 36 : 6 = 6." },
          ],
        },
        {
          id: "sf_ma34_2",
          name: "Geometrie & Größen",
          mc: [
            {
              q: "Wie viele Ecken hat ein Würfel?",
              c: ["8", "6", "12", "4"],
              a: 0,
              w: "8 Ecken, 12 Kanten, 6 Flächen.",
            },
            {
              q: "Wie viele Flächen hat ein Würfel?",
              c: ["6", "8", "4", "12"],
              a: 0,
              w: "6 gleich große Quadrate.",
            },
            {
              q: "1 km sind wie viele Meter?",
              c: ["1000", "100", "10", "10 000"],
              a: 0,
              w: "kilo = tausend.",
            },
            {
              q: "1 kg sind wie viele Gramm?",
              c: ["1000", "100", "10", "500"],
              a: 0,
              w: "1 kg = 1000 g.",
            },
            {
              q: "Umfang eines Rechtecks mit 5 cm und 3 cm?",
              c: ["16 cm", "15 cm", "8 cm", "30 cm"],
              a: 0,
              w: "2 · 5 + 2 · 3 = 16 cm.",
            },
          ],
          cards: [
            { f: "Umfang", b: "Einmal außen herum: Rechteck u = 2 · a + 2 · b." },
            { f: "Fläche Rechteck", b: "A = a · b, Einheit z. B. cm²." },
            { f: "Rechter Winkel", b: "90° – wie die Ecke eines Blattes Papier." },
          ],
          gaps: [
            { t: "1 m = ___ cm", a: ["100"] },
            { t: "Ein Quadrat hat ___ gleich lange Seiten.", a: ["4", "vier"] },
          ],
          free: [
            {
              q: "Fläche eines Rechtecks mit 6 cm und 4 cm (in cm²)?",
              a: ["24"],
              w: "6 · 4 = 24 cm²",
            },
            { q: "Wie viele Minuten sind 2 Stunden?", a: ["120"], w: "2 · 60 = 120" },
          ],
        },
      ],
    },
    "5-6": {
      topics: [
        {
          id: "sf_ma56_1",
          name: "Brüche & Dezimalzahlen",
          mc: [
            {
              q: "1/2 + 1/4 = ?",
              c: ["3/4", "2/6", "1/6", "2/4"],
              a: 0,
              w: "1/2 = 2/4, 2/4 + 1/4 = 3/4.",
            },
            {
              q: "3/4 als Dezimalzahl?",
              c: ["0,75", "0,34", "0,43", "7,5"],
              a: 0,
              w: "3 : 4 = 0,75.",
            },
            {
              q: "Kürze 6/8 vollständig.",
              c: ["3/4", "2/3", "6/4", "1/2"],
              a: 0,
              w: "Zähler und Nenner durch 2.",
            },
            { q: "2/3 von 12 = ?", c: ["8", "6", "4", "9"], a: 0, w: "12 : 3 = 4, 4 · 2 = 8." },
            {
              q: "Welcher Bruch ist am größten?",
              c: ["3/5", "1/2", "2/5", "1/3"],
              a: 0,
              w: "3/5 = 0,6 ist größer als 0,5; 0,4 und 0,33…",
            },
          ],
          cards: [
            {
              f: "Zähler und Nenner",
              b: "Unten der Nenner: in wie viele Teile geteilt. Oben der Zähler: wie viele Teile genommen.",
            },
            { f: "Kürzen", b: "Zähler und Nenner durch dieselbe Zahl teilen: 4/8 = 1/2." },
            { f: "Erweitern", b: "Zähler und Nenner mit derselben Zahl malnehmen: 1/3 = 2/6." },
          ],
          gaps: [
            { t: "1/2 = ___/10", a: ["5"] },
            { t: "0,5 = 1/___", a: ["2"] },
          ],
          free: [
            { q: "1/4 + 2/4 = ?", a: ["3/4", "0,75"], w: "Gleicher Nenner: Zähler addieren." },
            { q: "Schreibe 1/10 als Dezimalzahl.", a: ["0,1"], w: "1 Zehntel = 0,1" },
          ],
        },
        {
          id: "sf_ma56_2",
          name: "Teiler, Primzahlen & Winkel",
          mc: [
            {
              q: "Welche Zahl ist eine Primzahl?",
              c: ["7", "9", "15", "21"],
              a: 0,
              w: "7 hat nur die Teiler 1 und 7.",
            },
            {
              q: "ggT von 12 und 18?",
              c: ["6", "3", "2", "36"],
              a: 0,
              w: "Teiler von 12 und 18: 1, 2, 3, 6 → größter: 6.",
            },
            {
              q: "kgV von 4 und 6?",
              c: ["12", "24", "2", "10"],
              a: 0,
              w: "Vielfache von 4: 4, 8, 12 … von 6: 6, 12 … → 12.",
            },
            {
              q: "Eine Zahl ist durch 3 teilbar, wenn …",
              c: [
                "ihre Quersumme durch 3 teilbar ist",
                "sie auf 3 endet",
                "sie gerade ist",
                "sie auf 0 endet",
              ],
              a: 0,
              w: "z. B. 471: 4+7+1 = 12 → teilbar durch 3.",
            },
            {
              q: "Wie heißt ein Winkel unter 90°?",
              c: ["spitzer Winkel", "stumpfer Winkel", "rechter Winkel", "gestreckter Winkel"],
              a: 0,
              w: "spitz < 90° < stumpf < 180°",
            },
          ],
          cards: [
            {
              f: "Primzahl",
              b: "Hat genau zwei Teiler: 1 und sich selbst (2, 3, 5, 7, 11, 13 …).",
            },
            { f: "ggT", b: "Größter gemeinsamer Teiler – hilft beim Kürzen." },
            {
              f: "Winkelarten",
              b: "spitz < 90°, recht = 90°, stumpf 90°–180°, gestreckt = 180°, voll = 360°.",
            },
          ],
          gaps: [
            { t: "Die kleinste Primzahl ist ___.", a: ["2"] },
            { t: "Ein Vollwinkel hat ___ Grad.", a: ["360"] },
          ],
          free: [
            { q: "Wie groß ist die Quersumme von 4572?", a: ["18"], w: "4 + 5 + 7 + 2 = 18" },
            { q: "Ist 91 eine Primzahl? (ja/nein)", a: ["nein"], w: "91 = 7 · 13" },
          ],
        },
      ],
    },
    "7-8": {
      topics: [
        {
          id: "sf_ma78_1",
          name: "Prozent & Zuordnungen",
          mc: [
            {
              q: "20 % von 150 = ?",
              c: ["30", "20", "15", "300"],
              a: 0,
              w: "10 % = 15, also 20 % = 30.",
            },
            { q: "25 % als Bruch?", c: ["1/4", "1/25", "2/5", "1/2"], a: 0, w: "25/100 = 1/4." },
            {
              q: "Ein Artikel kostet 80 €, 10 % Rabatt. Neuer Preis?",
              c: ["72 €", "70 €", "78 €", "88 €"],
              a: 0,
              w: "10 % von 80 = 8 → 80 − 8 = 72.",
            },
            {
              q: "3 Hefte kosten 4,50 €. Was kosten 5 Hefte?",
              c: ["7,50 €", "6,50 €", "9,00 €", "7,00 €"],
              a: 0,
              w: "1 Heft = 1,50 € → 5 · 1,50 = 7,50 €.",
            },
            {
              q: "4 Arbeiter brauchen 6 Tage. Wie lange brauchen 8 Arbeiter?",
              c: ["3 Tage", "12 Tage", "6 Tage", "2 Tage"],
              a: 0,
              w: "Antiproportional: doppelt so viele → halb so lange.",
            },
          ],
          cards: [
            { f: "Prozentwert", b: "W = G · p / 100 (z. B. 20 % von 150 = 150 · 20 / 100 = 30)." },
            { f: "Grundwert", b: "Das Ganze, entspricht 100 %." },
            {
              f: "Proportional",
              b: "Doppelt so viel → doppelt so teuer (Quotient bleibt gleich).",
            },
            {
              f: "Antiproportional",
              b: "Doppelt so viele → halb so lange (Produkt bleibt gleich).",
            },
          ],
          gaps: [
            { t: "50 % von 64 = ___", a: ["32"] },
            { t: "1 % von 300 = ___", a: ["3"] },
          ],
          free: [
            { q: "Wie viel Prozent sind 15 von 60?", a: ["25", "25 %"], w: "15/60 = 1/4 = 25 %" },
            {
              q: "Ein Pulli kostet 40 € und wird 25 % teurer. Neuer Preis in €?",
              a: ["50"],
              w: "25 % von 40 = 10 → 50 €",
            },
          ],
        },
        {
          id: "sf_ma78_2",
          name: "Terme & Gleichungen",
          mc: [
            {
              q: "Löse 3x + 5 = 20.",
              c: ["x = 5", "x = 25/3", "x = 15", "x = 8"],
              a: 0,
              w: "−5: 3x = 15, :3 → x = 5.",
            },
            {
              q: "Vereinfache 2a + 3b + 4a.",
              c: ["6a + 3b", "9ab", "6a + 3", "5a + 4b"],
              a: 0,
              w: "Nur gleiche Variablen zusammenfassen.",
            },
            {
              q: "Multipliziere aus: 3(x + 4)",
              c: ["3x + 12", "3x + 4", "x + 12", "7x"],
              a: 0,
              w: "Jeder Summand wird mit 3 multipliziert.",
            },
            {
              q: "Löse 2x − 7 = x + 1.",
              c: ["x = 8", "x = −6", "x = 6", "x = −8"],
              a: 0,
              w: "−x: x − 7 = 1, +7: x = 8.",
            },
            {
              q: "(−3) · (−4) = ?",
              c: ["12", "−12", "−7", "7"],
              a: 0,
              w: "Minus mal minus ergibt plus.",
            },
          ],
          cards: [
            { f: "Äquivalenzumformung", b: "Auf beiden Seiten der Gleichung dasselbe rechnen." },
            { f: "Ausmultiplizieren", b: "a · (b + c) = a · b + a · c" },
            { f: "Vorzeichenregel", b: "+ · + = +, − · − = +, + · − = −" },
          ],
          gaps: [
            { t: "x + 9 = 14 → x = ___", a: ["5"] },
            { t: "4x = 28 → x = ___", a: ["7"] },
          ],
          free: [
            { q: "Löse 5x − 3 = 2x + 12. x = ?", a: ["5"], w: "3x = 15 → x = 5" },
            { q: "Fasse zusammen: 7y − 2y + y", a: ["6y"], w: "7 − 2 + 1 = 6 → 6y" },
          ],
        },
      ],
    },
    "9-10": {
      topics: [
        {
          id: "sf_ma910_1",
          name: "Quadratische Funktionen & Gleichungen",
          mc: [
            {
              q: "Scheitelpunkt von f(x) = (x − 2)² + 3?",
              c: ["S(2|3)", "S(−2|3)", "S(2|−3)", "S(3|2)"],
              a: 0,
              w: "Scheitelpunktform a(x − d)² + e → S(d|e).",
            },
            {
              q: "Lösungen von x² = 49?",
              c: ["x = 7 oder x = −7", "nur x = 7", "x = 24,5", "keine Lösung"],
              a: 0,
              w: "Beide Zahlen ergeben quadriert 49.",
            },
            {
              q: "Wann ist die Parabel f(x) = ax² nach oben geöffnet?",
              c: ["a > 0", "a < 0", "a = 0", "nur bei a = 1"],
              a: 0,
              w: "Positives a → nach oben, negatives → nach unten.",
            },
            {
              q: "pq-Formel für x² + px + q = 0?",
              c: [
                "x = −p/2 ± √((p/2)² − q)",
                "x = p/2 ± √(p² − q)",
                "x = −p ± √(p − q)",
                "x = −q/2 ± √(q² − p)",
              ],
              a: 0,
              w: "Normalform nötig (vor x² steht 1).",
            },
            {
              q: "Lösungen von x² − 5x + 6 = 0?",
              c: ["x = 2 und x = 3", "x = −2 und x = −3", "x = 1 und x = 6", "x = 5 und x = 6"],
              a: 0,
              w: "(x − 2)(x − 3) = 0.",
            },
          ],
          cards: [
            { f: "Normalparabel", b: "f(x) = x², Scheitel S(0|0), nach oben geöffnet." },
            { f: "Scheitelpunktform", b: "f(x) = a(x − d)² + e mit Scheitel S(d|e)." },
            {
              f: "Diskriminante",
              b: "D = (p/2)² − q: D > 0 zwei, D = 0 eine, D < 0 keine Lösung.",
            },
          ],
          gaps: [
            { t: "(a + b)² = a² + 2ab + ___", a: ["b²"] },
            { t: "√144 = ___", a: ["12"] },
          ],
          free: [
            {
              q: "Löse x² − 9 = 0. Wie heißt die positive Lösung?",
              a: ["3"],
              w: "x² = 9 → x = ±3",
            },
            {
              q: "Wie viele Nullstellen hat f(x) = x² + 1?",
              a: ["0", "keine"],
              w: "x² + 1 ist immer mindestens 1.",
            },
          ],
        },
        {
          id: "sf_ma910_2",
          name: "Pythagoras, Trigonometrie & Körper",
          mc: [
            {
              q: "Wie lautet der Satz des Pythagoras?",
              c: ["a² + b² = c²", "a + b = c", "a² · b² = c²", "2a + 2b = c"],
              a: 0,
              w: "Im rechtwinkligen Dreieck, c ist die Hypotenuse.",
            },
            {
              q: "Katheten 6 cm und 8 cm. Hypotenuse?",
              c: ["10 cm", "14 cm", "12 cm", "48 cm"],
              a: 0,
              w: "36 + 64 = 100 → √100 = 10.",
            },
            {
              q: "sin α = ?",
              c: [
                "Gegenkathete / Hypotenuse",
                "Ankathete / Hypotenuse",
                "Gegenkathete / Ankathete",
                "Hypotenuse / Gegenkathete",
              ],
              a: 0,
              w: "GAGA-HHAA: sin = G/H, cos = A/H, tan = G/A.",
            },
            {
              q: "tan 45° = ?",
              c: ["1", "0", "0,5", "√2"],
              a: 0,
              w: "Bei 45° sind Gegen- und Ankathete gleich lang.",
            },
            {
              q: "Volumen eines Zylinders?",
              c: ["V = π · r² · h", "V = 2 · π · r · h", "V = π · r · h²", "V = 4/3 · π · r³"],
              a: 0,
              w: "Grundfläche (Kreis) mal Höhe.",
            },
          ],
          cards: [
            { f: "Hypotenuse", b: "Längste Seite, liegt gegenüber dem rechten Winkel." },
            { f: "cos α", b: "Ankathete / Hypotenuse" },
            { f: "Kreisfläche", b: "A = π · r²; Umfang u = 2 · π · r" },
          ],
          gaps: [
            { t: "Katheten 3 cm und 4 cm → Hypotenuse = ___ cm", a: ["5"] },
            { t: "sin 30° = ___", a: ["0,5", "1/2"] },
          ],
          free: [
            {
              q: "Wie heißt die längste Seite im rechtwinkligen Dreieck?",
              a: ["Hypotenuse"],
              w: "Gegenüber dem rechten Winkel.",
            },
            { q: "cos 60° = ?", a: ["0,5", "1/2"], w: "cos 60° = sin 30° = 0,5" },
          ],
        },
      ],
    },
    "11-13": {
      topics: [
        {
          id: "sf_ma1113_1",
          name: "Ableitungen & Kurvendiskussion",
          mc: [
            {
              q: "f(x) = x³ → f'(x) = ?",
              c: ["3x²", "x²", "3x³", "x⁴/4"],
              a: 0,
              w: "Potenzregel: n · xⁿ⁻¹.",
            },
            {
              q: "f(x) = 5x² − 3x + 2 → f'(x) = ?",
              c: ["10x − 3", "10x + 2", "5x − 3", "10x² − 3"],
              a: 0,
              w: "Konstanten fallen weg, 5x² → 10x, −3x → −3.",
            },
            {
              q: "Notwendige Bedingung für eine Extremstelle?",
              c: ["f'(x) = 0", "f(x) = 0", "f''(x) = 0", "f'(x) > 0"],
              a: 0,
              w: "Waagerechte Tangente.",
            },
            {
              q: "f'(x₀) = 0 und f''(x₀) < 0 bedeutet …",
              c: ["Hochpunkt", "Tiefpunkt", "Wendepunkt", "Nullstelle"],
              a: 0,
              w: "Rechtskrümmung → Maximum.",
            },
            {
              q: "Ableitung von sin(x)?",
              c: ["cos(x)", "−cos(x)", "−sin(x)", "tan(x)"],
              a: 0,
              w: "sin → cos → −sin → −cos → sin",
            },
          ],
          cards: [
            { f: "Potenzregel", b: "(xⁿ)' = n · xⁿ⁻¹" },
            { f: "Kettenregel", b: "(u(v(x)))' = u'(v(x)) · v'(x) – äußere mal innere Ableitung." },
            { f: "e-Funktion", b: "(eˣ)' = eˣ" },
          ],
          gaps: [
            { t: "Die Ableitung von f(x) = 7x ist f'(x) = ___.", a: ["7"] },
            { t: "f''(x₀) > 0 bei f'(x₀) = 0 bedeutet einen ___.", a: ["Tiefpunkt"] },
          ],
          free: [
            { q: "f(x) = x⁴. Wie groß ist f'(2)?", a: ["32"], w: "f'(x) = 4x³ → 4 · 8 = 32" },
            { q: "Steigung von f(x) = x² an der Stelle x = 3?", a: ["6"], w: "f'(x) = 2x → 6" },
          ],
        },
        {
          id: "sf_ma1113_2",
          name: "Integrale & Wahrscheinlichkeit",
          mc: [
            {
              q: "Eine Stammfunktion von f(x) = 2x?",
              c: ["x² + C", "2 + C", "2x² + C", "x + C"],
              a: 0,
              w: "Ableiten von x² ergibt 2x.",
            },
            { q: "∫₀² x dx = ?", c: ["2", "4", "1", "8"], a: 0, w: "[x²/2] von 0 bis 2 = 2 − 0." },
            {
              q: "Wahrscheinlichkeit, mit einem fairen Würfel eine 6 zu werfen?",
              c: ["1/6", "1/3", "1/2", "6"],
              a: 0,
              w: "1 günstiges von 6 möglichen Ergebnissen.",
            },
            {
              q: "Zwei Münzwürfe: P(zweimal Kopf)?",
              c: ["1/4", "1/2", "1/3", "2"],
              a: 0,
              w: "1/2 · 1/2 = 1/4 (Pfadregel).",
            },
            {
              q: "Erwartungswert der Augenzahl eines fairen Würfels?",
              c: ["3,5", "3", "4", "6"],
              a: 0,
              w: "(1+2+3+4+5+6)/6 = 3,5",
            },
          ],
          cards: [
            { f: "Stammfunktion", b: "F ist Stammfunktion von f, wenn F' = f." },
            { f: "Hauptsatz", b: "∫ₐᵇ f(x) dx = F(b) − F(a)" },
            { f: "Gegenereignis", b: "P(nicht A) = 1 − P(A)" },
          ],
          gaps: [
            { t: "Stammfunktion von f(x) = 3x² ist F(x) = ___ + C", a: ["x³", "x^3"] },
            { t: "P(A) + P(nicht A) = ___", a: ["1"] },
          ],
          free: [
            { q: "∫ von 0 bis 1 von 3x² dx = ?", a: ["1"], w: "[x³] von 0 bis 1 = 1" },
            {
              q: "Auf wie viele Arten kann man 3 Bücher nebeneinander stellen?",
              a: ["6"],
              w: "3! = 3 · 2 · 1 = 6",
            },
          ],
        },
      ],
    },
  },

  englisch: {
    "1-2": {
      topics: [
        {
          id: "sf_en12_1",
          name: "Colours & Numbers",
          mc: [
            {
              q: "Was heißt „rot“ auf Englisch?",
              c: ["red", "blue", "green", "yellow"],
              a: 0,
              w: "red = rot",
            },
            {
              q: "Was heißt „blau“?",
              c: ["blue", "black", "brown", "red"],
              a: 0,
              w: "blue = blau",
            },
            { q: "Welche Zahl ist „seven“?", c: ["7", "6", "9", "11"], a: 0, w: "seven = sieben" },
            {
              q: "Was heißt „gelb“?",
              c: ["yellow", "white", "pink", "green"],
              a: 0,
              w: "yellow = gelb",
            },
            {
              q: "Welche Zahl ist „twelve“?",
              c: ["12", "20", "2", "11"],
              a: 0,
              w: "twelve = zwölf",
            },
          ],
          cards: [
            { f: "red", b: "rot" },
            { f: "green", b: "grün" },
            { f: "ten", b: "zehn" },
          ],
          gaps: [
            { t: "One, two, ___, four.", a: ["three"] },
            { t: "The sun is ___. (gelb)", a: ["yellow"] },
          ],
          free: [
            { q: "Wie sagt man „Hallo“ auf Englisch?", a: ["hello", "hi"], w: "Hello! / Hi!" },
            { q: "Wie heißt „fünf“ auf Englisch?", a: ["five"], w: "five = 5" },
          ],
        },
        {
          id: "sf_en12_2",
          name: "Animals & Family",
          mc: [
            { q: "Was heißt „Hund“?", c: ["dog", "cat", "mouse", "bird"], a: 0, w: "dog = Hund" },
            { q: "Was heißt „Katze“?", c: ["cat", "cow", "duck", "dog"], a: 0, w: "cat = Katze" },
            {
              q: "Was bedeutet „mother“?",
              c: ["Mutter", "Vater", "Schwester", "Oma"],
              a: 0,
              w: "mother = Mutter (mum)",
            },
            {
              q: "Was bedeutet „brother“?",
              c: ["Bruder", "Schwester", "Onkel", "Vater"],
              a: 0,
              w: "brother = Bruder",
            },
            {
              q: "Was heißt „Pferd“?",
              c: ["horse", "house", "hen", "cow"],
              a: 0,
              w: "horse = Pferd",
            },
          ],
          cards: [
            { f: "dog", b: "Hund" },
            { f: "sister", b: "Schwester" },
            { f: "bird", b: "Vogel" },
          ],
          gaps: [
            { t: "I have got a ___. (Katze)", a: ["cat"] },
            { t: "My ___ is tall. (Vater)", a: ["father", "dad"] },
          ],
          free: [
            { q: "Wie heißt „Maus“ auf Englisch?", a: ["mouse"], w: "mouse – mice (Mehrzahl)" },
            { q: "Wie heißt „Fisch“ auf Englisch?", a: ["fish"], w: "fish" },
          ],
        },
      ],
    },
    "3-4": {
      topics: [
        {
          id: "sf_en34_1",
          name: "School & Days",
          mc: [
            {
              q: "Was heißt „Montag“?",
              c: ["Monday", "Sunday", "Friday", "Tuesday"],
              a: 0,
              w: "Monday = Montag",
            },
            {
              q: "Was bedeutet „pencil“?",
              c: ["Bleistift", "Lineal", "Radiergummi", "Heft"],
              a: 0,
              w: "pencil = Bleistift",
            },
            {
              q: "Was bedeutet „Wednesday“?",
              c: ["Mittwoch", "Donnerstag", "Dienstag", "Montag"],
              a: 0,
              w: "Wednesday = Mittwoch",
            },
            {
              q: "Welcher Monat kommt nach „March“?",
              c: ["April", "May", "February", "June"],
              a: 0,
              w: "March → April",
            },
            {
              q: "Was bedeutet „ruler“?",
              c: ["Lineal", "Schere", "Kleber", "Tafel"],
              a: 0,
              w: "ruler = Lineal",
            },
          ],
          cards: [
            { f: "rubber", b: "Radiergummi (amerikanisch: eraser)" },
            { f: "Thursday", b: "Donnerstag" },
            { f: "schoolbag", b: "Schultasche" },
          ],
          gaps: [
            { t: "Today is ___. (Freitag)", a: ["Friday"] },
            { t: "I have got a red ___. (Buch)", a: ["book"] },
          ],
          free: [
            { q: "Wie heißt „Samstag“ auf Englisch?", a: ["Saturday"], w: "Saturday" },
            { q: "Wie heißt „Lehrer/Lehrerin“?", a: ["teacher"], w: "teacher" },
          ],
        },
        {
          id: "sf_en34_2",
          name: "I am / I have got / I like",
          mc: [
            { q: "I ___ ten years old.", c: ["am", "is", "are", "have"], a: 0, w: "I am …" },
            {
              q: "She ___ a dog.",
              c: ["has got", "have got", "am", "are"],
              a: 0,
              w: "he/she/it has got",
            },
            {
              q: "Do you like pizza? – Yes, I ___.",
              c: ["do", "am", "like", "does"],
              a: 0,
              w: "Kurzantwort: Yes, I do.",
            },
            { q: "My name ___ Tom.", c: ["is", "am", "are", "be"], a: 0, w: "My name is …" },
            {
              q: "They ___ my friends.",
              c: ["are", "is", "am", "has"],
              a: 0,
              w: "we/you/they are",
            },
          ],
          cards: [
            { f: "I am", b: "ich bin" },
            { f: "I have got", b: "ich habe" },
            { f: "I like", b: "ich mag" },
          ],
          gaps: [
            { t: "We ___ happy.", a: ["are"] },
            { t: "He ___ got a bike.", a: ["has"] },
          ],
          free: [
            {
              q: "Wie sagt man „Ich heiße Anna.“?",
              a: ["My name is Anna", "I am Anna", "I'm Anna"],
              w: "My name is Anna. / I'm Anna.",
            },
            {
              q: "Wie fragt man „Wie geht es dir?“?",
              a: ["How are you"],
              w: "How are you? – I'm fine, thanks.",
            },
          ],
        },
      ],
    },
    "5-6": {
      topics: [
        {
          id: "sf_en56_1",
          name: "Simple Present & Present Progressive",
          mc: [
            {
              q: "He ___ football every Saturday.",
              c: ["plays", "play", "is playing", "playing"],
              a: 0,
              w: "Regelmäßig → Simple Present, he/she/it: -s.",
            },
            {
              q: "Look! The baby ___.",
              c: ["is sleeping", "sleeps", "sleep", "sleeping"],
              a: 0,
              w: "Gerade jetzt → Present Progressive.",
            },
            {
              q: "Welches Signalwort passt zum Simple Present?",
              c: ["always", "now", "at the moment", "Look!"],
              a: 0,
              w: "always, often, never, every day → Simple Present.",
            },
            {
              q: "She doesn't ___ milk.",
              c: ["like", "likes", "liking", "liked"],
              a: 0,
              w: "Nach doesn't steht die Grundform.",
            },
            {
              q: "___ you play the guitar?",
              c: ["Do", "Does", "Are", "Is"],
              a: 0,
              w: "Frage mit do (I/you/we/they).",
            },
          ],
          cards: [
            { f: "Simple Present", b: "Für Regelmäßiges. he/she/it – das s muss mit!" },
            { f: "Present Progressive", b: "Was gerade passiert: am/is/are + -ing." },
            { f: "Verneinung", b: "don't / doesn't + Grundform: He doesn't like fish." },
          ],
          gaps: [
            { t: "My sister ___ TV every evening. (watch)", a: ["watches"] },
            { t: "We ___ a game right now. (play)", a: ["are playing"] },
          ],
          free: [
            {
              q: "Verneine: „He likes fish.“",
              a: ["He doesn't like fish", "He does not like fish"],
              w: "doesn't + Grundform",
            },
            { q: "Wie heißt „Hausaufgaben“?", a: ["homework"], w: "homework (kein Plural)" },
          ],
        },
        {
          id: "sf_en56_2",
          name: "Simple Past",
          mc: [
            {
              q: "Simple Past von „go“?",
              c: ["went", "goed", "gone", "wented"],
              a: 0,
              w: "go – went – gone",
            },
            {
              q: "Simple Past von „buy“?",
              c: ["bought", "buyed", "brought", "buy"],
              a: 0,
              w: "buy – bought – bought",
            },
            {
              q: "Did you see the film? – Yes, I ___.",
              c: ["did", "do", "saw", "was"],
              a: 0,
              w: "Kurzantwort im Simple Past: Yes, I did.",
            },
            {
              q: "Welches Signalwort passt zum Simple Past?",
              c: ["yesterday", "now", "every day", "tomorrow"],
              a: 0,
              w: "yesterday, last week, ago → Simple Past.",
            },
            {
              q: "She ___ at home last night.",
              c: ["was", "were", "is", "be"],
              a: 0,
              w: "I/he/she/it was – we/you/they were",
            },
          ],
          cards: [
            { f: "Simple Past (regelmäßig)", b: "Grundform + -ed: play – played." },
            { f: "Fragen im Simple Past", b: "Did + Grundform: Did you go?" },
            { f: "Verneinung im Simple Past", b: "didn't + Grundform: I didn't go." },
          ],
          gaps: [
            { t: "Last summer we ___ to Spain. (fly)", a: ["flew"] },
            { t: "I ___ TV yesterday. (not/watch)", a: ["didn't watch", "did not watch"] },
          ],
          free: [
            { q: "Simple Past von „write“?", a: ["wrote"], w: "write – wrote – written" },
            { q: "Simple Past von „have“?", a: ["had"], w: "have – had – had" },
          ],
        },
      ],
    },
    "7-8": {
      topics: [
        {
          id: "sf_en78_1",
          name: "Present Perfect vs. Simple Past",
          mc: [
            {
              q: "I ___ my homework already.",
              c: ["have done", "did", "have did", "done"],
              a: 0,
              w: "already → Present Perfect: have + 3. Form.",
            },
            {
              q: "We ___ to London last year.",
              c: ["went", "have gone", "have been", "go"],
              a: 0,
              w: "last year → Simple Past.",
            },
            {
              q: "Welches Signalwort gehört zum Present Perfect?",
              c: ["ever", "yesterday", "last week", "in 2010"],
              a: 0,
              w: "ever, never, already, yet, just, since, for.",
            },
            {
              q: "Has she ever ___ sushi?",
              c: ["eaten", "ate", "eat", "eated"],
              a: 0,
              w: "eat – ate – eaten",
            },
            {
              q: "I have lived here ___ 2015.",
              c: ["since", "for", "ago", "from"],
              a: 0,
              w: "since + Zeitpunkt, for + Zeitraum.",
            },
          ],
          cards: [
            {
              f: "Present Perfect",
              b: "have/has + 3. Form – Ergebnis zählt, Zeitpunkt unwichtig.",
            },
            { f: "Simple Past", b: "Abgeschlossen, Zeitpunkt genannt (yesterday, ago, in 2010)." },
            { f: "since / for", b: "since = seit (Zeitpunkt), for = seit (Zeitraum)." },
          ],
          gaps: [
            { t: "He has lived in Berlin ___ ten years.", a: ["for"] },
            { t: "They ___ just arrived.", a: ["have"] },
          ],
          free: [
            {
              q: "3. Form (past participle) von „write“?",
              a: ["written"],
              w: "write – wrote – written",
            },
            { q: "3. Form von „go“?", a: ["gone"], w: "go – went – gone" },
          ],
        },
        {
          id: "sf_en78_2",
          name: "Conditional I & will / going to",
          mc: [
            {
              q: "If it rains, we ___ at home.",
              c: ["will stay", "would stay", "stay will", "stayed"],
              a: 0,
              w: "Typ 1: If + Simple Present, will + Grundform.",
            },
            {
              q: "Welche Zeit steht im if-Satz Typ 1?",
              c: ["Simple Present", "will-future", "Simple Past", "Present Perfect"],
              a: 0,
              w: "Im if-Teil nie will!",
            },
            {
              q: "Look at the clouds! It ___ rain.",
              c: ["is going to", "will to", "going", "rains"],
              a: 0,
              w: "Klares Anzeichen → going to.",
            },
            {
              q: "I think he ___ win the race.",
              c: ["will", "is", "going", "would to"],
              a: 0,
              w: "Vermutung (I think) → will.",
            },
            {
              q: "If you ___ hard, you will pass.",
              c: ["study", "will study", "studied", "studying"],
              a: 0,
              w: "if + Simple Present",
            },
          ],
          cards: [
            { f: "if-Satz Typ 1", b: "If + Simple Present, will + Grundform (realistisch)." },
            { f: "going to", b: "Plan oder sicheres Anzeichen: I'm going to visit Gran." },
            { f: "will", b: "Vermutung oder spontane Entscheidung: I'll help you." },
          ],
          gaps: [
            { t: "If he ___ the bus, he will be late. (miss)", a: ["misses"] },
            { t: "We ___ going to visit our grandma tomorrow.", a: ["are"] },
          ],
          free: [
            { q: "Wie heißt „Erfahrung“ auf Englisch?", a: ["experience"], w: "experience" },
            { q: "Ergänze: If I have time, I ___ help you.", a: ["will"], w: "Typ 1 → will" },
          ],
        },
      ],
    },
    "9-10": {
      topics: [
        {
          id: "sf_en910_1",
          name: "Conditionals II & III, Passive",
          mc: [
            {
              q: "If I ___ rich, I would travel the world.",
              c: ["were", "am", "will be", "would be"],
              a: 0,
              w: "Typ 2: If + Simple Past (were), would + Grundform.",
            },
            {
              q: "If she had studied, she ___ the test.",
              c: ["would have passed", "would pass", "will pass", "had passed"],
              a: 0,
              w: "Typ 3: would have + 3. Form.",
            },
            {
              q: "The letter ___ yesterday.",
              c: ["was written", "wrote", "is writing", "has write"],
              a: 0,
              w: "Passive Simple Past: was/were + 3. Form.",
            },
            {
              q: "English ___ all over the world.",
              c: ["is spoken", "speaks", "is speaking", "spoke"],
              a: 0,
              w: "Passive Simple Present: is/are + 3. Form.",
            },
            {
              q: "Welche Zeit steht im if-Satz Typ 3?",
              c: ["Past Perfect", "Simple Past", "Simple Present", "will-future"],
              a: 0,
              w: "If I had known, …",
            },
          ],
          cards: [
            {
              f: "if-Satz Typ 2",
              b: "If + Simple Past, would + Grundform – unwahrscheinlich/gedacht.",
            },
            {
              f: "if-Satz Typ 3",
              b: "If + Past Perfect, would have + 3. Form – Vergangenheit, nicht mehr änderbar.",
            },
            { f: "Passive", b: "Form von be + 3. Form: The car is repaired / was repaired." },
          ],
          gaps: [
            { t: "If I ___ his number, I would call him. (know)", a: ["knew"] },
            { t: "The car ___ repaired last week.", a: ["was"] },
          ],
          free: [
            { q: "Wie heißt „Umwelt“ auf Englisch?", a: ["environment"], w: "environment" },
            {
              q: "Setze ins Passiv: „They build houses.“",
              a: ["Houses are built", "Houses are built by them"],
              w: "Objekt wird Subjekt, be + 3. Form.",
            },
          ],
        },
        {
          id: "sf_en910_2",
          name: "Reported Speech & Linking Words",
          mc: [
            {
              q: "He said: „I am tired.“ → He said that he ___ tired.",
              c: ["was", "is", "were", "has been"],
              a: 0,
              w: "Backshift: am → was.",
            },
            {
              q: "In der indirekten Rede wird „will“ zu …",
              c: ["would", "will", "shall", "wanted"],
              a: 0,
              w: "will → would",
            },
            {
              q: "She asked me where ___.",
              c: ["I lived", "did I live", "do I live", "lived I"],
              a: 0,
              w: "Indirekte Frage: keine Umstellung, kein do.",
            },
            {
              q: "Welches Linking Word drückt einen Gegensatz aus?",
              c: ["however", "therefore", "moreover", "for example"],
              a: 0,
              w: "however = jedoch",
            },
            {
              q: "Formeller Brief, Name des Empfängers bekannt – Schlussformel (britisch)?",
              c: ["Yours sincerely", "Yours faithfully", "Love", "Cheers"],
              a: 0,
              w: "Name bekannt → sincerely, unbekannt (Dear Sir or Madam) → faithfully.",
            },
          ],
          cards: [
            {
              f: "Backshift",
              b: "present → past, past → past perfect, will → would, can → could.",
            },
            { f: "however", b: "jedoch (Gegensatz)" },
            { f: "therefore", b: "deshalb (Folge)" },
          ],
          gaps: [
            { t: "She said that she ___ swim. (can)", a: ["could"] },
            { t: "He told me he ___ come later. (will)", a: ["would"] },
          ],
          free: [
            {
              q: "Linking Word für „außerdem“ (beginnt mit m)?",
              a: ["moreover"],
              w: "moreover / furthermore",
            },
            {
              q: "Reported Speech: „now“ wird zu …?",
              a: ["then"],
              w: "now → then, today → that day",
            },
          ],
        },
      ],
    },
    "11-13": {
      topics: [
        {
          id: "sf_en1113_1",
          name: "Text Analysis & Stylistic Devices",
          mc: [
            {
              q: "„The wind whispered through the trees.“ – Stilmittel?",
              c: ["personification", "simile", "alliteration", "hyperbole"],
              a: 0,
              w: "Der Wind „flüstert“ wie ein Mensch.",
            },
            {
              q: "„as brave as a lion“ – Stilmittel?",
              c: ["simile", "metaphor", "irony", "enumeration"],
              a: 0,
              w: "Vergleich mit as … as / like.",
            },
            {
              q: "Was ist ein „thesis statement“?",
              c: [
                "The main claim of an essay",
                "A summary of a novel",
                "The last line of a letter",
                "A quotation",
              ],
              a: 0,
              w: "Die zentrale These, meist am Ende der Einleitung.",
            },
            {
              q: "„Furthermore“ benutzt man, um …",
              c: [
                "ein Argument hinzuzufügen",
                "einen Gegensatz zu zeigen",
                "ein Beispiel zu geben",
                "zu schließen",
              ],
              a: 0,
              w: "furthermore = außerdem",
            },
            {
              q: "Eine summary ist …",
              c: [
                "im Present Tense, sachlich, ohne Zitate",
                "im Past Tense mit Meinung",
                "voller wörtlicher Rede",
                "in der Ich-Form",
              ],
              a: 0,
              w: "Summary: objektiv, kurz, Present Tense.",
            },
          ],
          cards: [
            { f: "tone", b: "Haltung des Autors, z. B. ironic, critical, humorous." },
            {
              f: "rhetorical question",
              b: "Frage ohne erwartete Antwort – bezieht den Leser ein.",
            },
            { f: "enumeration", b: "Aufzählung – betont Vielfalt oder Menge." },
          ],
          gaps: [
            { t: "A ___ compares two things using „like“ or „as“.", a: ["simile"] },
            { t: "In ___, I would like to say that … (Schluss)", a: ["conclusion"] },
          ],
          free: [
            {
              q: "Englisches Wort für „Erzähler“?",
              a: ["narrator"],
              w: "first-person / third-person narrator",
            },
            {
              q: "Englisches Wort für „Behauptung“ in einer Argumentation?",
              a: ["claim", "thesis", "statement"],
              w: "claim / thesis",
            },
          ],
        },
        {
          id: "sf_en1113_2",
          name: "Topics: Globalisation & Society",
          mc: [
            {
              q: "Was heißt „Nachhaltigkeit“?",
              c: ["sustainability", "sustenance", "stability", "suitability"],
              a: 0,
              w: "sustainability, Adjektiv: sustainable",
            },
            {
              q: "Was heißt „Einwanderung“?",
              c: ["immigration", "emigration", "integration", "imitation"],
              a: 0,
              w: "immigration = Einwanderung, emigration = Auswanderung",
            },
            {
              q: "Was heißt „Ungleichheit“?",
              c: ["inequality", "unequality", "disequality", "inequation"],
              a: 0,
              w: "inequality",
            },
            {
              q: "Was heißt „Arbeitslosigkeit“?",
              c: ["unemployment", "employment", "disemployment", "jobness"],
              a: 0,
              w: "unemployment",
            },
            {
              q: "Was bedeutet „to raise awareness“?",
              c: ["Bewusstsein schaffen", "Gehalt erhöhen", "aufwachen", "Kinder großziehen"],
              a: 0,
              w: "to raise awareness of sth.",
            },
          ],
          cards: [
            { f: "globalisation", b: "Globalisierung" },
            { f: "climate change", b: "Klimawandel" },
            { f: "to tackle a problem", b: "ein Problem angehen" },
          ],
          gaps: [
            { t: "Renewable ___ such as wind power is clean.", a: ["energy"] },
            {
              t: "Many people ___ to other countries to find work.",
              a: ["migrate", "emigrate", "move"],
            },
          ],
          free: [
            { q: "Was heißt „Gesellschaft“?", a: ["society"], w: "society" },
            { q: "Was heißt „Vielfalt“?", a: ["diversity", "variety"], w: "diversity" },
          ],
        },
      ],
    },
  },
};
