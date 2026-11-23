<?php
declare(strict_types=1);
if(PHP_SAPI !== 'cli') exit;
if(!is_file(__DIR__.'/../includes/profile.php')) { fwrite(STDERR,"Profile layer missing\n"); exit(1); }
require __DIR__.'/../includes/profile.php';
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.users(id TEXT,created_at TEXT); CREATE TABLE public.player_profiles(user_id TEXT,avatar_url TEXT); CREATE TABLE public.game_runs(id TEXT,user_id TEXT,score INTEGER,highest_circle INTEGER,grimoire TEXT,result TEXT,duration_seconds INTEGER,played_at TEXT); INSERT INTO public.users VALUES('a','2026-01-01'),('b','2026-01-02'); INSERT INTO public.player_profiles VALUES('a',NULL),('b',NULL); INSERT INTO public.game_runs VALUES('1','a',200,5,'basic','lost',30,'2026-01-01'),('2','a',1000,50,'ashen','won',60,'2026-01-02'),('3','a',500,8,'ashen','lost',45,'2026-01-03'),('4','b',99999,50,'stormbound','won',100,'2026-01-03')");
$p=player_profile_record($db,'a');
if((int)$p['stats']['runs']!==3||(int)$p['stats']['best_score']!==1000||(int)$p['stats']['wins']!==1||(int)$p['stats']['highest_circle']!==50||$p['grimoires'][0]['grimoire']!=='ashen'||count($p['recent'])!==3||$p['recent'][0]['id']!=='3') throw new RuntimeException('Profile data incorrect or exposed another player record');
$db->exec("DELETE FROM public.game_runs WHERE user_id='a'"); $p=player_profile_record($db,'a');
if((int)$p['stats']['runs']!==0||$p['recent']!==[]||$p['grimoires']!==[]) throw new RuntimeException('Empty profile incorrect');
echo "Profile record tests passed\n";
