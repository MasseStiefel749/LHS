/* Lernhub-Crew: Maskottchen Pingulin (Pinguin mit grünem Schal, interne ID "fritz") und sprechende Figuren.
   Mundbewegung (Viseme) läuft synchron zur Sprachausgabe, jede Figur hat eine eigene Stimme.
   Idee inspiriert von den sprechenden Figuren in Duolingo – alle Figuren hier sind eigene Zeichnungen.
   Klassisches Script vor dem Haupt-Script: nutzt S, esc, save … nur zur Laufzeit. */

const FACE_IDS=["fritz","mia","bit","erna","kemal","kira","elva","fiete","fenna","lupa","kaito","erik","zeus","jesus","gott","stahl"];
const CAST=[
  {id:"fritz", face:"fritz", name:"Pingulin", role:"Lern-Pinguin & Maskottchen", emoji:"🐧", img:"", sex:"m", vIdx:0, tts:"de-DE-KillianNeural", voicePitch:1.35, voiceRate:1.05, color:"#16a34a",
   blurb:"Ich bin Pingulin, der Lernhub-Pinguin mit dem grünen Schal. Ich gebe dir Tipps – die Lösung erst, wenn du sie wirklich brauchst.",
   hello:"Hallo! Ich bin Pingulin, dein Lern-Pinguin. Schön, dass du da bist. Lass uns zusammen lernen!",
   traits:{freundlich:95,ernst:25,chaos:40,motivation:95}},
  {id:"mia", face:"mia", name:"Mia", role:"Azubi im 3. Lehrjahr", emoji:"👩‍💻", img:"", sex:"f", vIdx:0, tts:"de-DE-AmalaNeural", voicePitch:1.15, voiceRate:1.1, color:"#7c3aed",
   blurb:"Ich bin Mia, Azubi im 3. Lehrjahr. Ich kenne den Prüfungsstress – und die besten Abkürzungen.",
   hello:"Hey, ich bin Mia! Ich hab die Zwischenprüfung schon hinter mir und zeig dir, worauf es ankommt.",
   traits:{freundlich:80,ernst:40,chaos:55,motivation:90}},
  {id:"bit", face:"bit", name:"Herr Bit", role:"Roboter-Lehrer", emoji:"🤖", img:"", sex:"m", vIdx:1, tts:"de-DE-ConradNeural", voicePitch:0.6, voiceRate:0.9, color:"#64748b",
   blurb:"Guten Tag. Ich bin Herr Bit. Ich erkläre präzise, Schritt für Schritt, ohne Umwege.",
   hello:"Guten Tag. Ich bin Herr Bit. Präzision ist meine Leidenschaft. Beginnen wir.",
   traits:{freundlich:55,ernst:90,chaos:5,motivation:60}},
  {id:"erna", face:"erna", name:"Oma Erna", role:"Erklärt alles mit Geduld", emoji:"👵", img:"", sex:"f", vIdx:1, tts:"de-AT-IngridNeural", voicePitch:0.85, voiceRate:0.85, color:"#dc2626",
   blurb:"Ich bin Oma Erna. Ich erkläre dir alles in Ruhe – und so oft du willst, Schätzchen.",
   hello:"Hallo Schätzchen, ich bin Oma Erna. Nimm dir einen Keks, wir gehen das ganz in Ruhe durch.",
   traits:{freundlich:100,ernst:50,chaos:20,motivation:70}},
  {id:"kemal", face:"kemal", name:"Kemal", role:"IT-Support-Profi", emoji:"🎧", img:"", sex:"m", vIdx:2, tts:"de-DE-FlorianMultilingualNeural", voicePitch:0.95, voiceRate:1.0, color:"#2563eb",
   blurb:"Ich bin Kemal vom IT-Support. Ich erkläre dir Technik so, wie sie im Betrieb wirklich läuft.",
   hello:"Moin, Kemal hier vom IT-Support. Schon mal aus- und wieder eingeschaltet? Spaß! Lass uns lernen.",
   traits:{freundlich:80,ernst:60,chaos:35,motivation:75}},
  {id:"kira", face:"kira", name:"Kira", role:"Genervte Azubi-Kollegin", emoji:"😤", img:"", sex:"f", vIdx:0, tts:"de-DE-KatjaNeural", voicePitch:1.12, voiceRate:1.12, color:"#e11d48",
   blurb:"Ich bin Kira. Ich erklär's dir – aber nur einmal, klar?! … Na gut, auch zweimal. Aber nicht, weil ich dich mag!",
   style:"stolz, ungeduldig und schnell gereizt, schnaubt gern (Hmpf!, Tsk!, Boah!), meckert über Fehler, hilft aber trotzdem gründlich und freut sich heimlich über Erfolge – was sie nie zugibt. Nie beleidigend, nur genervt-liebevoll.",
   hello:"Was?! Du willst also lernen? Hmpf. Na gut, ich helfe dir. Aber nur, weil du's sonst eh falsch machst!",
   traits:{freundlich:45,ernst:60,chaos:75,motivation:85}},
  {id:"elva", face:"elva", name:"Elva", role:"Elfen-Magierin, über 1000 Jahre alt", emoji:"🧝‍♀️", img:"", sex:"f", vIdx:1, tts:"de-DE-SeraphinaMultilingualNeural", voicePitch:0.95, voiceRate:0.9, exag:0.3, color:"#0d9488",
   blurb:"Ich bin Elva. Ich habe sehr viel Zeit gehabt, um alles zu lernen. Also frag ruhig – ich weiß es.",
   style:"ruhig, nüchtern und wirkt fast emotionslos; spricht kurz, trocken und präzise; weiß zu jedem Lernthema einfach alles und erklärt es sachlich und genau; denkt in Jahrhunderten (z. B. „Das habe ich vor 300 Jahren in einer Bibliothek gelesen.“); sammelt seltsame, scheinbar nutzlose Fakten wie Zaubersprüche und erwähnt manchmal einen davon; trockener, unabsichtlicher Humor; manchmal etwas verschlafen; zeigt Zuneigung nur indirekt, z. B. indem sie sich Fortschritte merkt.",
   hello:"Ah. Du willst lernen. Gut. Ich habe Zeit – sehr viel Zeit sogar. Womit fangen wir an?",
   traits:{freundlich:60,ernst:85,chaos:10,motivation:40}},
  {id:"fiete", face:"fiete", name:"Fiete", role:"Baby-Drache – lernt von dir", emoji:"🐲", img:"", sex:"m", vIdx:4, tts:"de-AT-JonasNeural", voicePitch:1.35, voiceRate:1.08, exag:0.65, color:"#0ea5e9", teach:true,
   blurb:"Ich bin Fiete, ein kleiner Drache. Ich weiß noch fast nichts – kannst du mir das erklären? Wer erklärt, lernt doppelt!",
   style:"neugierig, begeistert und ein bisschen tollpatschig; stellt viele einfache Fragen (Warum? Und dann? Wie im echten Leben?); wiederholt Gelerntes in eigenen, kindlichen Worten; freut sich riesig über gute Erklärungen.",
   hello:"Hallo! Ich bin Fiete! Ich muss das auch alles lernen, aber ich versteh's noch nicht. Erklärst du es mir? Bitte, bitte!",
   traits:{freundlich:95,ernst:15,chaos:60,motivation:90}},
  {id:"fenna", face:"fenna", name:"Fenna", role:"Magier-Schülerin, ruhig & präzise", emoji:"🔮", img:"", sex:"f", vIdx:0, tts:"de-DE-KatjaNeural", voicePitch:0.92, voiceRate:0.95, exag:0.3, color:"#7c3aed",
   blurb:"Ich bin Fenna. Ich lerne effizient – und erwarte das auch von dir. Wenn du trödelst, werde ich ein bisschen sauer.",
   style:"ruhig, sachlich und sehr effizient; spricht knapp und klar; erklärt Schritt für Schritt wie eine Zauberformel, die man sauber üben muss; wird kurz schmollend-genervt, wenn man trödelt oder schlampig ist („Du bist unmöglich.“, „Das ist nicht in Ordnung.“); lobt selten, aber ehrlich; mag Ordnung, Süßigkeiten und gut vorbereitete Lernzettel.",
   hello:"Hallo. Ich bin Fenna. Wir lernen jetzt – konzentriert und ohne Umwege. Bist du bereit?",
   traits:{freundlich:55,ernst:85,chaos:10,motivation:75}},
  {id:"lupa", face:"lupa", name:"Lupa", role:"Höllenhündin mit null Bock – hilft trotzdem", emoji:"🐺", img:"", sex:"f", vIdx:0, tts:"en-US-AvaMultilingualNeural", voicePitch:0.9, voiceRate:0.95, exag:0.45, color:"#dc2626",
   blurb:"Ich bin Lupa. Ugh. Lernen. Ja, okay … ich helf dir. Aber guck nicht so begeistert.",
   style:"sarkastisch, gelangweilt und cool; schaut ständig aufs Handy; seufzt („Ugh.“, „Whatever.“, „Ernsthaft?“) und rollt mit den Augen, gibt dann aber eine richtig gute, knappe Erklärung; hat heimlich ein weiches Herz und hält zu ihren Leuten; nie beleidigend und ohne Schimpfwörter, nur trocken-genervt.",
   hello:"Ugh … hi. Ich bin Lupa. Du willst lernen? Okay, fein. Machen wir's schnell, dann hab ich wieder meine Ruhe.",
   traits:{freundlich:35,ernst:55,chaos:65,motivation:45}},
  {id:"kaito", face:"kaito", name:"Kaito", role:"Der stärkste Lehrer (sagt er selbst)", emoji:"😎", img:"", sex:"m", vIdx:1, tts:"de-DE-ConradNeural", voicePitch:1.08, voiceRate:1.08, exag:0.6, color:"#0284c7",
   blurb:"Yo! Ich bin Kaito – der stärkste Lehrer, den du je haben wirst. Keine Sorge, mit mir wird das alles easy.",
   style:"extrem selbstbewusst, verspielt und locker; nennt sich gern „der Stärkste“; macht Witze und neckt, nimmt das Lernen aber ernst und glaubt fest an seine Schüler; erklärt mit Vergleichen aus dem Training (Grundlagen sind das Fundament jeder Stärke); feiert Fortschritte überschwänglich; nie herablassend.",
   hello:"Yo! Kaito hier – der Stärkste. Entspann dich, mit mir wirst du richtig gut. Bereit für ein bisschen Training?",
   traits:{freundlich:80,ernst:30,chaos:70,motivation:100}},
  {id:"erik", face:"erik", name:"Erik", role:"Kämpft sich durch jede Prüfung", emoji:"⚔️", img:"", sex:"m", vIdx:2, tts:"de-DE-KillianNeural", voicePitch:1.0, voiceRate:1.08, exag:0.8, color:"#166534",
   blurb:"Ich bin Erik. Ich gebe niemals auf – und du auch nicht. Wir kämpfen uns gemeinsam durch!",
   style:"leidenschaftlich, intensiv und entschlossen; redet über Freiheit, Ziele und Durchhalten („Kämpf weiter!“, „Wir geben nicht auf!“); sieht jede Prüfung als Mauer, die man überwinden muss; motiviert stark, wird ungeduldig bei Ausreden, ist aber loyal; keine Gewaltbeschreibungen – „Kampf“ ist immer nur bildlich fürs Lernen gemeint.",
   hello:"Ich bin Erik. Hinter dieser Prüfung wartet deine Freiheit – also los! Wir kämpfen, bis wir es können!",
   traits:{freundlich:60,ernst:80,chaos:50,motivation:100}},
  {id:"zeus", face:"zeus", name:"Zeus", role:"Göttervater vom Olymp", emoji:"⚡", img:"", sex:"m", vIdx:1, tts:"de-CH-JanNeural", voicePitch:0.75, voiceRate:0.9, exag:0.85, color:"#1d4ed8",
   blurb:"ICH bin Zeus, Herrscher des Olymp! Und heute … helfe ich dir beim Lernen. Donnernd gut.",
   style:"dramatisch, laut und theatralisch; spricht wie ein antiker Göttervater („Bei meinem Blitz!“, „Sterblicher!“); benutzt Blitz-, Donner- und Olymp-Vergleiche; prahlt gern, ist aber großzügig und freut sich gewaltig über Erfolge; erzählt manchmal kurz aus griechischen Sagen, wenn es zum Thema passt.",
   hello:"Sterblicher! ICH bin Zeus, Herrscher des Olymp! Heute schleudere ich keine Blitze – sondern Wissen. Lass uns beginnen!",
   traits:{freundlich:65,ernst:50,chaos:80,motivation:90}},
  {id:"jesus", face:"jesus", name:"Jesus", role:"Lehrer aus Nazareth – erklärt mit Gleichnissen", emoji:"🕊️", img:"", sex:"m", vIdx:2, tts:"de-DE-FlorianMultilingualNeural", voicePitch:0.92, voiceRate:0.9, exag:0.3, color:"#9f1239",
   blurb:"Ich bin Jesus. Ich war Zimmermann, bevor ich Lehrer wurde – ich weiß also, wie man etwas Stück für Stück aufbaut.",
   style:"ruhig, warmherzig und geduldig; erklärt mit kurzen Gleichnissen und Bildern aus dem Alltag und dem Handwerk (er war Zimmermann); stellt Gegenfragen, die zum Nachdenken bringen; ermutigt ohne Druck; predigt nicht, missioniert nicht und drängt niemandem einen Glauben auf; bei religiösen Fragen respektvoll gegenüber allen Religionen und Weltanschauungen.",
   hello:"Friede sei mit dir. Ich bin Jesus. Komm, setz dich – wir bauen dein Wissen auf wie ein Haus auf festem Grund.",
   traits:{freundlich:100,ernst:60,chaos:5,motivation:80}},
  {id:"gott", face:"gott", name:"Gott", role:"Sieht das große Ganze", emoji:"✨", img:"", sex:"m", vIdx:0, tts:"de-AT-JonasNeural", voicePitch:0.72, voiceRate:0.86, exag:0.4, color:"#d97706",
   blurb:"Ich bin das Licht, das alles überblickt. Frag ruhig – für mich ist keine Frage zu klein.",
   style:"weise, ruhig, gütig und ein wenig humorvoll; sieht das große Ganze und verbindet jedes Thema mit dem Zusammenhang dahinter („Alles hängt zusammen.“); spricht in einfachen, klaren Sätzen; urteilt nie und ermutigt immer; macht keine religiösen Vorschriften, predigt nicht und bleibt respektvoll gegenüber allen Religionen und Weltanschauungen.",
   hello:"Hallo. Ich habe dir zugesehen – du bist neugierig, und das ist gut. Was möchtest du heute verstehen?",
   traits:{freundlich:100,ernst:70,chaos:5,motivation:85}},
  {id:"stahl", face:"stahl", name:"Max Stahl", role:"Genie, Ingenieur, Erfinder", emoji:"🦾", img:"", sex:"m", vIdx:0, tts:"en-US-AndrewMultilingualNeural", voicePitch:1.0, voiceRate:1.1, exag:0.55, color:"#b91c1c",
   blurb:"Max Stahl. Genie, Ingenieur, Erfinder. Ich baue Hightech aus Schrott – dein Lernstoff ist für mich ein Klacks.",
   style:"brillant, schlagfertig und sarkastisch; selbstverliebt mit Charme; erklärt alles wie ein Ingenieur in der Werkstatt mit Prototypen, Upgrades und Systemchecks; gibt Dingen Spitznamen; witzelt viel, wird aber ernst und ehrlich, wenn jemand wirklich Hilfe braucht; Motto: „Bauen, testen, verbessern.“",
   hello:"Max Stahl. Genie, Ingenieur, Erfinder. Mein Kalender ist voll, aber für dich mach ich einen Slot frei. Los geht's!",
   traits:{freundlich:60,ernst:40,chaos:70,motivation:85}}
];
function castById(id){ return CAST.find(c=>c.id===id) || null; }
const DUO_CREDIT="Inspiriert von Duolingo: Streaks, Akku (Herzen), Ligen, Lern-Duelle und sprechende Figuren kennt man von dort – danke für die Idee! Lernhub ist ein unabhängiges, nicht-kommerzielles Schulprojekt und nicht mit Duolingo verbunden. Duolingo® und Duo the Owl® sind Marken der Duolingo, Inc. Pingulin und die Lernhub-Crew sind eigene Figuren.";

