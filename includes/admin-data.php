<?php
declare(strict_types=1);
function admin_metrics(PDO $db): array {
    return $db->query("SELECT (SELECT count(*) FROM public.users WHERE role='player') AS players, count(*) AS runs, COALESCE(max(score),0) AS best_score, COALESCE(avg(CASE WHEN result='won' THEN 100.0 ELSE 0 END),0) AS win_rate, COALESCE(avg(highest_circle),0) AS avg_circle, COALESCE(avg(score),0) AS avg_score FROM public.game_runs")->fetch(PDO::FETCH_ASSOC);
}
function admin_players(PDO $db,string $search=''): array {
    $stmt=$db->prepare("SELECT u.id,u.email,u.role,u.created_at,p.username FROM public.users u JOIN public.player_profiles p ON p.user_id=u.id WHERE lower(u.email) LIKE ? OR lower(p.username) LIKE ? ORDER BY u.created_at DESC LIMIT 200"); $term='%'.strtolower($search).'%'; $stmt->execute([$term,$term]); return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
function admin_runs(PDO $db,bool $ranked=false): array { return $db->query('SELECT r.id,p.username,r.score,r.highest_circle,r.grimoire,r.result,r.played_at FROM public.game_runs r JOIN public.player_profiles p ON p.user_id=r.user_id ORDER BY '.($ranked?'r.score DESC,r.played_at':'r.played_at DESC').' LIMIT 100')->fetchAll(PDO::FETCH_ASSOC); }
function admin_grimoires(PDO $db): array { return $db->query('SELECT grimoire,count(*) AS runs FROM public.game_runs GROUP BY grimoire ORDER BY runs DESC,grimoire')->fetchAll(PDO::FETCH_ASSOC); }
function admin_activity(PDO $db): array { return $db->query('SELECT CAST(played_at AS date) AS day,count(*) AS runs FROM public.game_runs GROUP BY CAST(played_at AS date) ORDER BY day DESC LIMIT 7')->fetchAll(PDO::FETCH_ASSOC); }
