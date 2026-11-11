/* =========================================================================
   js/feed.js – 🎬 Wissens-Feed: vertikale Kurzvideos wie bei TikTok.
   Tabs „Für dich“ (nach deinem Lernstand), „Fächer“ und „Gespeichert“.
   Nur das sichtbare Video läuft (youtube-nocookie, stumm bis du Ton anmachst).
   ========================================================================= */
let FEED = { tab: "fy", subj: null, list: [], idx: 0, io: null, sound: false, skip: {}, key: null };
const FEED_EXTRA_NAMES = { LERN: "🧪 Lernmethoden" };

function feedState() {
  if (!S.feed || typeof S.feed !== "object" || Array.isArray(S.feed)) S.feed = {};
  const f = S.feed;
  if (!f.likes || typeof f.likes !== "object" || Array.isArray(f.likes)) f.likes = {};
  if (!Array.isArray(f.saved)) f.saved = [];
  f.saved = f.saved.filter((x) => typeof x === "string").slice(0, 300);
  if (!f.seen || typeof f.seen !== "object" || Array.isArray(f.seen)) f.seen = {};
  return f;
}
function feedVideos() {
  return (Array.isArray(window.LERNHUB_VIDEOS) ? window.LERNHUB_VIDEOS : []).filter(
    (v) => v && /^[\w-]{11}$/.test(v.id) && typeof v.f === "string",
  );
}
function feedSubjName(f) {
  if (FEED_EXTRA_NAMES[f]) return FEED_EXTRA_NAMES[f];
  const s = typeof subjById === "function" ? subjById(f) : null;
  return (s && s.name) || (typeof SUBJECT_NAMES !== "undefined" && SUBJECT_NAMES[f]) || f;
}

