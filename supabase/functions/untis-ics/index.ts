// Lernhub: lädt den persönlichen WebUntis-iCal-Link für eingeloggte Nutzer (Browser dürfen ihn wegen CORS oft nicht direkt laden).
// Nur https://*.webuntis.com, keine Weiterleitungen, max. 3 MB, 10 s. Der Link wird NICHT gespeichert oder geloggt.
// Deploy: supabase functions deploy untis-ics
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MAX = 3_000_000;
const fail = (msg: string, status: number) => new Response(msg, { status, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });

function allowed(raw: unknown): URL | null {
  if (typeof raw !== "string" || raw.length > 2000) return null;
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return null;
  if (!/^([a-z0-9-]+\.)*webuntis\.com$/i.test(u.hostname)) return null;
  return u;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const auth = req.headers.get("Authorization") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  const { data: { user } } = await sb.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  if (!user) return fail("Bitte einloggen", 401);

  let body: { url?: unknown };
  try { body = await req.json(); } catch { return fail("Ungültige Anfrage", 400); }
  const url = allowed(body.url);
  if (!url) return fail("Nur WebUntis-Links (https://…webuntis.com/…) erlaubt", 400);

  let r: Response | null = null;
  let next: URL | null = url;
  try {
    // Weiterleitungen nur innerhalb von *.webuntis.com (jede Station wird erneut geprüft)
    for (let hop = 0; hop < 4 && next; hop++) {
      r = await fetch(next, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { Accept: "text/calendar" } });
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get("location");
        await r.body?.cancel();
        next = loc ? allowed(new URL(loc, next).toString()) : null;
        if (!next) return fail("WebUntis leitet auf eine fremde Adresse um", 502);
        r = null;
      } else next = null;
    }
  } catch {
    return fail("WebUntis nicht erreichbar", 502);
  }
  if (!r) return fail("Zu viele Weiterleitungen", 502);
  if (!r.ok) return fail(`WebUntis antwortet mit HTTP ${r.status} – Link abgelaufen oder deaktiviert?`, 502);
  if (+(r.headers.get("content-length") ?? 0) > MAX) return fail("Kalender zu groß", 413);

  const reader = r.body?.getReader();
  if (!reader) return fail("Leere Antwort", 502);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX) { await reader.cancel(); return fail("Kalender zu groß", 413); }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  const text = new TextDecoder().decode(buf);
  if (!text.includes("BEGIN:VCALENDAR")) return fail("Das ist kein iCal-Kalender", 502);

  return new Response(text, { headers: { ...CORS, "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
});
