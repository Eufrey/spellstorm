<?php
if(PHP_SAPI!=='cli') exit;
require __DIR__.'/../includes/site-nav.php';
function escape(string $value): string { return htmlspecialchars($value,ENT_QUOTES,'UTF-8'); }
function csrf_token(): string { return 'test-token'; }
function rendered_nav(string $active): string { ob_start(); site_nav($active); return ob_get_clean(); }
$_SESSION=[]; $guest=rendered_nav('play');
if(!str_contains($guest,'href="login.php"')||!str_contains($guest,'href="register.php"')||str_contains($guest,'action="logout.php"')||str_contains($guest,'class="site-primary"')) throw new RuntimeException('Guest navigation incorrect');
$_SESSION=['user_id'=>'sample']; $member=rendered_nav('profile');
if(!str_contains($member,'action="logout.php"')||!str_contains($member,'name="csrf"')||!str_contains($member,'href="account.php" aria-current="page"')||str_contains($member,'href="login.php"')) throw new RuntimeException('Member navigation incorrect');
echo "Navigation tests passed\n";