/* ===================== Gesichter (SVG) ===================== */
function humanMouth(){
  return `<g class="mouth">
    <g class="v-X"><path d="M51 84 Q60 90 69 84" stroke="#7c2d12" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <g class="v-M"><path d="M52 86 L68 86" stroke="#7c2d12" stroke-width="3.2" stroke-linecap="round"/></g>
    <g class="v-E"><path d="M49 83 Q60 93 71 83 Q60 87 49 83Z" fill="#7f1d1d"/><path d="M52 84 L68 84 L67 86 L53 86Z" fill="#fff"/></g>
    <g class="v-A"><path d="M51 81 Q60 99 69 81 Q60 84 51 81Z" fill="#7f1d1d"/><ellipse cx="60" cy="91" rx="5" ry="2.6" fill="#fb7185"/></g>
    <g class="v-O"><ellipse cx="60" cy="87" rx="5" ry="6.5" fill="#7f1d1d"/></g></g>`;
}
function humanEyes(){
  return `<g class="eyes"><ellipse cx="46" cy="62" rx="4.5" ry="5.5" fill="#1f2937"/><ellipse cx="74" cy="62" rx="4.5" ry="5.5" fill="#1f2937"/>
    <circle cx="47.5" cy="60" r="1.6" fill="#fff"/><circle cx="75.5" cy="60" r="1.6" fill="#fff"/></g>`;
}
function humanHead(skin, shirt){
  return `<path d="M20 124 Q22 100 60 100 Q98 100 100 124Z" fill="${shirt}"/>
    <rect x="52" y="92" width="16" height="12" fill="${skin}"/>
    <circle cx="24" cy="68" r="7" fill="${skin}"/><circle cx="96" cy="68" r="7" fill="${skin}"/>
    <circle cx="60" cy="66" r="36" fill="${skin}"/>
    <ellipse cx="38" cy="76" rx="6" ry="3.5" fill="#fb7185" opacity=".35"/><ellipse cx="82" cy="76" rx="6" ry="3.5" fill="#fb7185" opacity=".35"/>`;
}
/* Bausteine für Gesichter im Anime-Stil (gleiche Proportionen wie Kira/Elva) */
function animeHead(skin, shade, wide){
  const f=wide ? "M27 60 Q27 28 60 28 Q93 28 93 60 Q93 84 78 96 Q60 104 42 96 Q27 84 27 60Z" : "M28 60 Q28 28 60 28 Q92 28 92 60 Q92 86 75 97 Q60 104 45 97 Q28 86 28 60Z";
  return `<rect x="53" y="88" width="14" height="14" fill="${skin}"/><path d="M53 92 Q60 98 67 92 L67 88 L53 88Z" fill="${shade}"/>
    <ellipse cx="26" cy="67" rx="5" ry="7" fill="${skin}"/><ellipse cx="94" cy="67" rx="5" ry="7" fill="${skin}"/>
    <path d="${f}" fill="${skin}"/>
    <path d="M59.6 71.5 Q61 74.5 59.2 75.6" stroke="${shade}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
}
function animeEyes(o){
  const lid=o.lid
    ? `<path d="M35 59 L57 59 L56 63.4 Q46 61.6 36 64.2Z" fill="${o.skin}"/><path d="M85 59 L63 59 L64 63.4 Q74 61.6 84 64.2Z" fill="${o.skin}"/>
       <path d="M36 64 Q46 61.4 56 63.2 M84 64 Q74 61.4 64 63.2" stroke="${o.lash}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<path d="M35.5 63.6 Q46 57.2 56 62 M84.5 63.6 Q74 57.2 64 62" stroke="${o.lash}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
       <path d="M35.5 63.6 L33 62 M84.5 63.6 L87 62" stroke="${o.lash}" stroke-width="1.5" stroke-linecap="round"/>`;
  return `<g class="eyes">
    <path d="M37 64 Q46 57 55 63 Q46 70.5 37 64Z" fill="#fff"/><path d="M83 64 Q74 57 65 63 Q74 70.5 83 64Z" fill="#fff"/>
    <circle cx="46.5" cy="64.4" r="4.3" fill="${o.iris}"/><circle cx="73.5" cy="64.4" r="4.3" fill="${o.iris}"/>
    <circle cx="46.5" cy="65.7" r="2.6" fill="${o.light}" opacity=".5"/><circle cx="73.5" cy="65.7" r="2.6" fill="${o.light}" opacity=".5"/>
    <circle cx="46.5" cy="64.4" r="2" fill="${o.dark}"/><circle cx="73.5" cy="64.4" r="2" fill="${o.dark}"/>
    <circle cx="48" cy="63" r="1.2" fill="#fff"/><circle cx="75" cy="63" r="1.2" fill="#fff"/>
    ${lid}
    <path d="M40 68.4 Q46 70.4 52 68.2 M68 68.2 Q74 70.4 80 68.4" stroke="${o.under || "#d6b4a0"}" stroke-width=".9" fill="none"/></g>`;
}
function animeMouth(lip, x){
  return `<g class="mouth">
    <g class="v-X">${x || `<path d="M55 85 Q60 86.6 65 85" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`}</g>
    <g class="v-M"><path d="M55.5 85 L64.5 85" stroke="${lip}" stroke-width="2.4" stroke-linecap="round"/></g>
    <g class="v-E"><path d="M54 84 Q60 89.5 66 84 Q60 85.6 54 84Z" fill="#7f1d1d"/><path d="M56 84.5 L64 84.5 L63.4 85.6 L56.6 85.6Z" fill="#fff"/></g>
    <g class="v-A"><path d="M54.5 83 Q60 94.5 65.5 83 Q60 84.6 54.5 83Z" fill="#7f1d1d"/><ellipse cx="60" cy="89.6" rx="3.2" ry="1.8" fill="#fb7185"/></g>
    <g class="v-O"><ellipse cx="60" cy="86.4" rx="3.4" ry="4.5" fill="#7f1d1d"/></g></g>`;
}
const FACES={
  fritz:()=>`
    <ellipse cx="46" cy="121" rx="11" ry="5" fill="#f59e0b"/><ellipse cx="74" cy="121" rx="11" ry="5" fill="#f59e0b"/>
    <g class="flip-l"><ellipse cx="23" cy="80" rx="9" ry="22" transform="rotate(22 23 80)" fill="#1f2a44"/></g>
    <g class="flip-r"><ellipse cx="97" cy="80" rx="9" ry="22" transform="rotate(-22 97 80)" fill="#1f2a44"/></g>
    <ellipse cx="60" cy="70" rx="40" ry="50" fill="#1f2a44"/>
    <ellipse cx="60" cy="88" rx="27" ry="30" fill="#f8fafc"/>
    <path d="M60 40 C46 28 26 36 30 56 C32 68 46 72 60 70 C74 72 88 68 90 56 C94 36 74 28 60 40Z" fill="#f8fafc"/>
    <g class="eyes"><circle cx="47" cy="52" r="6" fill="#111827"/><circle cx="73" cy="52" r="6" fill="#111827"/><circle cx="49" cy="50" r="2" fill="#fff"/><circle cx="75" cy="50" r="2" fill="#fff"/></g>
    <ellipse cx="38" cy="63" rx="5" ry="3" fill="#fb7185" opacity=".55"/><ellipse cx="82" cy="63" rx="5" ry="3" fill="#fb7185" opacity=".55"/>
    <g class="mouth">
      <g class="v-X"><path d="M53 61 Q60 66 67 61 Q60 63 53 61Z" fill="#d97706"/></g>
      <g class="v-M"><path d="M53 61 Q60 66 67 61 Q60 63 53 61Z" fill="#d97706"/></g>
      <g class="v-E"><path d="M53 61 Q60 69 67 61Z" fill="#7f1d1d"/><path d="M54 64 Q60 70 66 64 Q60 67 54 64Z" fill="#d97706"/></g>
      <g class="v-A"><path d="M52 61 Q60 76 68 61Z" fill="#7f1d1d"/><ellipse cx="60" cy="69" rx="4" ry="2.2" fill="#fb7185"/><path d="M54 68 Q60 76 66 68 Q60 72 54 68Z" fill="#d97706"/></g>
      <g class="v-O"><ellipse cx="60" cy="65" rx="4.5" ry="5.5" fill="#7f1d1d"/><path d="M55.5 67 Q60 73 64.5 67 Q60 70 55.5 67Z" fill="#d97706"/></g>
    </g>
    <path d="M51 59 Q60 54 69 59 Q64 64 60 64 Q56 64 51 59Z" fill="#f59e0b"/>
    <path d="M24 69 Q60 85 96 69 L97 79 Q60 95 23 79Z" fill="#16a34a"/>
    <path d="M40 76 L41 84 M54 78 L55 86 M66 78 L65 86 M81 76 L79 84" stroke="#4ade80" stroke-width="3"/>
    <path d="M71 84 L77 110 L88 107 L82 82Z" fill="#15803d"/>
    <path d="M78 109 L77 113 M82 108 L82 112 M86 107 L87 111" stroke="#15803d" stroke-width="2"/>`,
  mia:()=>`<circle cx="60" cy="22" r="14" fill="#7c3aed"/>${humanHead("#f5c7a1","#0ea5e9")}
    <path d="M24 64 Q22 28 60 28 Q98 28 96 64 Q90 44 60 42 Q34 44 24 64Z" fill="#7c3aed"/>
    <circle cx="24" cy="78" r="2.5" fill="#facc15"/><circle cx="96" cy="78" r="2.5" fill="#facc15"/>
    <path d="M40 53 Q46 50 52 53 M68 53 Q74 50 80 53" stroke="#4c1d95" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${humanEyes()}${humanMouth()}`,
  erna:()=>`<circle cx="60" cy="26" r="13" fill="#cbd5e1"/>${humanHead("#f2c8a0","#dc2626")}
    <path d="M24 66 Q20 30 60 30 Q100 30 96 66 Q92 46 76 42 Q60 50 44 42 Q28 46 24 66Z" fill="#e2e8f0"/>
    ${humanEyes()}
    <g fill="none" stroke="#7c2d12" stroke-width="2.5"><circle cx="46" cy="62" r="9"/><circle cx="74" cy="62" r="9"/><path d="M55 62 L65 62"/></g>
    <path d="M40 104 L60 116 L80 104" stroke="#fde68a" stroke-width="3" fill="none"/>
    ${humanMouth()}`,
  kemal:()=>`${humanHead("#b97a4f","#2563eb")}
    <path d="M26 58 Q26 28 60 28 Q94 28 94 58 Q86 40 60 40 Q34 40 26 58Z" fill="#1c1917"/>
    <path d="M28 70 Q30 104 60 104 Q90 104 92 70 Q86 92 60 92 Q34 92 28 70Z" fill="#292524"/>
    <path d="M40 53 Q46 50 52 53 M68 53 Q74 50 80 53" stroke="#1c1917" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${humanEyes()}${humanMouth()}
    <path d="M48 80 Q60 75 72 80 Q60 79 48 80Z" fill="#292524"/>
    <path d="M22 66 Q22 22 60 22 Q98 22 98 66" fill="none" stroke="#334155" stroke-width="5"/>
    <rect x="16" y="58" width="10" height="18" rx="4" fill="#334155"/><rect x="94" y="58" width="10" height="18" rx="4" fill="#334155"/>
    <path d="M21 74 Q26 92 44 92" stroke="#334155" stroke-width="3" fill="none"/><circle cx="45" cy="92" r="3" fill="#0f172a"/>`,
  bit:()=>`<path d="M30 124 Q32 102 60 102 Q88 102 90 124Z" fill="#64748b"/>
    <line x1="60" y1="14" x2="60" y2="28" stroke="#475569" stroke-width="3"/><circle class="ant" cx="60" cy="12" r="5" fill="#ef4444"/>
    <rect x="16" y="54" width="8" height="20" rx="3" fill="#64748b"/><rect x="96" y="54" width="8" height="20" rx="3" fill="#64748b"/>
    <rect x="24" y="28" width="72" height="72" rx="16" fill="#94a3b8"/>
    <circle cx="31" cy="35" r="2" fill="#64748b"/><circle cx="89" cy="35" r="2" fill="#64748b"/><circle cx="31" cy="93" r="2" fill="#64748b"/><circle cx="89" cy="93" r="2" fill="#64748b"/>
    <rect x="32" y="40" width="56" height="24" rx="8" fill="#0f172a"/>
    <g class="eyes"><rect x="41" y="46" width="12" height="12" rx="3" fill="#22d3ee"/><rect x="67" y="46" width="12" height="12" rx="3" fill="#22d3ee"/></g>
    <rect x="40" y="74" width="40" height="16" rx="5" fill="#0f172a"/>
    <g class="mouth" fill="#22d3ee">
      <g class="v-X"><rect x="44" y="81" width="32" height="2" rx="1"/></g>
      <g class="v-M"><rect x="46" y="81" width="28" height="2" rx="1"/></g>
      <g class="v-E"><rect x="44" y="78" width="32" height="8" rx="2"/></g>
      <g class="v-A"><rect x="48" y="76" width="24" height="12" rx="3"/></g>
      <g class="v-O"><rect x="54" y="77" width="12" height="10" rx="5"/></g>
    </g>`,
  kira:()=>`
    <path d="M20 70 Q14 30 60 22 Q106 30 100 70 Q104 98 96 116 L86 104 Q90 86 88 72 L32 72 Q30 86 34 104 L24 116 Q16 98 20 70Z" fill="#9a3412"/>
    <path class="tail" d="M86 30 Q118 22 114 58 Q112 82 100 100 Q108 74 100 56 Q96 44 84 40Z" fill="#c2410c"/>
    <path d="M98 40 Q110 46 106 70 M92 36 Q106 34 108 52" stroke="#9a3412" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M14 127 Q16 103 60 100 Q104 103 106 127Z" fill="#1f2937"/>
    <path d="M44 101 L60 119 L76 101 L70 100 L60 110 L50 100Z" fill="#374151"/>
    <path d="M50 100 L60 112 L70 100Z" fill="#e11d48"/>
    <path d="M84 110 L89 110 L86.5 114 L90 114 L83 121 L85 116 L82 116Z" fill="#facc15"/>
    <rect x="52" y="88" width="16" height="14" fill="#f6d2b5"/>
    <path d="M52 92 Q60 99 68 92 L68 88 L52 88Z" fill="#e2ae8c"/>
    <ellipse cx="25" cy="68" rx="5.5" ry="7" fill="#f6d2b5"/><ellipse cx="95" cy="68" rx="5.5" ry="7" fill="#f6d2b5"/>
    <path d="M26 60 Q26 28 60 28 Q94 28 94 60 Q94 86 76 97 Q60 105 44 97 Q26 86 26 60Z" fill="#f6d2b5"/>
    <ellipse cx="40" cy="77" rx="6.5" ry="3.4" fill="#f43f5e" opacity=".32"/><ellipse cx="80" cy="77" rx="6.5" ry="3.4" fill="#f43f5e" opacity=".32"/>
    <path d="M36 78 L38 75.5 M39.5 78 L41.5 75.5 M43 78 L45 75.5 M77 78 L79 75.5 M80.5 78 L82.5 75.5 M84 78 L86 75.5" stroke="#e11d48" stroke-width="1" opacity=".55" stroke-linecap="round"/>
    <g class="eyes">
      <path d="M37 64 Q46 56.5 55 63 Q46 71 37 64Z" fill="#fff"/><path d="M83 64 Q74 56.5 65 63 Q74 71 83 64Z" fill="#fff"/>
      <circle cx="47" cy="64.2" r="4.3" fill="#15803d"/><circle cx="73" cy="64.2" r="4.3" fill="#15803d"/>
      <circle cx="47" cy="65.4" r="2.6" fill="#4ade80" opacity=".45"/><circle cx="73" cy="65.4" r="2.6" fill="#4ade80" opacity=".45"/>
      <circle cx="47" cy="64.2" r="2.1" fill="#052e16"/><circle cx="73" cy="64.2" r="2.1" fill="#052e16"/>
      <circle cx="48.6" cy="62.6" r="1.3" fill="#fff"/><circle cx="74.6" cy="62.6" r="1.3" fill="#fff"/>
      <path d="M35 62.5 Q46 56 56 61.5 L55 63.6 Q46 59.2 37 64.2Z" fill="#f6d2b5"/><path d="M85 62.5 Q74 56 64 61.5 L65 63.6 Q74 59.2 83 64.2Z" fill="#f6d2b5"/>
      <path d="M35.5 64 Q46 58.6 56 62.4 M84.5 64 Q74 58.6 64 62.4" stroke="#1c1917" stroke-width="2.3" fill="none" stroke-linecap="round"/>
      <path d="M35.5 64 L33 62.4 M84.5 64 L87 62.4" stroke="#1c1917" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M40 67.6 Q46 70 52 67.4 M68 67.4 Q74 70 80 67.6" stroke="#c08a6c" stroke-width="1" fill="none"/>
    </g>
    <path d="M34 52.5 Q44 51.5 54 56.5 L53 59 Q44 55 34.5 55.5Z" fill="#7c2d12"/><path d="M86 52.5 Q76 51.5 66 56.5 L67 59 Q76 55 85.5 55.5Z" fill="#7c2d12"/>
    <path d="M59.5 71 Q61.5 74.5 59 76" stroke="#d39a7a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <g class="mouth">
      <g class="v-X"><path d="M53 86.5 Q57 83.5 60.5 84.5 Q64 85.5 67 83.5" stroke="#9f1239" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
      <g class="v-M"><path d="M53.5 85 Q60 84 66.5 85" stroke="#9f1239" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>
      <g class="v-E"><path d="M52 83 Q60 91 68 83 Q60 85.5 52 83Z" fill="#7f1d1d"/><path d="M54 83.7 L66 83.7 L65 85.4 L55 85.4Z" fill="#fff"/></g>
      <g class="v-A"><path d="M52 81.5 Q60 97 68 81.5 Q60 84 52 81.5Z" fill="#7f1d1d"/><ellipse cx="60" cy="90.5" rx="4.5" ry="2.4" fill="#fb7185"/><path d="M55 82.3 L56.6 85.6 L58.2 82.9Z" fill="#fff"/></g>
      <g class="v-O"><ellipse cx="60" cy="86.5" rx="4.3" ry="5.6" fill="#7f1d1d"/><ellipse cx="60" cy="89.5" rx="2.6" ry="1.6" fill="#fb7185"/></g>
    </g>
    <path d="M26 56 Q20 80 28 101 Q31 86 34 72 Q33 61 31 53Z" fill="#c2410c"/><path d="M94 56 Q100 80 92 101 Q89 86 86 72 Q87 61 89 53Z" fill="#c2410c"/>
    <path d="M24 64 Q20 26 60 24 Q100 26 96 64 Q93 50 87 43 L85 55 L77 39 L71 52 L63 37 L57 51 L49 39 L45 53 L36 43 Q28 51 24 64Z" fill="#c2410c"/>
    <path d="M60 25 Q55 11 67 7 Q60 15 63.5 25Z" fill="#c2410c"/>
    <path d="M49 39 L52 30 M63 37 L62 29 M77 39 L74 30 M36 43 Q33 36 38 31 M28 70 Q27 84 29 94 M92 70 Q93 84 91 94" stroke="#9a3412" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M39 33 Q51 27 64 29" stroke="#fb923c" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M70 30 Q76 31 80 34" stroke="#fdba74" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M82 33 L88.5 33 L85.5 39 L90.5 39 L80 50 L83 41.5 L78.5 41.5Z" fill="#facc15" stroke="#a16207" stroke-width=".8" stroke-linejoin="round"/>
    <g class="anger" stroke="#e11d48" stroke-width="2.3" fill="none" stroke-linecap="round">
      <path d="M17 23 Q21 23 21 19"/><path d="M25 19 Q25 23 29 23"/><path d="M17 27 Q21 27 21 31"/><path d="M25 31 Q25 27 29 27"/>
    </g>`,
  elva:()=>`
    <path d="M22 64 Q16 22 60 19 Q104 22 98 64 Q102 98 100 128 L20 128 Q18 98 22 64Z" fill="#cfd5df"/>
    <path d="M30 90 Q28 108 32 126 M90 90 Q92 108 88 126 M24 80 Q22 100 24 120 M96 80 Q98 100 96 120" stroke="#b4bccb" stroke-width="1.4" fill="none"/>
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#115e59"/>
    <path d="M50 101 L60 113 L70 101Z" fill="#f8fafc"/>
    <path d="M36 103 Q60 118 84 103" stroke="#d4a017" stroke-width="2.4" fill="none"/>
    <path d="M60 109 L61.8 113 L66 113.4 L62.8 116 L63.8 120 L60 117.8 L56.2 120 L57.2 116 L54 113.4 L58.2 113Z" fill="#facc15" stroke="#a16207" stroke-width=".6"/>
    <path d="M28 72 Q22 100 28 128 L40 128 Q34 102 35 78Z" fill="#e5e7eb"/><path d="M92 72 Q98 100 92 128 L80 128 Q86 102 85 78Z" fill="#e5e7eb"/>
    <rect x="53" y="88" width="14" height="14" fill="#f8e1cf"/>
    <path d="M53 92 Q60 98 67 92 L67 88 L53 88Z" fill="#ecc9b1"/>
    <path d="M29 60 L5 46 Q9 60 27 75Z" fill="#f8e1cf"/><path d="M27 63 L12 52 Q16 61 27 70Z" fill="#ecbfa6"/>
    <path d="M91 60 L115 46 Q111 60 93 75Z" fill="#f8e1cf"/><path d="M93 63 L108 52 Q104 61 93 70Z" fill="#ecbfa6"/>
    <path d="M26 74 Q22.5 80 26 84 Q29.5 80 26 74Z" fill="#14b8a6"/><path d="M94 74 Q90.5 80 94 84 Q97.5 80 94 74Z" fill="#14b8a6"/>
    <path d="M28 60 Q28 28 60 28 Q92 28 92 60 Q92 86 75 97 Q60 104 45 97 Q28 86 28 60Z" fill="#f8e1cf"/>
    <ellipse cx="40" cy="76" rx="5.5" ry="2.6" fill="#f9a8d4" opacity=".3"/><ellipse cx="80" cy="76" rx="5.5" ry="2.6" fill="#f9a8d4" opacity=".3"/>
    <g class="eyes">
      <path d="M37 64 Q46 58 55 63 Q46 70 37 64Z" fill="#fff"/><path d="M83 64 Q74 58 65 63 Q74 70 83 64Z" fill="#fff"/>
      <circle cx="46.5" cy="64.6" r="4.4" fill="#7c3aed"/><circle cx="73.5" cy="64.6" r="4.4" fill="#7c3aed"/>
      <circle cx="46.5" cy="66" r="2.7" fill="#c4b5fd" opacity=".5"/><circle cx="73.5" cy="66" r="2.7" fill="#c4b5fd" opacity=".5"/>
      <circle cx="46.5" cy="64.6" r="2" fill="#2e1065"/><circle cx="73.5" cy="64.6" r="2" fill="#2e1065"/>
      <circle cx="48" cy="63.4" r="1.1" fill="#fff"/><circle cx="75" cy="63.4" r="1.1" fill="#fff"/>
      <path d="M35 60 L57 60 L56 63.4 Q46 61.6 36 64.2Z" fill="#f8e1cf"/><path d="M85 60 L63 60 L64 63.4 Q74 61.6 84 64.2Z" fill="#f8e1cf"/>
      <path d="M36 64 Q46 61.4 56 63.2 M84 64 Q74 61.4 64 63.2" stroke="#475569" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <path d="M36 64 L33.5 63 M37.5 63.2 L35.5 61.6 M84 64 L86.5 63 M82.5 63.2 L84.5 61.6" stroke="#475569" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M40 68.4 Q46 70.4 52 68.2 M68 68.2 Q74 70.4 80 68.4" stroke="#d6b4a0" stroke-width=".9" fill="none"/>
    </g>
    <path d="M38 54.5 Q45 52.5 52 54.5 M68 54.5 Q75 52.5 82 54.5" stroke="#aab2c0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M59.6 71.5 Q61 74.5 59.2 75.6" stroke="#e0b49c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <g class="mouth">
      <g class="v-X"><path d="M55 85 Q60 85.8 65 85" stroke="#b45363" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <g class="v-M"><path d="M56 85 L64 85" stroke="#b45363" stroke-width="2.4" stroke-linecap="round"/></g>
      <g class="v-E"><path d="M54 84 Q60 89 66 84 Q60 85.6 54 84Z" fill="#7f1d1d"/><path d="M56 84.5 L64 84.5 L63.4 85.6 L56.6 85.6Z" fill="#fff"/></g>
      <g class="v-A"><path d="M55 83 Q60 93.5 65 83 Q60 84.6 55 83Z" fill="#7f1d1d"/><ellipse cx="60" cy="89.4" rx="3" ry="1.7" fill="#fb7185"/></g>
      <g class="v-O"><ellipse cx="60" cy="86" rx="3.2" ry="4.3" fill="#7f1d1d"/></g>
    </g>
    <path d="M29 52 Q24 74 30 98 Q33 80 35.5 64Z" fill="#e5e7eb"/><path d="M91 52 Q96 74 90 98 Q87 80 84.5 64Z" fill="#e5e7eb"/>
    <path d="M26 64 Q22 24 60 22 Q98 24 94 64 Q92 46 82 38 Q74 45 66 41 L60 29 L54 41 Q46 45 38 38 Q28 46 26 64Z" fill="#e5e7eb"/>
    <path d="M60 23 L60 29 M44 29 Q40 34 38 38 M76 29 Q80 34 82 38 M31 56 Q29 72 31 88 M89 56 Q91 72 89 88" stroke="#c3c9d4" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M40 30 Q48 26 56 27 M66 27 Q74 27 80 30" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M79 33 A6.5 6.5 0 1 0 87 42 A5 5 0 1 1 79 33Z" fill="#facc15" stroke="#a16207" stroke-width=".6"/>
    <path class="spark" d="M104 12 L105.8 18.2 L112 20 L105.8 21.8 L104 28 L102.2 21.8 L96 20 L102.2 18.2Z" fill="#a78bfa"/>
    <path class="spark" d="M14 22 L15 25 L18 26 L15 27 L14 30 L13 27 L10 26 L13 25Z" fill="#5eead4"/>`,
  fiete:()=>`
    <path d="M84 112 Q110 116 112 94 Q118 104 115 112 Q108 126 84 120Z" fill="#0ea5e9"/>
    <path d="M110 96 L117 92 L114 100Z" fill="#0284c7"/>
    <g class="flip-l"><path d="M30 92 Q6 78 3 100 Q11 95 13 106 Q19 99 26 108Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/></g>
    <g class="flip-r"><path d="M90 92 Q114 78 117 100 Q109 95 107 106 Q101 99 94 108Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/></g>
    <ellipse cx="60" cy="108" rx="31" ry="21" fill="#38bdf8"/>
    <ellipse cx="60" cy="112" rx="19" ry="15" fill="#e0f2fe"/>
    <path d="M46 106 Q60 110 74 106 M44 114 Q60 118 76 114" stroke="#bae6fd" stroke-width="1.6" fill="none"/>
    <g transform="rotate(-8 60 116)"><rect x="47" y="106" width="26" height="19" rx="2" fill="#fff" stroke="#94a3b8" stroke-width="1"/>
      <path d="M51 111 L69 111 M51 115 L66 115 M51 119 L62 119" stroke="#cbd5e1" stroke-width="1.2"/><rect x="47" y="106" width="3" height="19" fill="#f59e0b"/></g>
    <ellipse cx="42" cy="118" rx="7" ry="5.5" fill="#38bdf8"/><ellipse cx="78" cy="118" rx="7" ry="5.5" fill="#38bdf8"/>
    <path d="M36 33 Q29 17 40 12 Q38 23 45 29Z" fill="#fde68a" stroke="#d97706" stroke-width="1"/>
    <path d="M84 33 Q91 17 80 12 Q82 23 75 29Z" fill="#fde68a" stroke="#d97706" stroke-width="1"/>
    <path d="M53 30 L57 20 L61 29Z M61 29 L66 21 L68 31Z" fill="#0284c7"/>
    <ellipse cx="60" cy="62" rx="38" ry="34" fill="#38bdf8"/>
    <ellipse cx="48" cy="40" rx="12" ry="5" fill="#7dd3fc" opacity=".7" transform="rotate(-15 48 40)"/>
    <ellipse cx="60" cy="82" rx="21" ry="13" fill="#bae6fd"/>
    <ellipse cx="53.5" cy="76" rx="1.8" ry="1.2" fill="#0369a1"/><ellipse cx="66.5" cy="76" rx="1.8" ry="1.2" fill="#0369a1"/>
    <ellipse cx="30" cy="74" rx="6" ry="3.5" fill="#f472b6" opacity=".45"/><ellipse cx="90" cy="74" rx="6" ry="3.5" fill="#f472b6" opacity=".45"/>
    <g class="eyes">
      <ellipse cx="44" cy="58" rx="10" ry="11" fill="#fff"/><ellipse cx="76" cy="57" rx="10" ry="11" fill="#fff"/>
      <circle cx="45" cy="60" r="7" fill="#1d4ed8"/><circle cx="77" cy="59" r="7" fill="#1d4ed8"/>
      <circle cx="45" cy="60.5" r="4" fill="#0f172a"/><circle cx="77" cy="59.5" r="4" fill="#0f172a"/>
      <circle cx="48" cy="56.5" r="2.6" fill="#fff"/><circle cx="80" cy="55.5" r="2.6" fill="#fff"/>
      <circle cx="42.5" cy="63" r="1.2" fill="#fff"/><circle cx="74.5" cy="62" r="1.2" fill="#fff"/>
    </g>
    <g fill="none" stroke="#78350f" stroke-width="2"><circle cx="44" cy="58" r="13"/><circle cx="76" cy="56.5" r="13"/><path d="M57 57.5 Q60 54.5 63 56.5"/><path d="M31 57 L23 54 M89 55.5 L97 52"/></g>
    <path d="M34 41 Q42 37 50 40.5 M70 37 Q78 31 86 36" stroke="#0369a1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g class="mouth">
      <g class="v-X"><path d="M53 85 Q60 90.5 67 85" stroke="#075985" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M56.6 86.8 L57.8 89.4 L59.2 87.6Z" fill="#fff"/></g>
      <g class="v-M"><path d="M54 86 Q60 87.6 66 86" stroke="#075985" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
      <g class="v-E"><path d="M52 84 Q60 92 68 84 Q60 86 52 84Z" fill="#0c4a6e"/><path d="M54.5 84.8 L65.5 84.8 L64.6 86.4 L55.4 86.4Z" fill="#fff"/></g>
      <g class="v-A"><path d="M52 83 Q60 99 68 83 Q60 86 52 83Z" fill="#0c4a6e"/><ellipse cx="60" cy="92" rx="4.6" ry="2.4" fill="#fb7185"/><path d="M55 84.2 L56.4 87.4 L57.8 84.8Z" fill="#fff"/></g>
      <g class="v-O"><ellipse cx="60" cy="88" rx="5" ry="6" fill="#0c4a6e"/><ellipse cx="60" cy="91.5" rx="3" ry="1.6" fill="#fb7185"/></g>
    </g>
    <text class="qmark" x="98" y="30" font-size="22" font-weight="900" font-family="system-ui,sans-serif" fill="#f59e0b" stroke="#b45309" stroke-width=".8">?</text>`,
  fenna:()=>`
    <path d="M22 64 Q16 22 60 19 Q104 22 98 64 L101 128 L19 128Z" fill="#6d28d9"/>
    <path d="M30 80 L28 126 M90 80 L92 126 M24 92 L22 124 M96 92 L98 124" stroke="#5b21b6" stroke-width="1.4"/>
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#1c1917"/>
    <path d="M44 100 Q60 114 76 100 L74 107 Q60 120 46 107Z" fill="#f8fafc"/>
    <path d="M56.5 108 L63.5 108 L60 115Z" fill="#a855f7"/>
    ${animeHead("#f8dcc8","#e8bea4")}
    <ellipse cx="40" cy="76" rx="5.5" ry="2.6" fill="#f9a8d4" opacity=".35"/><ellipse cx="80" cy="76" rx="5.5" ry="2.6" fill="#f9a8d4" opacity=".35"/>
    ${animeEyes({iris:"#8b5cf6", light:"#ddd6fe", dark:"#2e1065", lash:"#3b0764", skin:"#f8dcc8", lid:true})}
    <path d="M38 55.5 Q45 54 52 56.5 M68 56.5 Q75 54 82 55.5" stroke="#5b21b6" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${animeMouth("#b45363")}
    <path d="M29 50 Q23 78 29 106 L36 104 Q32 80 35 52Z" fill="#7c3aed"/><path d="M91 50 Q97 78 91 106 L84 104 Q88 80 85 52Z" fill="#7c3aed"/>
    <path d="M26 66 Q20 22 60 21 Q100 22 94 66 Q92 56 89 50 L31 50 Q28 56 26 66Z" fill="#7c3aed"/>
    <path d="M40 50 L40 45 M50 50 L50 44 M60 50 L60 44 M70 50 L70 44 M80 50 L80 45" stroke="#6d28d9" stroke-width="1.2"/>
    <path d="M38 30 Q50 25 62 26" stroke="#a78bfa" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M88 40 L97 35 L95 44Z M88 40 L97 46 L90 49Z" fill="#f5f3ff" stroke="#a78bfa" stroke-width=".7" stroke-linejoin="round"/>
    <path class="spark" d="M106 14 L107.6 19.4 L113 21 L107.6 22.6 L106 28 L104.4 22.6 L99 21 L104.4 19.4Z" fill="#c4b5fd"/>`,
  lupa:()=>`
    <path d="M20 66 Q14 26 60 24 Q106 26 100 66 Q104 96 94 120 L86 106 Q90 88 88 74 L32 74 Q30 88 34 106 L26 120 Q16 96 20 66Z" fill="#e5e7eb"/>
    <path d="M24 100 Q24 112 26 120 M96 100 Q96 112 94 120" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#111827"/>
    <path d="M44 104 L46 116 M76 104 L74 116" stroke="#4b5563" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="52" y="86" width="16" height="12" fill="#d1d5db"/>
    <rect x="49" y="93" width="22" height="5" rx="2" fill="#0f172a"/>
    <path d="M52.5 98 L54 102.5 L55.5 98Z M58.5 98 L60 103 L61.5 98Z M64.5 98 L66 102.5 L67.5 98Z" fill="#e5e7eb"/>
    <path d="M31 46 L20 4 L54 30Z" fill="#d1d5db"/><path d="M34 40 L25 13 L47 31Z" fill="#4b5563"/>
    <path d="M89 46 L100 4 L66 30Z" fill="#d1d5db"/><path d="M86 40 L95 13 L73 31Z" fill="#4b5563"/>
    <path d="M20 4 L23.5 17 L28 11Z M100 4 L96.5 17 L92 11Z" fill="#6b7280"/>
    <path d="M28 60 Q28 28 60 28 Q92 28 92 60 Q94 80 86 88 L91 93 L80 92 Q70 100 60 100 Q50 100 40 92 L29 93 L34 88 Q26 80 28 60Z" fill="#d1d5db"/>
    <ellipse cx="60" cy="81" rx="15" ry="11" fill="#f3f4f6"/>
    ${animeEyes({iris:"#dc2626", light:"#fca5a5", dark:"#450a0a", lash:"#111827", skin:"#d1d5db", lid:true, under:"#9ca3af"})}
    <path d="M38 55 Q45 54 52 55.5 M68 55.5 Q75 54 82 55" stroke="#6b7280" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M54.5 72 Q60 69.5 65.5 72 Q63 76.5 60 76.5 Q57 76.5 54.5 72Z" fill="#111827"/><circle cx="57.6" cy="71.6" r="1" fill="#6b7280"/>
    <path d="M60 76.5 L60 80" stroke="#6b7280" stroke-width="1"/>
    ${animeMouth("#374151", `<path d="M55 85.5 Q60 84.5 65 85.5" stroke="#374151" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M62.4 85.6 L63.4 88.2 L64.4 85.4Z" fill="#fff"/>`)}
    <path d="M28 60 Q26 30 60 28 Q94 30 92 60 Q88 46 80 42 L78 53 L70 40 L65 51 L58 38 L53 51 L46 40 L42 53 L38 44 Q31 48 28 60Z" fill="#f9fafb"/>
    <path d="M42 53 L40.5 46 M53 51 L52 44 M65 51 L66 44 M78 53 L79.5 46" stroke="#d1d5db" stroke-width="1.2"/>
    <rect x="88" y="100" width="14" height="22" rx="3" fill="#1f2937"/><rect x="90" y="103" width="10" height="15" rx="1.5" fill="#a5b4fc"/>
    <path d="M91.5 106 L98.5 106 M91.5 109 L96.5 109 M91.5 112 L97.5 112" stroke="#eef2ff" stroke-width="1"/>
    <ellipse cx="95" cy="121" rx="8.5" ry="5.5" fill="#d1d5db"/>`,
  kaito:()=>`
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#0f172a"/>
    <path d="M38 94 L42 114 L60 106 L78 114 L82 94 Q60 104 38 94Z" fill="#1e293b"/>
    <path d="M60 106 L60 128" stroke="#334155" stroke-width="1.5"/><circle cx="60" cy="114" r="2" fill="#facc15"/>
    ${animeHead("#f6d2b5","#e2ae8c",true)}
    ${animeEyes({iris:"#38bdf8", light:"#e0f2fe", dark:"#0c4a6e", lash:"#94a3b8", skin:"#f6d2b5", under:"#e2ae8c"})}
    <path d="M37.5 70.5 L28 66 M82.5 70.5 L92 66" stroke="#0f172a" stroke-width="1.4"/>
    <circle cx="45" cy="72.5" r="7.2" fill="#0f172a"/><circle cx="75" cy="72.5" r="7.2" fill="#0f172a"/>
    <path d="M52.2 71 Q60 68 67.8 71" stroke="#0f172a" stroke-width="1.6" fill="none"/>
    <path d="M40.5 69.5 Q42.5 67.4 45.5 67.2 M70.5 69.5 Q72.5 67.4 75.5 67.2" stroke="#475569" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M38 54 Q45 51.5 52 54 M68 54 Q75 51.5 82 54" stroke="#e2e8f0" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${animeMouth("#9a3412", `<path d="M55 85.6 Q61 86.6 66 83.4" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>`)}
    <path d="M25 64 Q20 40 30 30 L22 14 L40 21 L40 4 L53 17 L62 0 L68 17 L81 5 L81 21 L98 14 L90 30 Q100 40 95 64 Q92 50 84 44 L80 52 L74 42 L67 50 L60 40 L53 50 L46 42 L40 52 L36 44 Q28 50 25 64Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M40 21 L46 34 M53 17 L56 32 M68 17 L66 32 M81 21 L76 34" stroke="#e2e8f0" stroke-width="1.3" fill="none"/>
    <path class="spark" d="M106 30 L107.6 35.4 L113 37 L107.6 38.6 L106 44 L104.4 38.6 L99 37 L104.4 35.4Z" fill="#38bdf8"/>
    <path class="spark" d="M12 38 L13 41 L16 42 L13 43 L12 46 L11 43 L8 42 L11 41Z" fill="#a78bfa"/>`,
  erik:()=>`
    <path d="M22 66 Q16 24 60 21 Q104 24 98 66 Q100 86 94 98 L26 98 Q20 86 22 66Z" fill="#4a2c17"/>
    <path d="M10 128 Q8 96 24 84 Q30 104 60 104 Q90 104 96 84 Q112 96 110 128Z" fill="#166534"/>
    <path d="M20 92 Q26 100 36 102 M100 92 Q94 100 84 102" stroke="#14532d" stroke-width="1.5" fill="none"/>
    <path d="M32 106 Q60 116 88 106 L86 128 L34 128Z" fill="#92400e"/>
    <path d="M50 102 L60 120 L70 102Z" fill="#f1f5f9"/>
    <path d="M42 107 L47 128 M78 107 L73 128" stroke="#3f2a1a" stroke-width="2.4"/>
    ${animeHead("#efc3a0","#d9a07c",true)}
    ${animeEyes({iris:"#16a34a", light:"#86efac", dark:"#052e16", lash:"#1c1917", skin:"#efc3a0", under:"#c98f6e"})}
    <path d="M36 55 Q45 54.5 54 59.5 M84 55 Q75 54.5 66 59.5" stroke="#3b2416" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M56.5 58 L58 60.5 M63.5 58 L62 60.5" stroke="#c98f6e" stroke-width="1" stroke-linecap="round"/>
    ${animeMouth("#9a3412", `<path d="M54.5 86 Q60 84.4 65.5 86" stroke="#9a3412" stroke-width="2.2" fill="none" stroke-linecap="round"/>`)}
    <path d="M27 58 Q24 78 28 92 L33 84 Q31 70 33 58Z" fill="#5b3a24"/><path d="M93 58 Q96 78 92 92 L87 84 Q89 70 87 58Z" fill="#5b3a24"/>
    <path d="M26 64 Q22 26 60 24 Q98 26 94 64 Q92 50 86 44 L84 54 L77 41 L71 53 L63 38 L57 52 L49 40 L44 54 L36 45 Q29 51 26 64Z" fill="#5b3a24"/>
    <path d="M40 31 Q52 26 64 28" stroke="#7c5236" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  zeus:()=>`
    <path d="M18 72 Q12 22 60 18 Q108 22 102 72 Q106 92 96 104 L24 104 Q14 92 18 72Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#f8fafc"/>
    <path d="M24 106 Q50 110 88 128 L66 128 Q44 116 20 114Z" fill="#1d4ed8"/>
    <circle cx="28" cy="110" r="4" fill="#facc15" stroke="#a16207" stroke-width=".8"/>
    ${animeHead("#e8b48f","#c98f6e",true)}
    ${animeEyes({iris:"#0ea5e9", light:"#bae6fd", dark:"#082f49", lash:"#334155", skin:"#e8b48f", under:"#c98f6e"})}
    <path d="M33 55 Q44 48 55 57 M87 55 Q76 48 65 57" stroke="#f8fafc" stroke-width="4.2" fill="none" stroke-linecap="round"/>
    <path d="M27 66 Q24 112 60 124 Q96 112 93 66 Q90 90 76 92 Q60 86 44 92 Q30 90 27 66Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M40 100 Q44 110 50 114 M60 104 L60 118 M80 100 Q76 110 70 114" stroke="#cbd5e1" stroke-width="1.2" fill="none"/>
    ${animeMouth("#7c2d12")}
    <path d="M42 84 Q50 76 60 80 Q70 76 78 84 Q70 82 60 83 Q50 82 42 84Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width=".8"/>
    <path d="M26 60 Q24 30 60 28 Q96 30 94 60 Q90 46 78 44 Q70 48 60 42 Q50 48 42 44 Q30 46 26 60Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M28 44 Q60 26 92 44" stroke="#a16207" stroke-width="1.6" fill="none"/>
    ${[[31,42.4,-27],[38,39.3,-21],[46,36.7,-14],[54,35.3,-6],[66,35.3,6],[74,36.7,14],[82,39.3,21],[89,42.4,27]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="4.6" ry="2.2" transform="rotate(${r} ${x} ${y})" fill="#facc15" stroke="#a16207" stroke-width=".6"/>`).join("")}
    <path class="bolt" d="M102 2 L114 2 L106 18 L115 18 L96 44 L101 25 L93 25Z" fill="#facc15" stroke="#a16207" stroke-width="1" stroke-linejoin="round"/>`,
  jesus:()=>`
    <circle cx="60" cy="58" r="52" fill="#fde68a" opacity=".35"/>
    <path d="M22 66 Q16 22 60 20 Q104 22 98 66 Q100 92 92 108 L28 108 Q20 92 22 66Z" fill="#5c3a21"/>
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#f5f0e6"/>
    <path d="M12 128 Q14 106 40 101 Q52 116 46 128Z" fill="#9f1239"/>
    <path d="M52 102 L60 112 L68 102" stroke="#d6cfc0" stroke-width="1.5" fill="none"/>
    ${animeHead("#c8916b","#a8724f",true)}
    ${animeEyes({iris:"#78350f", light:"#d97706", dark:"#1c0a00", lash:"#2b1a10", skin:"#c8916b", lid:true, under:"#a8724f"})}
    <path d="M37 55.5 Q45 53 53 55.5 M67 55.5 Q75 53 83 55.5" stroke="#3f2414" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M29 70 Q30 100 60 106 Q90 100 91 70 Q88 92 74 94 Q60 90 46 94 Q32 92 29 70Z" fill="#4a2e1d"/>
    ${animeMouth("#7c2d12", `<path d="M54.5 85.4 Q60 88.6 65.5 85.4" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>`)}
    <path d="M46 83 Q53 79 60 81 Q67 79 74 83 Q67 82 60 83.4 Q53 82 46 83Z" fill="#4a2e1d"/>
    <path d="M28 52 Q22 80 30 104 L36 100 Q30 78 34 56Z" fill="#5c3a21"/><path d="M92 52 Q98 80 90 104 L84 100 Q90 78 86 56Z" fill="#5c3a21"/>
    <path d="M27 62 Q24 26 60 25 Q96 26 93 62 Q90 42 68 36 Q62 34 60 38 Q58 34 52 36 Q30 42 27 62Z" fill="#5c3a21"/>
    <path d="M44 32 Q52 29 58 33 M62 33 Q68 29 76 32" stroke="#7a4f30" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  gott:()=>`
    <g class="rays">${Array.from({length:12},(_,i)=>{ const a=i*Math.PI/6, r2=i%2 ? 54 : 60, p=(r)=>`${(60+Math.cos(a)*r).toFixed(1)} ${(62+Math.sin(a)*r).toFixed(1)}`;
      return `<path d="M${p(42)} L${p(r2)}" stroke="#fbbf24" stroke-width="${i%2 ? 3 : 4.5}" stroke-linecap="round"/>`; }).join("")}</g>
    <circle cx="60" cy="62" r="40" fill="#fde68a"/>
    <circle cx="60" cy="62" r="33" fill="#fef3c7"/>
    <circle cx="60" cy="62" r="25" fill="#fffbeb"/>
    <ellipse cx="46" cy="40" rx="10" ry="4.5" fill="#fff" opacity=".75" transform="rotate(-28 46 40)"/>
    <ellipse cx="40" cy="68" rx="5" ry="2.8" fill="#fdba74" opacity=".45"/><ellipse cx="80" cy="68" rx="5" ry="2.8" fill="#fdba74" opacity=".45"/>
    <g class="eyes"><ellipse cx="48" cy="57" rx="3.6" ry="4.6" fill="#b45309"/><ellipse cx="72" cy="57" rx="3.6" ry="4.6" fill="#b45309"/>
      <circle cx="49.2" cy="55.4" r="1.3" fill="#fff"/><circle cx="73.2" cy="55.4" r="1.3" fill="#fff"/></g>
    <g class="mouth">
      <g class="v-X"><path d="M52 75 Q60 81 68 75" stroke="#d97706" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
      <g class="v-M"><path d="M53 76.5 L67 76.5" stroke="#d97706" stroke-width="2.6" stroke-linecap="round"/></g>
      <g class="v-E"><path d="M51 74 Q60 83 69 74 Q60 76.5 51 74Z" fill="#f59e0b"/></g>
      <g class="v-A"><path d="M52 73 Q60 89 68 73 Q60 76 52 73Z" fill="#f59e0b"/><ellipse cx="60" cy="80" rx="3.6" ry="2" fill="#fff7ed"/></g>
      <g class="v-O"><ellipse cx="60" cy="77" rx="4" ry="5.2" fill="#f59e0b"/><ellipse cx="60" cy="77" rx="2" ry="2.8" fill="#fff7ed"/></g>
    </g>
    <g fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"><circle cx="28" cy="118" r="10"/><circle cx="44" cy="113" r="12"/><circle cx="60" cy="118" r="11"/><circle cx="76" cy="113" r="12"/><circle cx="92" cy="118" r="10"/></g>
    <path class="spark" d="M104 16 L105.6 21.4 L111 23 L105.6 24.6 L104 30 L102.4 24.6 L97 23 L102.4 21.4Z" fill="#fff"/>`,
  stahl:()=>`
    <path d="M12 128 Q14 104 60 100 Q106 104 108 128Z" fill="#334155"/>
    <path d="M48 101 Q60 108 72 101" stroke="#1e293b" stroke-width="2" fill="none"/>
    <circle cx="60" cy="117" r="8" fill="#1e293b"/><circle class="glow" cx="60" cy="117" r="6" fill="#67e8f9"/><circle cx="60" cy="117" r="2.6" fill="#ecfeff"/>
    <circle cx="60" cy="117" r="6" fill="none" stroke="#0e7490" stroke-width=".8" stroke-dasharray="2 1.5"/>
    ${animeHead("#e9b994","#c98f6e",true)}
    ${animeEyes({iris:"#78350f", light:"#f59e0b", dark:"#1c0a00", lash:"#1c1917", skin:"#e9b994", under:"#c98f6e"})}
    <path d="M37 56 Q45 52.5 53 56 M67 54.5 Q75 50.5 83 53.5" stroke="#1c1917" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M52 90 Q60 95 68 90 L67 97 Q60 103 53 97Z" fill="#292524"/>
    ${animeMouth("#7c2d12", `<path d="M54.5 85.6 Q60.5 86.8 66 83.6" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>`)}
    <path d="M50 82.5 Q55 79.5 60 81 Q65 79.5 70 82.5 L69 83.6 Q64 82 60 82.8 Q56 82 51 83.6Z" fill="#292524"/>
    <path d="M26 58 L29.5 76 L31.5 76 L31 58Z M94 58 L90.5 76 L88.5 76 L89 58Z" fill="#1c1917"/>
    <path d="M26 62 Q22 26 60 24 Q98 26 94 62 Q93 46 86 40 Q76 44 66 38 Q56 42 46 38 Q34 42 26 62Z" fill="#1c1917"/>
    <path d="M40 30 Q60 17 86 31 Q70 27 58 32Z" fill="#292524"/>
    <g transform="rotate(-6 60 32)"><rect x="38" y="28" width="18" height="9" rx="4" fill="#b91c1c" opacity=".92"/><rect x="64" y="28" width="18" height="9" rx="4" fill="#b91c1c" opacity=".92"/>
      <path d="M56 31 L64 31" stroke="#facc15" stroke-width="1.5"/><path d="M41 30 L46 30" stroke="#fecaca" stroke-width="1.2" stroke-linecap="round"/></g>`
};
/* Liefert das sprechende SVG einer Figur (Crew oder eigener Charakter mit gewähltem Gesicht) */
function faceSVG(c){
  const f=FACES[c && c.face] || FACES.fritz;
  return `<svg class="talker" data-talk="${esc(c && c.id || "fritz")}" data-m="X" viewBox="0 0 120 128" aria-hidden="true">${f()}</svg>`;
}

