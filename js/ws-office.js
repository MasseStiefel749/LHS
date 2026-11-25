/* 📄 Text, 📊 Tabelle und 🖼️ Folien im Arbeitsplatz – Word, Excel und PowerPoint light, direkt im Browser.
   Öffnen: .docx/.odt/.txt (Text), .xlsx/.csv (Tabelle), .pptx/.odp/.pdf (Folien). Speichern als .docx, .xlsx/.csv und PDF. */
const WS_TAGS = /^(P|DIV|BR|B|STRONG|I|EM|U|H1|H2|H3|UL|OL|LI|BLOCKQUOTE|PRE|CODE)$/;
const WS_DROP = /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|TEMPLATE|SVG|MATH|NOSCRIPT|TITLE|META|LINK)$/;

/* Nur einfache Formatierung behalten – keine Attribute, keine Skripte */
function wsCleanHtml(html) {
  const doc = new DOMParser().parseFromString("<body>" + String(html || "").slice(0, 400000) + "</body>", "text/html");
  const out = document.createElement("div");
  const walk = (n, to) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) to.appendChild(document.createTextNode(c.nodeValue));
      else if (c.nodeType === 1 && !WS_DROP.test(c.tagName)) {
        if (WS_TAGS.test(c.tagName)) {
          const e = document.createElement(c.tagName);
          walk(c, e);
          to.appendChild(e);
        } else walk(c, to);
      }
    }
  };
  walk(doc.body, out);
  return out.innerHTML;
}
/* Einfaches Markdown (von der KI) → HTML */
function wsMdHtml(md) {
  const inl = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<i>$2</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  let html = "",
    list = "";
  const close = () => {
    if (list) html += `</${list}>`;
    list = "";
  };
  String(md || "")
    .replace(/\r/g, "")
    .split("\n")
    .forEach((l) => {
      let m;
      if ((m = /^(#{1,3})\s+(.*)$/.exec(l))) {
        close();
        html += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`;
      } else if ((m = /^\s*[-*•]\s+(.*)$/.exec(l))) {
        if (list !== "ul") {
          close();
          html += "<ul>";
          list = "ul";
        }
        html += `<li>${inl(m[1])}</li>`;
      } else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(l))) {
        if (list !== "ol") {
          close();
          html += "<ol>";
          list = "ol";
        }
        html += `<li>${inl(m[1])}</li>`;
      } else if (l.trim()) {
        close();
        html += `<p>${inl(l)}</p>`;
      } else close();
    });
  close();
  return html;
}
function wsXml(s) {
  return String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
}
function wsPrint(title, bodyHtml, css) {
  const w = window.open("", "_blank");
  if (!w) return toast("Pop-up blockiert – erlaube Pop-ups für Lernhub");
  w.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Calibri,Arial,sans-serif;line-height:1.5;margin:2cm;color:#111}${css || ""}</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

/* ======================= 📄 Text ======================= */
function wsTextData() {
  const d = wsData("text");
  if (typeof d.html !== "string") d.html = "<h1>Mein Dokument</h1><p>Schreib hier los …</p>";
  if (typeof d.name !== "string" || !d.name) d.name = "Dokument";
  return d;
}
function wsTextEd() {
  return document.getElementById("wtEd");
}
function wsTextSaveSoon() {
  const ed = wsTextEd();
  if (!ed) return;
  wsTextData().html = wsCleanHtml(ed.innerHTML);
  wsTextCount();
  wsSave();
}
function wsTextCount() {
  const ed = wsTextEd(),
    c = $("wtCount");
  if (ed && c) c.textContent = (ed.innerText.match(/[\p{L}\p{N}]+/gu) || []).length + " Wörter";
}
function wsTextCmd(cmd, val) {
  const ed = wsTextEd();
  if (!ed) return;
  ed.focus();
  document.execCommand(cmd, false, val);
  wsTextSaveSoon();
}
async function wsTextOpen(inp) {
  const f = inp.files && inp.files[0];
  inp.value = "";
  if (!f) return;
  try {
    const r = await docRead(f, (s) => toast("⏳ " + s, 60000));
    const d = wsTextData();
    d.name = f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Dokument";
    d.html = r.text
      .split(/\n{2,}|\n/)
      .map((p) => `<p>${esc(p)}</p>`)
      .join("");
    const ed = wsTextEd();
    if (ed) ed.innerHTML = d.html;
    wsTextCount();
    wsSave();
    toast("📂 " + f.name + " geöffnet (nur Text, ohne Bilder/Layout)");
  } catch (e) {
    toast("⚠️ " + e.message, 4500);
  }
}
/* Echte .docx: Absätze, Überschriften, Listen, fett/kursiv/unterstrichen */
function wsDocx() {
  const ed = wsTextEd();
  const box = document.createElement("div");
  box.innerHTML = wsCleanHtml(ed ? ed.innerHTML : wsTextData().html);
  const paras = [];
  const runs = (n, st, out) => {
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) {
        if (c.nodeValue) out.push(`<w:r>${st.b || st.i || st.u || st.sz || st.mono ? `<w:rPr>${st.b ? "<w:b/>" : ""}${st.i ? "<w:i/>" : ""}${st.u ? '<w:u w:val="single"/>' : ""}${st.mono ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>' : ""}${st.sz ? `<w:sz w:val="${st.sz}"/>` : ""}</w:rPr>` : ""}<w:t xml:space="preserve">${wsXml(c.nodeValue)}</w:t></w:r>`);
      } else if (c.tagName === "BR") out.push("<w:r><w:br/></w:r>");
      else if (c.nodeType === 1) {
        const t = c.tagName;
        runs(c, Object.assign({}, st, { b: st.b || /^(B|STRONG)$/.test(t), i: st.i || /^(I|EM)$/.test(t), u: st.u || t === "U", mono: st.mono || /^(CODE|PRE)$/.test(t) }), out);
      }
    });
    return out;
  };
  const para = (n, st, prefix) => {
    const r = runs(n, st, []);
    paras.push(`<w:p>${prefix ? `<w:r><w:t xml:space="preserve">${wsXml(prefix)}</w:t></w:r>` : ""}${r.join("")}</w:p>`);
  };
  const block = (n) => {
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) {
        if (c.nodeValue.trim()) paras.push(`<w:p><w:r><w:t xml:space="preserve">${wsXml(c.nodeValue)}</w:t></w:r></w:p>`);
        return;
      }
      if (c.nodeType !== 1) return;
      const t = c.tagName;
      if (/^H[1-3]$/.test(t)) para(c, { b: true, sz: { H1: 36, H2: 30, H3: 26 }[t] });
      else if (t === "UL" || t === "OL")
        [...c.children].forEach((li, i) => para(li, {}, t === "UL" ? "•\t" : i + 1 + ".\t"));
      else if (t === "DIV" && [...c.children].some((x) => /^(P|DIV|H[1-3]|UL|OL)$/.test(x.tagName))) block(c);
      else para(c, {});
    });
  };
  block(box);
  const W = "http://schemas.openxmlformats.org";
  const files = [
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${W}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${W}/package/2006/relationships"><Relationship Id="rId1" Type="${W}/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      name: "word/document.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}/wordprocessingml/2006/main"><w:body>${paras.join("") || "<w:p/>"}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    },
  ];
  wsDownload(wsZip(files, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), wsTextData().name + ".docx");
}
function wsTextName(v, id) {
  wsTextData().name = String(v).trim().replace(/[\\/:*?"<>|]+/g, "_").slice(0, 60) || "Dokument";
  const w = wsWin(id);
  if (w) wsRetitle(w);
  wsSave();
}
async function wsTextAi(md, append) {
  const w = wsOpen("text");
  if (!w) return "⚠️ Kein Fenster frei";
  const ed = wsTextEd();
  await wsCursor(ed, "KI schreibt");
  const html = wsMdHtml(String(md).slice(0, 60000));
  const before = append ? wsCleanHtml(ed.innerHTML) : "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const blocks = [...tmp.children].map((c) => c.outerHTML);
  const step = Math.max(1, Math.ceil(blocks.length / 14));
  for (let i = step; i < blocks.length; i += step) {
    ed.innerHTML = before + blocks.slice(0, i).join("");
    await new Promise((r) => setTimeout(r, 55));
  }
  ed.innerHTML = before + html;
  wsTextSaveSoon();
  return `✅ Text ${append ? "ergänzt" : "geschrieben"} (${(ed.innerText.match(/[\p{L}\p{N}]+/gu) || []).length} Wörter)`;
}
WS_APPS.text = {
  icon: "📄",
  name: "Text",
  order: 3,
  w: 55,
  h: 80,
  title: () => "Text · " + wsTextData().name,
  mount(w, body) {
    const d = wsTextData();
    const b = (cmd, label, title, val) =>
      `<button class="wstool" onmousedown="event.preventDefault()" onclick="wsTextCmd('${cmd}'${val ? `,'${val}'` : ""})" title="${title}" aria-label="${title}">${label}</button>`;
    body.innerHTML = `<div class="wtext">
      <div class="wcbar">${b("bold", "<b>F</b>", "Fett")}${b("italic", "<i>K</i>", "Kursiv")}${b("underline", "<u>U</u>", "Unterstrichen")}
        ${b("formatBlock", "H1", "Überschrift", "h1")}${b("formatBlock", "H2", "Zwischenüberschrift", "h2")}${b("formatBlock", "¶", "Normaler Absatz", "p")}
        ${b("insertUnorderedList", "•", "Aufzählung")}${b("insertOrderedList", "1.", "Nummerierung")}${b("undo", "↶", "Rückgängig")}${b("redo", "↷", "Wiederholen")}
        <span class="wsgap"></span>
        <button class="wstool" onclick="$('wtFile').click()" title="Öffnen (.docx, .odt, .txt, .pdf)" aria-label="Öffnen">📂</button>
        <button class="wstool" onclick="wsDocx()" title="Als Word-Datei (.docx) speichern" aria-label="Als docx speichern">💾</button>
        <button class="wstool" onclick="wsPrint(wsTextData().name, wsCleanHtml(wsTextEd().innerHTML))" title="Drucken / als PDF speichern" aria-label="PDF">🖨️</button>
        <input type="file" id="wtFile" hidden accept=".docx,.odt,.txt,.md,.pdf,.html,.htm" onchange="wsTextOpen(this)"></div>
      <div class="wtpage"><input class="wtname" value="${esc(d.name)}" maxlength="60" aria-label="Dateiname" onchange="wsTextName(this.value,'${w.id}')">
        <div class="wted" id="wtEd" contenteditable="true" spellcheck="true" lang="de"></div></div>
      <div class="wtfoot small mut"><span id="wtCount"></span></div>
    </div>`;
    const ed = wsTextEd();
    ed.innerHTML = wsCleanHtml(d.html);
    ed.addEventListener("input", wsTextSaveSoon);
    ed.addEventListener("paste", (e) => {
      e.preventDefault();
      document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain"));
    });
    wsTextCount();
  },
  ctx() {
    const ed = wsTextEd(),
      box = document.createElement("div");
    box.innerHTML = ed ? ed.innerHTML : wsTextData().html;
    return `Text-Dokument „${wsTextData().name}“:\n${(box.innerText || box.textContent).slice(0, 2500)}`;
  },
};

/* ======================= 📊 Tabelle ======================= */
const WS_COLS = 12;
const WS_ROWS = 50;
const WS_FN = {
  SUMME: "SUM", SUM: "SUM", MITTELWERT: "AVERAGE", AVERAGE: "AVERAGE", MIN: "MIN", MAX: "MAX",
  ANZAHL: "COUNT", COUNT: "COUNT", RUNDEN: "ROUND", ROUND: "ROUND", WENN: "IF", IF: "IF", ABS: "ABS", WURZEL: "SQRT", SQRT: "SQRT",
};
const WS_SHEET = { sel: "A1" };
function wsCol(i) {
  return String.fromCharCode(65 + i);
}
function wsRef(r) {
  const m = /^([A-L])([1-9]\d?)$/.exec(String(r || "").toUpperCase().replace(/\$/g, ""));
  return m && +m[2] <= WS_ROWS ? { c: m[1].charCodeAt(0) - 65, r: +m[2], id: m[1] + m[2] } : null;
}
function wsSheetData() {
  const d = wsData("tabelle");
  if (!d.cells || typeof d.cells !== "object" || Array.isArray(d.cells)) d.cells = {};
  Object.keys(d.cells).forEach((k) => {
    if (!wsRef(k) || wsRef(k).id !== k || typeof d.cells[k] !== "string" || !d.cells[k]) delete d.cells[k];
  });
  if (typeof d.name !== "string" || !d.name) d.name = "Tabelle";
  return d;
}
function wsNumParse(s) {
  s = String(s).trim();
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "");
  s = s.replace(",", ".");
  return /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s) ? parseFloat(s) : NaN;
}
/* Formeln ohne eval: + − × ÷ ^, Vergleiche, Zellbezüge, Bereiche und ein paar Funktionen (deutsch & englisch) */
function wsCalc(cells, id, seen, memo) {
  if (memo.has(id)) return memo.get(id);
  const raw = cells[id];
  let v;
  if (raw == null || raw === "") v = "";
  else if (raw[0] !== "=") {
    const n = wsNumParse(raw);
    v = Number.isNaN(n) ? raw : n;
  } else {
    if (seen.has(id)) throw "#ZIRKEL!";
    seen.add(id);
    try {
      v = wsFormula(raw.slice(1), cells, seen, memo);
    } catch (e) {
      v = typeof e === "string" ? e : "#FEHLER!";
    }
    seen.delete(id);
  }
  memo.set(id, v);
  return v;
}
function wsFormula(src, cells, seen, memo) {
  const toks = [];
  const re = /\s*(?:(\d+(?:[.,]\d+)?)|([A-Za-z]+\d+(?::[A-Za-z]+\d+)?)|([A-Za-zÄÖÜäöü]+)\s*\(|("[^"]*")|(<=|>=|<>|[-+*/^()<>=;,&]))/y;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < src.length) {
    const at = re.lastIndex;
    if (!(m = re.exec(src))) {
      if (/^\s*$/.test(src.slice(at))) break;
      throw "#FEHLER!";
    }
    if (m[1]) toks.push({ k: "n", v: parseFloat(m[1].replace(",", ".")) });
    else if (m[2]) toks.push({ k: "r", v: m[2].toUpperCase() });
    else if (m[3]) toks.push({ k: "f", v: m[3].toUpperCase() });
    else if (m[4]) toks.push({ k: "s", v: m[4].slice(1, -1) });
    else toks.push({ k: "o", v: m[5] });
  }
  let p = 0;
  const peek = () => toks[p] || {},
    eat = (v) => (peek().k === "o" && peek().v === v ? (p++, true) : false);
  const cell = (id) => {
    const r = wsRef(id);
    if (!r) throw "#BEZUG!";
    const v = wsCalc(cells, r.id, seen, memo);
    if (typeof v === "string" && v[0] === "#") throw v;
    return v;
  };
  const num = (v) => {
    if (v === "" || v === true || v === false) return +v || 0;
    if (typeof v === "number") return v;
    const n = wsNumParse(v);
    if (Number.isNaN(n)) throw "#WERT!";
    return n;
  };
  const range = (s) => {
    const [a, b] = s.split(":").map(wsRef);
    if (!a || !b) throw "#BEZUG!";
    const out = [];
    for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++)
      for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) out.push(cell(wsCol(c) + r));
    return out;
  };
  const args = () => {
    const out = [];
    if (eat(")")) return out;
    do {
      const t = peek();
      if (t.k === "r" && t.v.includes(":")) {
        p++;
        out.push(range(t.v));
      } else out.push(cmp());
    } while (eat(";") || eat(","));
    if (!eat(")")) throw "#FEHLER!";
    return out;
  };
  const call = (name, a) => {
    const f = WS_FN[name];
    const nums = () => a.flat().filter((x) => typeof x === "number" || (typeof x === "string" && x !== "" && !Number.isNaN(wsNumParse(x)))).map(num);
    if (f === "SUM") return nums().reduce((s, x) => s + x, 0);
    if (f === "AVERAGE") {
      const n = nums();
      if (!n.length) throw "#DIV/0!";
      return n.reduce((s, x) => s + x, 0) / n.length;
    }
    if (f === "MIN") return nums().length ? Math.min(...nums()) : 0;
    if (f === "MAX") return nums().length ? Math.max(...nums()) : 0;
    if (f === "COUNT") return nums().length;
    if (f === "ROUND") {
      const k = Math.pow(10, Math.round(num(a[1] == null ? 0 : a[1])));
      return Math.round(num(a[0]) * k) / k;
    }
    if (f === "IF") return a[0] ? (a[1] == null ? true : a[1]) : a[2] == null ? false : a[2];
    if (f === "ABS") return Math.abs(num(a[0]));
    if (f === "SQRT") {
      if (num(a[0]) < 0) throw "#ZAHL!";
      return Math.sqrt(num(a[0]));
    }
    throw "#NAME?";
  };
  const prim = () => {
    const t = toks[p++] || {};
    if (t.k === "n" || t.k === "s") return t.v;
    if (t.k === "r") {
      if (t.v.includes(":")) throw "#WERT!";
      return cell(t.v);
    }
    if (t.k === "f") return call(t.v, args());
    if (t.k === "o" && t.v === "(") {
      const v = cmp();
      if (!eat(")")) throw "#FEHLER!";
      return v;
    }
    if (t.k === "o" && t.v === "-") return -num(prim());
    if (t.k === "o" && t.v === "+") return num(prim());
    throw "#FEHLER!";
  };
  const pow = () => {
    let v = prim();
    while (eat("^")) v = Math.pow(num(v), num(prim()));
    return v;
  };
  const mul = () => {
    let v = pow();
    for (;;) {
      if (eat("*")) v = num(v) * num(pow());
      else if (eat("/")) {
        const d = num(pow());
        if (d === 0) throw "#DIV/0!";
        v = num(v) / d;
      } else return v;
    }
  };
  const add = () => {
    let v = mul();
    for (;;) {
      if (eat("+")) v = num(v) + num(mul());
      else if (eat("-")) v = num(v) - num(mul());
      else if (eat("&")) v = String(v) + String(mul());
      else return v;
    }
  };
  const cmp = () => {
    const v = add();
    for (const op of ["<=", ">=", "<>", "<", ">", "="])
      if (eat(op)) {
        const w = add();
        const [x, y] = typeof v === "number" || typeof w === "number" ? [num(v), num(w)] : [String(v), String(w)];
        return { "<=": x <= y, ">=": x >= y, "<>": x !== y, "<": x < y, ">": x > y, "=": x === y }[op];
      }
    return v;
  };
  const v = cmp();
  if (p < toks.length) throw "#FEHLER!";
  if (typeof v === "number" && !Number.isFinite(v)) throw "#ZAHL!";
  return v;
}
function wsShow(v) {
  if (typeof v === "number") return v.toLocaleString("de-DE", { maximumFractionDigits: 10 });
  if (v === true) return "WAHR";
  if (v === false) return "FALSCH";
  return String(v);
}
function wsSheetPaint() {
  const t = $("wsGrid");
  if (!t) return;
  const d = wsSheetData(),
    memo = new Map();
  t.querySelectorAll("td[data-c]").forEach((td) => {
    const id = td.dataset.c;
    const v = wsCalc(d.cells, id, new Set(), memo);
    td.textContent = wsShow(v);
    td.classList.toggle("num", typeof v === "number");
    td.classList.toggle("err", typeof v === "string" && /^#[A-Z/0!?]+$/.test(v) && d.cells[id] && d.cells[id][0] === "=");
    td.classList.toggle("sel", id === WS_SHEET.sel);
  });
  const f = $("wsFx"),
    n = $("wsCell");
  if (n) n.textContent = WS_SHEET.sel;
  if (f && document.activeElement !== f) f.value = d.cells[WS_SHEET.sel] || "";
}
function wsSheetSel(id, edit) {
  if (!wsRef(id)) return;
  WS_SHEET.sel = id;
  wsSheetPaint();
  const td = document.querySelector(`#wsGrid td[data-c="${id}"]`);
  if (td) td.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (edit) {
    const f = $("wsFx");
    if (f) {
      f.focus();
      if (typeof edit === "string") f.value = edit;
    }
  } else {
    const g = $("wsGridBox");
    if (g) g.focus({ preventScroll: true });
  }
}
function wsSheetSet(id, val) {
  const d = wsSheetData(),
    r = wsRef(id);
  if (!r) return;
  val = String(val == null ? "" : val).slice(0, 2000);
  if (val) d.cells[r.id] = val;
  else delete d.cells[r.id];
  wsSave();
}
function wsSheetMove(dc, dr) {
  const r = wsRef(WS_SHEET.sel);
  const c = Math.min(WS_COLS - 1, Math.max(0, r.c + dc)),
    row = Math.min(WS_ROWS, Math.max(1, r.r + dr));
  wsSheetSel(wsCol(c) + row);
}
function wsSheetKey(e) {
  if (e.target.id === "wsFx") {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      wsSheetSet(WS_SHEET.sel, e.target.value);
      e.target.blur();
      wsSheetMove(e.key === "Tab" ? 1 : 0, e.key === "Enter" ? 1 : 0);
    } else if (e.key === "Escape") {
      e.target.blur();
      wsSheetSel(WS_SHEET.sel);
    }
    return;
  }
  if (e.target.id !== "wsGridBox") return;
  const mv = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], Enter: [0, 1], Tab: [1, 0] }[e.key];
  if (mv) {
    e.preventDefault();
    wsSheetMove(...mv);
  } else if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    wsSheetSet(WS_SHEET.sel, "");
    wsSheetPaint();
  } else if (e.key === "F2") {
    e.preventDefault();
    wsSheetSel(WS_SHEET.sel, true);
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    wsSheetSel(WS_SHEET.sel, e.key);
  }
}
function wsCsvParse(text) {
  const sep = (text.split("\n")[0].match(/;/g) || []).length >= (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [],
    cur = "",
    q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cur = "";
    } else cur += ch;
  }
  if (cur || row.length) rows.push(row.concat(cur));
  return rows;
}
async function wsSheetOpen(inp) {
  const f = inp.files && inp.files[0];
  inp.value = "";
  if (!f) return;
  try {
    const d = wsSheetData();
    const cells = {};
    if (/\.xlsx$/i.test(f.name)) {
      const parts = await docZipParts(f, /^xl\/(sharedStrings\.xml|worksheets\/sheet1\.xml)$/);
      const by = Object.fromEntries(parts.map((p) => [p.name, p.xml]));
      const shared = ((by["xl/sharedStrings.xml"] || "").match(/<si>[\s\S]*?<\/si>/g) || []).map(docXmlText);
      ((by["xl/worksheets/sheet1.xml"] || "").match(/<c\b[^>]*>[\s\S]*?<\/c>/g) || []).forEach((c) => {
        const r = wsRef((/\br="([A-Z]+\d+)"/.exec(c) || [])[1]);
        if (!r) return;
        const fm = /<f>([\s\S]*?)<\/f>/.exec(c),
          v = /<v>([\s\S]*?)<\/v>/.exec(c),
          isS = /\bt="s"/.test(c),
          inl = /<is>([\s\S]*?)<\/is>/.exec(c);
        let val = fm ? "=" + docXmlText(fm[1]) : isS && v ? shared[+v[1]] || "" : inl ? docXmlText(inl[1]) : v ? docXmlText(v[1]) : "";
        if (!fm && /^-?\d+\.\d+$/.test(val)) val = val.replace(".", ",");
        if (val) cells[r.id] = val.slice(0, 2000);
      });
    } else {
      if (f.size > 2e6) throw new Error("Die Datei ist zu groß");
      wsCsvParse(await f.text()).forEach((row, ri) =>
        row.forEach((v, ci) => {
          const r = wsRef(wsCol(ci) + (ri + 1));
          if (r && v !== "") cells[r.id] = v.slice(0, 2000);
        }),
      );
    }
    d.cells = cells;
    d.name = f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Tabelle";
    wsSave();
    wsSheetPaint();
    toast(`📂 ${f.name} geöffnet (erste ${WS_COLS} Spalten, ${WS_ROWS} Zeilen)`);
  } catch (e) {
    toast("⚠️ " + e.message, 4500);
  }
}
function wsSheetUsed() {
  const d = wsSheetData();
  let mr = 0,
    mc = 0;
  Object.keys(d.cells).forEach((k) => {
    const r = wsRef(k);
    mr = Math.max(mr, r.r);
    mc = Math.max(mc, r.c + 1);
  });
  return { mr, mc, d };
}
function wsSheetCsv() {
  const { mr, mc, d } = wsSheetUsed(),
    memo = new Map(),
    lines = [];
  for (let r = 1; r <= mr; r++) {
    const row = [];
    for (let c = 0; c < mc; c++) {
      const s = wsShow(wsCalc(d.cells, wsCol(c) + r, new Set(), memo));
      row.push(/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    }
    lines.push(row.join(";"));
  }
  wsDownload(new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), d.name + ".csv");
}
/* Echte .xlsx: Zahlen, Texte und Formeln (deutsche Funktionsnamen werden für Excel übersetzt) */
function wsSheetXlsx() {
  const { mr, mc, d } = wsSheetUsed(),
    memo = new Map(),
    rows = [];
  const en = (f) =>
    f
      .replace(/("[^"]*")|([A-Za-zÄÖÜäöü]+)\s*\(/g, (m, s, n) => s || (WS_FN[n.toUpperCase()] || n.toUpperCase()) + "(")
      .replace(/("[^"]*")|(\d),(\d)/g, (m, s, a, b) => s || a + "." + b)
      .replace(/("[^"]*")|;/g, (m, s) => s || ",");
  for (let r = 1; r <= mr; r++) {
    const cs = [];
    for (let c = 0; c < mc; c++) {
      const id = wsCol(c) + r,
        raw = d.cells[id];
      if (raw == null) continue;
      const v = wsCalc(d.cells, id, new Set(), memo);
      if (raw[0] === "=") {
        const t = typeof v === "number" ? "" : typeof v === "boolean" ? ' t="b"' : ' t="str"';
        const cv = typeof v === "boolean" ? +v : typeof v === "number" ? v : wsXml(v);
        cs.push(`<c r="${id}"${t}><f>${wsXml(en(raw.slice(1)))}</f><v>${cv}</v></c>`);
      } else if (typeof v === "number") cs.push(`<c r="${id}"><v>${v}</v></c>`);
      else cs.push(`<c r="${id}" t="inlineStr"><is><t xml:space="preserve">${wsXml(v)}</t></is></c>`);
    }
    if (cs.length) rows.push(`<row r="${r}">${cs.join("")}</row>`);
  }
  const W = "http://schemas.openxmlformats.org";
  const X = "application/vnd.openxmlformats-officedocument.spreadsheetml";
  wsDownload(
    wsZip(
      [
        { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${W}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${X}.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="${X}.worksheet+xml"/></Types>` },
        { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${W}/package/2006/relationships"><Relationship Id="rId1" Type="${W}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
        { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${W}/spreadsheetml/2006/main" xmlns:r="${W}/officeDocument/2006/relationships"><sheets><sheet name="Tabelle1" sheetId="1" r:id="rId1"/></sheets><calcPr fullCalcOnLoad="1"/></workbook>` },
        { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${W}/package/2006/relationships"><Relationship Id="rId1" Type="${W}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
        { name: "xl/worksheets/sheet1.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${W}/spreadsheetml/2006/main"><sheetData>${rows.join("")}</sheetData></worksheet>` },
      ],
      X + ".sheet",
    ),
    d.name + ".xlsx",
  );
}
async function wsSheetAi(list) {
  const w = wsOpen("tabelle");
  if (!w) return "⚠️ Kein Fenster frei";
  let n = 0;
  for (const x of (Array.isArray(list) ? list : []).slice(0, 200)) {
    const r = x && wsRef(x.zelle);
    if (!r) continue;
    if (n < 6) {
      wsSheetSel(r.id);
      await wsCursor(document.querySelector(`#wsGrid td[data-c="${r.id}"]`), "KI · " + r.id);
    }
    wsSheetSet(r.id, String(x.wert == null ? "" : x.wert));
    n++;
  }
  wsSheetPaint();
  return `✅ ${n} Zellen gefüllt`;
}
WS_APPS.tabelle = {
  icon: "📊",
  name: "Tabelle",
  order: 4,
  w: 60,
  h: 72,
  title: () => "Tabelle · " + wsSheetData().name,
  mount(w, body) {
    let head = "<tr><th></th>";
    for (let c = 0; c < WS_COLS; c++) head += `<th>${wsCol(c)}</th>`;
    let rows = "";
    for (let r = 1; r <= WS_ROWS; r++) {
      rows += `<tr><th>${r}</th>`;
      for (let c = 0; c < WS_COLS; c++) rows += `<td data-c="${wsCol(c)}${r}"></td>`;
      rows += "</tr>";
    }
    body.innerHTML = `<div class="wsheet" onkeydown="wsSheetKey(event)">
      <div class="wcbar"><b class="wscell" id="wsCell">A1</b><input class="fi wsfx" id="wsFx" placeholder="Wert oder Formel, z. B. =SUMME(A1:A5)" autocomplete="off" aria-label="Zellinhalt"
          onchange="wsSheetSet(WS_SHEET.sel,this.value);wsSheetPaint()">
        <button class="wstool" onclick="$('wsFile').click()" title="Öffnen (.xlsx, .csv)" aria-label="Öffnen">📂</button>
        <button class="wstool" onclick="wsSheetXlsx()" title="Als Excel-Datei (.xlsx) speichern" aria-label="Als xlsx speichern">💾</button>
        <button class="wstool" onclick="wsSheetCsv()" title="Als CSV speichern" aria-label="CSV">CSV</button>
        <input type="file" id="wsFile" hidden accept=".xlsx,.csv,.txt" onchange="wsSheetOpen(this)"></div>
      <div class="wsgrid" id="wsGridBox" tabindex="0"><table id="wsGrid"><thead>${head}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="small mut wmnote">Formeln: =A1+B1 · =SUMME(A1:A9) · =MITTELWERT(…) · MIN · MAX · ANZAHL · RUNDEN(x;2) · WENN(A1>4;"ok";"nein") · WURZEL · ABS</p>
    </div>`;
    body.querySelector("#wsGrid").addEventListener("click", (e) => {
      const td = e.target.closest("td[data-c]");
      if (td) wsSheetSel(td.dataset.c);
    });
    body.querySelector("#wsGrid").addEventListener("dblclick", (e) => {
      const td = e.target.closest("td[data-c]");
      if (td) wsSheetSel(td.dataset.c, true);
    });
    wsSheetPaint();
  },
  ctx() {
    const d = wsSheetData();
    const memo = new Map();
    const cells = Object.keys(d.cells)
      .slice(0, 120)
      .map((k) => `${k}=${d.cells[k]}${d.cells[k][0] === "=" ? " → " + wsShow(wsCalc(d.cells, k, new Set(), memo)) : ""}`);
    return `Tabelle „${d.name}“: ${cells.join(" | ").slice(0, 1500) || "leer"}`;
  },
};

/* ======================= 🖼️ Folien ======================= */
const WS_SLIDE_COLORS = ["#7c5cff", "#ff7a59", "#00b894", "#3fa9f5", "#e84393", "#2d3436"];
const WS_SL = { cur: 0, show: -1 };
function wsSlidesData() {
  const d = wsData("folien");
  if (!Array.isArray(d.list)) d.list = [];
  d.list = d.list
    .filter((s) => s && typeof s === "object")
    .slice(0, 60)
    .map((s) => ({
      t: String(s.t || "").slice(0, 120),
      p: String(s.p || "").slice(0, 3000),
      c: WS_SLIDE_COLORS.includes(s.c) ? s.c : WS_SLIDE_COLORS[0],
    }));
  if (!d.list.length) d.list.push({ t: "Mein Thema", p: "Untertitel oder erster Punkt", c: WS_SLIDE_COLORS[0] });
  if (typeof d.name !== "string" || !d.name) d.name = "Präsentation";
  WS_SL.cur = Math.min(WS_SL.cur, d.list.length - 1);
  return d;
}
function wsSlideHTML(s, big) {
  const pts = s.p
    .split("\n")
    .map((x) => x.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
  return `<div class="wslide${big ? " big" : ""}" style="--sc:${s.c}"><h2>${esc(s.t)}</h2>${pts.length ? `<ul>${pts.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div>`;
}
function wsSlidesPaint(keepEdit) {
  const d = wsSlidesData(),
    s = d.list[WS_SL.cur];
  const th = $("wfThumbs");
  if (!th) return;
  th.innerHTML = d.list
    .map((x, i) => `<button class="wfthumb${i === WS_SL.cur ? " on" : ""}" onclick="WS_SL.cur=${i};wsSlidesPaint()" aria-label="Folie ${i + 1}"><small>${i + 1}</small>${wsSlideHTML(x)}</button>`)
    .join("");
  $("wfPrev").innerHTML = wsSlideHTML(s, true);
  if (!keepEdit) {
    $("wfT").value = s.t;
    $("wfP").value = s.p;
    $("wfC").innerHTML = WS_SLIDE_COLORS.map((c) => `<button class="wfcol${c === s.c ? " on" : ""}" style="background:${c}" onclick="wsSlideEdit('c','${c}')" aria-label="Farbe ${c}"></button>`).join("");
  }
}
function wsSlideEdit(k, v) {
  const d = wsSlidesData();
  d.list[WS_SL.cur][k] = k === "c" ? (WS_SLIDE_COLORS.includes(v) ? v : WS_SLIDE_COLORS[0]) : String(v).slice(0, k === "t" ? 120 : 3000);
  wsSave();
  wsSlidesPaint(k !== "c");
}
function wsSlideAdd() {
  const d = wsSlidesData();
  if (d.list.length >= 60) return toast("Höchstens 60 Folien");
  d.list.splice(WS_SL.cur + 1, 0, { t: "Neue Folie", p: "", c: d.list[WS_SL.cur].c });
  WS_SL.cur++;
  wsSave();
  wsSlidesPaint();
}
function wsSlideDel() {
  const d = wsSlidesData();
  if (d.list.length < 2) return toast("Die letzte Folie bleibt");
  d.list.splice(WS_SL.cur, 1);
  WS_SL.cur = Math.max(0, WS_SL.cur - 1);
  wsSave();
  wsSlidesPaint();
}
function wsSlideMove(dir) {
  const d = wsSlidesData(),
    i = WS_SL.cur,
    j = i + dir;
  if (j < 0 || j >= d.list.length) return;
  [d.list[i], d.list[j]] = [d.list[j], d.list[i]];
  WS_SL.cur = j;
  wsSave();
  wsSlidesPaint();
}
function wsSlideShow(i) {
  const d = wsSlidesData();
  let o = $("wfShow");
  if (i < 0 || i >= d.list.length) {
    if (o) o.remove();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    WS_SL.show = -1;
    return;
  }
  WS_SL.show = i;
  if (!o) {
    o = document.createElement("div");
    o.id = "wfShow";
    o.className = "wfshow";
    o.tabIndex = 0;
    o.addEventListener("click", (e) => wsSlideShow(WS_SL.show + (e.clientX < innerWidth / 3 ? -1 : 1)));
    o.addEventListener("keydown", (e) => {
      if (/^(ArrowRight|ArrowDown|PageDown| )$/.test(e.key)) wsSlideShow(WS_SL.show + 1);
      else if (/^(ArrowLeft|ArrowUp|PageUp)$/.test(e.key)) wsSlideShow(WS_SL.show - 1);
      else if (e.key === "Escape") wsSlideShow(-1);
      else return;
      e.preventDefault();
    });
    document.body.appendChild(o);
    if (o.requestFullscreen) o.requestFullscreen().catch(() => {});
    document.addEventListener("fullscreenchange", function fc() {
      if (!document.fullscreenElement) {
        document.removeEventListener("fullscreenchange", fc);
        wsSlideShow(-1);
      }
    });
  }
  o.innerHTML = wsSlideHTML(d.list[i], true) + `<small class="wfnr">${i + 1} / ${d.list.length} · ← → · Esc</small>`;
  o.focus();
}
function wsSlidesPrint() {
  const d = wsSlidesData();
  wsPrint(
    d.name,
    d.list.map((s) => wsSlideHTML(s, true)).join(""),
    `@page{size:A4 landscape;margin:0}body{margin:0}.wslide{box-sizing:border-box;width:100vw;height:100vh;page-break-after:always;padding:7vh 8vw;background:#fff;border-top:3vh solid var(--sc);-webkit-print-color-adjust:exact;print-color-adjust:exact}.wslide h2{font-size:5vh;color:var(--sc);margin:0 0 4vh}.wslide li{font-size:3.2vh;margin:1.4vh 0}`,
  );
}
/* Echte .pptx (PowerPoint, Keynote, Google Slides, Impress): Farbbalken, Titel und Aufzählung je Folie */
function wsSlidesPptx() {
  const d = wsSlidesData();
  const W = "http://schemas.openxmlformats.org",
    NS = `xmlns:a="${W}/drawingml/2006/main" xmlns:r="${W}/officeDocument/2006/relationships" xmlns:p="${W}/presentationml/2006/main"`,
    R = `${W}/officeDocument/2006/relationships`,
    P = "application/vnd.openxmlformats-officedocument.presentationml",
    head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    grp = `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>`,
    rels = (list) => `${head}<Relationships xmlns="${W}/package/2006/relationships">${list.map((x, i) => `<Relationship Id="rId${i + 1}" Type="${R}/${x[0]}" Target="${x[1]}"/>`).join("")}</Relationships>`,
    box = (id, name, x, y, cx, cy, inner) =>
      `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>${inner}</p:sp>`,
    run = (t, sz, col, b) => `<a:r><a:rPr lang="de-DE" sz="${sz}"${b ? ' b="1"' : ""} dirty="0"><a:solidFill><a:srgbClr val="${col}"/></a:solidFill></a:rPr><a:t>${wsXml(t)}</a:t></a:r>`;
  const slides = d.list.map((s) => {
    const col = s.c.slice(1).toUpperCase();
    const pts = s.p
      .split("\n")
      .map((x) => x.replace(/^\s*[-*•]\s*/, "").trim())
      .filter(Boolean);
    const body = pts.length
      ? pts.map((x) => `<a:p><a:pPr marL="342900" indent="-342900"><a:spcBef><a:spcPts val="1200"/></a:spcBef><a:buClr><a:srgbClr val="${col}"/></a:buClr><a:buFont typeface="Arial"/><a:buChar char="•"/></a:pPr>${run(x, 2400, "333333")}</a:p>`).join("")
      : '<a:p><a:endParaRPr lang="de-DE"/></a:p>';
    return `${head}<p:sld ${NS}><p:cSld><p:spTree>${grp}
<p:sp><p:nvSpPr><p:cNvPr id="2" name="Farbbalken"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="228600"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${col}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>
${box(3, "Titel", 731520, 548640, 10728960, 1143000, `<p:txBody><a:bodyPr wrap="square" anchor="b"><a:normAutofit/></a:bodyPr><a:lstStyle/><a:p>${run(s.t, 4000, col, 1)}</a:p></p:txBody>`)}
${box(4, "Inhalt", 731520, 1920240, 10728960, 4389120, `<p:txBody><a:bodyPr wrap="square"><a:normAutofit/></a:bodyPr><a:lstStyle/>${body}</p:txBody>`)}
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
  });
  const fill = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
  const clr = (n, v) => `<a:${n}><a:srgbClr val="${v}"/></a:${n}>`;
  const font = '<a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/>';
  const theme = `${head}<a:theme xmlns:a="${W}/drawingml/2006/main" name="Lernhub"><a:themeElements><a:clrScheme name="Lernhub">${clr("dk1", "000000")}${clr("lt1", "FFFFFF")}${clr("dk2", "1F1B3A")}${clr("lt2", "F3F0FF")}${WS_SLIDE_COLORS.map((c, i) => clr("accent" + (i + 1), c.slice(1).toUpperCase())).join("")}${clr("hlink", "3FA9F5")}${clr("folHlink", "7C5CFF")}</a:clrScheme><a:fontScheme name="Lernhub"><a:majorFont>${font}</a:majorFont><a:minorFont>${font}</a:minorFont></a:fontScheme><a:fmtScheme name="Lernhub"><a:fillStyleLst>${fill.repeat(3)}</a:fillStyleLst><a:lnStyleLst>${`<a:ln w="6350">${fill}</a:ln>`.repeat(3)}</a:lnStyleLst><a:effectStyleLst>${"<a:effectStyle><a:effectLst/></a:effectStyle>".repeat(3)}</a:effectStyleLst><a:bgFillStyleLst>${fill.repeat(3)}</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
  const files = [
    {
      name: "[Content_Types].xml",
      data: `${head}<Types xmlns="${W}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="${P}.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="${P}.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="${P}.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides.map((x, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="${P}.slide+xml"/>`).join("")}</Types>`,
    },
    { name: "_rels/.rels", data: rels([["officeDocument", "ppt/presentation.xml"]]) },
    {
      name: "ppt/presentation.xml",
      data: `${head}<p:presentation ${NS}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slides.map((x, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 3}"/>`).join("")}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
    },
    { name: "ppt/_rels/presentation.xml.rels", data: rels([["slideMaster", "slideMasters/slideMaster1.xml"], ["theme", "theme/theme1.xml"], ...slides.map((x, i) => ["slide", `slides/slide${i + 1}.xml`])]) },
    {
      name: "ppt/slideMasters/slideMaster1.xml",
      data: `${head}<p:sldMaster ${NS}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree>${grp}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`,
    },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: rels([["slideLayout", "../slideLayouts/slideLayout1.xml"], ["theme", "../theme/theme1.xml"]]) },
    {
      name: "ppt/slideLayouts/slideLayout1.xml",
      data: `${head}<p:sldLayout ${NS} type="blank" preserve="1"><p:cSld name="Leer"><p:spTree>${grp}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`,
    },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: rels([["slideMaster", "../slideMasters/slideMaster1.xml"]]) },
    { name: "ppt/theme/theme1.xml", data: theme },
    ...slides.map((x, i) => ({ name: `ppt/slides/slide${i + 1}.xml`, data: x })),
    ...slides.map((x, i) => ({ name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: rels([["slideLayout", "../slideLayouts/slideLayout1.xml"]]) })),
  ];
  wsDownload(wsZip(files, P + ".presentation"), d.name.replace(/[\\/:*?"<>|]+/g, "_") + ".pptx");
}
async function wsSlidesOpen(inp) {
  const f = inp.files && inp.files[0];
  inp.value = "";
  if (!f) return;
  try {
    const r = await prRead(f, (s) => toast("⏳ " + s, 60000));
    const d = wsSlidesData();
    d.list = r.slides.slice(0, 60).map((s, i) => {
      const lines = s.text.split("\n").filter((l) => l.trim() && l.trim() !== s.title);
      return { t: s.title || lines.shift() || "Folie " + (i + 1), p: lines.join("\n").slice(0, 3000), c: WS_SLIDE_COLORS[0] };
    });
    d.name = f.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Präsentation";
    WS_SL.cur = 0;
    wsSave();
    wsSlidesPaint();
    toast(`📂 ${d.list.length} Folien übernommen (nur Text)`);
  } catch (e) {
    toast("⚠️ " + e.message, 4500);
  }
}
function wsSlidesCheck() {
  const d = wsSlidesData();
  PR.file = { name: d.name.slice(0, 80), kind: "ws", slides: d.list.map((s) => prSlide(s.p, s.t, 0, "")) };
  PR.res = null;
  go("praes");
}
async function wsSlidesAi(list, append) {
  const w = wsOpen("folien");
  if (!w) return "⚠️ Kein Fenster frei";
  const d = wsSlidesData();
  const col = (d.list[0] || {}).c || WS_SLIDE_COLORS[0];
  const neu = (Array.isArray(list) ? list : [])
    .filter((s) => s && typeof s.titel === "string")
    .slice(0, 30)
    .map((s) => ({
      t: s.titel.slice(0, 120),
      p: (Array.isArray(s.punkte) ? s.punkte : []).map((x) => String(x).slice(0, 300)).slice(0, 10).join("\n"),
      c: col,
    }));
  if (!neu.length) return "⚠️ Keine Folien bekommen";
  if (!append) d.list = [];
  for (const s of neu) {
    if (d.list.length >= 60) break;
    d.list.push(s);
    WS_SL.cur = d.list.length - 1;
    wsSlidesPaint();
    await wsCursor($("wfThumbs") && $("wfThumbs").lastElementChild, "KI · Folie " + d.list.length);
  }
  wsSave();
  return `✅ ${neu.length} Folien ${append ? "angehängt" : "erstellt"}`;
}
WS_APPS.folien = {
  icon: "🖼️",
  name: "Folien",
  order: 5,
  w: 64,
  h: 80,
  title: () => "Folien · " + wsSlidesData().name,
  mount(w, body) {
    body.innerHTML = `<div class="wfol">
      <div class="wcbar"><button class="wstool" onclick="wsSlideAdd()" title="Neue Folie" aria-label="Neue Folie">＋</button>
        <button class="wstool" onclick="wsSlideDel()" title="Folie löschen" aria-label="Folie löschen">🗑️</button>
        <button class="wstool" onclick="wsSlideMove(-1)" title="Nach oben" aria-label="Nach oben">↑</button>
        <button class="wstool" onclick="wsSlideMove(1)" title="Nach unten" aria-label="Nach unten">↓</button>
        <span class="wsgap"></span>
        <button class="btn g sm" onclick="wsSlideShow(WS_SL.cur)">▶ Präsentieren</button>
        <button class="wstool" onclick="$('wfFile').click()" title="Öffnen (.pptx, .odp, .pdf)" aria-label="Öffnen">📂</button>
        <button class="wstool" onclick="wsSlidesPptx()" title="Als PowerPoint-Datei (.pptx) speichern" aria-label="Als pptx speichern">💾</button>
        <button class="wstool" onclick="wsSlidesPrint()" title="Als PDF speichern / drucken" aria-label="PDF">🖨️</button>
        <button class="wstool" onclick="wsSlidesCheck()" title="Vom Präsentations-Check bewerten lassen" aria-label="Bewerten">🎤</button>
        <input type="file" id="wfFile" hidden accept=".pptx,.odp,.pdf" onchange="wsSlidesOpen(this)"></div>
      <div class="wfmain"><div class="wfthumbs" id="wfThumbs"></div>
        <div class="wfedit"><div id="wfPrev"></div>
          <input class="fi" id="wfT" maxlength="120" placeholder="Titel" oninput="wsSlideEdit('t',this.value)" aria-label="Titel">
          <textarea class="ta" id="wfP" rows="5" placeholder="Ein Punkt pro Zeile" oninput="wsSlideEdit('p',this.value)" aria-label="Punkte"></textarea>
          <div class="wfcols" id="wfC"></div></div></div>
    </div>`;
    wsSlidesPaint();
  },
  ctx() {
    const d = wsSlidesData();
    return `Folien „${d.name}“ (${d.list.length}): ${d.list.map((s, i) => `${i + 1}. ${s.t}`).join(" | ").slice(0, 900)}`;
  },
};
