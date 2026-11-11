-- Lernhub: Konto, Freunde & Bestenliste (Supabase, kostenloser Plan)
-- Einmal komplett im Supabase-Dashboard unter "SQL Editor" ausführen. Mehrfaches Ausführen ist unschädlich.
-- Sicherheitsprinzip: Der Browser darf keine Tabelle direkt lesen/schreiben (RLS ohne Policies + REVOKE).
-- Alles läuft über die Funktionen unten; jede prüft auth.uid() und gibt nur eigene bzw. Freundes-Daten heraus.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nickname     text not null check (nickname ~ '^[A-Za-z0-9_.-]{3,20}$'),
  share_errors boolean not null default false,
  share_hints  boolean not null default false,
  created_at   timestamptz not null default now()
);
create unique index if not exists profiles_nickname_lower_idx on public.profiles (lower(nickname));

create table if not exists public.stats (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  xp          integer not null default 0 check (xp >= 0),
  week_xp     integer not null default 0 check (week_xp >= 0),
  week_start  date,
  streak      integer not null default 0 check (streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  lessons     integer not null default 0 check (lessons >= 0),
  answered    integer not null default 0 check (answered >= 0),
  correct     integer not null default 0 check (correct >= 0),
  hints       integer not null default 0 check (hints >= 0),
  last_day    date,
  updated_at  timestamptz not null default now()
);
create index if not exists stats_week_idx on public.stats (week_start, week_xp desc);
create index if not exists stats_xp_idx on public.stats (xp desc);
create index if not exists stats_last_day_idx on public.stats (last_day);

create table if not exists public.friendships (
  id         bigint generated always as identity primary key,
  requester  uuid not null references public.profiles(id) on delete cascade,
  addressee  uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair_idx on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_requester_idx on public.friendships (requester, status);
create index if not exists friendships_addressee_idx on public.friendships (addressee, status);

-- ===== Erweiterung: Wochenligen, Klassen-Challenge, Lern-Duelle, Push-Erinnerungen =====
alter table public.profiles add column if not exists league_on boolean not null default false;
alter table public.stats add column if not exists tier smallint not null default 0 check (tier between 0 and 9);
alter table public.stats add column if not exists best_tier smallint not null default 0 check (best_tier between 0 and 9);
alter table public.stats add column if not exists goal_day date;
create index if not exists profiles_league_idx on public.profiles (id) where league_on;
create index if not exists stats_tier_idx on public.stats (tier, week_start, week_xp desc);
create index if not exists stats_goal_day_idx on public.stats (goal_day);

-- Merkt sich, bis zu welcher Woche die Ligen schon abgerechnet sind (genau eine Zeile)
create table if not exists public.league_state (
  id        smallint primary key default 1 check (id = 1),
  last_week date not null
);
create table if not exists public.league_history (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  tier       smallint not null,
  week_xp    integer not null,
  rank       integer not null,
  result     text not null check (result in ('up','down','stay')),
  primary key (user_id, week_start)
);
create index if not exists league_history_week_idx on public.league_history (week_start, tier);

create table if not exists public.classes (
  id         bigint generated always as identity primary key,
  code       text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  name       text not null check (char_length(name) between 2 and 40),
  owner      uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists classes_owner_idx on public.classes (owner);
create table if not exists public.class_members (
  user_id   uuid primary key references public.profiles(id) on delete cascade,
  class_id  bigint not null references public.classes(id) on delete cascade,
  joined_at timestamptz not null default now()
);
create index if not exists class_members_class_idx on public.class_members (class_id);

create table if not exists public.duels (
  id          bigint generated always as identity primary key,
  challenger  uuid not null references public.profiles(id) on delete cascade,
  opponent    uuid not null references public.profiles(id) on delete cascade,
  subj        text not null check (subj ~ '^[A-Za-z0-9_-]{1,60}$'),
  seed        integer not null check (seed >= 0),
  c_score     smallint not null check (c_score between 0 and 10),
  c_ms        integer not null check (c_ms between 0 and 3600000),
  o_score     smallint check (o_score between 0 and 10),
  o_ms        integer check (o_ms between 0 and 3600000),
  status      text not null default 'open' check (status in ('open','done','declined')),
  created_at  timestamptz not null default now(),
  finished_at timestamptz,
  check (challenger <> opponent)
);
create index if not exists duels_challenger_idx on public.duels (challenger, created_at desc);
create index if not exists duels_opponent_idx on public.duels (opponent, status, created_at desc);

create table if not exists public.push_subs (
  endpoint    text primary key check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  p256dh      text not null check (char_length(p256dh) <= 200),
  auth        text not null check (char_length(auth) <= 100),
  remind_on   boolean not null default true,
  remind_from time not null default '17:00',
  rest_days   smallint[] not null default '{}',
  last_sent   timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subs (user_id);
create index if not exists push_subs_due_idx on public.push_subs (remind_on, remind_from, last_sent);

-- Schulalltag läuft in deutscher Zeit, nicht in UTC
create or replace function public.lh_today() returns date
language sql stable as $$ select (now() at time zone 'Europe/Berlin')::date $$;
create or replace function public.lh_week() returns date
language sql stable as $$ select date_trunc('week', public.lh_today())::date $$;

alter table public.profiles    enable row level security;
alter table public.stats       enable row level security;
alter table public.friendships enable row level security;
alter table public.league_state   enable row level security;
alter table public.league_history enable row level security;
alter table public.classes        enable row level security;
alter table public.class_members  enable row level security;
alter table public.duels          enable row level security;
alter table public.push_subs      enable row level security;
revoke all on public.profiles, public.stats, public.friendships, public.league_state, public.league_history,
  public.classes, public.class_members, public.duels, public.push_subs from anon, authenticated;

-- Eigenes Profil lesen
create or replace function public.my_profile()
returns table (nickname text, share_errors boolean, share_hints boolean)
language sql stable security definer set search_path = public as $$
  select p.nickname, p.share_errors, p.share_hints from profiles p where p.id = auth.uid();
$$;

-- Spitzname + Freigaben setzen (legt das Profil beim ersten Mal an)
create or replace function public.set_profile(p_nick text, p_share_errors boolean, p_share_hints boolean)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_nick is null or p_nick !~ '^[A-Za-z0-9_.-]{3,20}$' then raise exception 'bad_nickname'; end if;
  begin
    insert into profiles (id, nickname, share_errors, share_hints)
    values (uid, p_nick, coalesce(p_share_errors, false), coalesce(p_share_hints, false))
    on conflict (id) do update set nickname = excluded.nickname,
      share_errors = excluded.share_errors, share_hints = excluded.share_hints;
  exception when unique_violation then
    raise exception 'nickname_taken';
  end;
end $$;

-- Lernzahlen hochladen (Werte werden begrenzt; max. 1 Schreibvorgang pro 2 Sekunden)
drop function if exists public.push_stats(integer, integer, date, integer, integer, integer, integer, integer, integer, date);
create or replace function public.push_stats(
  p_xp integer, p_week_xp integer, p_week_start date, p_streak integer, p_best integer,
  p_lessons integer, p_answered integer, p_correct integer, p_hints integer, p_last_day date,
  p_goal_day date default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_today date := lh_today();
  v_answered integer := least(greatest(coalesce(p_answered, 0), 0), 10000000);
  v_week_ok boolean := p_week_start between v_today - 7 and v_today + 1;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = uid) then raise exception 'no_profile'; end if;
  -- Neue Woche? Erst Ligen der Vorwoche abrechnen, bevor Wochen-XP überschrieben werden
  perform league_settle();
  insert into stats as s (user_id, xp, week_xp, week_start, streak, best_streak, lessons, answered, correct, hints, last_day, goal_day, updated_at)
  values (uid,
    least(greatest(coalesce(p_xp, 0), 0), 10000000),
    case when v_week_ok then least(greatest(coalesce(p_week_xp, 0), 0), 100000) else 0 end,
    case when v_week_ok then p_week_start end,
    least(greatest(coalesce(p_streak, 0), 0), 5000),
    least(greatest(coalesce(p_best, 0), 0), 5000),
    least(greatest(coalesce(p_lessons, 0), 0), 1000000),
    v_answered,
    least(greatest(coalesce(p_correct, 0), 0), v_answered),
    least(greatest(coalesce(p_hints, 0), 0), 10000000),
    case when p_last_day <= v_today + 1 then p_last_day end,
    case when p_goal_day = v_today then v_today end,
    now())
  on conflict (user_id) do update set
    xp = excluded.xp, week_xp = excluded.week_xp, week_start = excluded.week_start,
    streak = excluded.streak, best_streak = excluded.best_streak, lessons = excluded.lessons,
    answered = excluded.answered, correct = excluded.correct, hints = excluded.hints,
    last_day = excluded.last_day, updated_at = excluded.updated_at,
    goal_day = coalesce(excluded.goal_day, case when s.goal_day = v_today then s.goal_day end)
  where s.updated_at < now() - interval '2 seconds';
end $$;

-- Bestenliste: ich + bestätigte Freunde. Fehler/Hinweise nur bei Freigabe (null = privat).
create or replace function public.leaderboard()
returns table (nickname text, is_me boolean, xp integer, week_xp integer, streak integer, best_streak integer,
               lessons integer, answered integer, wrong integer, hints integer)
language sql stable security definer set search_path = public as $$
  with me as (select auth.uid() as uid),
  ids as (
    select me.uid as pid from me where me.uid is not null
    union
    select case when f.requester = me.uid then f.addressee else f.requester end
    from friendships f cross join me
    where f.status = 'accepted' and me.uid in (f.requester, f.addressee)
  )
  select p.nickname,
    p.id = me.uid,
    coalesce(s.xp, 0),
    case when s.week_start = lh_week() then s.week_xp else 0 end,
    case when s.last_day >= lh_today() - 1 then s.streak else 0 end,
    coalesce(s.best_streak, 0),
    coalesce(s.lessons, 0),
    coalesce(s.answered, 0),
    case when p.share_errors or p.id = me.uid then coalesce(s.answered - s.correct, 0) end,
    case when p.share_hints  or p.id = me.uid then coalesce(s.hints, 0) end
  from ids
  join profiles p on p.id = ids.pid
  left join stats s on s.user_id = p.id
  cross join me;
$$;

-- Freundschaftsanfrage per Spitzname. Antwort: sent | accepted | exists | not_found | self | limit
create or replace function public.friend_request(p_nick text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); target uuid; f friendships%rowtype;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select id into target from profiles where lower(nickname) = lower(trim(p_nick));
  if target is null then return 'not_found'; end if;
  if target = uid then return 'self'; end if;
  select * into f from friendships
   where least(requester, addressee) = least(uid, target) and greatest(requester, addressee) = greatest(uid, target);
  if found then
    if f.status = 'pending' and f.addressee = uid then
      update friendships set status = 'accepted' where id = f.id;
      return 'accepted';
    end if;
    return 'exists';
  end if;
  if (select count(*) from friendships where requester = uid and status = 'pending') >= 50 then return 'limit'; end if;
  insert into friendships (requester, addressee) values (uid, target);
  return 'sent';
end $$;

-- Eigene Freundschaften und Anfragen
create or replace function public.friends_list()
returns table (id bigint, nickname text, status text, incoming boolean)
language sql stable security definer set search_path = public as $$
  select f.id, p.nickname, f.status, f.addressee = auth.uid()
  from friendships f
  join profiles p on p.id = case when f.requester = auth.uid() then f.addressee else f.requester end
  where auth.uid() in (f.requester, f.addressee)
  order by f.status, p.nickname;
$$;

-- Anfrage annehmen (true) oder Anfrage/Freundschaft entfernen (false)
create or replace function public.friend_respond(p_id bigint, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_accept then
    update friendships set status = 'accepted' where id = p_id and addressee = uid and status = 'pending';
  else
    delete from friendships where id = p_id and uid in (requester, addressee);
  end if;
end $$;

-- Konto komplett löschen (Profil, Zahlen, Freundschaften folgen per ON DELETE CASCADE)
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.my_profile() from public, anon;
revoke all on function public.set_profile(text, boolean, boolean) from public, anon;
revoke all on function public.push_stats(integer, integer, date, integer, integer, integer, integer, integer, integer, date, date) from public, anon;
revoke all on function public.leaderboard() from public, anon;
revoke all on function public.friend_request(text) from public, anon;
revoke all on function public.friends_list() from public, anon;
revoke all on function public.friend_respond(bigint, boolean) from public, anon;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.my_profile() to authenticated;
grant execute on function public.set_profile(text, boolean, boolean) to authenticated;
grant execute on function public.push_stats(integer, integer, date, integer, integer, integer, integer, integer, integer, date, date) to authenticated;
grant execute on function public.leaderboard() to authenticated;
grant execute on function public.friend_request(text) to authenticated;
grant execute on function public.friends_list() to authenticated;
grant execute on function public.friend_respond(bigint, boolean) to authenticated;
grant execute on function public.delete_account() to authenticated;

-- ===================== Wochenligen =====================
-- Stufen 0..9 (Bronze … Diamant). Nur wer mitmacht (league_on) erscheint dort – mit Spitzname und Wochen-XP.
-- Abrechnung "lazy": der erste Aufruf in einer neuen Woche rechnet die Vorwoche ab (kein Cronjob nötig).
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships f where f.status = 'accepted'
    and least(f.requester, f.addressee) = least(a, b) and greatest(f.requester, f.addressee) = greatest(a, b));
$$;

create or replace function public.league_settle()
returns void language plpgsql security definer set search_path = public as $$
declare v_cur date := lh_week(); v_last date;
begin
  insert into league_state (id, last_week) values (1, v_cur) on conflict (id) do nothing;
  select last_week into v_last from league_state where id = 1 for update;
  if v_last >= v_cur then return; end if;
  -- Aufstieg: obere 30 % der Aktiven (mind. 1, mind. 50 XP). Abstieg: untere 20 % ab 5 Aktiven + alle mit 0 XP.
  with p as (
    select s.user_id, s.tier, case when s.week_start = v_last then s.week_xp else 0 end as wxp
    from stats s join profiles pr on pr.id = s.user_id where pr.league_on
  ), r as (
    select p.*, rank() over (partition by p.tier order by p.wxp desc) as rk,
           count(*) filter (where p.wxp > 0) over (partition by p.tier) as active
    from p
  ), d as (
    select r.user_id, r.tier, r.wxp, r.rk,
      case when r.wxp >= 50 and r.tier < 9 and r.rk <= greatest(1, ceil(r.active * 0.3)) then 'up'
           when r.tier > 0 and (r.wxp = 0 or (r.active >= 5 and r.rk > r.active - floor(r.active * 0.2))) then 'down'
           else 'stay' end as res
    from r
  ), h as (
    insert into league_history (user_id, week_start, tier, week_xp, rank, result)
    select d.user_id, v_last, d.tier, d.wxp, d.rk, d.res from d
    on conflict (user_id, week_start) do nothing
  )
  update stats s set
    tier = s.tier + case d.res when 'up' then 1 else -1 end,
    best_tier = greatest(s.best_tier, s.tier + case d.res when 'up' then 1 else 0 end)
  from d where d.user_id = s.user_id and d.res <> 'stay';
  update league_state set last_week = v_cur where id = 1;
end $$;

create or replace function public.league_join(p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update profiles set league_on = coalesce(p_on, false) where id = auth.uid();
end $$;

create or replace function public.league_view()
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_on boolean; v_tier smallint := 0; v_best smallint := 0; v_last json; v_rows json;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  perform league_settle();
  select league_on into v_on from profiles where id = uid;
  if v_on is null then raise exception 'no_profile'; end if;
  select coalesce(s.tier, 0), coalesce(s.best_tier, 0) into v_tier, v_best from stats s where s.user_id = uid;
  v_tier := coalesce(v_tier, 0); v_best := coalesce(v_best, 0);
  select json_build_object('week', h.week_start, 'tier', h.tier, 'rank', h.rank, 'xp', h.week_xp, 'result', h.result)
    into v_last from league_history h where h.user_id = uid order by h.week_start desc limit 1;
  if v_on then
    select coalesce(json_agg(x order by x.week_xp desc, x.nickname), '[]'::json) into v_rows from (
      select p.nickname, p.id = uid as is_me,
        case when s.week_start = lh_week() then s.week_xp else 0 end as week_xp,
        case when s.last_day >= lh_today() - 1 then s.streak else 0 end as streak
      from profiles p left join stats s on s.user_id = p.id
      where p.league_on and coalesce(s.tier, 0) = v_tier
      order by 3 desc limit 100) x;
  end if;
  return json_build_object('on', v_on, 'tier', v_tier, 'best', v_best, 'week', lh_week(), 'last', v_last,
                           'rows', coalesce(v_rows, '[]'::json));
end $$;

-- ===================== Klassen-Challenge =====================
-- Eine Klasse pro Person. Mitglieder sehen gegenseitig Spitzname, Wochen-XP, Streak, Lektionen.
create or replace function public.class_create(p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; v_code text; v_raw bytea; v_id bigint; i int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = uid) then raise exception 'no_profile'; end if;
  if exists (select 1 from class_members where user_id = uid) then raise exception 'already_in_class'; end if;
  p_name := trim(coalesce(p_name, ''));
  if char_length(p_name) not between 2 and 40 then raise exception 'bad_class_name'; end if;
  if (select count(*) from classes where owner = uid) >= 3 then raise exception 'limit'; end if;
  loop
    v_raw := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_code := '';
    for i in 0..5 loop
      v_code := v_code || substr(v_chars, 1 + (get_byte(v_raw, i) % 32), 1);
    end loop;
    begin
      insert into classes (code, name, owner) values (v_code, p_name, uid) returning id into v_id;
      exit;
    exception when unique_violation then null;
    end;
  end loop;
  insert into class_members (user_id, class_id) values (uid, v_id);
  return v_code;
end $$;

-- Antwort: joined | already | not_found | full
create or replace function public.class_join(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_id bigint;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = uid) then raise exception 'no_profile'; end if;
  if exists (select 1 from class_members where user_id = uid) then return 'already'; end if;
  select id into v_id from classes where code = upper(trim(coalesce(p_code, '')));
  if v_id is null then return 'not_found'; end if;
  if (select count(*) from class_members where class_id = v_id) >= 60 then return 'full'; end if;
  insert into class_members (user_id, class_id) values (uid, v_id);
  return 'joined';
end $$;

create or replace function public.class_leave()
returns void language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from class_members where user_id = auth.uid() returning class_id into v_id;
  if v_id is not null and not exists (select 1 from class_members where class_id = v_id) then
    delete from classes where id = v_id;
  end if;
end $$;

create or replace function public.class_info()
returns json language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_cls classes%rowtype; v_members json; v_n int; v_total int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select c.* into v_cls from classes c join class_members m on m.class_id = c.id where m.user_id = uid;
  if not found then return null; end if;
  select count(*), coalesce(sum(case when s.week_start = lh_week() then s.week_xp else 0 end), 0)
    into v_n, v_total
    from class_members m left join stats s on s.user_id = m.user_id where m.class_id = v_cls.id;
  select coalesce(json_agg(x order by x.week_xp desc, x.nickname), '[]'::json) into v_members from (
    select p.nickname, p.id = uid as is_me,
      case when s.week_start = lh_week() then s.week_xp else 0 end as week_xp,
      case when s.last_day >= lh_today() - 1 then s.streak else 0 end as streak,
      coalesce(s.lessons, 0) as lessons
    from class_members m join profiles p on p.id = m.user_id left join stats s on s.user_id = m.user_id
    where m.class_id = v_cls.id) x;
  return json_build_object('name', v_cls.name, 'code', v_cls.code, 'is_owner', v_cls.owner = uid,
    'members', v_members, 'count', v_n, 'week_total', v_total, 'goal', v_n * 150);
end $$;

-- Klassen gegeneinander: nur Klassenname, Mitgliederzahl und Ø Wochen-XP (keine Personen)
create or replace function public.class_ranking()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.avg_xp desc), '[]'::json) from (
    select c.name, count(*)::int as members,
      round(avg(case when s.week_start = lh_week() then s.week_xp else 0 end))::int as avg_xp,
      bool_or(m.user_id = auth.uid()) as mine
    from classes c join class_members m on m.class_id = c.id left join stats s on s.user_id = m.user_id
    group by c.id, c.name having count(*) >= 2
    order by 3 desc limit 20) x;
$$;

-- ===================== Lern-Duelle (nur unter bestätigten Freunden) =====================
-- Herausforderer spielt zuerst; der Gegner sieht dessen Ergebnis erst nach seinem eigenen Spiel.
create or replace function public.duel_create(p_nick text, p_subj text, p_seed integer, p_score integer, p_ms integer)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); target uuid;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_subj is null or p_subj !~ '^[A-Za-z0-9_-]{1,60}$' then raise exception 'bad_subject'; end if;
  select id into target from profiles where lower(nickname) = lower(trim(p_nick));
  if target is null then return 'not_found'; end if;
  if target = uid then return 'self'; end if;
  if not are_friends(uid, target) then return 'not_friends'; end if;
  if (select count(*) from duels where challenger = uid and status = 'open' and created_at > now() - interval '7 days') >= 20 then
    return 'limit';
  end if;
  insert into duels (challenger, opponent, subj, seed, c_score, c_ms)
  values (uid, target, p_subj, greatest(coalesce(p_seed, 0), 0),
          least(greatest(coalesce(p_score, 0), 0), 10), least(greatest(coalesce(p_ms, 0), 0), 3600000));
  return 'sent';
end $$;

create or replace function public.duel_list()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.created_at desc), '[]'::json) from (
    select d.id, d.challenger = auth.uid() as mine, p.nickname as other, d.subj, d.seed,
      case when d.challenger = auth.uid() then d.c_score else d.o_score end as my_score,
      case when d.challenger = auth.uid() then d.c_ms else d.o_ms end as my_ms,
      case when d.challenger = auth.uid() then d.o_score when d.o_score is not null then d.c_score end as other_score,
      case when d.challenger = auth.uid() then d.o_ms when d.o_score is not null then d.c_ms end as other_ms,
      case when d.status = 'open' and d.created_at < now() - interval '7 days' then 'expired' else d.status end as status,
      d.created_at
    from duels d
    join profiles p on p.id = case when d.challenger = auth.uid() then d.opponent else d.challenger end
    where auth.uid() in (d.challenger, d.opponent) and d.created_at > now() - interval '30 days'
    order by d.created_at desc limit 50) x;
