<?php
require __DIR__.'/includes/session.php';
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); exit; }
verify_csrf(); $_SESSION=[]; $params=session_get_cookie_params(); setcookie(session_name(),'',time()-3600,$params['path'],$params['domain'],$params['secure'],$params['httponly']); session_destroy(); redirect_to('index.html');