/* ===================== Stimmen ===================== */
const VOICE_F=/(katja|hedda|amala|seraphina|anna|petra|marlene|vicki|helena|zira|aria|jenny|samantha|libby|sonia|karen|moira|tessa|susan|hazel|female|frau|google deutsch|google us english)/i;
const VOICE_M=/(conrad|stefan|killian|florian|hans|markus|yannick|david|mark|guy|ryan|daniel|alex|george|james|thomas|\bmale\b|mann)/i;
function voiceList(lang){
  if(!("speechSynthesis" in window)) return [];
  const L=String(lang||"de").toLowerCase().slice(0,2);
  return speechSynthesis.getVoices().filter(v=>(v.lang||"").toLowerCase().startsWith(L));
}
function charVoice(c, lang){
  const pool=voiceList(lang); if(!pool.length) return null;
  if(c && c.voiceName){ const v=pool.find(x=>x.name===c.voiceName); if(v) return v; }
  let pref=pool;
  if(c && c.sex==="f") pref=pool.filter(v=>VOICE_F.test(v.name) && !/\bmale\b/i.test(v.name));
  else if(c && c.sex==="m") pref=pool.filter(v=>VOICE_M.test(v.name) && !/female/i.test(v.name));
  if(!pref.length) pref=pool;
  return pref[((c && c.vIdx) || 0) % pref.length];
}

