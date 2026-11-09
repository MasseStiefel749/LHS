// Lernhub: verschickt fällige Lern-Erinnerungen als Web-Push – auch wenn Lernhub geschlossen ist.
// Wird alle 15 Minuten von pg_cron aufgerufen (siehe supabase/push-cron.sql).
// Deploy:  supabase functions deploy push-reminders --no-verify-jwt
// Secrets: supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… VAPID_SUBJECT=mailto:du@example.org CRON_SECRET=…
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => {
  const v = Deno.env.get(k);
  if (!v) throw new Error(`Secret ${k} fehlt`);
  return v;
};

function sameSecret(a: string, b: string) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!sameSecret(req.headers.get("x-cron-secret") ?? "", env("CRON_SECRET"))) {
    return new Response("Forbidden", { status: 403 });
  }

  webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

  const { data, error } = await db.rpc("push_due");
  if (error) return new Response("push_due: " + error.message, { status: 500 });

  let sent = 0, gone = 0, failed = 0;
  await Promise.all((data ?? []).map(async (r: { endpoint: string; p256dh: string; auth: string; title: string; body: string }) => {
    try {
      await webpush.sendNotification(
        { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
        JSON.stringify({ title: r.title, body: r.body, url: "./index.html" }),
        { TTL: 3600, urgency: "normal" },
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await db.rpc("push_gone", { p_endpoint: r.endpoint });
        gone++;
      } else {
        failed++;
        console.warn("push failed", code);
      }
    }
  }));

  return Response.json({ sent, gone, failed });
});
