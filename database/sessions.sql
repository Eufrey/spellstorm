-- Run once in the existing Spellstorm Supabase database. Safe to rerun.
create table if not exists public.spellstorm_sessions (
  id_hash text primary key,
  data text not null,
  expires_at bigint not null
);
create index if not exists spellstorm_sessions_expiry_idx on public.spellstorm_sessions(expires_at);
alter table public.spellstorm_sessions enable row level security;
revoke all on public.spellstorm_sessions from public, anon, authenticated, service_role;
