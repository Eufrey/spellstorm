<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/rank-preview.php';
header('Content-Type: application/json; charset=UTF-8');
if($_SERVER['REQUEST_METHOD']!=='GET'){http_response_code(405);exit;}
try { $score=filter_var($_GET['score']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>2147483647]]); if($score===false) {http_response_code(400);echo '{}';exit;} $account=($_GET['mode']??'')==='guest'?null:current_account(); $data=rank_preview(spellstorm_database(),$account['id']??null,$score); $data['name']=$account['username']??'Guest'; echo json_encode($data); } catch(Throwable $e){http_response_code(503);echo '{}';}
