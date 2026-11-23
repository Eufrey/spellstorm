<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (!is_file(__DIR__.'/../includes/accounts.php')) { fwrite(STDERR,"Account layer missing\n"); exit(1); }
require __DIR__.'/../includes/accounts.php';
function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
$db = new PDO('sqlite::memory:', null, null, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.users(id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), email TEXT UNIQUE, password_hash TEXT, role TEXT DEFAULT 'player'); CREATE TABLE public.player_profiles(user_id TEXT UNIQUE, username TEXT COLLATE NOCASE UNIQUE)");
$id = register_player($db, ' HERO@example.com ', 'Hero', 'long-test-password');
$user = authenticate_player($db,'hero@example.com','long-test-password');
check($user !== null && $user['id'] === $id && $user['role'] === 'player', 'registration/login failed');
check(authenticate_player($db,'hero@example.com','incorrect') === null,'wrong password accepted');
check(account_by_id($db,$id)['username'] === 'Hero','profile missing');
try { register_player($db,'other@example.com','Hero','long-test-password'); throw new RuntimeException('duplicate username accepted'); } catch (PDOException $e) {}
check((int)$db->query('SELECT count(*) FROM public.users')->fetchColumn() === 1,'failed registration left account');
echo "Account tests passed\n";
