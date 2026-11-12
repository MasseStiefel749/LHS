// Lernhub-KI: beantwortet Chat-Fragen über Groq – der Schlüssel bleibt auf dem Server.
// Mit Konto: Limit ki_take(); ohne Konto (Gäste): Limit ki_take_guest() über einen täglich wechselnden IP-Hash.
// Optional "tools" (OpenAI-Format, z. B. aufgaben_anlegen): der Browser führt die Tool-Aufrufe selbst aus.
// Secrets: GROQ_API_KEY (Pflicht), KI_MODEL (optional, Standard openai/gpt-oss-120b).
// Deploy: supabase functions deploy ki   (oder Dashboard → Edge Functions → Via Editor, Name „ki“)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MODEL = Deno.env.get("KI_MODEL") || "openai/gpt-oss-120b";
const ROLES = ["system", "user", "assistant"];
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const fail = (message: string, status: number) => json({ error: { message } }, status);
const SUPA = Deno.env.get("SUPABASE_URL");

type Tool = { type: "function"; function: { name: string; description?: string; parameters?: unknown } };
function cleanTools(x: unknown): Tool[] | null {
  if (x === undefined) return [];
  if (!Array.isArray(x) || x.length > 3 || JSON.stringify(x).length > 8000) return null;
  const out: Tool[] = [];
  for (const t of x) {
    const f = t?.function;
    if (t?.type !== "function" || typeof f?.name !== "string" || !/^[a-z_]{1,40}$/.test(f.name)) return null;
    out.push({ type: "function", function: { name: f.name, description: String(f.description ?? "").slice(0, 1500), parameters: f.parameters ?? {} } });
  }
  return out;
}

// Gäste: HMAC(IP|Tag) mit einem Server-Schlüssel – die IP selbst verlässt die Function nie
async function guestTake(req: Request): Promise<string> {
  const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!svc || !SUPA) return "setup";
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unbekannt";
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(svc), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(ip + "|" + new Date().toISOString().slice(0, 10))));
  const h = Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
  const headers: Record<string, string> = { apikey: svc, "Content-Type": "application/json" };
  if (!svc.startsWith("sb_")) headers.Authorization = `Bearer ${svc}`;
  const r = await fetch(`${SUPA}/rest/v1/rpc/ki_take_guest`, { method: "POST", headers, body: JSON.stringify({ p_h: h }) });
  if (r.ok) return "ok";
  const t = await r.text();
  return /"limit"/.test(t) ? "limit" : /"busy"/.test(t) ? "busy" : "setup";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return fail("Die Lernhub-KI ist noch nicht eingerichtet.", 503);

  let body: { messages?: unknown; max_tokens?: unknown; tools?: unknown };
  try { body = await req.json(); } catch { return fail("Ungültige Anfrage", 400); }
  const msgs = Array.isArray(body.messages) ? body.messages : [];
  if (!msgs.length || msgs.length > 24) return fail("Ungültige Anfrage", 400);
  const clean: { role: string; content: string }[] = [];
  let size = 0;
  for (const m of msgs) {
    if (!m || !ROLES.includes(m.role) || typeof m.content !== "string") return fail("Ungültige Anfrage", 400);
    size += m.content.length;
    clean.push({ role: m.role, content: m.content });
  }
  if (size > 16_000) return fail("Anfrage zu lang", 413);
  const tools = cleanTools(body.tools);
  if (!tools) return fail("Ungültige Tools", 400);
  // Tool-Aufrufe (z. B. 14 Aufgaben als JSON) brauchen mehr Platz als Chat-Antworten
  const max = Math.min(Math.max(Number(body.max_tokens) || 400, 16), tools.length ? 4000 : 800);

  // Prüft den Login (auth.uid()) und zählt die Anfrage fürs Tageslimit
  const take = await fetch(`${SUPA}/rest/v1/rpc/ki_take`, {
    method: "POST",
    headers: {
      apikey: req.headers.get("apikey") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      Authorization: req.headers.get("Authorization") ?? "",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!take.ok) {
    const t = await take.text();
    if (/"limit"/.test(t)) return fail("Tageslimit der Lernhub-KI erreicht – morgen geht's weiter (oder eigenen Key eintragen).", 429);
    if (take.status !== 401 && !/"auth"/.test(t)) return fail("Server noch nicht aktualisiert: supabase/schema.sql bitte erneut ausführen.", 503);
    // Nicht eingeloggt → Gäste-Kontingent
    const g = await guestTake(req);
    if (g === "limit") return fail("Tageslimit für Gäste erreicht – mit einem kostenlosen Konto geht's weiter.", 429);
    if (g === "busy") return fail("Die Lernhub-KI ist für Gäste heute ausgelastet – mit einem kostenlosen Konto geht's weiter.", 429);
    if (g !== "ok") return fail("Server noch nicht aktualisiert: supabase/schema.sql bitte erneut ausführen.", 503);
  }

  // gpt-oss denkt vor der Antwort – dafür extra Tokens, Denkaufwand niedrig
  const oss = MODEL.startsWith("openai/gpt-oss");
  let r: Response;
  try {
    r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(tools.length ? 60_000 : 30_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: clean,
        max_completion_tokens: oss ? max + 600 : max,
        ...(oss ? { reasoning_effort: "low" } : {}),
        ...(tools.length ? { tools, tool_choice: "auto", parallel_tool_calls: false } : {}),
      }),
    });
  } catch {
    return fail("Die KI ist gerade nicht erreichbar.", 502);
  }
  const j = await r.json().catch(() => null);
  if (!r.ok) {
    console.error("groq", r.status, j?.error?.code, j?.error?.message);
    if (j?.error?.code === "tool_use_failed") return fail("Die KI hat die Aufgaben nicht sauber erstellt – bitte nochmal versuchen.", 502);
    return r.status === 429
      ? fail("Die Lernhub-KI ist gerade ausgelastet – bitte gleich nochmal versuchen.", 429)
      : fail(`KI-Fehler (HTTP ${r.status})`, 502);
  }
  const msg = j?.choices?.[0]?.message ?? {};
  const content = typeof msg.content === "string" ? msg.content : "";
  const names = tools.map((t) => t.function.name);
  const calls = (Array.isArray(msg.tool_calls) ? msg.tool_calls : [])
    .filter((c: any) => names.includes(c?.function?.name) && typeof c.function.arguments === "string" && c.function.arguments.length <= 40_000)
    .slice(0, 1)
    .map((c: any) => ({ id: String(c.id ?? "call"), type: "function", function: { name: c.function.name, arguments: c.function.arguments } }));
  if (!content.trim() && !calls.length) return fail("Keine Antwort von der KI.", 502);
  return json({ choices: [{ message: { role: "assistant", content, ...(calls.length ? { tool_calls: calls } : {}) } }] });
});
