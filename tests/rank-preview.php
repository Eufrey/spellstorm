<?php
if(PHP_SAPI!=='cli') exit;
require __DIR__.'/../includes/rank-preview.php';
$db=new PDO('sqlite::memory:'); $db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.game_runs(user_id TEXT,score INTEGER); CREATE TABLE public.player_profiles(user_id TEXT,username TEXT); INSERT INTO public.player_profiles VALUES('a','A'),('b','B'),('c','C'); INSERT INTO public.game_runs VALUES('a',100),('a',80),('b',100),('c',60)");
$guest=rank_preview($db,null,90); if($guest['rank']!==3||!$guest['guest']||count($guest['rows'])!==3||$guest['rows'][1]['rank']!==1) throw new RuntimeException('Guest rank incorrect');
$member=rank_preview($db,'c',9999); if($member['rank']!==3||$member['score']!==60||$member['guest']) throw new RuntimeException('Member rank incorrect');
if((int)$db->query('SELECT count(*) FROM public.game_runs')->fetchColumn()!==4) throw new RuntimeException('Preview mutated scores');
echo "Rank preview tests passed\n";
