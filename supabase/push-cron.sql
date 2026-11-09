-- Lernhub: Push-Erinnerungen alle 15 Minuten auslösen (Supabase → Database → Extensions: pg_cron und pg_net aktivieren).
-- Platzhalter ersetzen: DEIN-PROJEKT (aus der Projekt-URL) und DEIN-CRON-SECRET (derselbe Wert wie das Secret CRON_SECRET).
-- Mehrfaches Ausführen ist unschädlich (der alte Job wird ersetzt).
select cron.unschedule('lernhub-push') where exists (select 1 from cron.job where jobname = 'lernhub-push');
select cron.schedule(
  'lernhub-push',
  '*/15 * * * *',
  $$ select net.http_post(
       url     := 'https://DEIN-PROJEKT.supabase.co/functions/v1/push-reminders',
       headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'DEIN-CRON-SECRET'),
       body    := '{}'::jsonb,
       timeout_milliseconds := 20000
     ); $$
);
