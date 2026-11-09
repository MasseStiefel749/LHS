/* Konto & Bestenliste über Supabase (kostenloser Plan). Einrichtung: siehe README → „Konto & Bestenliste".
   Der anon-Key ist öffentlich (geschützt wird über Row Level Security in supabase/schema.sql).
   Leer lassen = Konto/Bestenliste aus, alles bleibt lokal.
   vapidPublic = öffentlicher VAPID-Schlüssel für Push-Erinnerungen (README → „Push-Erinnerungen“); leer = Push aus. */
window.LERNHUB_CLOUD = {
  url: "https://dbpphalqhsfkzqmtlnva.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicHBoYWxxaHNma3pxbXRsbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMTc3ODgsImV4cCI6MjEwOTc5Mzc4OH0.rVSqa4n8m79mzPTCQLh43hGCERN-xyAXkZT-r0md1dE",
  vapidPublic: ""
};
