<?php
declare(strict_types=1);
function challenge_target(string $type,int $target): bool { return match($type) {'finish','win'=>$target===1,'circle'=>$target>=1&&$target<=50,'score'=>$target>=1&&$target<=2147483647,default=>false}; }
function challenge_list(PDO $db): array { return $db->query('SELECT c.*, (SELECT count(*) FROM public.player_achievements a WHERE a.challenge_id=c.id) AS earned FROM public.challenges c ORDER BY c.title')->fetchAll(PDO::FETCH_ASSOC); }
function save_challenge(PDO $db,string $id,string $title,string $description,string $type,int $target): void {
    $title=trim($title); $description=trim($description);
    if ($title===''||mb_strlen($title)>100||$description===''||mb_strlen($description)>1000||!challenge_target($type,$target)) throw new InvalidArgumentException('Invalid challenge details or target.');
    if ($id==='') { $s=$db->prepare('INSERT INTO public.challenges(title,description,condition_type,target) VALUES (?,?,?,?)'); $s->execute([$title,$description,$type,$target]); }
    else { $s=$db->prepare('UPDATE public.challenges SET title=?,description=? WHERE id=? AND condition_type=? AND target=?'); $s->execute([$title,$description,$id,$type,$target]); if(!$s->rowCount()) throw new InvalidArgumentException('Existing challenge conditions cannot change. Create a new challenge instead.'); }
}
function record_run(PDO $db,string $user,array $run): array {
    $id=$run['id']??''; $score=$run['score']??null; $circle=$run['circle']??null; $duration=$run['duration']??null; $grimoire=$run['grimoire']??''; $result=$run['result']??'';
    if(!is_string($id)||!preg_match('/\A[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\z/i',$id)||!is_int($score)||$score<0||$score>2147483647||!is_int($circle)||$circle<1||$circle>50||!is_int($duration)||$duration<0||$duration>86400||!in_array($grimoire,['basic','ashen','hollowWinter','stormbound','infernal','glacial','thunderous'],true)||!in_array($result,['won','lost'],true)||($result==='won'&&$circle!==50)) throw new InvalidArgumentException('Invalid run.');
    $db->beginTransaction();
    try {
        $s=$db->prepare('INSERT INTO public.game_runs(id,user_id,score,highest_circle,grimoire,result,duration_seconds) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id'); $s->execute([$id,$user,$score,$circle,$grimoire,$result,$duration]); $inserted=$s->fetchColumn(); $s->closeCursor();
        if(!$inserted) { $s=$db->prepare('SELECT id FROM public.game_runs WHERE id=? AND user_id=?'); $s->execute([$id,$user]); if(!$s->fetchColumn()) throw new InvalidArgumentException('Invalid run identifier.'); $db->commit(); return []; }
        $s=$db->prepare("INSERT INTO public.player_achievements(user_id,challenge_id,run_id) SELECT ?,id,? FROM public.challenges WHERE active AND (condition_type='finish' OR (condition_type='win' AND ?='won') OR (condition_type='circle' AND target<=?) OR (condition_type='score' AND target<=?)) ON CONFLICT(user_id,challenge_id) DO NOTHING RETURNING challenge_id"); $s->execute([$user,$id,$result,$circle,$score]); $awards=$s->fetchAll(PDO::FETCH_COLUMN); $db->commit(); return $awards;
    } catch(Throwable $e) { if($db->inTransaction()) $db->rollBack(); throw $e; }
}
