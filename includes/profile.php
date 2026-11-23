<?php
declare(strict_types=1);
function player_profile_record(PDO $db,string $user): array {
    $s=$db->prepare('SELECT u.created_at,p.avatar_url FROM public.users u JOIN public.player_profiles p ON p.user_id=u.id WHERE u.id=?'); $s->execute([$user]); $identity=$s->fetch(PDO::FETCH_ASSOC)?:[];
    $s=$db->prepare("SELECT count(*) AS runs,COALESCE(max(score),0) AS best_score,COALESCE(max(highest_circle),0) AS highest_circle,COALESCE(sum(CASE WHEN result='won' THEN 1 ELSE 0 END),0) AS wins,COALESCE(sum(duration_seconds),0) AS play_seconds FROM public.game_runs WHERE user_id=?"); $s->execute([$user]); $stats=$s->fetch(PDO::FETCH_ASSOC);
    $s=$db->prepare('SELECT grimoire,count(*) AS runs FROM public.game_runs WHERE user_id=? GROUP BY grimoire ORDER BY runs DESC,grimoire'); $s->execute([$user]); $grimoires=$s->fetchAll(PDO::FETCH_ASSOC);
    $s=$db->prepare('SELECT id,score,highest_circle,grimoire,result,duration_seconds,played_at FROM public.game_runs WHERE user_id=? ORDER BY played_at DESC,id DESC LIMIT 10'); $s->execute([$user]); $recent=$s->fetchAll(PDO::FETCH_ASSOC);
    return compact('identity','stats','grimoires','recent');
}
function grimoire_record_info(string $key): array {
    return ['basic'=>['Basic Grimoire','#b9a7ce'],'ashen'=>['Ashen Crown','#ff6a2a'],'hollowWinter'=>['Hollow Winter','#8eebff'],'stormbound'=>['Stormbound','#d2b6ff'],'infernal'=>['Infernal Testament','#ff9b42'],'glacial'=>['Glacial Sovereign','#b7f3ff'],'thunderous'=>['Tempest Ascendant','#ead7ff']][$key]??['Unknown grimoire','#b9a7ce'];
}
function profile_date(string $value): string { try { return (new DateTimeImmutable($value,new DateTimeZone('UTC')))->setTimezone(new DateTimeZone('Asia/Manila'))->format('M j, Y'); } catch(Throwable $e) { return '—'; } }
