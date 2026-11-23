<?php
declare(strict_types=1);
function achievement_levels(): array { return [1=>['name'=>'Initiate','title'=>'Ember Initiate','class'=>'initiate'],2=>['name'=>'Veteran','title'=>'Arcane Vanguard','class'=>'veteran'],3=>['name'=>'Hardcore','title'=>'Stormbreaker','class'=>'hardcore']]; }
function achievement_progress(array $rows): array {
    $levels=achievement_levels(); $title=null; $previous=true;
    foreach($levels as $tier=>&$level) {
        $level['entries']=array_values(array_filter($rows,fn($r)=>(int)($r['tier']??0)===$tier));
        $level['total']=count($level['entries']); $level['earned']=count(array_filter($level['entries'],fn($r)=>!empty($r['earned_at'])));
        $level['complete']=$level['total']>0 && $level['earned']===$level['total'];
        $previous=$previous && $level['complete']; if($previous) $title=$level;
    } unset($level);
    return ['levels'=>$levels,'title'=>$title];
}
function player_achievement_rows(PDO $db,?string $user): array {
    $s=$db->prepare('SELECT c.title,c.description,c.condition_type,c.target,c.tier,a.earned_at FROM public.challenges c LEFT JOIN public.player_achievements a ON a.challenge_id=c.id AND a.user_id=? WHERE c.tier IS NOT NULL OR c.active OR a.earned_at IS NOT NULL ORDER BY c.tier,c.target,c.title'); $s->execute([$user]); return $s->fetchAll(PDO::FETCH_ASSOC);
}
function player_title_map(PDO $db): array {
    $rows=$db->query('SELECT u.id AS user_id,c.tier,a.earned_at FROM public.users u CROSS JOIN public.challenges c LEFT JOIN public.player_achievements a ON a.user_id=u.id AND a.challenge_id=c.id WHERE c.tier IS NOT NULL')->fetchAll(PDO::FETCH_ASSOC);
    $group=[]; foreach($rows as $row) $group[$row['user_id']][]=$row;
    $titles=[]; foreach($group as $id=>$entries) $titles[$id]=achievement_progress($entries)['title']; return $titles;
}
