/* Lernhub Plus: Dashboard, Erklär-Modus, Notizen, Planer (Untis + Erinnerungen), Lernlinks.
   Klassisches Script vor dem Haupt-Script: nutzt S und Helfer (esc, today, save …) nur zur Laufzeit. */

/* ===================== Zustand ===================== */
function plusDefaults(){
  return {
    notes:[],
    events:[],
    remind:{on:true, from:"17:00", notify:false},
    share:{errors:false, hints:false},
    untis:{url:"", ev:[], week:[], off:[], at:0}
  };
}
function sanitizePlus(st){
  const D=plusDefaults();
  const isObj=o=>o && typeof o==="object" && !Array.isArray(o);
  const s=(v,n)=>typeof v==="string" ? v.slice(0,n) : "";
  const hm=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "";
  const arr=v=>Array.isArray(v) ? v.filter(isObj) : [];
  st.notes=arr(st.notes).slice(0,500).map(n=>({
    id:/^n\d{1,20}$/.test(n.id) ? n.id : "n"+Date.now()+Math.floor(Math.random()*1000),
    title:s(n.title,120), body:s(n.body,20000), subj:s(n.subj,40), upd:+n.upd||Date.now()}));
  st.events=arr(st.events).slice(0,300).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date)).map(e=>({
    id:/^e\d{1,20}$/.test(e.id) ? e.id : "e"+Date.now()+Math.floor(Math.random()*1000),
    date:e.date, title:s(e.title,120)||"Termin", subj:s(e.subj,40), exam:!!e.exam}));
  const r=isObj(st.remind) ? st.remind : {};
  st.remind={on:r.on!==false, from:hm(r.from)||D.remind.from, notify:!!r.notify};
  const sh=isObj(st.share) ? st.share : {};
  st.share={errors:!!sh.errors, hints:!!sh.hints};
  const u=isObj(st.untis) ? st.untis : {};
  st.untis={
    url:/^https:\/\/[^\s"'<>]{4,600}$/.test(u.url||"") ? u.url : "",
    ev:arr(u.ev).slice(0,800).filter(e=>isFinite(e.s) && e.s>0).map(e=>({s:+e.s, e:+e.e||+e.s, t:s(e.t,80), r:s(e.r,60), cx:!!e.cx})),
    week:arr(u.week).slice(0,80).filter(w=>w.d>=1 && w.d<=7 && hm(w.from)).map(w=>({d:+w.d, from:w.from, to:hm(w.to)||w.from, t:s(w.t,80), r:s(w.r,60), bi:/^\d{4}-\d{2}-\d{2}$/.test(w.bi||"")?w.bi:""})),
    off:arr(u.off).slice(0,60).filter(h=>/^\d{4}-\d{2}-\d{2}$/.test(h.from||"") && /^\d{4}-\d{2}-\d{2}$/.test(h.to||"")).map(h=>({from:h.from, to:h.to, t:s(h.t,60)})),
    at:+u.at||0
  };
  st.stats.weekXP=Math.max(0, +st.stats.weekXP||0);
  if(typeof st.stats.weekDay!=="string") st.stats.weekDay="";
}
function weekXPNow(){ return S.stats.weekDay===weekStartStr() ? (S.stats.weekXP||0) : 0; }
const UNTIS_WEB="https://gsvs.webuntis.com/timetable/my-student";
function hhmm(ms){ const d=new Date(ms); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function dayOf(ms){ const d=new Date(ms); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function openUrl(u){ if(/^https:\/\//.test(u)) window.open(u, "_blank", "noopener,noreferrer"); }

/* ===================== Navigation (mobil: "Mehr") ===================== */
function openMore(){
  toastModal(`<h2 style="margin-top:0">☰ Alle Bereiche</h2>
    ${NAV.map(([v,ic,l])=>`<div class="listrow" data-v="${v}" onclick="closeModal();go(this.dataset.v)"><span class="emo">${ic}</span><div><b>${l}</b></div><span class="go">›</span></div>`).join("")}
    <button class="btn ghost sm" style="margin-top:12px" onclick="closeModal()">Schließen</button>`);
}

/* ===================== 🏠 Dashboard ===================== */
function favSubject(){ const ids=allSubjectIds(); return S.stats.lastSubject && subjById(S.stats.lastSubject) ? S.stats.lastSubject : ids[0]; }
function quests(){
  return [
    {ok:S.stats.lastLessonDay===today(), t:"1 Lektion abschließen", go:"continueLesson()"},
    {ok:dayGoalPct()>=100, t:`Tagesziel: ${S.profile.daily||20} XP`, go:"continueLesson()"},
    {ok:dueCount()===0, t:"Fällige Wiederholungen erledigen", go:"go('review')"},
    {ok:S.videos.lastDay===today(), t:"1 Erklär-Video ansehen", go:`suggestVideo(favSubject())`}
  ];
}
function upcoming(days){
  const t=today(), list=[];
  (typeof EXT_TERMINE!=="undefined" ? EXT_TERMINE : []).forEach(x=>list.push({date:x.datum, title:(EXAM_RE.test(x.titel||"")?"📝 ":"")+x.titel, subj:x.fach||""}));
  S.events.forEach(e=>list.push({date:e.date, title:(e.exam||EXAM_RE.test(e.title)?"📝 ":"")+e.title, subj:e.subj, own:e.id}));
  return list.filter(x=>x.date>=t && dayDiff(x.date,t)<=days).sort((a,b)=>a.date<b.date?-1:1);
}
function whenTxt(date){ const d=dayDiff(date,today()); return d===0?"heute":d===1?"morgen":"in "+d+" Tagen"; }
function lessonsOn(off){
  const t=dayStr(off||0), U=S.untis;
  if(U.off.some(h=>t>=h.from && t<=h.to)) return [];
  const ev=U.ev.filter(e=>dayOf(e.s)===t).sort((a,b)=>a.s-b.s).map(e=>({from:hhmm(e.s), to:hhmm(e.e), t:e.t, r:e.r, cx:e.cx}));
  if(ev.length) return ev;
  /* Innerhalb des importierten Zeitraums gilt der Import – kein Eintrag = frei */
  if(U.ev.length){ const days=U.ev.map(e=>dayOf(e.s)).sort(); if(t>=days[0] && t<=days[days.length-1]) return []; }
  const wd=((new Date(t+"T12:00").getDay()+6)%7)+1;
  return U.week.filter(w=>w.d===wd && (!w.bi || ((Math.floor(dayDiff(t,w.bi)/7)%2)+2)%2===0)).sort((a,b)=>a.from<b.from?-1:1).map(w=>({from:w.from, to:w.to, t:w.t, r:w.r, cx:false}));
}
function todayLessons(){ return lessonsOn(0); }
function nextSchoolDay(){
  for(let i=1;i<=21;i++){ const l=lessonsOn(i); if(l.length) return {off:i, date:dayStr(i), lessons:l}; }
  return null;
}
function lessonRows(list){
  return list.map(l=>`<div class="trow ${l.cx?'cx':''}"><span class="tm">${esc(l.from)}–${esc(l.to)}</span><span>${esc(l.t)}${l.r?` <small class="mut">· ${esc(l.r)}</small>`:""}${l.cx?' <span class="pill r">entfällt</span>':""}</span></div>`).join("");
}
function dayLabel(off, date){ return off===1?"Morgen":new Date(date+"T12:00").toLocaleDateString("de-DE",{weekday:"long", day:"numeric", month:"numeric"}); }
function renderDashboard(){
  const hour=new Date().getHours();
  const greet=hour<11?"Guten Morgen":hour<18?"Guten Tag":"Guten Abend";
  const name=S.profile.name?(", "+esc(S.profile.name)):"";
  const goalPct=dayGoalPct(), due=dueCount(), fav=favSubject();
  const away=S.streak.last ? dayDiff(today(), S.streak.last) : 0;
  const q=quests(), qDone=q.filter(x=>x.ok).length;
  const lessons=todayLessons(), ups=upcoming(14).slice(0,5);
  const nxt=lessons.length?null:nextSchoolDay();
  const notes=S.notes.slice().sort((a,b)=>b.upd-a.upd).slice(0,3);
  const rank=(window.boardRank && boardRank()) || null;
  const batt=S.profile.hearts ? `${battHTML(S.hearts.v)}<small>${S.hearts.v<5?"+1 in "+fmtMin(battNextIn()):"voll geladen"}</small>` : `<b>∞</b><small>Akku-Limit aus</small>`;
  $("app").innerHTML=`
  ${away>=2?`<div class="card" style="border-color:var(--amber);margin-bottom:14px"><b>👋 Willkommen zurück!</b> Du warst ${away} Tage weg – kein Problem. Dein Akku ist voll, eine kurze Lektion bringt dich sofort wieder rein.
    <div style="margin-top:10px"><button class="btn g sm" onclick="continueLesson()">5-Minuten-Comeback starten</button></div></div>`:""}
  <div class="hero">
    <h1>${greet}${name} ${streakNow()>1?'<span class="streakflame">🔥</span>':''}</h1>
    <p>${streakLine()} ${goalPct>=100?'<br>✅ Tagesziel erreicht – Respekt!':`<br>🎯 Noch ${Math.max(0,(S.profile.daily||20)-todayXP())} XP bis zum Tagesziel.`}</p>
    <p class="hero-say">🐧 <b>Pingulin:</b> „<span id="heroSay">${esc(mascotLine())}</span>“</p>
    <div class="hero-m">${mascotHTML("", 92)}</div>
  </div>
  ${examCountdownHTML()}
  <div class="kpis" style="margin-top:14px">
    <div class="kpi" style="cursor:pointer" title="Streak-Freeze &amp; Ruhetage" onclick="openStreak()"><small>🔥 Streak</small><b>${streakNow()} Tage</b><small>Rekord ${S.streak.best} · 🧊 ${S.freeze.n}${isRestDay(today())?" · 😴 Ruhetag":""}</small></div>
    <div class="kpi"><small>🎯 Heute</small><b>${todayXP()} / ${S.profile.daily||20} XP</b><div class="bar" style="height:8px"><i style="width:${goalPct}%"></i></div></div>
    <div class="kpi"><small>🔋 Akku</small><div>${batt}</div></div>
    <div class="kpi" style="cursor:pointer" onclick="go('review')"><small>🔁 Wiederholen</small><b>${due}</b><small>${due?"fällig":"alles aufgeholt ✓"}</small></div>
    <div class="kpi" style="cursor:pointer" onclick="go('board')"><small>🏆 Diese Woche</small><b>${weekXPNow()} XP</b><small>${rank?"Platz "+rank.pos+" von "+rank.of+" unter Freunden":"Bestenliste ansehen"}</small></div>
  </div>
  <div class="quickbtns">
    <button class="btn g" onclick="continueLesson()">▶️ Weiterlernen: ${esc(nextLessonFor(fav).name)}</button>
    <button class="btn" onclick="go('explain')">🧠 Erklär-Modus</button>
    ${focusMini()||`<button class="btn ghost" onclick="go('fokus')">🍅 Fokus</button>`}
    <button class="btn ghost" onclick="SOC.sec='duels';go('board')">⚔️ Duell</button>
    <button class="btn ghost" onclick="go('notes')">📝 Notiz</button>
  </div>
  <div class="two">
    <div class="card"><b>✅ Tages-Quests (${qDone}/${q.length})</b>
      ${q.map(x=>`<div class="trow" style="cursor:${x.ok?'default':'pointer'}" ${x.ok?"":`onclick="${x.go}"`}><span>${x.ok?"✅":"⬜"}</span><span style="${x.ok?'opacity:.6;text-decoration:line-through':''}">${x.t}</span></div>`).join("")}
      ${qDone===q.length?'<p class="small mut">Alles erledigt – morgen gibt\'s neue. 🎉</p>':""}
    </div>
    <div class="card"><b>📅 Heute im Stundenplan</b>
      ${lessons.length?lessonRows(lessons)
        :nxt?`<p class="small mut">Heute kein Unterricht. <b>${esc(dayLabel(nxt.off, nxt.date))}:</b></p>${lessonRows(nxt.lessons)}`
        :`<p class="small mut">Kein Unterricht eingetragen. Verbinde Untis oder trag deinen Stundenplan ein.</p><button class="btn ghost sm" onclick="go('plan')">Stundenplan einrichten</button>`}
      <button class="btn ghost sm" style="margin-top:8px" onclick="openUrl(UNTIS_WEB)">🏫 In WebUntis öffnen</button>
    </div>
    <div class="card"><b>🗓️ Nächste Termine</b>
      ${ups.length?ups.map(x=>`<div class="trow"><span class="tm">${esc(whenTxt(x.date))}</span><span>${esc(x.title)}${x.subj?` <small class="mut">· ${esc(x.subj)}</small>`:""}</span></div>`).join("")
        :'<p class="small mut">Keine Termine in den nächsten 2 Wochen.</p>'}
      <button class="btn ghost sm" style="margin-top:8px" onclick="go('plan')">+ Termin</button>
    </div>
    <div class="card"><b>📝 Zuletzt notiert</b>
      ${notes.length?notes.map(n=>`<div class="trow" style="cursor:pointer" data-id="${n.id}" onclick="NOTE_SEL=this.dataset.id;go('notes')"><span>📄</span><span>${esc(n.title||"Ohne Titel")}</span></div>`).join("")
        :'<p class="small mut">Noch keine Notizen. Merk dir hier Stoff, Hausaufgaben oder Fragen an den Lehrer.</p>'}
    </div>
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <div style="font-size:34px">🔔</div>
    <div style="flex:1;min-width:200px"><b>Erinnerungen ${S.remind.on?"an":"aus"}</b><br><small class="mut">${S.remind.on?`Ab ${esc(S.remind.from)} Uhr erinnert Lernhub dich – je später, desto öfter – bis dein Tagesziel geschafft ist.`:"Schalte sie im Planer ein, damit deine Streak nicht reißt."}</small></div>
    <button class="btn ghost sm" onclick="go('plan')">Einstellen</button>
  </div>
  <div class="promo" style="margin-top:14px">
    <b style="font-size:17px">🎓 Tipp: simpleclub</b>
    <p style="margin:6px 0">Kurze, witzige Erklärvideos und Prüfungsvorbereitung für Schule &amp; Ausbildung – perfekt zwischen zwei Lektionen.</p>
    <a class="btn sm" href="https://simpleclub.com" target="_blank" rel="noopener noreferrer">simpleclub ansehen ↗</a>
    <a class="btn ghost sm" onclick="go('links')">Alle Lernlinks</a>
  </div>
  <p class="small mut center" style="margin-top:18px">${S.stats.lessons} Lektionen · ${S.stats.answered} Aufgaben · ${S.stats.answered-S.stats.correct} Fehler · ${S.stats.hints||0} Hinweise · Rekord-Streak ${S.streak.best} 🔥</p>`;
  setTimeout(()=>{ const h=$("heroSay"); if(h) talkAnim("fritz", h.textContent); }, 300);
}

/* ===================== 🧠 Erklär-Modus mit KI-Chat ===================== */
let EX={subj:null, tid:null, msgs:[], quiz:null};
function exTopic(){
  const sid=EX.subj && subjById(EX.subj) ? EX.subj : favSubject();
  const subj=subjById(sid);
  const tp=subj.topics.find(t=>t.id===EX.tid) || nextLessonFor(sid);
  EX.subj=sid; EX.tid=tp.id;
  return {sid, subj, tp};
}
function gapFilled(g){ const ans=gapSpec(g).map(x=>x[0]); let i=0; return g.t.replace(/___/g,()=>"**"+(ans[i++]||"…")+"**"); }
function boldHTML(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>"); }
/* Wissens-Schnipsel eines Themas (für Offline-Antworten und als KI-Kontext) */
function topicFacts(tp){
  const f=[];
  (tp.cards||[]).forEach(c=>f.push(c.f+": "+c.b));
  (tp.mc||[]).forEach(m=>f.push(m.q+" → "+m.c[m.a]+(m.w?" ("+m.w+")":"")));
  (tp.gaps||[]).forEach(g=>f.push(gapFilled(g).replace(/\*\*/g,"")));
  (tp.free||[]).forEach(q=>f.push(q.q+" → "+q.a[0]+(q.w?" ("+q.w+")":"")));
  return f;
}
function renderExplain(){
  const {sid, subj, tp}=exTopic();
  const ids=allSubjectIds();
  const idx=subj.topics.indexOf(tp);
  const locked=topicState(sid, idx)==="lock";
  const sec=(title, items, open)=>items.length?`<details class="exsec" ${open?"open":""}><summary>${title} (${items.length})</summary>${items.map(x=>`<div class="exitem">${x}</div>`).join("")}</details>`:"";
  if(!EX.msgs.length) EX.msgs=[{who:"bot", t:`Ich erkläre dir „${tp.name}“ so oft und so einfach du willst. Frag einfach – oder nimm eine der Schnellfragen unten.${S.chat.apiKey?"":"\n(Ohne KI-Key antworte ich aus dem Lernstoff. Echte KI: ⚙️ Einstellungen → KI-Chat, z. B. kostenlos lokal mit Ollama.)"}`}];
  $("app").innerHTML=`
  <div class="hero" style="background:linear-gradient(135deg,${subj.color||"#3a63d6"},#1a2a63)">
    <h1>🧠 Erklär-Modus</h1><p>Alles erläutert, Schritt für Schritt – ohne Akku, ohne Druck. Danach mit einer Lektion festigen.</p><span class="big">📖</span>
  </div>
  <div class="pathtabs" style="margin-top:14px">${ids.map(id=>`<button class="${id===sid?'on':''}" data-s="${esc(id)}" onclick="EX.subj=this.dataset.s;EX.tid=null;EX.msgs=[];renderExplain()">${esc(subjById(id).name)}</button>`).join("")}</div>
  <select class="fi" onchange="EX.tid=this.value;EX.msgs=[];renderExplain()">
    ${subj.topics.map((t,i)=>`<option value="${esc(t.id)}" ${t.id===tp.id?"selected":""}>${i+1}. ${esc(t.name)}${topicState(sid,i)==="done"?" ✓":""}</option>`).join("")}
  </select>
  <div class="exwrap" style="margin-top:12px">
    <div class="card">
      <b style="font-size:18px">${esc(tp.name)}</b>
      ${sec("📖 Das Wichtigste – Begriffe einfach erklärt", (tp.cards||[]).map(c=>`<b>${esc(c.f)}</b><br>${esc(c.b)}`), true)}
      ${sec("❓ Typische Prüfungsfragen mit Lösung & Begründung", (tp.mc||[]).map(m=>`${esc(m.q)}<br>✅ <b>${esc(m.c[m.a])}</b>${m.w?`<br><small class="mut">Warum: ${esc(m.w)}</small>`:""}`))}
      ${sec("✍️ Merksätze (Lückentexte ausgefüllt)", (tp.gaps||[]).map(g=>boldHTML(gapFilled(g))))}
      ${sec("💬 Offene Fragen mit Musterantwort", (tp.free||[]).map(q=>`${esc(q.q)}<br>✅ <b>${esc(q.a[0])}</b>${q.w?`<br><small class="mut">${esc(q.w)}</small>`:""}`))}
      <div class="quickbtns">
        ${locked?`<button class="btn ghost sm" disabled>🔒 Lektion noch gesperrt</button>`:`<button class="btn g sm" data-s="${esc(sid)}" data-t="${esc(tp.id)}" onclick="startLesson(this.dataset.s,this.dataset.t)">▶️ Jetzt üben</button>`}
        <button class="btn ghost sm" data-s="${esc(sid)}" data-t="${esc(tp.id)}" onclick="suggestVideo(this.dataset.s,this.dataset.t)">🎥 Videos dazu</button>
        <button class="btn ghost sm" onclick="exToNote()">📝 Als Notiz speichern</button>
      </div>
    </div>
    <div class="card">
      <b>✨ Frag die KI zu „${esc(tp.name)}“</b> <small class="mut">${S.chat.apiKey?"· echte KI aktiv":"· Offline-Modus"}</small>
      <div class="exmsgs" id="exMsgs" style="margin-top:10px">${EX.msgs.map(m=>`<div class="msg ${m.who}">${esc(m.t)}</div>`).join("")}</div>
      <div class="quick" style="background:none;padding:8px 0 0">
        ${["Erklär mir das ganz einfach","Gib mir ein Beispiel aus der Praxis","Wofür brauche ich das in der Ausbildung?","Stell mir eine Prüfungsfrage"].map(x=>`<button onclick="exAsk(this.textContent)">${x}</button>`).join("")}
      </div>
      <div class="exrow"><input class="fi" id="exIn" placeholder="Deine Frage …" onkeydown="if(event.key==='Enter')exAsk(this.value)"><button class="btn" onclick="exAsk($('exIn').value)">➤</button></div>
    </div>
  </div>`;
  const m=$("exMsgs"); m.scrollTop=m.scrollHeight;
}
function exPush(who,t){
  EX.msgs.push({who,t}); EX.msgs=EX.msgs.slice(-40);
  const m=$("exMsgs"); if(!m) return;
  const d=document.createElement("div"); d.className="msg "+who; d.textContent=t; m.appendChild(d); m.scrollTop=m.scrollHeight;
}
function exAsk(raw){
  const q=String(raw||"").trim().slice(0,1000); if(!q) return;
  const inp=$("exIn"); if(inp) inp.value="";
  S.stats.exQ=(S.stats.exQ||0)+1; save();
  exPush("me", q);
  const {tp}=exTopic();
  if(EX.quiz){
    const a=EX.quiz; EX.quiz=null;
    const ok=norm(q)===norm(a.correct) || norm(q).includes(norm(a.correct)) || /^[a-d]$/i.test(q) && "abcd".indexOf(q.toLowerCase())===a.idx;
    return exPush("bot", (ok?"✅ Richtig! ":"❌ Nicht ganz. ")+"Lösung: "+a.correct+(a.w?"\nWarum: "+a.w:""));
  }
  if(S.chat.apiKey) return exAPI(q, tp);
  exPush("bot", exOffline(q, tp));
}
function exOffline(q, tp){
  const t=norm(q), facts=topicFacts(tp), cards=tp.cards||[];
  if(/frage|quiz|test|prufung/.test(t) && (tp.mc||[]).length){
    const m=tp.mc[Math.floor(Math.random()*tp.mc.length)];
    EX.quiz={correct:m.c[m.a], idx:m.a, w:m.w||""};
    return "Prüfungsfrage: "+m.q+"\n"+m.c.map((c,i)=>"abcd"[i]+") "+c).join("\n")+"\n\nAntworte mit dem Buchstaben oder der Antwort.";
  }
  if(/einfach|versteh|erklar|kurz/.test(t) && cards.length)
    return "Ganz einfach gesagt:\n"+cards.slice(0,4).map(c=>"• "+c.f+" = "+c.b).join("\n")+"\n\nMerk dir zuerst nur den ersten Punkt – der Rest baut darauf auf.";
  if(/beispiel|praxis/.test(t)){
    const w=(tp.mc||[]).map(m=>m.w).concat((tp.free||[]).map(f=>f.w)).filter(Boolean);
    if(w.length) return "Beispiel: "+w[Math.floor(Math.random()*w.length)];
  }
  if(/wofur|brauche|ausbildung|beruf/.test(t))
    return `„${tp.name}“ kommt in Berufsschule und IHK-Prüfung dran – und im Betrieb brauchst du es, um Kunden und Kollegen fachlich richtig zu beraten. Lern es einmal richtig, dann sparst du dir später das Nachschlagen.`;
  /* Stichwortsuche: zuerst im aktuellen Thema, sonst in allen Fächern */
  const words=String(q).toLowerCase().split(/[^a-zäöüß0-9]+/).filter(w=>w.length>3).map(norm);
  const score=f=>{ const n=norm(f); return words.reduce((s,w)=>s+(n.includes(w)?1:0),0); };
  let hits=facts.map(f=>({f,s:score(f)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,3);
  if(!hits.length && words.length){
    allSubjectIds().forEach(id=>subjById(id).topics.forEach(t2=>topicFacts(t2).forEach(f=>{ const s=score(f); if(s>0) hits.push({f:t2.name+" – "+f,s}); })));
    hits=hits.sort((a,b)=>b.s-a.s).slice(0,3);
  }
  if(hits.length) return "Das habe ich im Lernstoff gefunden:\n"+hits.map(h=>"• "+h.f).join("\n");
  return "Dazu finde ich nichts im Lernstoff. Probier andere Stichwörter, schau dir ein Video an (🎥) – oder trag in den Einstellungen einen KI-Key ein, dann beantwortet eine echte KI jede Frage.";
}
function exAPI(q, tp){
  exPush("bot","⏳ Denkt nach …");
  const facts=topicFacts(tp).join("\n").slice(0,3500);
  const sys=`Du bist ein geduldiger Nachhilfelehrer für Azubis (Fachinformatiker, Berufsschule ${S.profile.klasse||""}). Antworte auf Deutsch, einfach, mit Beispielen aus der IT-Praxis, höchstens 8 Sätze. Erfinde nichts – wenn du unsicher bist, sag es.
Thema: ${tp.name}
Lernstoff dazu:
${facts}`;
  const hist=EX.msgs.filter(m=>m.t!=="⏳ Denkt nach …").slice(-8).map(m=>({role:m.who==="me"?"user":"assistant", content:m.t}));
  fetch(S.chat.endpoint,{method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+S.chat.apiKey},
    body:JSON.stringify({model:S.chat.model||"gpt-4o-mini", messages:[{role:"system",content:sys}].concat(hist), max_tokens:600})})
  .then(r=>r.json()).then(j=>{
    EX.msgs=EX.msgs.filter(m=>m.t!=="⏳ Denkt nach …");
    const t=(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||(j.error&&j.error.message)||"Keine Antwort – Endpunkt prüfen.";
    if(V.view==="explain") renderExplain(); exPush("bot", t);
  }).catch(e=>{
    EX.msgs=EX.msgs.filter(m=>m.t!=="⏳ Denkt nach …");
    if(V.view==="explain") renderExplain();
    exPush("bot","⚠️ KI nicht erreichbar ("+(e.message||e)+"). Offline-Antwort:\n"+exOffline(q,tp));
  });
}
function exToNote(){
  const {subj, tp}=exTopic();
  const body=(tp.cards||[]).map(c=>"- "+c.f+": "+c.b).join("\n");
  const n={id:"n"+Date.now(), title:tp.name, body, subj:subj.name, upd:Date.now()};
  S.notes.unshift(n); save(); NOTE_SEL=n.id; toast("Notiz angelegt ✓"); go("notes");
}

/* ===================== 📝 Notizen ===================== */
let NOTE_SEL=null, NOTE_Q="", NOTE_T=null;
function curNote(){ return S.notes.find(n=>n.id===NOTE_SEL) || null; }
function noteListHTML(){
  const q=norm(NOTE_Q);
  const list=S.notes.slice().sort((a,b)=>b.upd-a.upd).filter(n=>!q || norm(n.title+" "+n.body+" "+n.subj).includes(q));
  if(!list.length) return `<p class="small mut">${S.notes.length?"Nichts gefunden.":"Noch keine Notizen."}</p>`;
  return list.map(n=>`<div class="noteitem ${n.id===NOTE_SEL?'on':''}" data-id="${n.id}" onclick="NOTE_SEL=this.dataset.id;renderNotes()"><b>${esc(n.title||"Ohne Titel")}</b><small>${n.subj?esc(n.subj)+" · ":""}${new Date(n.upd).toLocaleDateString("de-DE")}</small></div>`).join("");
}
function renderNotes(){
  if(!curNote() && S.notes.length) NOTE_SEL=S.notes.slice().sort((a,b)=>b.upd-a.upd)[0].id;
  const n=curNote();
  const subjects=allSubjectIds().map(id=>subjById(id).name);
  $("app").innerHTML=`
  <div class="h1">📝 Notizen</div>
  <p class="mut">Mitschriften, Hausaufgaben, Fragen an den Lehrer – alles an einem Ort. Gespeichert nur in deinem Browser.</p>
  <div class="notegrid">
    <div>
      <button class="btn g" style="width:100%" onclick="noteNew()">+ Neue Notiz</button>
      <input class="fi" placeholder="🔍 Suchen …" value="${esc(NOTE_Q)}" oninput="NOTE_Q=this.value;$('noteList').innerHTML=noteListHTML()">
      <div id="noteList">${noteListHTML()}</div>
    </div>
    <div class="card">
      ${n?`
      <input class="fi" style="font-weight:800;font-size:17px;margin-top:0" placeholder="Titel" value="${esc(n.title)}" oninput="noteEdit('title',this.value)">
      <select class="fi" onchange="noteEdit('subj',this.value)"><option value="">– kein Fach –</option>${subjects.map(s=>`<option ${s===n.subj?"selected":""}>${esc(s)}</option>`).join("")}</select>
      <textarea class="ta" style="min-height:300px;margin-top:8px" placeholder="Schreib los … Tipp: Zeilen im Format „Frage | Antwort“ kannst du als Karteikarten lernen." oninput="noteEdit('body',this.value)">${esc(n.body)}</textarea>
      <div class="quickbtns">
        <button class="btn ghost sm" onclick="noteToCards()">🃏 Als Karteikarten lernen</button>
        <button class="btn ghost sm" onclick="noteDownload()">⬇️ Herunterladen</button>
        <button class="btn r sm" onclick="noteDelete()">🗑️ Löschen</button>
      </div>`:`<p class="mut center">Leg deine erste Notiz an. ✍️</p>`}
    </div>
  </div>`;
}
function noteNew(){ const n={id:"n"+Date.now(), title:"", body:"", subj:"", upd:Date.now()}; S.notes.unshift(n); NOTE_SEL=n.id; save(); renderNotes(); }
function noteEdit(field, val){
  const n=curNote(); if(!n) return;
  n[field]=String(val).slice(0, field==="body"?20000:120); n.upd=Date.now();
  clearTimeout(NOTE_T); NOTE_T=setTimeout(save, 400);
  if(field==="title"){ const el=document.querySelector(".noteitem.on b"); if(el) el.textContent=n.title||"Ohne Titel"; }
}
function noteDelete(){
  const n=curNote(); if(!n || !confirm("Notiz „"+(n.title||"Ohne Titel")+"“ löschen?")) return;
  S.notes=S.notes.filter(x=>x.id!==n.id); NOTE_SEL=null; save(); renderNotes();
}
function noteDownload(){
  const n=curNote(); if(!n) return;
  const blob=new Blob([(n.title?"# "+n.title+"\n\n":"")+n.body],{type:"text/markdown"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=(n.title||"notiz").replace(/[^\wäöüÄÖÜß -]/g,"").slice(0,60)+".md"; a.click(); URL.revokeObjectURL(a.href);
}
function noteToCards(){
  const n=curNote(); if(!n) return;
  const lines=n.body.split("\n").filter(l=>l.includes("|"));
  if(!lines.length) return toast("Schreib Zeilen im Format „Frage | Antwort“");
  newCustomSubject(); $("csName").value=n.title||"Meine Notiz"; $("csQ").value=lines.join("\n");
}

/* ===================== 📅 Planer: Untis, Termine, Erinnerungen ===================== */
const WD=["","Mo","Di","Mi","Do","Fr","Sa","So"];
function renderPlan(){
  const u=S.untis, r=S.remind;
  const notifState=("Notification" in window) ? Notification.permission : "unsupported";
  $("app").innerHTML=`
  <div class="h1">📅 Planer</div>
  <p class="mut">Stundenplan, Klassenarbeiten und Erinnerungen – damit du nichts verpasst.</p>
  <div class="card">
    <b>🔔 Erinnerungen bis zum Tagesziel</b>
    <p class="small mut">Ab der Startzeit erinnert Lernhub dich, solange dein Tagesziel offen ist – und je näher Mitternacht, desto öfter: bis 18 Uhr stündlich, dann alle 30 Min, ab 20 Uhr alle 15 Min, ab 22 Uhr alle 5 Min. An 😴 Ruhetagen ist Ruhe. Im offenen Tab immer – mit 📲 Push (unten) auch, wenn Lernhub geschlossen ist.</p>
    <button class="choice ${r.on?'sel':''}" onclick="S.remind.on=true;save();pushSync();renderPlan()">🔔 An</button>
    <button class="choice ${!r.on?'sel':''}" onclick="S.remind.on=false;save();pushSync();renderPlan()">🔕 Aus</button>
    <label class="fl" style="display:block;margin-top:12px">Start ab</label>
    <input class="fi" type="time" value="${esc(r.from)}" onchange="if(/^\\d\\d:\\d\\d$/.test(this.value)){S.remind.from=this.value;save();pushSync();}">
    <div class="quickbtns">
      <button class="btn ghost sm" onclick="askNotify()" ${notifState==="granted"||notifState==="unsupported"?"disabled":""}>${notifState==="granted"?"✓ Browser-Benachrichtigungen erlaubt":notifState==="unsupported"?"Benachrichtigungen nicht unterstützt":"Browser-Benachrichtigungen erlauben"}</button>
      <button class="btn ghost sm" onclick="openStreak()">😴 Ruhetage &amp; 🧊 Freeze</button>
      <button class="btn ghost sm" onclick="downloadRemindICS()">📅 Kalender-Wecker (.ics)</button>
    </div>
    <p class="small mut">Ohne Push: die .ics-Datei in den Handy-Kalender importieren → tägl. Erinnerung um ${esc(r.from)}, 20:00 und 21:30 Uhr (erinnert allerdings auch, wenn du schon gelernt hast).</p>
  </div>
  ${pwaCardHTML()}
  <div class="card" style="margin-top:14px">
    <b>🏫 Untis-Stundenplan</b>
    <div class="quickbtns"><button class="btn sm" onclick="openUrl(UNTIS_WEB)">🏫 Mein Stundenplan in WebUntis öffnen</button></div>
    <p class="small mut">An der GSVS gibt es für Schüler <b>keinen iCal-Link</b> (im ⋯-Menü fehlt „iCal-Abo“, Gastzugang ist aus). Deinen Plan kann der 🤖 Agent aus deinem eingeloggten WebUntis übernehmen – oder du trägst ihn unten selbst ein.</p>
    <details class="exsec" style="margin-top:8px">
      <summary><b>Andere Schule mit iCal-Abo? So bekommst du den Link</b></summary>
      <ol class="small" style="padding-left:20px;line-height:1.7">
        <li>WebUntis <b>im Browser</b> öffnen (PC oder Handy): <b>webuntis.com</b> → Schule suchen: <b>„Gewerbliche Schulen Villingen-Schwenningen“</b> → mit deinem Schul-Login anmelden.</li>
        <li>Links im Menü auf <b>„Mein Stundenplan“</b> klicken.</li>
        <li>Unter dem Stundenplan, rechts neben der Legende, auf die <b>drei Punkte ⋯</b> klicken.</li>
        <li><b>„iCal-Abo verwalten“</b> wählen.</li>
        <li>Format <b>„Standard“</b> lassen → <b>„Link erstellen“</b>.</li>
        <li><b>„Link kopieren“</b> → hier unten einfügen → <b>🔄 Laden</b>. Fertig!</li>
      </ol>
      <p class="small mut">❓ <b>Keine drei Punkte / kein „iCal-Abo“?</b> Dann hat eure Schule das Modul „Individuelle Stundenplanabfrage“ für Schüler nicht freigeschaltet (an der GSVS ist das aktuell so) – frag deine Lehrkraft oder trag den Plan unten selbst ein (dauert 2 Minuten). Der „Öffentliche Link“ aus dem ⋯-Menü ist nur eine Webseite und funktioniert hier <b>nicht</b>.<br>
      ❓ <b>„Laden“ klappt nicht?</b> Den Link im Browser öffnen → die <b>.ics-Datei</b> wird heruntergeladen → hier „📂 .ics-Datei importieren“. Mit Lernhub-Konto läuft der Abruf automatisch über unseren Server.<br>
      🔒 Der Link ist wie ein Passwort zu deinem Stundenplan: nicht teilen. Du kannst ihn in WebUntis jederzeit mit <b>„Link deaktivieren“</b> ungültig machen. Er bleibt nur auf diesem Gerät; der Server reicht ihn nur weiter und speichert nichts.<br>
      🔁 Der Feed enthält ca. 1 Woche zurück und 12 Wochen voraus. Lernhub lädt ihn beim Öffnen automatisch neu (höchstens alle 6 Stunden) – Vertretungen und Ausfälle sind also aktuell.</p>
    </details>
    <input class="fi" id="untisUrl" placeholder="https://…webuntis.com/WebUntis/Ical.do?…" value="${esc(u.url)}">
    <div class="quickbtns">
      <button class="btn sm" onclick="untisFetch()">🔄 Laden</button>
      <button class="btn ghost sm" onclick="$('icsFile').click()">📂 .ics-Datei importieren</button>
      <input type="file" id="icsFile" accept=".ics,text/calendar" style="display:none" onchange="untisFile(this)">
      ${u.ev.length?`<button class="btn r sm" onclick="if(confirm('Importierten Stundenplan löschen?')){S.untis.ev=[];S.untis.at=0;save();renderPlan()}">Import löschen</button>`:""}
    </div>
    <p class="small mut">${u.at?`${u.ev.length} Stunden geladen am ${new Date(u.at).toLocaleString("de-DE")}.`:"Noch nichts geladen."}</p>
    ${u.ev.length||u.week.length?`<details class="exsec"><summary><b>Nächste 14 Tage ansehen</b></summary>${Array.from({length:14},(_,i)=>i).map(i=>{ const l=lessonsOn(i); return l.length?`<div style="margin-top:8px"><b>${esc(i===0?"Heute":dayLabel(i,dayStr(i)))}</b>${lessonRows(l)}</div>`:""; }).join("")||'<p class="small mut">Keine Stunden in den nächsten 14 Tagen.</p>'}</details>`:""}
    <hr class="sep">
    <b>✍️ Oder Stundenplan selbst eintragen (wöchentlich)</b>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px">
      <select class="fi" id="wD">${[1,2,3,4,5,6].map(d=>`<option value="${d}">${WD[d]}</option>`).join("")}</select>
      <input class="fi" id="wF" type="time" value="08:00"><input class="fi" id="wT" type="time" value="09:30">
      <input class="fi" id="wN" placeholder="Fach"><input class="fi" id="wR" placeholder="Raum">
      <select class="fi" id="wB"><option value="0">jede Woche</option><option value="1">alle 2 Wochen – ab dieser Woche</option><option value="2">alle 2 Wochen – ab nächster Woche</option></select>
    </div>
    <button class="btn ghost sm" style="margin-top:8px" onclick="weekAdd()">+ Stunde</button>
    ${u.off.length?`<p class="small mut">🏖️ ${u.off.length} Ferien-/Feiertage aus WebUntis hinterlegt – dort fällt der Plan automatisch weg.</p>`:""}
    ${[1,2,3,4,5,6].map(d=>{ const l=u.week.filter(w=>w.d===d).sort((a,b)=>a.from<b.from?-1:1); return l.length?`<div style="margin-top:10px"><b>${WD[d]}</b>${l.map(w=>`<div class="trow"><span class="tm">${esc(w.from)}–${esc(w.to)}</span><span style="flex:1">${esc(w.t)}${w.r?` <small class="mut">· ${esc(w.r)}</small>`:""}${w.bi?` <small class="mut">· alle 2 Wochen${((Math.floor(dayDiff(weekStartStr(),w.bi)/7)%2)+2)%2===0?" (diese Woche)":" (nächste Woche)"}</small>`:""}</span><button class="xbtn" title="Löschen" onclick="weekDel(${u.week.indexOf(w)})">✕</button></div>`).join("")}</div>`:""; }).join("")}
  </div>
  <div class="card" style="margin-top:14px">
    <b>📝 Klassenarbeiten &amp; Termine</b>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
      <input class="fi" id="evD" type="date" value="${today()}"><input class="fi" id="evT" placeholder="z. B. Klassenarbeit IT-Systeme"><input class="fi" id="evS" placeholder="Fach (optional)">
    </div>
    <label class="small" style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="evX"> 📝 Prüfung / Klassenarbeit (Countdown auf dem Dashboard)</label>
    <button class="btn ghost sm" style="margin-top:8px" onclick="eventAdd()">+ Termin</button>
    ${upcoming(365).map(x=>`<div class="trow"><span class="tm">${esc(x.date)}</span><span style="flex:1">${esc(x.title)}${x.subj?` <small class="mut">· ${esc(x.subj)}</small>`:""} <small class="mut">(${esc(whenTxt(x.date))})</small></span>${x.own?`<button class="xbtn" data-id="${x.own}" onclick="eventDel(this.dataset.id)">✕</button>`:'<small class="mut">Agent</small>'}</div>`).join("")}
  </div>`;
}
function weekAdd(){
  const from=$("wF").value, to=$("wT").value, t=$("wN").value.trim();
  if(!/^\d\d:\d\d$/.test(from) || !t) return toast("Uhrzeit und Fach angeben");
  const b=$("wB")?+$("wB").value:0, mon=new Date(weekStartStr()+"T12:00"); mon.setDate(mon.getDate()+(b===2?7:0));
  const bi=b?mon.getFullYear()+"-"+String(mon.getMonth()+1).padStart(2,"0")+"-"+String(mon.getDate()).padStart(2,"0"):"";
  S.untis.week.push({d:+$("wD").value, from, to:/^\d\d:\d\d$/.test(to)?to:from, t:t.slice(0,80), r:$("wR").value.trim().slice(0,60), bi});
  save(); renderPlan();
}
function weekDel(i){ S.untis.week.splice(i,1); save(); renderPlan(); }
function eventAdd(){
  const date=$("evD").value, title=$("evT").value.trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) return toast("Datum und Titel angeben");
  S.events.push({id:"e"+Date.now(), date, title:title.slice(0,120), subj:$("evS").value.trim().slice(0,40), exam:!!($("evX")&&$("evX").checked)}); save(); renderPlan(); toast("Termin gespeichert ✓");
}
function eventDel(id){ S.events=S.events.filter(e=>e.id!==id); save(); renderPlan(); }
/* iCal-Parser (RFC 5545, nur was ein Stundenplan braucht) */
function icsText(v){ return v.replace(/\\n/gi," ").replace(/\\([,;\\])/g,"$1").trim(); }
function icsDate(v){
  const m=/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/.exec(v); if(!m) return 0;
  return m[7] ? Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)) : new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)).getTime();
}
function parseICS(txt){
  const out=[]; let ev=null;
  String(txt).replace(/\r?\n[ \t]/g,"").split(/\r?\n/).forEach(ln=>{
    if(ln==="BEGIN:VEVENT"){ ev={}; return; }
    if(ln==="END:VEVENT"){ if(ev && ev.s) out.push(ev); ev=null; return; }
    if(!ev) return;
    const i=ln.indexOf(":"); if(i<0) return;
    const key=ln.slice(0,i).split(";")[0].toUpperCase(), val=ln.slice(i+1);
    if(key==="DTSTART") ev.s=icsDate(val);
    else if(key==="DTEND") ev.e=icsDate(val);
    else if(key==="SUMMARY") ev.t=icsText(val).slice(0,80);
    else if(key==="LOCATION") ev.r=icsText(val).slice(0,60);
    else if(key==="STATUS") ev.cx=/CANCELLED/i.test(val);
  });
  return out;
}
function untisStore(txt, silent){
  if(!/BEGIN:VCALENDAR/.test(txt)){ if(!silent) toast("Das ist keine Kalender-Datei (.ics)"); return; }
  const from=Date.now()-86400000, to=Date.now()+90*86400000;
  const ev=parseICS(txt).filter(e=>e.s>=from && e.s<=to).sort((a,b)=>a.s-b.s).slice(0,800)
    .map(e=>({s:e.s, e:e.e||e.s, t:e.t||"Unterricht", r:e.r||"", cx:!!e.cx}));
  S.untis.ev=ev; S.untis.at=Date.now(); save();
  if(!silent){ toast(ev.length+" Stunden übernommen ✓"); if(V.view==="plan") renderPlan(); }
  else if(V.view==="home") render();
}
async function untisFetch(silent){
  const inp=$("untisUrl");
  const url=(silent||!inp) ? S.untis.url : inp.value.trim();
  if(!/^https:\/\/[^\s"'<>]{4,600}$/.test(url||"")){ if(!silent) toast("Bitte einen https-Link einfügen"); return; }
  if(untisHtmlLink(url)){
    if(silent) return;
    S.untis.url=""; save(); if(inp) inp.value="";
    return toastModal(`<h2 style="margin-top:0">🏫 Das ist kein iCal-Link</h2>
      <p>Der „Öffentliche Link“ aus WebUntis zeigt nur eine Webseite, keinen Kalender-Feed – den kann Lernhub nicht laden.</p>
      <p>Wenn im ⋯-Menü <b>„iCal-Abo verwalten“</b> fehlt, hat deine Schule das Modul <b>„Individuelle Stundenplanabfrage“</b> für Schüler ausgeschaltet.</p>
      <p><b>Was geht stattdessen:</b><br>✍️ Plan unten selbst eintragen (2 Minuten)<br>📂 eine .ics-Datei importieren (z. B. Export aus dem Untis-Kalender)<br>🙋 Lehrkraft/IT bitten, das Modul freizuschalten – dann klappt der Link.</p>
      <button class="btn" onclick="closeModal()">Verstanden</button>`);
  }
  if(!silent){ S.untis.url=url; save(); toast("⏳ Lade Stundenplan …"); }
  let txt=null;
  try{ const r=await fetch(url); if(!r.ok) throw new Error("HTTP "+r.status); txt=await r.text(); }
  catch(e){
    if(CLOUD && cloudCfg()){ try{ txt=await cloudUntis(url); }catch(e2){ if(!silent) toast(e2.message||"Untis-Abruf fehlgeschlagen", 6000); return; } }
  }
  if(txt) return untisStore(txt.slice(0,3000000), silent);
  if(!silent) toast("Direkter Abruf blockiert (CORS). Öffne den Link, lade die .ics herunter und importiere sie hier – oder melde dich an (👤 Konto), dann klappt's über den Server.", 7000);
}
/* WebUntis-Ansicht (#/basic/timetablePublic …) statt iCal-Feed (Ical.do / /ical/) */
function untisHtmlLink(url){ return /webuntis/i.test(url) && !/ical/i.test(url) && /#\/|timetable|[?&]school=/i.test(url); }
function untisFile(input){
  const f=input.files[0]; if(!f) return;
  if(f.size>5*1024*1024) return toast("Datei zu groß");
  const rd=new FileReader(); rd.onload=()=>untisStore(String(rd.result)); rd.readAsText(f);
}
/* Erinnerungen: eskalierend bis Tagesziel erreicht */
let REM_LAST=0, REM_SNOOZE=0;
const BASE_TITLE=document.title;
function remindActive(){
  if(!S.remind.on || dayGoalPct()>=100 || isRestDay(today())) return false;
  const [h,m]=S.remind.from.split(":").map(Number), now=new Date();
  return now.getHours()*60+now.getMinutes() >= h*60+m;
}
function remindGapMin(){ const h=new Date().getHours(); return h>=22?5:h>=20?15:h>=18?30:60; }
function remindText(){
  const h=new Date().getHours(), left=Math.max(0,(S.profile.daily||20)-todayXP()), st=streakNow();
  if(h>=22) return `🚨 Letzte Chance! Nur noch ${left} XP – sonst ${st?"reißt deine "+st+"-Tage-Streak":"ist der Tag vorbei"}. 5 Minuten reichen!`;
  if(h>=20) return `⏰ Der Tag ist bald rum – dir fehlen noch ${left} XP. Eine kurze Lektion?`;
  return `📚 Tagesziel noch offen: ${left} XP fehlen. ${st?"Halte deine 🔥 "+st+"-Tage-Streak!":"Starte heute eine Streak!"}`;
}
function remindTick(){
  const active=remindActive();
  document.title = active ? "⏰ Tagesziel offen – "+BASE_TITLE : BASE_TITLE;
  if(!active){ hideRemind(); return; }
  if(V.view==="lesson" || Date.now()<REM_SNOOZE || Date.now()-REM_LAST < remindGapMin()*60000) return;
  REM_LAST=Date.now();
  const txt=remindText();
  if(document.hidden && "Notification" in window && Notification.permission==="granted"){
    try{ const n=new Notification("Lernhub", {body:txt, tag:"lernhub-remind"}); n.onclick=()=>{ window.focus(); n.close(); }; }catch(e){}
  }
  let b=$("remindBar");
  if(!b){ b=document.createElement("div"); b.id="remindBar"; b.setAttribute("role","alert"); document.body.appendChild(b); }
  b.innerHTML=`<p></p><button class="btn g sm" onclick="hideRemind();continueLesson()">Jetzt lernen</button> <button class="btn ghost sm" onclick="REM_SNOOZE=Date.now()+30*60000;hideRemind()">30 Min später</button>`;
  b.querySelector("p").textContent=txt;
}
function hideRemind(){ const b=$("remindBar"); if(b) b.remove(); }
function askNotify(){
  if(!("Notification" in window)) return toast("Dein Browser unterstützt keine Benachrichtigungen");
  Notification.requestPermission().then(p=>{ S.remind.notify=p==="granted"; save(); toast(p==="granted"?"Benachrichtigungen an ✓":"Nicht erlaubt – Erinnerungen kommen nur in der Seite"); if(V.view==="plan") renderPlan(); });
}
function downloadRemindICS(){
  const d=today().replace(/-/g,""), stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const times=[S.remind.from, "20:00", "21:30"].filter((t,i,a)=>a.indexOf(t)===i);
  const ev=times.map((t,i)=>[
    "BEGIN:VEVENT", `UID:lernhub-remind-${i}-${d}@lernhub`, `DTSTAMP:${stamp}`,
    `DTSTART:${d}T${t.replace(":","")}00`, "DURATION:PT10M", "RRULE:FREQ=DAILY",
    `SUMMARY:${i===times.length-1?"Letzte Chance: ":""}Lernhub – Tagesziel schon geschafft?`,
    "DESCRIPTION:Kurze Lektion = Streak gerettet. Wenn schon erledigt: einfach ignorieren.",
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Lernhub","TRIGGER:PT0M","END:VALARM","END:VEVENT"].join("\r\n"));
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Lernhub//Erinnerungen//DE"].concat(ev,["END:VCALENDAR"]).join("\r\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));
  a.download="lernhub-erinnerungen.ics"; a.click(); URL.revokeObjectURL(a.href);
  toast("Datei öffnen → zum Kalender hinzufügen ✓");
}

/* ===================== 🔗 Lernlinks (mit Credits) ===================== */
const LINKS=[
  {cat:"🎥 Erklärvideos", items:[
    {n:"simpleclub", d:"Die Lernplattform für Schule & Ausbildung – kurze Videos, IHK-Prüfungsvorbereitung (GAP 1 & 2), KI-Assistent.", u:"https://simpleclub.com", by:"simpleclub GmbH"},
    {n:"simpleclub auf YouTube", d:"Kostenlose Erklärvideos zu Mathe, Physik, Informatik, Wirtschaft …", u:"https://www.youtube.com/channel/UCdQvwubOWGRB8JyoEC7lSbA", by:"simpleclub GmbH"},
    {n:"Lehrer Schmidt", d:"Mathe & Grundlagen Schritt für Schritt erklärt – ideal zum Nachholen.", u:"https://www.youtube.com/results?search_query=Lehrer+Schmidt", by:"Lehrer Schmidt (YouTube)"},
    {n:"Studyflix", d:"Über 8.000 kostenlose Lernvideos, auch Informatik, Wirtschaft und ein Ausbildungsportal.", u:"https://studyflix.de", by:"Studyflix"},
    {n:"Studyflix – Informatik", d:"Informatik-Themen für Schüler und Azubis.", u:"https://studyflix.de/informatik-schueler", by:"Studyflix"},
    {n:"Khan Academy (Deutsch)", d:"Kostenlose Übungen und Videos, besonders Mathe.", u:"https://de.khanacademy.org", by:"Khan Academy"}
  ]},
  {cat:"💻 IT, Netzwerk & Elektrotechnik", items:[
    {n:"Elektronik-Kompendium: Netzwerktechnik", d:"OSI-Modell, IP, Subnetting, Ethernet – die Azubi-Referenz.", u:"https://www.elektronik-kompendium.de/sites/net/index.htm", by:"Elektronik-Kompendium.de"},
    {n:"Elektronik-Kompendium: Computertechnik", d:"Hardware, Schnittstellen, Speicher.", u:"https://www.elektronik-kompendium.de/sites/com/index.htm", by:"Elektronik-Kompendium.de"},
    {n:"Elektronik-Kompendium: Grundlagen & Formeln", d:"Spannung, Strom, Widerstand, Formelsammlungen.", u:"https://www.elektronik-kompendium.de/sites/grd/index.htm", by:"Elektronik-Kompendium.de"},
    {n:"Elektronik-Kompendium: Digitaltechnik", d:"Zahlensysteme, Logikgatter.", u:"https://www.elektronik-kompendium.de/sites/dig/index.htm", by:"Elektronik-Kompendium.de"},
    {n:"MDN Web Docs", d:"Die Referenz für HTML, CSS und JavaScript.", u:"https://developer.mozilla.org/de/", by:"Mozilla"},
    {n:"W3Schools", d:"Programmieren lernen mit Beispielen zum Ausprobieren.", u:"https://www.w3schools.com", by:"W3Schools"}
  ]},
  {cat:"🗣️ Sprache", items:[
    {n:"Duden", d:"Rechtschreibung und Grammatik nachschlagen.", u:"https://www.duden.de", by:"Cornelsen Verlag / Duden"},
    {n:"LEO Wörterbuch", d:"Englisch ↔ Deutsch, mit Aussprache und Forum.", u:"https://dict.leo.org", by:"LEO GmbH"},
    {n:"Duolingo", d:"Das Vorbild für Lernhubs Lernpfad, Streaks und Ligen – kostenlos Sprachen lernen.", u:"https://www.duolingo.com", by:"Duolingo, Inc."}
  ]}
];
function renderLinks(){
  $("app").innerHTML=`
  <div class="h1">🔗 Lernlinks</div>
  <p class="mut">Die besten kostenlosen Lernquellen – alles an einem Ort, damit du nicht zwischen zehn Apps springen musst.</p>
  <div class="promo">
    <span class="pill" style="background:rgba(255,255,255,.4);color:#2b1700">Unsere Empfehlung</span>
    <h2 style="margin:8px 0 4px">🎓 simpleclub – Lernen, das Spaß macht</h2>
    <p style="margin:0 0 6px">Fast jeder zwischen 16 und 25 kennt es: über 2 Mio. Nutzer, kurze Videos, Lernpläne nach IHK-Rahmenlehrplan und Prüfungssimulation für GAP 1 &amp; GAP 2. Perfekt als Ergänzung zu Lernhub – hier üben, dort Videos schauen.</p>
    <a class="btn sm" href="https://simpleclub.com" target="_blank" rel="noopener noreferrer">simpleclub.com ↗</a>
    <a class="btn ghost sm" href="https://simpleclub.com/unlimited" target="_blank" rel="noopener noreferrer">Für die Schule ↗</a>
    <a class="btn ghost sm" href="https://www.youtube.com/channel/UCdQvwubOWGRB8JyoEC7lSbA" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
    <p class="small" style="margin:10px 0 0;opacity:.8">Unbezahlte Empfehlung – keine Kooperation, kein Sponsoring.</p>
  </div>
  <div class="card" style="margin-top:14px">
    <b>🔍 Thema in Videos suchen</b>
    <div class="exrow"><input class="fi" id="lkQ" placeholder="z. B. Subnetting, Ohmsches Gesetz, Kaufvertrag" onkeydown="if(event.key==='Enter')linkSearch('')"></div>
    <div class="quickbtns">
      <button class="btn sm" onclick="linkSearch('simpleclub')">bei simpleclub</button>
      <button class="btn ghost sm" onclick="linkSearch('Lehrer Schmidt')">bei Lehrer Schmidt</button>
      <button class="btn ghost sm" onclick="linkSearch('Studyflix')">bei Studyflix</button>
      <button class="btn ghost sm" onclick="linkSearch('')">überall</button>
    </div>
  </div>
  ${LINKS.map(c=>`<h2 class="h2">${c.cat}</h2>${c.items.map(l=>`<a class="linkcard" href="${esc(l.u)}" target="_blank" rel="noopener noreferrer"><b>${esc(l.n)} ↗</b><span>${esc(l.d)}</span><br><small class="mut">© ${esc(l.by)}</small></a>`).join("")}`).join("")}
  <div class="card" style="margin-top:18px"><b>🙏 Credits</b>
    <p class="small mut">Alle verlinkten Inhalte, Namen und Marken gehören den jeweiligen Anbietern (${[...new Set(LINKS.flatMap(c=>c.items.map(l=>l.by)))].map(esc).join(", ")}). Lernhub verlinkt nur auf deren Seiten, kopiert keine Inhalte und bettet keine Videos ein. Danke, dass ihr Lernen für alle zugänglich macht!</p>
    <p class="small mut">🐧 ${esc(DUO_CREDIT)}</p>
  </div>`;
}
function linkSearch(who){
  const q=($("lkQ").value||"").trim(); if(!q) return toast("Erst ein Thema eingeben");
  openUrl(VID_BASIS+encodeURIComponent((who?who+" ":"")+q+(who?"":" einfach erklärt")));
}

/* ===================== 🎭 Lernrunde: mehrere Figuren erklären ein Thema – du hörst zu und redest mit ===================== */
let RUNDE={subj:null, tid:null, ids:[], log:[], run:0, cur:"", phase:"idle", mic:null};
function rundeChars(){ return CAST.concat((S.chars || []).filter(c=>!castById(c.id))); }
function rundeChar(id){ return rundeChars().find(c=>c.id===id) || null; }
function rundeTopic(){
  const sid=RUNDE.subj && subjById(RUNDE.subj) ? RUNDE.subj : favSubject();
  const subj=subjById(sid);
  const tp=subj.topics.find(t=>t.id===RUNDE.tid) || nextLessonFor(sid);
  RUNDE.subj=sid; RUNDE.tid=tp.id;
  return {sid, subj, tp};
}
function renderRunde(){
  const {sid, subj, tp}=rundeTopic(), ids=allSubjectIds(), all=rundeChars();
  if(!RUNDE.ids.length) RUNDE.ids=[...new Set([activeChar().id, "kaito", "fenna"])].filter(id=>rundeChar(id)).slice(0,3);
  const sel=RUNDE.ids.map(rundeChar).filter(Boolean);
  $("app").innerHTML=`
  <div class="hero" style="background:linear-gradient(135deg,#7c3aed,#1a2a63)">
    <h1>🎭 Lernrunde</h1><p>Deine Lieblingsfiguren erklären dir ein Thema – jede auf ihre eigene Art. Du hörst zu und kannst jederzeit mitreden oder selbst erklären.</p><span class="big">🎧</span>
  </div>
  ${agentOn()?"":`<div class="card" style="margin-top:12px"><b>ℹ️ Offline-Modus</b><br><small class="mut">Die Figuren tragen den Lernstoff vor und antworten aus den Lernkarten. Damit sie frei in ihrer Rolle antworten: 🤖 Agent → OpenCode verbinden.</small></div>`}
  <div class="pathtabs" style="margin-top:14px">${ids.map(id=>`<button class="${id===sid?'on':''}" data-s="${esc(id)}" onclick="rundeStop();RUNDE.subj=this.dataset.s;RUNDE.tid=null;RUNDE.log=[];renderRunde()">${esc(subjById(id).name)}</button>`).join("")}</div>
  <select class="fi" onchange="rundeStop();RUNDE.tid=this.value;RUNDE.log=[];renderRunde()">
    ${subj.topics.map((t,i)=>`<option value="${esc(t.id)}" ${t.id===tp.id?"selected":""}>${i+1}. ${esc(t.name)}</option>`).join("")}
  </select>
  <details class="card" style="margin-top:12px" ${RUNDE.log.length?"":"open"}>
    <summary><b>Wer ist dabei?</b> <small class="mut">(1–4 Figuren · ${sel.map(c=>esc(c.name)).join(", ")})</small></summary>
    <div class="rundepick">${all.map(c=>`<button class="${RUNDE.ids.includes(c.id)?'on':''}" data-c="${esc(c.id)}" onclick="rundePick(this.dataset.c)" style="--cc:${esc(c.color||"#7c5cff")}"><span class="rav">${charAvatarHTML(c)}</span>${esc(c.name)}</button>`).join("")}</div>
  </details>
  <div class="card" style="margin-top:12px">
    <div class="rundecast">${sel.map(c=>`<div class="rundeseat ${RUNDE.cur===c.id?'on':''}" data-seat="${esc(c.id)}" style="--cc:${esc(c.color||"#7c5cff")}"><span class="rav big">${charAvatarHTML(c)}</span><b>${esc(c.name)}</b></div>`).join("")}</div>
    <div class="exmsgs" id="rundeLog"></div>
    <div class="quickbtns" id="rundeBtns" style="justify-content:center"></div>
    <div class="exrow"><input class="fi" id="rundeIn" maxlength="600" placeholder="Frag die Runde oder erklär selbst … (Name nennen = diese Figur antwortet)" onkeydown="if(event.key==='Enter')rundeSend(this.value)">
      ${hasSTT()?`<button class="btn ghost" id="rundeMicBtn" title="Sprechen statt tippen" onclick="rundeMic()">🎤</button>`:""}
      <button class="btn" onclick="rundeSend($('rundeIn').value)">➤</button></div>
  </div>`;
  rundePaint(); rundeButtons();
}
function rundePick(id){
  const i=RUNDE.ids.indexOf(id);
  if(i>=0){ if(RUNDE.ids.length<2) return toast("Mindestens eine Figur muss dabei sein."); RUNDE.ids.splice(i,1); }
  else { if(RUNDE.ids.length>=4) return toast("Höchstens 4 Figuren gleichzeitig."); RUNDE.ids.push(id); }
  rundeStop(); renderRunde();
}
function rundePaint(){
  const el=$("rundeLog"); if(!el) return;
  el.innerHTML=RUNDE.log.length ? RUNDE.log.map(m=>{ const c=m.id==="me"?null:rundeChar(m.id);
    return `<div class="msg ${c?"bot":"me"}">${c?`<b>${esc(c.name)}:</b> `:""}${esc(m.t)}</div>`; }).join("")
    : `<p class="small mut center">Drück „▶️ Los geht's“ – dann erklärt dir die Runde „${esc(rundeTopic().tp.name)}“.</p>`;
  el.scrollTop=el.scrollHeight;
  document.querySelectorAll(".rundeseat").forEach(s=>s.classList.toggle("on", s.dataset.seat===RUNDE.cur));
}
function rundeButtons(){
  const b=$("rundeBtns"); if(!b) return;
  b.innerHTML=RUNDE.phase==="play" ? `<button class="btn r sm" onclick="rundeStop()">⏹️ Stopp</button>`
    : RUNDE.phase==="think" ? `<button class="btn ghost sm" disabled>💭 Die Runde überlegt …</button><button class="btn ghost sm" onclick="rundeStop()">Abbrechen</button>`
    : `<button class="btn g sm" onclick="rundeStart()">▶️ ${RUNDE.log.length?"Nochmal erklären":"Los geht's"}</button>`;
}
function rundeStop(){
  RUNDE.run++;
  if(RUNDE.phase==="play") ttsStop();
  RUNDE.phase="idle"; RUNDE.cur="";
  if(RUNDE.mic){ try{ RUNDE.mic.stop(); }catch(e){} RUNDE.mic=null; }
  rundePaint(); rundeButtons();
}
function rundeCtx(cs, tp){
  return `Du schreibst gesprochene Dialogzeilen für die Lern-App „Lernhub“ (Berufsschule, Fachinformatiker-Azubis). Mehrere Figuren erklären ${S.profile.name||"dem Azubi"} das Thema „${tp.name}“ – jede auf ihre eigene, typische Art.
Figuren:
${cs.map(c=>`- id "${c.id}": ${c.name} – ${String(c.blurb||"").slice(0,160)}${c.style?" Sprechstil: "+String(c.style).slice(0,220):""}`).join("\n")}
Lernstoff (fachlich korrekt bleiben, darauf aufbauen): ${topicFacts(tp).slice(0,14).join(" | ").slice(0,1800)}
${AGE_RULES}
Antwortformat: NUR ein JSON-Array, z. B. [{"id":"${cs[0].id}","text":"..."}]. Nur die ids oben verwenden. Benutze keine Tools. Kein Markdown, keine Emojis, keine Regieanweisungen – nur das, was die Figur laut sagt.`;
}
function rundeParse(t, cs){
  const s=String(t||""), a=s.indexOf("["), b=s.lastIndexOf("]");
  const find=x=>{ const k=String(x||"").toLowerCase(); return cs.find(c=>c.id===k || String(c.name).toLowerCase()===k || String(c.name).toLowerCase().startsWith(k+" ")); };
  if(a>=0 && b>a){
    try{
      const arr=JSON.parse(s.slice(a,b+1));
      if(Array.isArray(arr)) return arr.map(x=>({c:x && find(x.id), t:x && typeof x.text==="string" ? x.text.trim() : ""}))
        .filter(x=>x.c && x.t).slice(0,10).map(x=>({id:x.c.id, t:x.t.slice(0,600)}));
    }catch(e){}
  }
  /* abgeschnittenes JSON: vollständige {"id","text"}-Objekte einzeln retten */
  const part=[...s.matchAll(/\{\s*"id"\s*:\s*"([^"]{1,40})"\s*,\s*"text"\s*:\s*("(?:[^"\\]|\\.)*")\s*\}/g)]
    .map(m=>{ try{ return {c:find(m[1]), t:String(JSON.parse(m[2])).trim()}; }catch(e){ return {}; } }).filter(x=>x.c && x.t);
  if(part.length) return part.slice(0,10).map(x=>({id:x.c.id, t:x.t.slice(0,600)}));
  if(a>=0) return null;
  return s.trim() ? [{id:cs[0].id, t:s.trim().slice(0,600)}] : null;
}
function rundeOffline(cs, tp){
  const intro=[`Heute geht's um ${tp.name}. Ich fang an:`, "Ich ergänze:", "Und noch was Wichtiges:", "Das kommt gern in der Prüfung:"];
  const out=topicFacts(tp).slice(0, Math.max(3, cs.length*2)).map((f,i)=>({id:cs[i%cs.length].id, t:(i<cs.length?intro[i]+" ":"")+f.replace(/ → /g,": ")}));
  if(!out.length) return [{id:cs[0].id, t:`Zu ${tp.name} gibt es noch keinen Lernstoff. Schau mal im Erklär-Modus.`}];
  out.push({id:cs[0].id, t:"Alles klar so weit? Frag uns einfach, wenn etwas unklar ist – oder erklär es uns selbst."});
  return out;
}
function rundeOfflineAnswer(q, tp){
  rundeChars().forEach(c=>{ const w=String(c.name).split(" ")[0]; if(w) q=q.split(w).join(" "); });
  const t=norm(q), cards=tp.cards||[];
  if(/frage|quiz|test|prufung/.test(t) && (tp.mc||[]).length){
    const m=tp.mc[Math.floor(Math.random()*tp.mc.length)];
    return `Typische Prüfungsfrage: ${m.q} Richtig ist: ${m.c[m.a]}.${m.w?" Warum: "+m.w:""}`;
  }
  if(/wichtig|zusammen|worum|wasist|nochmal|wiederhol/.test(t) && cards.length)
    return "Das Wichtigste zu "+tp.name+":\n"+cards.slice(0,3).map(c=>"• "+c.f+" = "+c.b).join("\n");
  return exOffline(q, tp).replace(/ → /g,": ");
}
async function rundePlay(lines, run){
  RUNDE.phase="play"; rundeButtons();
  for(const l of lines){
    if(run!==RUNDE.run) return;
    const c=rundeChar(l.id); if(!c) continue;
    RUNDE.cur=c.id; RUNDE.log.push(l); RUNDE.log=RUNDE.log.slice(-60); rundePaint();
    const cbx=ttsEngine()==="cbx";
    await sayWait(c, l.t, undefined, (cbx?90000:30000)+l.t.length*(cbx?400:150));
    if(run!==RUNDE.run) return;
    await new Promise(r=>setTimeout(r, 350));
  }
  if(run!==RUNDE.run) return;
  RUNDE.phase="idle"; RUNDE.cur=""; rundePaint(); rundeButtons();
}
async function rundeStart(){
  const cs=RUNDE.ids.map(rundeChar).filter(Boolean);
  if(!cs.length) return toast("Wähl mindestens eine Figur.");
  rundeStop();
  const run=RUNDE.run, {tp}=rundeTopic(), who=S.profile.name||"dem Azubi";
  RUNDE.log=[]; rundePaint();
  let lines=null;
  if(agentOn()){
    RUNDE.phase="think"; rundeButtons();
    const t=await bridgeAsk(rundeCtx(cs, tp)+`
Aufgabe: Erklärt ${who} das Thema gemeinsam in ${Math.max(3, cs.length)} bis ${Math.max(4, cs.length*2)} Beiträgen. Jede Figur spricht mindestens einmal, je 2–3 Sätze. Jede Figur übernimmt einen anderen Aspekt (Grundidee, Beispiel aus Betrieb oder Alltag, typische Prüfungsfalle, Merksatz) und bleibt dabei klar in ihrer Rolle. Die Figuren dürfen kurz aufeinander eingehen. Der letzte Beitrag endet mit einer kurzen Frage an ${who}.`, cs.map(c=>c.name).join(" & "), cs[0].id);
    if(run!==RUNDE.run) return;
    lines=rundeParse(t, cs);
  }
  await rundePlay(lines && lines.length ? lines : rundeOffline(cs, tp), run);
}
async function rundeSend(raw){
  const q=String(raw||"").trim().slice(0,600); if(!q) return;
  if(AGENT_BUSY) return toast("Moment – die KI denkt noch nach …");
  const cs=RUNDE.ids.map(rundeChar).filter(Boolean);
  if(!cs.length) return toast("Wähl mindestens eine Figur.");
  const inp=$("rundeIn"); if(inp) inp.value="";
  rundeStop();
  const run=RUNDE.run, {tp}=rundeTopic(), who=S.profile.name||"Azubi";
  const named=cs.find(c=>{ const w=String(c.name).split(" ")[0].toLowerCase().replace(/[^a-zäöüß0-9]/g,""); return w && new RegExp("(^|[^a-zäöüß])"+w+"($|[^a-zäöüß])","i").test(q); });
  RUNDE.log.push({id:"me", t:q}); rundePaint();
  S.stats.exQ=(S.stats.exQ||0)+1; save();
  let lines=null;
  if(agentOn()){
    RUNDE.phase="think"; rundeButtons();
    const hist=RUNDE.log.slice(-12).map(m=>(m.id==="me" ? who : (rundeChar(m.id)||{name:m.id}).name)+": "+String(m.t).slice(0,300)).join("\n");
    const t=await bridgeAsk(rundeCtx(cs, tp)+`
Bisheriges Gespräch:
${hist}

Aufgabe: Reagiert auf die letzte Nachricht von ${who}. ${named?`${named.name} wurde direkt angesprochen und antwortet zuerst (id "${named.id}").`:"Es antwortet die Figur, die am besten passt."} Höchstens 2 Beiträge, je 1–3 Sätze, jede Figur in ihrer Rolle. Erklärt ${who} selbst etwas: Ist es richtig, lobt konkret; ist es falsch oder lückenhaft, korrigiert freundlich und sagt kurz warum. Fragen außerhalb des Lernstoffs kurz in der Rolle beantworten und zum Thema zurückführen.`, (named||cs[0]).name, (named||cs[0]).id);
    if(run!==RUNDE.run) return;
    lines=rundeParse(t, cs);
  }
  await rundePlay(lines && lines.length ? lines : [{id:(named||cs[0]).id, t:rundeOfflineAnswer(q, tp)}], run);
}
function rundeMic(){
  if(RUNDE.mic){ try{ RUNDE.mic.stop(); }catch(e){} return; }
  rundeStop();   /* Figuren verstummen, damit das Mikro sie nicht mithört */
  const b=$("rundeMicBtn"); if(b) b.textContent="🔴";
  RUNDE.mic=sttStart("de-DE", alts=>{ const t=alts[0]||""; if(t) rundeSend(t); }, ()=>{ RUNDE.mic=null; const b2=$("rundeMicBtn"); if(b2) b2.textContent="🎤"; });
}

/* ===================== 🗺️ App-Tour für Neue: Pingulin zeigt Schritt für Schritt alles ===================== */
let TOUR={on:false, i:0, list:[]};
function tourVisible(el){ if(!el) return null; const r=el.getBoundingClientRect(); return r.width>0 && r.height>0 ? el : null; }
/* Desktop-Menü, sonst Handy-Leiste, sonst „☰ Mehr“ */
function tourNav(v){ return ()=>tourVisible(document.querySelector(`#nav button[onclick="go('${v}')"]`)) || tourVisible(document.querySelector(`#mnav button[onclick="go('${v}')"]`)) || tourVisible(document.querySelector(`#mnav button[onclick="openMore()"]`)); }
const TOUR_STEPS=[
  {t:"👋 Willkommen im Lernhub!", d:"Ich bin Pingulin und zeig dir in einer Minute, wie hier alles funktioniert. Du kannst jederzeit überspringen – die Tour findest du später unter ⚙️ Einstellungen wieder."},
  {sel:()=>tourVisible(document.querySelector(".chip.streak")), opt:true, t:"🔥 Deine Streak", d:"Lern jeden Tag mindestens eine Lektion, dann wächst deine Streak. Mit einem Streak-Freeze rettest du sie an stressigen Tagen."},
  {sel:()=>tourVisible(document.querySelector(".chip.xp")), opt:true, t:"⚡ XP & Tagesziel", d:"Für jede richtige Antwort gibt's XP. Der Ring daneben zeigt, wie viel von deinem Tagesziel du heute schon geschafft hast."},
  {sel:()=>tourVisible($("heartsChip")), opt:true, t:"🔋 Akku", d:"Jeder Fehler kostet eine Zelle, alle 20 Minuten lädt eine nach. Wenn dich das stresst, kannst du den Akku in den Einstellungen abschalten."},
  {sel:tourNav("path"), t:"🎓 Lernpfad", d:"Hier findest du alle Fächer – ITS, SAE, BWL und mehr. Lektion für Lektion, wie bei Duolingo. Die nächste wird frei, sobald du die vorherige geschafft hast."},
  {sel:tourNav("explain"), t:"🧠 Erklär-Modus", d:"Kein Druck, kein Akku: Hier wird dir jedes Thema Schritt für Schritt erklärt – mit Beispielen und typischen Prüfungsfragen."},
  {sel:tourNav("runde"), t:"🎭 Lernrunde", d:"Deine Lieblingsfiguren erklären dir ein Thema, jede auf ihre eigene Art. Du hörst zu und redest per Text oder Mikro mit – sie antworten dir in ihrer Rolle."},
  {sel:tourNav("review"), t:"🔁 Wiederholen", d:"Was du falsch hattest, kommt hier zurück, bis es sitzt. Immer nur kurze Runden mit höchstens 10 Aufgaben."},
  {sel:tourNav("board"), t:"🏆 Bestenliste", d:"Vergleich dich mit deiner Klasse: Wochen-XP, Ligen und Lern-Duelle."},
  {sel:tourNav("plan"), t:"📅 Planer & 📝 Notizen", d:"Klassenarbeiten, Termine und deine Mitschriften an einem Ort. Lernhub erinnert dich rechtzeitig vor Prüfungen."},
  {sel:tourNav("chars"), t:"🧸 Charaktere", d:"Such dir deinen Lernbegleiter aus – oder bau dir einen eigenen mit Gesicht, Stimme und Persönlichkeit."},
  {sel:()=>tourVisible(($("agentDot")||{closest:()=>null}).closest(".chip")), opt:true, t:"🤖 KI-Agent", d:"Wenn OpenCode verbunden ist, bekommst du Tipps, Chat und die Lernrunde mit echter KI. Ohne Verbindung funktioniert alles offline aus dem Lernstoff."},
  {sel:()=>tourVisible($("fab")), opt:true, t:"✨ Hilfe-Chat", d:"Hier fragst du deinen Begleiter um Hilfe. Er gibt dir zuerst Tipps – die Lösung gibt's erst nach ein paar Versuchen. So bleibt mehr hängen."},
  {sel:tourNav("settings"), t:"⚙️ Einstellungen", d:"Stimmen, Akku, Tagesziel und Design – und du kannst sogar deine eigene Stimme für die Figuren aufnehmen."},
  {t:"🚀 Bereit?", d:"Am besten startest du direkt mit deiner ersten Lektion. Viel Erfolg – ich bin da, wenn du mich brauchst!", end:true}
];
function tourMaybe(){
  if(TOUR.on || S.seenTour || !S.seenOnboard || V.view!=="home") return;
  if(document.querySelector("#modal:not(.hidden)")) return;
  tourStart();
}
function tourStart(){
  if(TOUR.on) return;
  TOUR={on:true, i:0, list:TOUR_STEPS.filter(s=>!s.opt || s.sel())};
  let el=$("tour");
  if(!el){
    el=document.createElement("div"); el.id="tour";
    el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","tourT");
    document.body.appendChild(el);
  }
  el.innerHTML=`<div class="tour-hole"></div><div class="tour-tip" id="tourTip"></div>`;
  el.classList.add("show");
  window.addEventListener("keydown", tourKey, true);
  window.addEventListener("resize", tourPlace);
  tourGo(0);
}
function tourGo(i){
  if(!TOUR.on) return;
  if(i<0) i=0;
  if(i>=TOUR.list.length) return tourEnd(true);
  TOUR.i=i;
  const s=TOUR.list[i], last=i===TOUR.list.length-1, tip=$("tourTip");
  const target=s.sel ? s.sel() : null;
  if(target) target.scrollIntoView({block:"nearest", inline:"nearest"});
  tip.innerHTML=`<div class="tour-head"><span class="tour-av">${faceSVG(castById("fritz"))}</span>
      <div><b id="tourT">${esc(s.t)}</b><small class="mut">Schritt ${i+1} von ${TOUR.list.length}</small></div>
      <button class="tour-x" onclick="tourEnd(true)" title="Tour beenden" aria-label="Tour beenden">✕</button></div>
    <p>${esc(s.d)}${target && /openMore/.test(target.getAttribute("onclick")||"") ? " <b>Zu finden unter ☰ Mehr.</b>" : ""}</p>
    <div class="tour-bar"><i style="width:${Math.round(100*(i+1)/TOUR.list.length)}%"></i></div>
    <div class="tour-btns">
      <button class="btn ghost sm" onclick="sayAs(castById('fritz'), TOUR.list[TOUR.i].t+'. '+TOUR.list[TOUR.i].d)" title="Vorlesen">🔊</button>
      ${i>0?`<button class="btn ghost sm" onclick="tourGo(TOUR.i-1)">Zurück</button>`:`<button class="btn ghost sm" onclick="tourEnd(true)">Überspringen</button>`}
      ${last?`<button class="btn g sm" onclick="tourEnd(true);continueLesson()">▶️ Erste Lektion</button><button class="btn sm" id="tourNext" onclick="tourEnd(true)">Fertig</button>`
            :`<button class="btn sm" id="tourNext" onclick="tourGo(TOUR.i+1)">Weiter ›</button>`}
    </div>`;
  TOUR.target=target;
  tourPlace();
  talkAnim("fritz", s.d);
  const nx=$("tourNext"); if(nx) nx.focus();
}
function tourPlace(){
  if(!TOUR.on) return;
  const hole=document.querySelector("#tour .tour-hole"), tip=$("tourTip"); if(!hole || !tip) return;
  const vw=window.innerWidth, vh=window.innerHeight, pad=8, gap=14;
  const t=TOUR.target && tourVisible(TOUR.target);
  if(!t){
    Object.assign(hole.style, {left:vw/2+"px", top:vh/2+"px", width:"0px", height:"0px"});
    tip.style.left=Math.max(10,(vw-tip.offsetWidth)/2)+"px"; tip.style.top=Math.max(10,(vh-tip.offsetHeight)/2)+"px";
    return;
  }
  const r=t.getBoundingClientRect();
  Object.assign(hole.style, {left:(r.left-pad)+"px", top:(r.top-pad)+"px", width:(r.width+pad*2)+"px", height:(r.height+pad*2)+"px"});
  const w=tip.offsetWidth, h=tip.offsetHeight;
  const spots=[
    [r.right+pad+gap, r.top+r.height/2-h/2, r.right+pad+gap+w<=vw],
    [r.left+r.width/2-w/2, r.bottom+pad+gap, r.bottom+pad+gap+h<=vh],
    [r.left+r.width/2-w/2, r.top-pad-gap-h, r.top-pad-gap-h>=0],
    [r.left-pad-gap-w, r.top+r.height/2-h/2, r.left-pad-gap-w>=0]
  ];
  const [x,y]=(spots.find(s=>s[2]) || [(vw-w)/2, vh-h-10]);
  tip.style.left=Math.min(Math.max(10,x), vw-w-10)+"px";
  tip.style.top=Math.min(Math.max(10,y), vh-h-10)+"px";
}
function tourKey(e){
  if(!TOUR.on) return;
  if(e.key==="Escape"){ e.stopPropagation(); e.preventDefault(); tourEnd(true); }
  else if(e.key==="ArrowRight"){ e.stopPropagation(); e.preventDefault(); tourGo(TOUR.i+1); }
  else if(e.key==="ArrowLeft"){ e.stopPropagation(); e.preventDefault(); tourGo(TOUR.i-1); }
  else if(e.key==="Enter"){ e.stopPropagation(); }   /* nicht an „Weiter nach Aufgabe“ durchreichen */
  else if(e.key==="Tab"){   /* Fokus im Dialog halten */
    const f=[...document.querySelectorAll("#tourTip button")]; if(!f.length) return;
    const k=f.indexOf(document.activeElement), n=e.shiftKey ? (k<=0?f.length-1:k-1) : (k<0||k===f.length-1?0:k+1);
    e.preventDefault(); f[n].focus();
  }
}
function tourEnd(done){
  TOUR.on=false;
  window.removeEventListener("keydown", tourKey, true);
  window.removeEventListener("resize", tourPlace);
  const el=$("tour"); if(el){ el.classList.remove("show"); el.innerHTML=""; }
  ttsStop(); talkStop();
  if(done && !S.seenTour){ S.seenTour=true; save(); }
}

/* ===================== Start-Hooks ===================== */
function plusInit(){
  setInterval(()=>{
    if(V.view==="lesson" && LES && LES.outOfHearts) renderNoHearts(); else renderTop();
    remindTick();
  }, 30000);
  setTimeout(remindTick, 4000);
  document.addEventListener("visibilitychange", ()=>{ if(!document.hidden){ renderTop(); remindTick(); } });
}