$$;

create or replace function public.duel_play(p_id bigint, p_score integer, p_ms integer)
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); d duels%rowtype;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  update duels set o_score = least(greatest(coalesce(p_score, 0), 0), 10),
    o_ms = least(greatest(coalesce(p_ms, 0), 0), 3600000), status = 'done', finished_at = now()
  where id = p_id and opponent = uid and status = 'open' and created_at > now() - interval '7 days'
  returning * into d;
  if not found then return json_build_object('ok', false); end if;
  return json_build_object('ok', true, 'my_score', d.o_score, 'my_ms', d.o_ms, 'other_score', d.c_score, 'other_ms', d.c_ms);
end $$;

-- Gegner lehnt ab; Herausforderer zieht ein offenes Duell zurück
create or replace function public.duel_decline(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update duels set status = 'declined', finished_at = now() where id = p_id and opponent = auth.uid() and status = 'open';
  delete from duels where id = p_id and challenger = auth.uid() and status = 'open';
end $$;

-- ===================== Push-Erinnerungen =====================
-- Nur Endpunkte bekannter Push-Dienste (Chrome/Android, Firefox, Safari/iOS, Edge) – kein Versand an beliebige Server.
create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_on boolean, p_from text, p_rest smallint[])
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = uid) then raise exception 'no_profile'; end if;
  if p_endpoint is null or char_length(p_endpoint) > 1000 or p_endpoint !~
     '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)/' then
    raise exception 'bad_endpoint';
  end if;
  if p_from is null or p_from !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'bad_time'; end if;
  if (select count(*) from push_subs where user_id = uid and endpoint <> p_endpoint) >= 5 then raise exception 'limit'; end if;
  insert into push_subs (endpoint, user_id, p256dh, auth, remind_on, remind_from, rest_days)
  values (p_endpoint, uid, left(p_p256dh, 200), left(p_auth, 100), coalesce(p_on, true), p_from::time,
          coalesce((select array_agg(distinct d) from unnest(p_rest) d where d between 1 and 7), '{}'))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
    remind_on = excluded.remind_on, remind_from = excluded.remind_from, rest_days = excluded.rest_days;