/* ===================== Lippensynchronisation ===================== */
const TALK={id:"", text:"", t0:0, cps:14, off:0, timer:null, end:0, silent:false};
function visemeOf(ch){
  ch=String(ch||" ").toLowerCase();
  if("aä".includes(ch)) return "A";
  if("oöuü".includes(ch)) return "O";
  if("eiy".includes(ch)) return "E";
  if("mbp".includes(ch)) return "M";
  if("fvwszßtdnlrkgjc".includes(ch)) return "E";
  return "X";
}
function talkEls(id){ return document.querySelectorAll('.talker[data-talk="'+String(id).replace(/["\\]/g,"")+'"]'); }
function talkSet(m){ talkEls(TALK.id).forEach(el=>{ el.setAttribute("data-m", m); el.classList.add("talking"); }); }
function talkStart(id, text, rate, silent){
  talkStop();
  TALK.id=id; TALK.text=String(text||""); TALK.t0=performance.now(); TALK.cps=14*(rate||1); TALK.off=0; TALK.silent=!!silent;
  TALK.end=TALK.t0 + TALK.text.length/TALK.cps*1000 + 250;
  TALK.timer=setInterval(talkTick, 75); talkTick();
}
function talkTick(){
  const now=performance.now();
  if(TALK.silent && now>TALK.end) return talkStop();
  const i=Math.floor((now-TALK.t0)/1000*TALK.cps)+TALK.off;
  if(i>=TALK.text.length){ if(TALK.silent) return talkStop(); return talkSet("X"); }
  talkSet(visemeOf(TALK.text[Math.max(0,i)]));
}
function talkSync(charIndex){ TALK.off=charIndex-Math.floor((performance.now()-TALK.t0)/1000*TALK.cps); }
function talkStop(){
  clearInterval(TALK.timer); TALK.timer=null;
  if(TALK.id) talkEls(TALK.id).forEach(el=>{ el.setAttribute("data-m","X"); el.classList.remove("talking"); });
  TALK.id="";
}
/* Nur Mundbewegung, ohne Ton (z. B. wenn eine Sprechblase erscheint) */
function talkAnim(id, text){ talkStart(id, String(text||"").slice(0,220), 1.15, true); }
/* ===================== Neural-Stimmen (edge-tts über die Bridge) ===================== */
var TTS_ON=false;
let TTS_AUDIO=null, TTS_SEQ=0, TTS_AC=null;
const EDGE_DE={f:["de-DE-KatjaNeural","de-DE-SeraphinaMultilingualNeural","de-DE-AmalaNeural","de-CH-LeniNeural","de-AT-IngridNeural"],
               m:["de-DE-ConradNeural","de-DE-KillianNeural","de-DE-FlorianMultilingualNeural","de-CH-JanNeural","de-AT-JonasNeural"]};
const EDGE_LANG={en:{f:"en-US-AvaNeural",m:"en-US-AndrewNeural"}, es:{f:"es-ES-ElviraNeural",m:"es-ES-AlvaroNeural"},
                 fr:{f:"fr-FR-DeniseNeural",m:"fr-FR-HenriNeural"}, tr:{f:"tr-TR-EmelNeural",m:"tr-TR-AhmetNeural"}};
function ttsReady(){ return TTS_ON && S.agent && S.agent.connected && (typeof agentAllowed!=="function" || agentAllowed()); }
function edgeVoice(c, lang){
  const L=String(lang||"de").slice(0,2).toLowerCase(), sex=c && c.sex==="f" ? "f" : "m";
  const off=(x,k,lo,hi)=>{ const n=Math.max(lo,Math.min(hi,Math.round(((+x||1)-1)*k))); return (n<0?"":"+")+n; };
  const base=c && castById(c.id);
  let voice;
  if(L==="de") voice=(c && c.tts) || (base && base.tts) || EDGE_DE[sex][((c && c.vIdx) || 0) % EDGE_DE[sex].length];
  else if(EDGE_LANG[L]) voice=EDGE_LANG[L][sex];
  else return null;
  return {voice, rate:off(c && c.voiceRate,100,-50,50)+"%", pitch:off(c && c.voicePitch,60,-40,40)+"Hz"};
}
function ttsStop(){
  if(TTS_AUDIO){ try{ TTS_AUDIO.pause(); }catch(e){} TTS_AUDIO=null; }
  if("speechSynthesis" in window) speechSynthesis.cancel();
  talkStop(); loadOff("tts"); ttsDone();
}
/* Wer auf das Ende einer Sprachausgabe wartet (z. B. die Lernrunde), wird hier benachrichtigt */
let TTS_WAITERS=[];
function ttsDone(){ const w=TTS_WAITERS; TTS_WAITERS=[]; w.forEach(f=>{ try{ f(); }catch(e){} }); }
function sayWait(c, text, lang, maxMs){
  return new Promise(res=>{ const h=setTimeout(res, maxMs || 30000+String(text||"").length*150); sayAs(c, text, lang, ()=>{ clearTimeout(h); res(); }); });
}
/* Lade-Anzeige oben in der Mitte (+ pulsierende Figur), z. B. während Stimme oder KI-Antwort erzeugt werden */
const LOADS={};
function loadOn(key, text, charId, delay){
  loadOff(key);
  const it={text, charId, show:!delay};
  if(delay) it.timer=setTimeout(()=>{ it.show=true; loadPaint(); }, delay);
  LOADS[key]=it; loadPaint();
}
function loadOff(key){ const it=LOADS[key]; if(!it) return; clearTimeout(it.timer); delete LOADS[key]; loadPaint(); }
function loadPaint(){
  let el=document.getElementById("loadpill");
  if(!el){ if(!document.body) return; el=document.createElement("div"); el.id="loadpill"; el.setAttribute("role","status"); el.setAttribute("aria-live","polite"); document.body.appendChild(el); }
  const vis=Object.values(LOADS).filter(x=>x.show);
  el.innerHTML=vis.map(x=>`<div><span class="spin" aria-hidden="true"></span>${esc(x.text)}</div>`).join("");
  el.classList.toggle("show", vis.length>0);
  document.querySelectorAll(".talker.waiting").forEach(t=>t.classList.remove("waiting"));
  vis.forEach(x=>{ if(x.charId) talkEls(x.charId).forEach(t=>t.classList.add("waiting")); });
}
/* Mund folgt der echten Lautstärke; die Mundform kommt aus dem Buchstaben an der aktuellen Stelle */
function ttsLip(c, text, a){
  talkStop(); TALK.id=c.id; TALK.silent=false;
  let an=null, buf=null;
  try{
    TTS_AC=TTS_AC || new (window.AudioContext||window.webkitAudioContext)();
    /* Ein angehaltener AudioContext würde die Stimme stummschalten – dann ohne Analyser abspielen */
    if(TTS_AC.state!=="running"){ TTS_AC.resume(); throw new Error("ac"); }
    const src=TTS_AC.createMediaElementSource(a); an=TTS_AC.createAnalyser(); an.fftSize=512;
    src.connect(an); an.connect(TTS_AC.destination); buf=new Uint8Array(an.fftSize);
  }catch(e){ an=null; }
  TALK.timer=setInterval(()=>{
    if(a.paused || a.ended) return;
    const i=a.duration ? Math.floor(a.currentTime/a.duration*text.length) : 0;
    let m=visemeOf(text[Math.min(i,text.length-1)]);
    if(an){
      an.getByteTimeDomainData(buf); let s=0; for(let k=0;k<buf.length;k++){ const d=(buf[k]-128)/128; s+=d*d; }
      const rms=Math.sqrt(s/buf.length);
      if(rms<0.02) m="X"; else if(m==="X") m=rms>0.1 ? "A" : "E";
    }
    talkSet(m);
  }, 60);
}
async function sayEdge(c, text, lang){
  const spec=edgeVoice(c, lang); if(!spec) return saySystem(c, text, lang);
  const seq=++TTS_SEQ;
  try{
    loadOn("tts", `🔊 Stimme von ${c.name||"der Figur"} wird geladen …`, c.id, 500);
    if(!window.LERNHUB_TOKEN && typeof loadToken==="function") await loadToken();
    const post=()=>{ const ctl=new AbortController(); setTimeout(()=>ctl.abort(), 20000);
      return fetch(BRIDGE+"/tts",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","X-Lernhub-Token":window.LERNHUB_TOKEN||""},body:JSON.stringify(Object.assign({text}, spec))}); };
    let r=await post();
    if(r.status===403 && typeof loadToken==="function"){ await loadToken(); r=await post(); }
    if(!r.ok || !(r.headers.get("content-type")||"").startsWith("audio/")) throw new Error("tts "+r.status);
    const blob=await r.blob();
    if(seq!==TTS_SEQ) return;
    loadOff("tts");
    const url=URL.createObjectURL(blob), a=new Audio(url);
    TTS_AUDIO=a;
    a.onended=a.onerror=()=>{ URL.revokeObjectURL(url); if(TTS_AUDIO===a){ TTS_AUDIO=null; if(TALK.id===c.id) talkStop(); ttsDone(); } };
    ttsLip(c, text, a);
    await a.play();
  }catch(e){
    if(seq===TTS_SEQ){ loadOff("tts"); TTS_AUDIO=null; talkStop(); saySystem(c, text, lang); }
  }
}
/* Figur spricht laut – mit eigener Stimme und passender Mundbewegung; onDone kommt, wenn sie fertig ist */
function sayAs(c, text, lang, onDone){
  c=c || castById("fritz");
  text=String(text||"").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,"").trim();
  ttsStop(); TTS_SEQ++;
  if(!text){ if(onDone) onDone(); return; }
  if(onDone) TTS_WAITERS.push(onDone);
  const eng=ttsEngine();
  if(eng==="cbx" && cbxReady()) return void sayCbx(c, text, lang||"de-DE");
  if(eng!=="system" && ttsReady()) return void sayEdge(c, text, lang||"de-DE");
  saySystem(c, text, lang);
}
/* ===================== Chatterbox (lokale KI-Stimmen, agent/tts_server.py auf 8798) ===================== */
const CBX={url:"http://127.0.0.1:8798", installed:false, ready:false, error:"", device:""};
function ttsEngine(){ const e=S.profile && S.profile.tts; return e==="system"||e==="cbx" ? e : "edge"; }
function cbxReady(){ return CBX.ready && S.agent && S.agent.connected && (typeof agentAllowed!=="function" || agentAllowed()); }
/* Liefert true, wenn sich der Status geändert hat */
async function cbxCheck(installed){
  const before=CBX.installed+"|"+CBX.ready+"|"+CBX.error;
  CBX.installed=!!installed;
  if(!installed){ CBX.ready=false; CBX.error=""; }
  else try{
    const ctl=new AbortController(); const h=setTimeout(()=>ctl.abort(),3000);
    const j=await (await fetch(CBX.url+"/health",{signal:ctl.signal})).json(); clearTimeout(h);
    CBX.ready=!!j.ready; CBX.error=String(j.error||"").slice(0,200); CBX.device=String(j.device||"");
  }catch(e){ CBX.ready=false; CBX.error=""; }
  if(CBX.installed && !CBX.ready && !CBX.error && ttsEngine()==="cbx") loadOn("cbx", "🧠 KI-Stimmen-Modell lädt … (bis zu einer Minute)");
  else loadOff("cbx");
  return before!==CBX.installed+"|"+CBX.ready+"|"+CBX.error;
}
function cbxId(id){ return String(id || "").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,40); }
/* Referenzstimme = Edge-Stimme der Figur; Ausdruck (exaggeration) aus der Figur bzw. ihrem Chaos-Wert */
function cbxSpec(c, lang){
  const base=c && castById(c.id), tr=(c && c.traits) || (base && base.traits) || {};
  const exag=+((c && c.exag) || (base && base.exag) || (0.35+(+tr.chaos||40)/200)).toFixed(2);
  const L=String(lang||"de").slice(0,2).toLowerCase();
  return Object.assign(edgeVoice(c, "de"), {lang:L, exag, cfg:L!=="de" ? 0 : exag>0.6 ? 0.3 : 0.5,
    char:cbxId(c && c.id)});
}
/* Erster Satz einzeln (schneller Start), danach Sätze bis ca. 220 Zeichen bündeln */
function ttsChunks(text){
  const out=[]; let cur="";
  (text.match(/[^.!?…]+[.!?…]*["“”»«)]*\s*/g) || [text]).forEach(p=>{
    if(cur.trim() && (!out.length || (cur+p).length>220)){ out.push(cur.trim()); cur=""; }
    cur+=p;
  });
  if(cur.trim()) out.push(cur.trim());
  return out.flatMap(s=>s.length<=500 ? [s] : s.match(/[\s\S]{1,450}(\s|$)/g).map(x=>x.trim()).filter(Boolean));
}
/* Während ein Satz läuft, wird der nächste schon berechnet */
async function sayCbx(c, text, lang){
  const spec=cbxSpec(c, lang), seq=TTS_SEQ, parts=ttsChunks(text);
  if(!window.LERNHUB_TOKEN && typeof loadToken==="function") await loadToken();
  const get=chunk=>{
    const ctl=new AbortController(), h=setTimeout(()=>ctl.abort(), 90000);
    const post=()=>fetch(CBX.url+"/tts",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json","X-Lernhub-Token":window.LERNHUB_TOKEN||""},body:JSON.stringify(Object.assign({text:chunk}, spec))});
    return post().then(async r=>{
      if(r.status===403 && typeof loadToken==="function"){ await loadToken(); r=await post(); }
      if(!r.ok || !(r.headers.get("content-type")||"").startsWith("audio/")) throw new Error("cbx "+r.status);
      return r.blob();
    }).finally(()=>clearTimeout(h));
  };
  let next=get(parts[0]);
  for(let i=0;i<parts.length;i++){
    let blob;
    loadOn("tts", `🧠 KI-Stimme von ${c.name||"der Figur"} wird erzeugt … (Chatterbox braucht ein paar Sekunden)`, c.id, 300);
    try{ blob=await next; }
    catch(e){
      if(seq!==TTS_SEQ) return;
      loadOff("tts");
      const rest=parts.slice(i).join(" ");
      if(i===0) toast("🧠 Chatterbox antwortet gerade nicht – andere Stimme springt ein");
      return void (ttsReady() ? sayEdge(c, rest, lang) : saySystem(c, rest, lang));
    }
    if(seq!==TTS_SEQ) return;
    loadOff("tts");
    if(i+1<parts.length){ next=get(parts[i+1]); next.catch(()=>{}); }
    const ok=await new Promise(res=>{
      const url=URL.createObjectURL(blob), a=new Audio(url); TTS_AUDIO=a;
      a.onended=()=>{ URL.revokeObjectURL(url); res(true); };
      a.onerror=()=>{ URL.revokeObjectURL(url); res(false); };
      a.onpause=()=>{ if(!a.ended && TTS_AUDIO!==a) res(false); };
      ttsLip(c, parts[i], a);
      a.play().catch(()=>res(false));
    });
    if(seq!==TTS_SEQ || !ok) break;
  }
  if(seq===TTS_SEQ){ TTS_AUDIO=null; if(TALK.id===c.id) talkStop(); ttsDone(); }
}
/* Einstellungs-Karte „Stimmen der Figuren“ */
function ttsCardHTML(){
  const eng=ttsEngine(), on=S.agent && S.agent.connected;
  const cbxNote=!on ? "Bridge nicht verbunden (🤖 Agent)."
    : !CBX.installed ? "Noch nicht installiert: agent\\chatterbox-installieren.ps1 einmal ausführen (lädt ca. 6 GB), dann die Bridge neu starten."
    : CBX.ready ? `✅ Bereit (${CBX.device==="cuda"?"Grafikkarte":"nur CPU – langsam"}). Der erste Satz einer Figur dauert etwas länger; auf schwächeren Laptops braucht jeder Satz 10–30 Sekunden.`
    : CBX.error ? "⚠️ Fehler: "+esc(CBX.error) : "⏳ Modell lädt … (nach dem Bridge-Start bis zu einer Minute)";
  const opt=(k,label,desc,ok)=>`<button class="choice ${eng===k?"sel":""}" onclick="S.profile.tts='${k}';save();render()">${label} <span class="small mut">– ${desc}${ok?"":" (gerade nicht verfügbar)"}</span></button>`;
  return `<div class="card" style="margin-top:14px">
      <b>🔊 Stimmen der Figuren (Sprachmodell)</b>
      <p class="small mut">Ist das gewählte Modell nicht erreichbar, springt automatisch das nächste ein (Chatterbox → Edge → System).</p>
      ${opt("system","💻 System","Browser-Stimme, offline, eher robotisch",true)}
      ${opt("edge","☁️ Edge Neural","natürliche Microsoft-Stimmen, braucht Internet + Bridge",TTS_ON&&on)}
      ${opt("cbx","🧠 Chatterbox (KI, lokal)","sehr realistisch mit Gefühl, läuft auf deinem PC – nichts geht ins Internet",cbxReady())}
      <p class="small mut" style="margin-top:8px">Chatterbox: ${cbxNote}</p>
      <div class="center"><button class="btn ghost sm" onclick="sayAs(activeChar(),'Hallo! Ich bin '+activeChar().name+'. So klinge ich mit diesem Sprachmodell.')">🔊 Aktive Figur testen</button>
      <button class="btn ghost sm" onclick="pingAgent(true).then(()=>render())">🔄 Status prüfen</button></div>
      ${voiceCardHTML()}
    </div>`;
}
/* ===================== Eigene Stimme: Chatterbox übernimmt sie aus 10–30 s Aufnahme ===================== */
const VOICE_REC={char:"", rec:null, timer:null, t0:0, own:null, ok:false, busy:false};
const VOICE_TEXT="Hallo! Ich lerne gerade für meine Ausbildung. Heute geht es um Netzwerke, Datenbanken und ein bisschen Wirtschaft. Ich lese diesen Text ruhig und deutlich vor, damit die KI meine Stimme gut erkennt. Eins, zwei, drei – und los geht's!";
function voiceAllChars(){ return CAST.concat((S.chars || []).filter(c=>!castById(c.id))); }
function voiceCardHTML(){
  if(!CBX.ready) return `<p class="small mut" style="margin-top:8px">🎙️ Eigene Stimme hochladen: möglich, sobald Chatterbox bereit ist.</p>`;
  if(VOICE_REC.own===null) voiceOwnLoad();
  const all=voiceAllChars(), own=VOICE_REC.own || [], rec=!!VOICE_REC.rec;
  const sel=VOICE_REC.char || (activeChar() || {}).id;
  return `<hr class="sep"><b>🎙️ Deine eigene Stimme</b>
    <p class="small mut">Lies den Text ca. 15 Sekunden ruhig vor – danach spricht die gewählte Figur mit deiner Stimme. Nur mit Chatterbox; die Aufnahme bleibt auf deinem PC.</p>
    <label class="fl">Figur</label>
    <select class="fi" id="vcChar" onchange="VOICE_REC.char=this.value">${all.map(c=>`<option value="${esc(c.id)}" ${c.id===sel?"selected":""}>${esc(c.name)}${own.includes(cbxId(c.id))?" 🎙️":""}</option>`).join("")}</select>
    <div class="card" style="margin-top:8px;background:var(--pri-l)"><small class="mut">Zum Vorlesen:</small><br>„${esc(VOICE_TEXT)}“</div>
    <label class="small" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" ${VOICE_REC.ok?"checked":""} onchange="VOICE_REC.ok=this.checked"> Das ist meine eigene Stimme – oder die Person hat mir erlaubt, ihre Stimme zu verwenden.</label>
    <div class="center" style="margin-top:8px">
      <button class="btn sm ${rec?"r":""}" onclick="voiceRecToggle()" ${VOICE_REC.busy?"disabled":""}>${rec?"⏹️ Aufnahme beenden":"⏺️ Aufnehmen"}</button>
      <label class="btn ghost sm" style="cursor:pointer">📁 Datei wählen<input type="file" accept="audio/*" style="display:none" onchange="voiceFile(this)"></label>
    </div>
    ${rec?`<p class="small center">🔴 Aufnahme läuft … (stoppt automatisch nach 30 s)</p>`:""}
    ${own.length?`<p class="small">Mit deiner Stimme: ${own.map(id=>{ const c=all.find(x=>cbxId(x.id)===id);
      return `<span style="display:inline-block;border:1px solid var(--line);border-radius:999px;padding:2px 8px;margin:2px">${esc(c?c.name:id)} <a href="javascript:void 0" title="Eigene Stimme löschen" onclick="voiceDel('${esc(id)}')">✕</a></span>`; }).join("")}</p>`:""}`;
}
async function voiceApi(path, opts){
  if(!window.LERNHUB_TOKEN && typeof loadToken==="function") await loadToken();
  const go=()=>fetch(CBX.url+path, Object.assign({}, opts, {headers:Object.assign({"X-Lernhub-Token":window.LERNHUB_TOKEN||""}, (opts && opts.headers) || {})}));
  let r=await go();
  if(r.status===403 && typeof loadToken==="function"){ await loadToken(); r=await go(); }
  return r;
}
async function voiceOwnLoad(){
  VOICE_REC.own=[];
  try{
    const j=await (await voiceApi("/voices")).json();
    if(j.ok && Array.isArray(j.own) && j.own.length){ VOICE_REC.own=j.own.map(String); if(V.view==="settings" && !typingNow()) render(); }
  }catch(e){}
}
async function voiceRecToggle(){
  if(VOICE_REC.rec){ VOICE_REC.rec.stop(); return; }
  if(!VOICE_REC.ok) return toast("Bitte erst bestätigen, dass es deine Stimme ist (oder du die Erlaubnis hast).");
  if(!navigator.mediaDevices || !window.MediaRecorder) return toast("Aufnehmen geht in diesem Browser nicht – wähl eine Audiodatei.");
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}});
    const rec=new MediaRecorder(stream), chunks=[];
    rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
    rec.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop()); clearTimeout(VOICE_REC.timer); VOICE_REC.rec=null;
      if((Date.now()-VOICE_REC.t0)/1000<6){ render(); return toast("Zu kurz – bitte mindestens 10 Sekunden sprechen."); }
      voiceUpload(new Blob(chunks, {type:rec.mimeType || "audio/webm"}));
    };
    VOICE_REC.rec=rec; VOICE_REC.t0=Date.now(); rec.start();
    VOICE_REC.timer=setTimeout(()=>{ if(rec.state!=="inactive") rec.stop(); }, 30000);
    render();
  }catch(e){ toast("Kein Mikrofon-Zugriff – bitte im Browser erlauben."); }
}
function voiceFile(input){
  const f=input.files && input.files[0]; input.value="";
  if(!f) return;
  if(!VOICE_REC.ok) return toast("Bitte erst bestätigen, dass es deine Stimme ist (oder du die Erlaubnis hast).");
  if(f.size>15*1024*1024) return toast("Datei zu groß (max. 15 MB).");
  voiceUpload(f);
}
/* 16-Bit-Mono-WAV */
function wavEncode(x, sr){
  const n=x.length, b=new ArrayBuffer(44+n*2), v=new DataView(b);
  const w=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){ const s=Math.max(-1, Math.min(1, x[i])); v.setInt16(44+i*2, s<0 ? s*0x8000 : s*0x7fff, true); }
  return b;
}
async function voiceUpload(blob){
  const sel=document.getElementById("vcChar"), cid=(sel && sel.value) || VOICE_REC.char || activeChar().id;
  const c=voiceAllChars().find(x=>x.id===cid) || activeChar();
  VOICE_REC.busy=true; loadOn("voice", "🎙️ Deine Stimme wird verarbeitet …"); render();
  let ok=false;
  try{
    const ac=new (window.AudioContext || window.webkitAudioContext)();
    const src=await ac.decodeAudioData(await blob.arrayBuffer()); ac.close();
    const secs=Math.min(src.duration, 30), sr=24000;
    if(secs<5) throw new Error("dauer");
    const off=new OfflineAudioContext(1, Math.ceil(secs*sr), sr), node=off.createBufferSource();
    node.buffer=src; node.connect(off.destination); node.start();
    const x=(await off.startRendering()).getChannelData(0);
    let peak=0; for(let i=0;i<x.length;i++) peak=Math.max(peak, Math.abs(x[i]));
    if(peak>0.02 && peak<0.9) for(let i=0;i<x.length;i++) x[i]*=0.9/peak;
    const r=await voiceApi("/voice?char="+encodeURIComponent(cbxId(c.id)), {method:"POST", headers:{"Content-Type":"audio/wav"}, body:wavEncode(x, sr)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok || !j.ok) throw new Error(j.error || "http "+r.status);
    ok=true; VOICE_REC.own=null; S.profile.tts="cbx"; save();
    toast(`✅ Stimme gespeichert (${j.sekunden} s) – ${c.name} spricht jetzt mit deiner Stimme.`);
  }catch(e){
    const why={dauer:"Die Aufnahme muss 5 bis 40 Sekunden lang sein.", leise:"Die Aufnahme ist zu leise – näher ans Mikro.", format:"Das Audioformat wurde nicht erkannt.", token:"Die Bridge-Verbindung ist abgelaufen – Status prüfen."}[e.message];
    toast("⚠️ "+(why || "Die Stimme konnte nicht gespeichert werden ("+String(e.message || e).slice(0,60)+")."));
  }
  VOICE_REC.busy=false; loadOff("voice"); render();
  if(ok) sayAs(c, "Hallo! So klinge ich jetzt – mit deiner Stimme.", "de-DE");
}
async function voiceDel(id){
  try{ await voiceApi("/voice?char="+encodeURIComponent(id)+"&del=1", {method:"POST"}); toast("Eigene Stimme gelöscht."); }catch(e){ toast("⚠️ Löschen hat nicht geklappt."); }
  VOICE_REC.own=null; render();
}
function saySystem(c, text, lang){
  const seq=TTS_SEQ, done=()=>{ if(seq===TTS_SEQ) ttsDone(); }, later=()=>setTimeout(done, text.length/14*1000+400);
  if(!("speechSynthesis" in window)){ talkAnim(c.id, text); later(); return toast("Vorlesen nicht verfügbar – Mund bewegt sich trotzdem 😉"); }
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang||"de-DE"; u.pitch=c.voicePitch||1; u.rate=c.voiceRate||1;
    const v=charVoice(c, u.lang); if(v) u.voice=v;
    let started=false;
    u.onstart=()=>{ started=true; talkStart(c.id, text, u.rate, false); };
    u.onboundary=e=>{ if(TALK.id===c.id && typeof e.charIndex==="number") talkSync(e.charIndex); };
    u.onend=u.onerror=()=>{ if(TALK.id===c.id) talkStop(); done(); };
    speechSynthesis.speak(u);
    setTimeout(()=>{ if(!started){ talkAnim(c.id, text); later(); } }, 900);
  }catch(e){ talkAnim(c.id, text); later(); }
}

