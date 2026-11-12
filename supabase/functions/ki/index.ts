// Lernhub-KI: beantwortet Chat-Fragen eingeloggter Nutzer über Groq – der Schlüssel bleibt auf dem Server.
// Secrets: GROQ_API_KEY (Pflicht), KI_MODEL (optional, Standard openai/gpt-oss-120b). Limit: ki_take() in schema.sql.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return fail("Die Lernhub-KI ist noch nicht eingerichtet.", 503);

  let body: { messages?: unknown; max_tokens?: unknown };
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
  const max = Math.min(Math.max(Number(body.max_tokens) || 400, 16), 800);

  // Prüft den Login (auth.uid()) und zählt die Anfrage fürs Tageslimit
  const take = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/ki_take`, {
    method: "POST",
    headers: {
      apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      Authorization: req.headers.get("Authorization") ?? "",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!take.ok) {
    const t = await take.text();
    if (/"limit"/.test(t)) return fail("Tageslimit der Lernhub-KI erreicht – morgen geht's weiter (oder eigenen Key eintragen).", 429);
    if (take.status === 401 || /"auth"/.test(t)) return fail("Bitte einloggen, um die Lernhub-KI zu nutzen.", 401);
    return fail("Server noch nicht aktualisiert: supabase/schema.sql bitte erneut ausführen.", 503);
  }

  // gpt-oss denkt vor der Antwort – dafür extra Tokens, Denkaufwand niedrig
  const oss = MODEL.startsWith("openai/gpt-oss");
  let r: Response;
  try {
    r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: clean,
        max_completion_tokens: oss ? max + 600 : max,
        ...(oss ? { reasoning_effort: "low" } : {}),
      }),
    });
  } catch {
    return fail("Die KI ist gerade nicht erreichbar.", 502);
  }
  const j = await r.json().catch(() => null);
  if (!r.ok) {
    console.error("groq", r.status, j?.error?.message);
    return r.status === 429
      ? fail("Die Lernhub-KI ist gerade ausgelastet – bitte gleich nochmal versuchen.", 429)
      : fail(`KI-Fehler (HTTP ${r.status})`, 502);
  }
  const content = j?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) return fail("Keine Antwort von der KI.", 502);
  return json({ choices: [{ message: { role: "assistant", content } }] });
});
