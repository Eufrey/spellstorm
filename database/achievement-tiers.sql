-- Apply after challenges.sql. Existing earned achievements remain intact.
alter table public.challenges add column tier integer check (tier between 1 and 3);
update public.challenges set tier=1 where title in ('First Stand','Archon Encounter');
update public.challenges set tier=2 where title in ('Storm Survivor','Score Seeker');
update public.challenges set tier=3 where title='Master of the Spire';
insert into public.challenges(title,description,condition_type,target,tier) values
('First Steps','Reach Circle 5 in a single run.','circle',5,1),
('Archon Veteran','Reach Circle 30 in a single run.','circle',30,2),
('Against the Storm','Reach Circle 40 in a single run.','circle',40,3),
('The Final Hour','Reach Circle 50 in a single run.','circle',50,3);
update public.challenges set active=true where tier is not null;
alter table public.challenges add constraint tier_challenges_active check(tier is null or active);
-- Credit previous valid run records as well as future runs.
insert into public.player_achievements(user_id,challenge_id,run_id,earned_at)
select distinct on (r.user_id,c.id) r.user_id,c.id,r.id,r.played_at
from public.game_runs r cross join public.challenges c
where c.tier is not null and (c.condition_type='finish' or (c.condition_type='win' and r.result='won') or (c.condition_type='circle' and r.highest_circle>=c.target) or (c.condition_type='score' and r.score>=c.target))
order by r.user_id,c.id,r.played_at,r.id
on conflict(user_id,challenge_id) do nothing;