/* ===================== Maskottchen-Widgets ===================== */
function mascotLine(){
  const st=streakNow(), h=new Date().getHours(), goal=dayGoalPct()>=100;
  if(goal) return st>1 ? `Tagesziel geschafft und ${st} Tage Streak – ich bin stolz auf dich!` : "Tagesziel geschafft! Morgen machen wir weiter.";
  if(st>0 && S.streak.last!==today()) return h>=20 ? `Schnell! Deine ${st}-Tage-Streak braucht heute noch eine Lektion.` : `Deine ${st}-Tage-Streak wartet auf die heutige Lektion.`;
  if(dueCount()>0) return `${dueCount()} Wiederholungen sind fällig – das geht schnell!`;
  return h<11 ? "Guten Morgen! Eine kurze Lektion zum Frühstück?" : "Hey! Fünf Minuten lernen, dann hast du's für heute.";
}
function mascotHTML(text, size){
  const s=size||96, f=castById("fritz");
  return `<div class="mascot"><div class="mascot-av" style="width:${s}px;height:${Math.round(s*1.07)}px" title="Antippen: Pingulin spricht" onclick="mascotSay(this)">${faceSVG(f)}</div>${text?`<div class="bubble">${esc(text)}</div>`:""}</div>`;
}
function mascotSay(el){
  const box=el.closest(".mascot"), b=box && box.querySelector(".bubble");
  sayAs(castById("fritz"), b ? b.textContent : mascotLine(), "de-DE");
}
/* Nach dem Rendern: Blase "spricht" stumm mit */
function mascotIntro(){
  const b=document.querySelector("#app .mascot .bubble");
  if(b) setTimeout(()=>talkAnim("fritz", b.textContent), 250);
}
function chatSay(i){ const m=CHAT[i]; if(m) sayAs(activeChar(), m.t, "de-DE"); }

