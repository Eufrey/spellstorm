-- Apply after database.sql. Existing Codex data is retained.
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check(char_length(btrim(title)) between 1 and 100),
  description text not null check(char_length(btrim(description)) between 1 and 1000),
  condition_type text not null check(condition_type in ('finish','win','circle','score')),
  target integer not null check(target > 0),
  active boolean not null default true,
  check ((condition_type in ('finish','win') and target=1) or (condition_type='circle' and target<=50) or condition_type='score')
);
create table public.player_achievements (
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  run_id uuid references public.game_runs(id) on delete set null,
  earned_at timestamptz not null default now(),
  primary key(user_id,challenge_id)
);
create index player_achievements_challenge_idx on public.player_achievements(challenge_id);
create index player_achievements_run_idx on public.player_achievements(run_id);
alter table public.challenges enable row level security;
alter table public.player_achievements enable row level security;
revoke all on public.challenges,public.player_achievements from public,anon,authenticated,service_role;
insert into public.challenges(title,description,condition_type,target) values
('First Stand','Complete your first run.','finish',1),
('Archon Encounter','Reach Circle 10.','circle',10),
('Storm Survivor','Reach Circle 25.','circle',25),
('Master of the Spire','Win by completing Circle 50.','win',1),
('Score Seeker','Earn 10,000 points in one run.','score',10000);