/* Wie stark interessiert dich ein Fach gerade? Lernstand + Prüfungen + Likes */
function feedWeights() {
  const w = {},
    add = (f, n) => {
      if (f) w[f] = (w[f] || 0) + n;
    };
  Object.entries(S.progress || {}).forEach(([tid, p]) => {
    const sid = typeof subjectOfTopic === "function" ? subjectOfTopic(tid) : null;
    add(sid, Math.min(6, (p && p.lessons) || 0));
  });
  (S.review || []).forEach((r) => {
    const sid = typeof subjectOfTopic === "function" ? subjectOfTopic(r.tid) : null;
    add(sid, 0.5);
  });
  if (S.stats && S.stats.lastSubject) add(S.stats.lastSubject, 4);
  try {
    (typeof examsUpcoming === "function" ? examsUpcoming() : []).slice(0, 3).forEach((e) => {
      const sid = Object.keys(SUBJECT_NAMES).find(
        (k) => k === e.subj || norm(SUBJECT_NAMES[k]) === norm(e.subj || ""),
      );
      add(sid, 5);
    });
  } catch (e) {}
  const f = feedState(),
    vids = feedVideos();
  Object.entries(f.likes).forEach(([id, v]) => {
    const vid = vids.find((x) => x.id === id);
    if (vid) add(vid.f, v > 0 ? 3 : -3);
  });
  add("LERN", 2);
  return w;
}
function feedBuild() {
  const f = feedState(),
    all = feedVideos().filter((v) => f.likes[v.id] !== -1);
  if (FEED.tab === "saved")
    return f.saved.map((id) => feedVideos().find((v) => v.id === id)).filter(Boolean);
  if (FEED.tab === "subj") return FEED.subj ? shuffle(all.filter((v) => v.f === FEED.subj)) : [];
  const w = feedWeights(),
    now = Date.now();
  const scored = all
    .map((v) => {
      let s = 2 + (w[v.f] || 0) * 1.6 + Math.random() * 6;
      if (f.seen[v.id]) s -= Math.min(8, 2 + (now - f.seen[v.id] < 864e5 ? 6 : 0));
      if (f.likes[v.id] === 1) s += 1;
      if (FEED.skip[v.f]) s -= FEED.skip[v.f] * 6;
      return { v, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
  /* nicht drei gleiche Fächer hintereinander */
  const out = [],
    rest = scored.slice();
  while (rest.length) {
    let i = rest.findIndex(
      (v) => !(out.length >= 2 && out[out.length - 1].f === v.f && out[out.length - 2].f === v.f),
    );
    if (i < 0) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return out;
}

/* render() aus dem Router: laufenden Feed nicht neu aufbauen (sonst springt das Video zurück) */
function feedView() {
  if (FEED.io && $("feed")) return;
  renderFeed();
}
function renderFeed() {
  feedState();
  feedTeardown();
  document.body.classList.add("feedmode");
  const tabs = `<div class="feedtabs" role="tablist">
      <button role="tab" aria-selected="${FEED.tab === "fy"}" class="${FEED.tab === "fy" ? "on" : ""}" onclick="feedTab('fy')">Für dich</button>
      <button role="tab" aria-selected="${FEED.tab === "subj"}" class="${FEED.tab === "subj" ? "on" : ""}" onclick="feedTab('subj')">Fächer</button>
      <button role="tab" aria-selected="${FEED.tab === "saved"}" class="${FEED.tab === "saved" ? "on" : ""}" onclick="feedTab('saved')">🔖 ${S.feed.saved.length || ""}</button>
    </div>`;
  if (FEED.tab === "subj" && !FEED.subj) {
    const counts = {};
    feedVideos().forEach((v) => {
      counts[v.f] = (counts[v.f] || 0) + 1;
    });
    $("app").innerHTML = `<div class="feedwrap">${tabs}<div class="feedsubjs">
      <h2>Welches Fach?</h2>
      ${Object.keys(counts)
        .map(
          (f, i) =>
            `<button class="feedsubj" style="--d:${i * 0.04}s" data-f="${esc(f)}" onclick="FEED.subj=this.dataset.f;FEED.idx=0;FEED.list=[];renderFeed()"><b>${esc(feedSubjName(f))}</b><small>${counts[f]} Videos</small></button>`,
        )
        .join("")}
    </div></div>`;
    return;
  }
  const key = FEED.tab + "|" + (FEED.subj || "");
  if (FEED.key !== key || !FEED.list.length) {
    FEED.list = feedBuild();
    FEED.key = key;
    FEED.idx = 0;
  }
  const L = FEED.list;
  const file = location.protocol === "file:";
  $("app").innerHTML = `<div class="feedwrap">${tabs}
    ${FEED.tab === "subj" ? `<button class="feedback" onclick="FEED.subj=null;renderFeed()">‹ ${esc(feedSubjName(FEED.subj))}</button>` : ""}
    <div class="feed" id="feed" tabindex="0" aria-label="Video-Feed – mit Pfeiltasten blättern">
      ${
        L.length
          ? L.map((v, i) => feedSlide(v, i, file)).join("") +
            `<section class="fslide fend"><div><span style="font-size:46px">🎉</span><h2>Du bist durch!</h2><p class="mut">Zeit, das Gelernte anzuwenden.</p>
        <button class="btn g" onclick="continueLesson()">▶️ Lektion starten</button> <button class="btn ghost" onclick="FEED.list=[];FEED.skip={};renderFeed()">🔄 Neu mischen</button></div></section>`
          : `<section class="fslide fend"><div><span style="font-size:46px">${FEED.tab === "saved" ? "🔖" : "📭"}</span><h2>${FEED.tab === "saved" ? "Noch nichts gespeichert" : "Keine Videos"}</h2><p class="mut">${FEED.tab === "saved" ? "Tippe bei einem Video auf 🔖, um es hier zu sammeln." : "Hier gibt es noch nichts."}</p></div></section>`
      }
    </div>
    <button class="feedsound" id="feedSound" onclick="feedSoundToggle()" title="Ton an/aus" aria-label="Ton an/aus">${FEED.sound ? "🔊" : "🔇"}</button>
  </div>`;
  feedSetup();
}
function feedSlide(v, i, file) {
  const f = S.feed,
    like = f.likes[v.id],
    saved = f.saved.includes(v.id),
    canPractice = typeof subjById === "function" && subjById(v.f);
  return `<section class="fslide" data-i="${i}">
    <div class="fvid"><div class="fplayer" id="fp${i}">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer">
      ${file ? `<a class="fopen" href="https://www.youtube.com/shorts/${v.id}" target="_blank" rel="noopener noreferrer">▶ Auf YouTube ansehen</a>` : `<span class="fplay">▶</span>`}
    </div>
    <div class="fmeta">
      <span class="fsubj">${esc(feedSubjName(v.f))}${v.lang === "en" ? " · 🇬🇧" : ""}</span>
      <b>${esc(v.t)}</b>
      <small>@${esc(v.by || "YouTube")}</small>
      ${canPractice ? `<button class="fpractice" data-f="${esc(v.f)}" onclick="go('path',this.dataset.f)">🎓 Dazu üben</button>` : v.f === "LERN" ? `<button class="fpractice" onclick="go('methoden')">🧪 Methode ausprobieren</button>` : ""}
    </div></div>
    <div class="factions">
      <button class="${like === 1 ? "on" : ""}" onclick="feedLike(${i},1)" aria-label="Gefällt mir"><span>👍</span><small>Mag ich</small></button>
      <button class="${like === -1 ? "on" : ""}" onclick="feedLike(${i},-1)" aria-label="Gefällt mir nicht"><span>👎</span><small>Nö</small></button>
      <button onclick="feedOther(${i})" aria-label="Anderes Thema"><span>🔀</span><small>Anderes Thema</small></button>
      <button class="${saved ? "on" : ""}" onclick="feedSave(${i})" aria-label="Speichern"><span>🔖</span><small>${saved ? "Gespeichert" : "Speichern"}</small></button>
      <a href="https://www.youtube.com/shorts/${v.id}" target="_blank" rel="noopener noreferrer" aria-label="Auf YouTube öffnen"><span>↗</span><small>YouTube</small></a>
    </div>
  </section>`;
}
function feedSetup() {
  const box = $("feed");
  if (!box) return;
  FEED.io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          const i = +e.target.dataset.i;
          if (!isNaN(i)) feedActivate(i);
        }
      });
    },
    { root: box, threshold: [0.6] },
  );
  box.querySelectorAll(".fslide[data-i]").forEach((s) => FEED.io.observe(s));
  window.scrollTo(0, 0);
  feedSize();
  if (FEED.idx > 0) {
    const s = box.querySelector(`.fslide[data-i="${FEED.idx}"]`);
    if (s) box.scrollTop = s.offsetTop;
  }
  window.addEventListener("keydown", feedKey);
  window.addEventListener("resize", feedSize);
}
/* Feed füllt den Platz zwischen Kopfzeile und Handy-Leiste */
function feedSize() {
  const b = $("feed");
  if (!b) return;
  const mn = $("mnav"),
    mh = mn && getComputedStyle(mn).display !== "none" ? mn.offsetHeight : 0;
  b.style.height =
    Math.max(320, window.innerHeight - b.getBoundingClientRect().top - (mh || 16)) + "px";
}
function feedActivate(i) {
  const v = FEED.list[i];
  if (!v) return;
  FEED.idx = i;
  document.querySelectorAll("#feed iframe").forEach((f) => {
    const p = f.parentElement;
    f.remove();
    p.classList.remove("live");
  });
  if (location.protocol === "file:") return;
  const p = $("fp" + i);
  if (!p) return;
  const fr = document.createElement("iframe");
  fr.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=${FEED.sound ? 0 : 1}&playsinline=1&loop=1&playlist=${v.id}&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  fr.title = v.t;
  fr.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  fr.allowFullscreen = true;
  fr.referrerPolicy = "strict-origin-when-cross-origin";
  p.appendChild(fr);
  p.classList.add("live");
  const f = feedState();
  f.seen[v.id] = Date.now();
  const ids = Object.keys(f.seen);
  if (ids.length > 400)
    ids
      .sort((a, b) => f.seen[a] - f.seen[b])
      .slice(0, ids.length - 400)
      .forEach((k) => delete f.seen[k]);
  clearTimeout(FEED._sv);
  FEED._sv = setTimeout(save, 1500);
}
function feedKey(e) {
  if (
    V.view !== "feed" ||
    /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "") ||
    document.querySelector("#modal:not(.hidden)")
  )
    return;
  if (e.key === "ArrowDown" || e.key === "j") {
    e.preventDefault();
    feedGoTo(FEED.idx + 1);
  } else if (e.key === "ArrowUp" || e.key === "k") {
    e.preventDefault();
    feedGoTo(FEED.idx - 1);
  } else if (e.key === "m") {
    feedSoundToggle();
  }
}
function feedGoTo(i) {
  const box = $("feed");
  if (!box) return;
  const all = box.querySelectorAll(".fslide");
  i = Math.max(0, Math.min(all.length - 1, i));
  all[i].scrollIntoView({ behavior: "smooth", block: "start" });
}
function feedTab(t) {
  FEED.tab = t;
  if (t !== "subj") FEED.subj = null;
  FEED.list = [];
  FEED.idx = 0;
  renderFeed();
}
function feedRefreshActions(i) {
  const s = document.querySelector(`#feed .fslide[data-i="${i}"]`);
  if (!s) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = feedSlide(FEED.list[i], i, location.protocol === "file:");
  s.querySelector(".factions").replaceWith(tmp.querySelector(".factions"));
}
function feedLike(i, v) {
  const vid = FEED.list[i];
  if (!vid) return;
  const f = feedState();
  f.likes[vid.id] = f.likes[vid.id] === v ? undefined : v;
  if (f.likes[vid.id] === undefined) delete f.likes[vid.id];
  save();
  feedRefreshActions(i);
  const s = document.querySelector(
    `#feed .fslide[data-i="${i}"] .factions button:nth-child(${v > 0 ? 1 : 2}) span`,
  );
  if (s) {
    s.classList.remove("pop");
    void s.offsetWidth;
    s.classList.add("pop");
  }
  if (v < 0 && f.likes[vid.id] === -1) {
    toast("👎 Verstanden – davon zeigen wir dir weniger");
    setTimeout(() => feedGoTo(i + 1), 350);
  }
}
function feedSave(i) {
  const vid = FEED.list[i];
  if (!vid) return;
  const f = feedState();
  const k = f.saved.indexOf(vid.id);
  if (k >= 0) {
    f.saved.splice(k, 1);
    toast("Aus Gespeichert entfernt");
  } else {
    f.saved.unshift(vid.id);
    toast("🔖 Gespeichert");
  }
  save();
  feedRefreshActions(i);
  const t = document.querySelector(".feedtabs button:nth-child(3)");
  if (t) t.textContent = "🔖 " + (f.saved.length || "");
}
/* 🔀 Anderes Thema: Fach für diese Sitzung abwerten und zum nächsten Video aus einem anderen Fach springen */
function feedOther(i) {
  const cur = FEED.list[i];
  if (!cur) return;
  if (FEED.tab === "subj") {
    FEED.subj = null;
    renderFeed();
    return;
  }
  FEED.skip[cur.f] = (FEED.skip[cur.f] || 0) + 1;
  const head = FEED.list.slice(0, i + 1),
    seen = new Set(head.map((v) => v.id));
  const rest = FEED.list.filter((v) => !seen.has(v.id));
  const other = rest.filter((v) => v.f !== cur.f),
    same = rest.filter((v) => v.f === cur.f);
  FEED.list = head.concat(other, same);
  const box = $("feed");
  const top = box ? box.scrollTop : 0;
  renderFeed();
  const b = $("feed");
  if (b) b.scrollTop = top;
  toast("🔀 Okay, was anderes!");
  setTimeout(() => feedGoTo(i + 1), 120);
}
function feedSoundToggle() {
  FEED.sound = !FEED.sound;
  const b = $("feedSound");
  if (b) b.textContent = FEED.sound ? "🔊" : "🔇";
  const fr = document.querySelector("#feed iframe");
  if (fr && fr.contentWindow)
    fr.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: FEED.sound ? "unMute" : "mute", args: [] }),
      "https://www.youtube-nocookie.com",
    );
}
function feedTeardown() {
  if (FEED.io) {
    FEED.io.disconnect();
    FEED.io = null;
  }
  window.removeEventListener("keydown", feedKey);
  window.removeEventListener("resize", feedSize);
}
function feedStop() {
  feedTeardown();
  document.querySelectorAll("#feed iframe").forEach((f) => f.remove());
  document.body.classList.remove("feedmode");
}
