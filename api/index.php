<?php
declare(strict_types=1);
ini_set('display_errors','0');
$path=parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH);
$pages=['account.php','achievements.php','admin.php','admin-analytics.php','admin-challenges.php','admin-codex.php','admin-leaderboard.php','admin-players.php','admin-settings.php','avatar.php','avatar-upload.php','guide.php','leaderboard.php','login.php','logout.php','rank-preview.php','register.php','run-api.php','site-nav.php'];
$page=is_string($path)?ltrim($path,'/'):'';
if (!in_array($page,$pages,true)) { http_response_code(404); exit('Not found.'); }
$_SERVER['SCRIPT_NAME']='/'.$page;
require dirname(__DIR__).'/'.$page;