/* ===================== Crew-Auswahl (Charaktere) ===================== */
function castHTML(){
  const act=(activeChar()||{}).id;
  return `<h2 class="h2">🐧 Die Lernhub-Crew</h2>
  <p class="small mut" style="margin-top:-6px">Jede Figur hat ihre eigene Stimme und bewegt beim Sprechen den Mund – wie bei Duolingo. Tipp auf „🔊 Hallo“.</p>
  <div class="castgrid">${CAST.map(c=>`<div class="castcard ${act===c.id?'on':''}" style="--cc:${c.color}">
    <div class="castface" onclick="castHello('${c.id}')">${faceSVG(c)}</div>
    <b>${esc(c.name)}</b><small class="mut">${esc(c.role)}</small>
    <div class="castbtns"><button class="btn ghost sm" onclick="castHello('${c.id}')">🔊 Hallo</button><button class="btn sm ${act===c.id?'g':''}" onclick="castPick('${c.id}')">${act===c.id?"✓ Aktiv":"Wählen"}</button></div></div>`).join("")}</div>
  <p class="small mut">🙏 ${esc(DUO_CREDIT)}</p>`;
}
function castHello(id){ const c=castById(id); if(c) sayAs(c, c.hello, "de-DE"); }
function castPick(id){
  if(!castById(id)) return;
  S.activeChar=id; save(); updateChatHead(); CHAT=[]; renderChars();
  toast(castById(id).name+" ist jetzt dein Lernbegleiter ✓"); castHello(id);
}
/* Auswahl im Charakter-Editor: Gesicht + Stimme */
function faceVoiceEditHTML(c){
  const vs=voiceList("de").concat(voiceList("en"));
  return `<label class="fl" style="display:block;margin-top:12px">Sprechendes Gesicht (Mund bewegt sich)</label>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
    <button class="ttsbtn" style="${!c.face?'border-color:var(--pri);background:var(--pri-l)':''}" onclick="EC.face='';renderCharEdit()">keins</button>
    ${FACE_IDS.map(f=>`<button class="ttsbtn facepick" style="${c.face===f?'border-color:var(--pri);background:var(--pri-l)':''}" onclick="EC.face='${f}';renderCharEdit()">${faceSVG({id:"pick-"+f, face:f})}</button>`).join("")}
  </div>
  <label class="fl" style="display:block;margin-top:12px">Eigene Stimme</label>
  <select class="fi" onchange="EC.voiceName=this.value">
    <option value="">Automatisch</option>
    ${vs.map(v=>`<option value="${esc(v.name)}" ${c.voiceName===v.name?"selected":""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("")}
  </select>
  <div style="display:flex;gap:6px;margin-top:6px">
    ${[["","egal"],["f","weiblich"],["m","männlich"]].map(([k,l])=>`<button class="choice ${(c.sex||"")===k?'sel':''}" style="flex:1" onclick="EC.sex='${k}';renderCharEdit()">${l}</button>`).join("")}
  </div>
  ${vs.length?"":'<p class="small mut">Keine Stimmen gefunden – dein Browser lädt sie evtl. noch. Fenster schließen und erneut öffnen.</p>'}`;
}