end $$;

create or replace function public.push_unsubscribe(p_endpoint text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from push_subs where endpoint = p_endpoint and user_id = auth.uid();
end $$;

-- Für die Edge Function "push-reminders" (nur service_role): fällige Erinnerungen holen und als gesendet markieren.
-- Abstand: bis 18 Uhr stündlich, bis 20 Uhr alle 30 Min, danach alle 15 Min (Cron läuft alle 15 Min).
create or replace function public.push_due()
returns table (endpoint text, p256dh text, auth text, title text, body text)
language plpgsql security definer set search_path = public as $$
declare
  v_now timestamp := now() at time zone 'Europe/Berlin';
  v_today date := v_now::date;
  v_h int := extract(hour from v_now)::int;
  v_gap interval := case when v_h >= 20 then interval '14 minutes' when v_h >= 18 then interval '29 minutes' else interval '59 minutes' end;
begin
  if v_now::time >= time '23:50' then return; end if;
  return query
  with due as (
    select ps.endpoint as ep from push_subs ps
    left join stats st on st.user_id = ps.user_id
    where ps.remind_on and v_now::time >= ps.remind_from
      and not (extract(isodow from v_today)::smallint = any (ps.rest_days))
      and st.goal_day is distinct from v_today
      and (ps.last_sent is null or ps.last_sent < now() - v_gap)
    limit 500
    for update of ps skip locked
  ), upd as (
    update push_subs ps set last_sent = now() from due where ps.endpoint = due.ep
    returning ps.endpoint as ep, ps.p256dh as pk, ps.auth as au, ps.user_id as uid
  )
  select upd.ep, upd.pk, upd.au,
    case when v_h >= 22 then '🚨 Letzte Chance!' when v_h >= 20 then '⏰ Der Tag ist bald rum' else '🐧 Pingulin wartet auf dich' end,
    case when coalesce(st.streak, 0) > 0 and st.last_day >= v_today - 1 and st.last_day < v_today
           then 'Deine 🔥 ' || st.streak || '-Tage-Streak reißt um Mitternacht – 5 Minuten reichen!'
         else 'Dein Tagesziel ist noch offen. Eine kurze Lektion?' end
  from upd left join stats st on st.user_id = upd.uid;
end $$;

-- Abgelaufene Push-Abos (HTTP 404/410 vom Push-Dienst) entfernen
create or replace function public.push_gone(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subs where endpoint = p_endpoint;
$$;

revoke all on function public.are_friends(uuid, uuid) from public, anon, authenticated;
revoke all on function public.league_settle() from public, anon, authenticated;
revoke all on function public.push_due() from public, anon, authenticated;
revoke all on function public.push_gone(text) from public, anon, authenticated;
grant execute on function public.push_due() to service_role;
grant execute on function public.push_gone(text) to service_role;

revoke all on function public.league_join(boolean) from public, anon;
revoke all on function public.league_view() from public, anon;
revoke all on function public.class_create(text) from public, anon;
revoke all on function public.class_join(text) from public, anon;
revoke all on function public.class_leave() from public, anon;
revoke all on function public.class_info() from public, anon;
revoke all on function public.class_ranking() from public, anon;
revoke all on function public.duel_create(text, text, integer, integer, integer) from public, anon;
revoke all on function public.duel_list() from public, anon;
revoke all on function public.duel_play(bigint, integer, integer) from public, anon;
revoke all on function public.duel_decline(bigint) from public, anon;
revoke all on function public.push_subscribe(text, text, text, boolean, text, smallint[]) from public, anon;
revoke all on function public.push_unsubscribe(text) from public, anon;
grant execute on function public.league_join(boolean) to authenticated;
grant execute on function public.league_view() to authenticated;
grant execute on function public.class_create(text) to authenticated;
grant execute on function public.class_join(text) to authenticated;
grant execute on function public.class_leave() to authenticated;
grant execute on function public.class_info() to authenticated;
grant execute on function public.class_ranking() to authenticated;
grant execute on function public.duel_create(text, text, integer, integer, integer) to authenticated;
grant execute on function public.duel_list() to authenticated;
grant execute on function public.duel_play(bigint, integer, integer) to authenticated;
grant execute on function public.duel_decline(bigint) to authenticated;
grant execute on function public.push_subscribe(text, text, text, boolean, text, smallint[]) to authenticated;
grant execute on function public.push_unsubscribe(text) to authenticated;

-- ===================== Privater Cloud-Speicher (kompletter Lernstand, nur für den Besitzer) =====================
-- Primärschlüssel user_id ist zugleich der einzige Suchindex (alle Zugriffe: where user_id = auth.uid()).
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
revoke all on public.user_state from anon, authenticated;

create or replace function public.state_load()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('data', s.data, 'updated_at', s.updated_at) from user_state s where s.user_id = auth.uid();
$$;

-- Speichert nur, wenn p_base dem letzten bekannten Stand entspricht (sonst state_conflict: anderes Gerät war schneller)
create or replace function public.state_save(p_data jsonb, p_base timestamptz)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare cur timestamptz; ts timestamptz := clock_timestamp();
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then raise exception 'bad_state'; end if;
  if octet_length(p_data::text) > 2000000 then raise exception 'state_too_big'; end if;
  select s.updated_at into cur from user_state s where s.user_id = auth.uid() for update;
  if found and (p_base is null or cur <> p_base) then raise exception 'state_conflict'; end if;
  insert into user_state (user_id, data, updated_at) values (auth.uid(), p_data, ts)
    on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return ts;
end $$;

revoke all on function public.state_load() from public, anon;
revoke all on function public.state_save(jsonb, timestamptz) from public, anon;
grant execute on function public.state_load() to authenticated;
grant execute on function public.state_save(jsonb, timestamptz) to authenticated;

-- ===================== 💬 Chat: Direktnachrichten unter Freunden + Klassenchat =====================
-- Direktnachrichten nur zwischen bestätigten Freunden, Klassenchat nur für Mitglieder derselben Klasse.
-- Kein direkter Tabellenzugriff (RLS ohne Policies + REVOKE) – alles über die Funktionen unten.
-- Limits: max. 1000 Zeichen, 15 Nachrichten pro Minute, 400 pro Tag. Nachrichten werden nach 90 Tagen gelöscht.
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  sender     uuid not null references public.profiles(id) on delete cascade,
  recipient  uuid references public.profiles(id) on delete cascade,
  class_id   bigint references public.classes(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  check ((recipient is null) <> (class_id is null)),
  check (recipient is null or recipient <> sender)
);
-- Verlauf eines Paares (beide Richtungen), Posteingang, Klassenchat, Rate-Limit pro Absender, Aufräumen nach Alter
create index if not exists messages_pair_idx on public.messages (least(sender, recipient), greatest(sender, recipient), id desc) where recipient is not null;
create index if not exists messages_recipient_idx on public.messages (recipient, id desc) where recipient is not null;
create index if not exists messages_class_idx on public.messages (class_id, id desc) where class_id is not null;
create index if not exists messages_sender_idx on public.messages (sender, created_at desc);
create index if not exists messages_created_idx on public.messages (created_at);
alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;

-- Übersicht: Klassenchat (falls Mitglied) + alle bestätigten Freunde mit letzter Nachricht
create or replace function public.chat_overview()
returns json language sql stable security definer set search_path = public as $$
  with me as (select auth.uid() as uid),
  cls as (select c.id, c.name from class_members m join classes c on c.id = m.class_id, me where m.user_id = me.uid),
  fr as (
    select p.id, p.nickname from friendships f cross join me
    join profiles p on p.id = case when f.requester = me.uid then f.addressee else f.requester end
    where f.status = 'accepted' and me.uid in (f.requester, f.addressee))
  select json_build_object(
    'class', (select json_build_object('name', cls.name, 'last', (
        select json_build_object('id', m.id, 'body', left(m.body, 80), 'at', m.created_at, 'mine', m.sender = me.uid, 'nick', p.nickname)
        from messages m join profiles p on p.id = m.sender
        where m.class_id = cls.id order by m.id desc limit 1)) from cls, me),
    'friends', coalesce((select json_agg(x order by x.last_id desc nulls last, x.nickname) from (
        select fr.nickname, l.id as last_id, left(l.body, 80) as body, l.created_at as at, l.sender = me.uid as mine
        from fr cross join me
        left join lateral (
          select m.id, m.body, m.created_at, m.sender from messages m
          where m.recipient is not null
            and least(m.sender, m.recipient) = least(me.uid, fr.id) and greatest(m.sender, m.recipient) = greatest(me.uid, fr.id)
          order by m.id desc limit 1) l on true) x), '[]'::json));
$$;

-- Nachrichten laden: p_nick = Freund (null = Klassenchat); p_after = nur neuere als diese ID (0 = letzte 60)
create or replace function public.chat_messages(p_nick text, p_after bigint)
returns json language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); peer uuid; v_cls bigint; res json;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_nick is null then
    select class_id into v_cls from class_members where user_id = uid;
    if v_cls is null then return '[]'::json; end if;
    select coalesce(json_agg(x order by x.id), '[]'::json) into res from (
      select m.id, m.sender = uid as mine, p.nickname as nick, m.body, m.created_at as at
      from messages m join profiles p on p.id = m.sender
      where m.class_id = v_cls and m.id > coalesce(p_after, 0)
      order by m.id desc limit 60) x;
  else
    select id into peer from profiles where lower(nickname) = lower(trim(p_nick));
    if peer is null or not are_friends(uid, peer) then return '[]'::json; end if;
    select coalesce(json_agg(x order by x.id), '[]'::json) into res from (
      select m.id, m.sender = uid as mine, p.nickname as nick, m.body, m.created_at as at
      from messages m join profiles p on p.id = m.sender
      where m.recipient is not null
        and least(m.sender, m.recipient) = least(uid, peer) and greatest(m.sender, m.recipient) = greatest(uid, peer)
        and m.id > coalesce(p_after, 0)
      order by m.id desc limit 60) x;
  end if;
  return res;
end $$;

-- Senden. Antwort: sent | empty | not_friends | no_class | rate
create or replace function public.chat_send(p_nick text, p_body text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); peer uuid; v_cls bigint;
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'));
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from profiles where id = uid) then raise exception 'no_profile'; end if;
  if v_body = '' then return 'empty'; end if;
  v_body := left(v_body, 1000);
  if (select count(*) from messages where sender = uid and created_at > now() - interval '1 minute') >= 15
     or (select count(*) from messages where sender = uid and created_at > now() - interval '1 day') >= 400 then
    return 'rate';
  end if;
  if p_nick is null then
    select class_id into v_cls from class_members where user_id = uid;
    if v_cls is null then return 'no_class'; end if;
    insert into messages (sender, class_id, body) values (uid, v_cls, v_body);
  else
    select id into peer from profiles where lower(nickname) = lower(trim(p_nick));
    if peer is null or peer = uid or not are_friends(uid, peer) then return 'not_friends'; end if;
    insert into messages (sender, recipient, body) values (uid, peer, v_body);
  end if;
  delete from messages where created_at < now() - interval '90 days';
  return 'sent';
