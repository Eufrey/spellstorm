<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/challenges.php';
header('Content-Type: application/json');
try {
    $account=current_account(); if(!$account){http_response_code(401); echo json_encode(['error'=>'Sign in to save runs.']); exit;}
    if($_SERVER['REQUEST_METHOD']==='GET'){echo json_encode(['csrf'=>csrf_token()]); exit;}
    if($_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405); exit;}
    if(!hash_equals(csrf_token(),$_SERVER['HTTP_X_CSRF_TOKEN']??'')){http_response_code(403); echo '{}'; exit;}
    $data=json_decode(file_get_contents('php://input',false,null,0,8192),true); if(!is_array($data)) throw new InvalidArgumentException('Invalid run.');
    $db=spellstorm_database(); $best=$db->prepare('SELECT max(score) FROM public.game_runs WHERE user_id=?'); $best->execute([$account['id']]); $previous=$best->fetchColumn(); $best->closeCursor();
    $awards=record_run($db,$account['id'],$data);
    $best->execute([$account['id']]); $personalBest=(int)$best->fetchColumn();
    echo json_encode(['saved'=>true,'awards'=>count($awards),'best'=>$personalBest,'newBest'=>$previous===null||$data['score']>(int)$previous]);
} catch(InvalidArgumentException $e){http_response_code(400); echo json_encode(['error'=>'Invalid run.']);} catch(Throwable $e){http_response_code(503); echo json_encode(['error'=>'Unable to save run.']);}
