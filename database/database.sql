-- Spellstorm CLE database (PostgreSQL / Supabase).
-- Apply once to an empty database. PHP is the sole application access layer.

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 254 and email = lower(btrim(email))),
  password_hash text not null check (char_length(password_hash) between 50 and 255),
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now(),
  unique (email)
);

create table public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  username text not null check (char_length(btrim(username)) between 3 and 32),
  avatar_url text,
  unique (username)
);
create unique index player_profiles_username_ci_idx on public.player_profiles (lower(username));

create table public.guide_categories (
  id integer generated always as identity primary key,
  name text not null unique check (char_length(btrim(name)) between 1 and 100)
);

create table public.guide_entries (
  id integer generated always as identity primary key,
  category_id integer not null references public.guide_categories(id) on delete restrict,
  author_id uuid references public.users(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 150),
  description text not null check (char_length(btrim(description)) > 0),
  image_url text,
  updated_at timestamptz not null default now(),
  unique (category_id, title)
);
create index guide_entries_author_idx on public.guide_entries (author_id);

create table public.game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 0),
  highest_circle integer not null check (highest_circle between 1 and 50),
  grimoire text not null check (grimoire in ('basic', 'ashen', 'hollowWinter', 'stormbound', 'infernal', 'glacial', 'thunderous')),
  result text not null check (result in ('won', 'lost')),
  duration_seconds integer not null check (duration_seconds >= 0),
  played_at timestamptz not null default now(),
  check (result <> 'won' or highest_circle = 50)
);
create index game_runs_user_played_idx on public.game_runs (user_id, played_at desc);
create index game_runs_score_idx on public.game_runs (score desc, played_at);

-- The PHP backend will enforce authentication, ownership and administrator checks.
-- Browser Data API roles have no direct access to these tables.
alter table public.users enable row level security;
alter table public.player_profiles enable row level security;
alter table public.guide_categories enable row level security;
alter table public.guide_entries enable row level security;
alter table public.game_runs enable row level security;
revoke all on public.users, public.player_profiles, public.guide_categories, public.guide_entries, public.game_runs from public, anon, authenticated, service_role;
revoke all on sequence public.guide_categories_id_seq, public.guide_entries_id_seq from public, anon, authenticated, service_role;

insert into public.guide_categories (name) values
  ('Grimoires'), ('Enemies'), ('Archons'), ('Upgrades'), ('Game Mechanics');