end $$;

-- Eigene Nachricht löschen; im Klassenchat darf die Person, die die Klasse erstellt hat, jede Nachricht löschen
create or replace function public.chat_delete(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  delete from messages m where m.id = p_id and (m.sender = uid
    or (m.class_id is not null and exists (select 1 from classes c where c.id = m.class_id and c.owner = uid)));
end $$;

revoke all on function public.chat_overview() from public, anon;
revoke all on function public.chat_messages(text, bigint) from public, anon;
revoke all on function public.chat_send(text, text) from public, anon;
revoke all on function public.chat_delete(bigint) from public, anon;
grant execute on function public.chat_overview() to authenticated;
grant execute on function public.chat_messages(text, bigint) to authenticated;
grant execute on function public.chat_send(text, text) to authenticated;
grant execute on function public.chat_delete(bigint) to authenticated;

-- ===================== Schul-Aufgaben (von OpenCode erzeugt, für alle gleich) =====================
-- Schlüssel: Bundesland|Schulart|Klassenstufe|Fach, z. B. "BW|gy|7|biologie". Ein Paket wird einmal erzeugt
-- und dann von allen mit gleichem Schlüssel genutzt. Erzeugt wird es vom GitHub-Workflow (.github/workflows/aufgaben.yml),
-- der als service_role die pack_worker_*-Funktionen aufruft. Der Browser darf nur lesen und Aufträge einreichen.
create table if not exists public.content_packs (
  key        text primary key check (key ~ '^[A-Z]{2}\|[a-z]{2}\|(1[0-3]|[1-9]|L[1-4])\|[a-z0-9-]{2,40}$'),
  fach_name  text not null check (char_length(fach_name) between 2 and 40),
  subject    jsonb not null,
  topics     smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_packs_prefix_idx on public.content_packs (key text_pattern_ops);

create table if not exists public.content_requests (
  id           bigint generated always as identity primary key,
  key          text not null check (key ~ '^[A-Z]{2}\|[a-z]{2}\|(1[0-3]|[1-9]|L[1-4])\|[a-z0-9-]{2,40}$'),
  fach_name    text not null check (char_length(fach_name) between 2 and 40),
  kind         text not null check (kind in ('neu','mehr','fix')),
  status       text not null default 'offen' check (status in ('offen','arbeit','fertig','fehler')),
  school       text not null default '' check (char_length(school) <= 100),
  requested_by uuid references auth.users(id) on delete set null,
  attempts     smallint not null default 0,
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists content_requests_status_idx on public.content_requests (status, created_at);
create index if not exists content_requests_key_idx on public.content_requests (key, created_at desc);
create index if not exists content_requests_user_idx on public.content_requests (requested_by, created_at desc);
-- Pro Paket höchstens ein offener Auftrag (verhindert doppelte KI-Kosten)
create unique index if not exists content_requests_open_key on public.content_requests (key) where status in ('offen','arbeit');

create table if not exists public.content_reports (
  id         bigint generated always as identity primary key,
  key        text not null references public.content_packs(key) on delete cascade,
  tid        text not null check (tid ~ '^[A-Za-z0-9_-]{1,60}$'),
  kind       text not null check (kind in ('mc','card','gap','free')),
  idx        smallint not null check (idx between 0 and 199),
  note       text not null default '' check (char_length(note) <= 300),
  reporter   uuid not null references auth.users(id) on delete cascade,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists content_reports_key_idx on public.content_reports (key, resolved);
create index if not exists content_reports_reporter_idx on public.content_reports (reporter, created_at desc);
create unique index if not exists content_reports_once on public.content_reports (key, tid, kind, idx, reporter) where not resolved;

alter table public.content_packs    enable row level security;
alter table public.content_requests enable row level security;
alter table public.content_reports  enable row level security;
revoke all on public.content_packs, public.content_requests, public.content_reports from anon, authenticated;

-- Welche Fächer gibt es schon für Bundesland|Schulart|Stufe| ? (ohne Login lesbar)
create or replace function public.pack_list(p_prefix text)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('key', key, 'name', fach_name, 'topics', topics, 'at', updated_at) order by fach_name), '[]'::json)
  from content_packs
  where p_prefix ~ '^[A-Z]{2}\|[a-z]{2}\|(1[0-3]|[1-9]|L[1-4])\|$' and key like p_prefix || '%';
$$;

-- Pakete laden (höchstens 30 auf einmal)
create or replace function public.pack_get(p_keys text[])
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('key', key, 'name', fach_name, 'subject', subject, 'at', updated_at)), '[]'::json)
  from content_packs where key = any(p_keys[1:30]);
