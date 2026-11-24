<?php
declare(strict_types=1);
require_once __DIR__.'/database.php';
require_once __DIR__.'/accounts.php';
ini_set('session.use_strict_mode','1');
$cloud=getenv('VERCEL')==='1';
session_set_cookie_params(['httponly'=>true,'secure'=>$cloud || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off'),'samesite'=>'Lax']);
try {
    if ($cloud || getenv('SPELLSTORM_DB_SESSIONS')==='1') {
        require_once __DIR__.'/session-store.php';
        ini_set('session.gc_maxlifetime','86400');
        session_set_save_handler(new DatabaseSessionStore(spellstorm_database()),true);
    }
    if (!session_start()) throw new RuntimeException('Session unavailable');
} catch (Throwable $e) { http_response_code(503); exit('Account session service unavailable.'); }
header('Cache-Control: no-store');
function csrf_token(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(32)); }
function verify_csrf(): void { if (!hash_equals(csrf_token(),is_string($_POST['csrf']??null)?$_POST['csrf']:'')) { http_response_code(403); exit('Invalid request.'); } }
function field(string $key): string { return is_string($_POST[$key]??null)?$_POST[$key]:''; }
function escape(string $value): string { return htmlspecialchars($value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
function redirect_to(string $path): never { header('Location: '.$path,true,303); exit; }
function current_account(): ?array { return isset($_SESSION['user_id']) ? account_by_id(spellstorm_database(),$_SESSION['user_id']) : null; }
function require_account(bool $admin=false): array {
    try { $account=current_account(); } catch (Throwable $e) { http_response_code(503); exit('Account service unavailable.'); }
    if (!$account) redirect_to('login.php');
    if ($admin && $account['role'] !== 'admin') { http_response_code(403); exit('Access denied.'); }
    return $account;
}
function login_account(string $id): void { session_regenerate_id(true); $_SESSION=['user_id'=>$id]; }
