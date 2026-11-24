<?php
declare(strict_types=1);
function rank_preview(PDO $db,?string $userId,int $guestScore): array {
    $score=$guestScore;
    if($userId!==null){ $s=$db->prepare('SELECT max(score) FROM public.game_runs WHERE user_id=?'); $s->execute([$userId]); $best=$s->fetchColumn(); if($best===null||$best===false) throw new RuntimeException('No saved score'); $score=(int)$best; }
    $s=$db->prepare('SELECT count(*) FROM (SELECT user_id FROM public.game_runs GROUP BY user_id HAVING max(score)>?) ranked'); $s->bindValue(1,$score,PDO::PARAM_INT); $s->execute(); $rank=1+(int)$s->fetchColumn();
    $rows=$db->query('SELECT p.user_id,p.username,max(r.score) AS score FROM public.player_profiles p JOIN public.game_runs r ON r.user_id=p.user_id GROUP BY p.user_id,p.username ORDER BY score DESC,p.username LIMIT 10')->fetchAll(PDO::FETCH_ASSOC);
    $previous=null; $position=0; foreach($rows as $i=>&$row){$row['score']=(int)$row['score']; if($previous!==$row['score']) $position=$i+1; $previous=$row['score']; $row['rank']=$position;} unset($row);
    return ['rank'=>$rank,'score'=>$score,'guest'=>$userId===null,'rows'=>$rows];
}
