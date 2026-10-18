-- MortWise AI request budget. NOT applied anywhere yet. Apply only to a confirmed
-- MortWise database, after review. Counters are keyed by a hashed client id.
create table if not exists mortwise_ai_usage (
  client_hash text not null,
  day date not null,
  calls int not null default 0,
  primary key (client_hash, day)
);
create table if not exists mortwise_ai_windows (
  window_key text primary key,   -- 'day:YYYY-MM-DD' or 'min:YYYY-MM-DDTHH:MI'
  calls int not null default 0
);
alter table mortwise_ai_usage enable row level security;
alter table mortwise_ai_windows enable row level security;

-- Atomically reserves one AI call. Returns 'ok', 'user_daily', 'global_daily' or 'global_minute'.
create or replace function reserve_mortwise_ai_call(
  p_client_hash text, p_user_daily int, p_global_daily int, p_global_minute int
) returns text language plpgsql security definer as $$
declare
  d text := 'day:' || to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  m text := 'min:' || to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI');
  u int; g int; n int;
begin
  insert into mortwise_ai_usage(client_hash, day, calls) values (p_client_hash, (now() at time zone 'utc')::date, 0)
    on conflict do nothing;
  insert into mortwise_ai_windows(window_key, calls) values (d, 0), (m, 0) on conflict do nothing;
  select calls into u from mortwise_ai_usage where client_hash = p_client_hash and day = (now() at time zone 'utc')::date for update;
  select calls into g from mortwise_ai_windows where window_key = d for update;
  select calls into n from mortwise_ai_windows where window_key = m for update;
  if u >= p_user_daily then return 'user_daily'; end if;
  if g >= p_global_daily then return 'global_daily'; end if;
  if n >= p_global_minute then return 'global_minute'; end if;
  update mortwise_ai_usage set calls = calls + 1 where client_hash = p_client_hash and day = (now() at time zone 'utc')::date;
  update mortwise_ai_windows set calls = calls + 1 where window_key in (d, m);
  return 'ok';
end $$;
revoke all on function reserve_mortwise_ai_call from public, anon, authenticated;