$$;

-- Stand der letzten Aufträge je Schlüssel (+ Platz in der Warteschlange)
create or replace function public.pack_status(p_keys text[])
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('key', r.key, 'kind', r.kind, 'status', r.status, 'error', left(r.error, 120),
    'at', r.updated_at,
    'pos', case when r.status = 'offen' then (select count(*) from content_requests o where o.status = 'offen' and o.created_at <= r.created_at) end)), '[]'::json)
  from (select distinct on (key) * from content_requests where key = any(p_keys[1:30]) order by key, created_at desc) r;
$$;

-- Neues Fach bzw. mehr Aufgaben anfordern (mit Login, Limit pro Tag)
create or replace function public.pack_request(p_key text, p_name text, p_kind text, p_school text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int; cur int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_key !~ '^[A-Z]{2}\|[a-z]{2}\|(1[0-3]|[1-9]|L[1-4])\|[a-z0-9-]{2,40}$' then raise exception 'bad_key'; end if;
  if p_name !~ '^[A-Za-zÄÖÜäöüß0-9 .,&()/+-]{2,40}$' then raise exception 'bad_subject_name'; end if;
  if p_kind not in ('neu','mehr') then raise exception 'bad_kind'; end if;
  select topics into cur from content_packs where key = p_key;
  if p_kind = 'neu' and found then return 'exists'; end if;
  if coalesce(cur, 0) >= 16 then return 'full'; end if;
  if exists (select 1 from content_requests where key = p_key and status in ('offen','arbeit')) then return 'queued'; end if;
  select count(*) into n from content_requests where requested_by = uid and created_at > now() - interval '1 day';
  if n >= 5 then raise exception 'limit'; end if;
  select count(*) into n from content_requests where status in ('offen','arbeit');
  if n >= 200 then raise exception 'busy'; end if;
  insert into content_requests (key, fach_name, kind, school, requested_by)
    values (p_key, p_name, p_kind, left(regexp_replace(coalesce(p_school, ''), '[^[:alnum:] .,&()/+''-]', '', 'g'), 100), uid)
    on conflict (key) where status in ('offen','arbeit') do nothing;
  return 'ok';
end $$;

-- Fehlerhafte Aufgabe melden -> OpenCode prüft und korrigiert sie (Position bleibt gleich)
create or replace function public.pack_report(p_key text, p_tid text, p_kind text, p_idx integer, p_note text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int; v_name text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_kind not in ('mc','card','gap','free') or p_idx is null or p_idx < 0 or p_idx > 199 then raise exception 'bad_report'; end if;
  select fach_name into v_name from content_packs p
    where p.key = p_key and exists (select 1 from jsonb_array_elements(p.subject->'topics') t where t->>'id' = p_tid);
  if v_name is null then raise exception 'bad_report'; end if;
  select count(*) into n from content_reports where reporter = uid and created_at > now() - interval '1 day';
  if n >= 20 then raise exception 'limit'; end if;
  insert into content_reports (key, tid, kind, idx, note, reporter)
    values (p_key, p_tid, p_kind, p_idx, left(coalesce(p_note, ''), 300), uid)
    on conflict (key, tid, kind, idx, reporter) where not resolved do nothing;
  insert into content_requests (key, fach_name, kind, requested_by) values (p_key, v_name, 'fix', uid)
    on conflict (key) where status in ('offen','arbeit') do nothing;
  return 'ok';
end $$;

-- ---- Nur für den GitHub-Workflow (service_role) ----
create or replace function public.pack_worker_claim(p_max integer)
returns json language plpgsql security definer set search_path = public as $$
declare ids bigint[];
begin
  update content_requests set status = 'offen', updated_at = now()
    where status = 'arbeit' and updated_at < now() - interval '45 minutes';
  select array_agg(id) into ids from (
    select id from content_requests
    where status = 'offen' or (status = 'fehler' and attempts < 3 and updated_at < now() - interval '20 minutes')
    order by created_at limit greatest(1, least(coalesce(p_max, 3), 10))
    for update skip locked) x;
  if ids is null then return '[]'::json; end if;
  update content_requests set status = 'arbeit', attempts = attempts + 1, updated_at = now() where id = any(ids);
  return (select coalesce(json_agg(json_build_object(
      'id', r.id, 'key', r.key, 'name', r.fach_name, 'kind', r.kind, 'school', r.school,
      'subject', p.subject,
      'reports', (select coalesce(json_agg(json_build_object('id', c.id, 'tid', c.tid, 'kind', c.kind, 'idx', c.idx, 'note', c.note)), '[]'::json)
                  from content_reports c where c.key = r.key and not c.resolved)
    ) order by r.created_at), '[]'::json)
    from content_requests r left join content_packs p on p.key = r.key where r.id = any(ids));
end $$;

create or replace function public.pack_worker_done(p_id bigint, p_subject jsonb, p_resolved bigint[])
returns void language plpgsql security definer set search_path = public as $$
declare r content_requests%rowtype;
begin
  select * into r from content_requests where id = p_id and status = 'arbeit';
  if not found then raise exception 'not_claimed'; end if;
  if jsonb_typeof(p_subject->'topics') <> 'array' or octet_length(p_subject::text) > 600000 then raise exception 'bad_subject'; end if;
  insert into content_packs as cp (key, fach_name, subject, topics)
    values (r.key, r.fach_name, p_subject, jsonb_array_length(p_subject->'topics'))
    on conflict (key) do update set subject = excluded.subject, topics = excluded.topics, updated_at = now();
  update content_reports set resolved = true where key = r.key and id = any(coalesce(p_resolved, '{}'));
  update content_requests set status = 'fertig', error = null, updated_at = now() where id = p_id;
  -- Meldungen, die während der Arbeit dazukamen, im nächsten Lauf prüfen
  if exists (select 1 from content_reports where key = r.key and not resolved) then
    insert into content_requests (key, fach_name, kind) values (r.key, r.fach_name, 'fix')
      on conflict (key) where status in ('offen','arbeit') do nothing;
  end if;
end $$;

create or replace function public.pack_worker_fail(p_id bigint, p_error text)
returns void language sql security definer set search_path = public as $$
  update content_requests set status = 'fehler', error = left(p_error, 300), updated_at = now() where id = p_id;
$$;

revoke all on function public.pack_list(text) from public;
revoke all on function public.pack_get(text[]) from public;
revoke all on function public.pack_status(text[]) from public;
revoke all on function public.pack_request(text, text, text, text) from public, anon;
revoke all on function public.pack_report(text, text, text, integer, text) from public, anon;
revoke all on function public.pack_worker_claim(integer) from public, anon, authenticated;
revoke all on function public.pack_worker_done(bigint, jsonb, bigint[]) from public, anon, authenticated;
revoke all on function public.pack_worker_fail(bigint, text) from public, anon, authenticated;
grant execute on function public.pack_list(text) to anon, authenticated;
grant execute on function public.pack_get(text[]) to anon, authenticated;
grant execute on function public.pack_status(text[]) to anon, authenticated;
grant execute on function public.pack_request(text, text, text, text) to authenticated;
grant execute on function public.pack_report(text, text, text, integer, text) to authenticated;
grant execute on function public.pack_worker_claim(integer) to service_role;
grant execute on function public.pack_worker_done(bigint, jsonb, bigint[]) to service_role;
grant execute on function public.pack_worker_fail(bigint, text) to service_role;
