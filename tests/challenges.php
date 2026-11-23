<?php
if(PHP_SAPI!=='cli') exit;
require __DIR__.'/../includes/challenges.php';
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.challenges(id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),title TEXT,description TEXT,condition_type TEXT,target INTEGER,active BOOLEAN DEFAULT 1); CREATE TABLE public.game_runs(id TEXT PRIMARY KEY,user_id TEXT,score INTEGER,highest_circle INTEGER,grimoire TEXT,result TEXT,duration_seconds INTEGER); CREATE TABLE public.player_achievements(user_id TEXT,challenge_id TEXT,run_id TEXT,PRIMARY KEY(user_id,challenge_id))");
save_challenge($db,'','First','First run','finish',1); save_challenge($db,'','Win','Win','win',1); save_challenge($db,'','Circle','Circle 10','circle',10); save_challenge($db,'','Score','Score 100','score',100);
$run=['id'=>'11111111-1111-4111-8111-111111111111','score'=>100,'circle'=>10,'grimoire'=>'basic','result'=>'lost','duration'=>20];
if(count(record_run($db,'player',$run))!==3) throw new RuntimeException('Expected three badges');
if(record_run($db,'player',$run)!==[]) throw new RuntimeException('Duplicate awards');
if((int)$db->query('SELECT count(*) FROM public.game_runs')->fetchColumn()!==1) throw new RuntimeException('Duplicate run');
$run['id']='22222222-2222-4222-8222-222222222222'; $run['result']='won';
try { record_run($db,'player',$run); throw new RuntimeException('Invalid win accepted'); } catch(InvalidArgumentException $e) {}
$run['circle']=50; if(count(record_run($db,'player',$run))!==1) throw new RuntimeException('Expected win badge only');
echo "Challenge and run tests passed\n";
