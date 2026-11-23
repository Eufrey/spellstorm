<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/../includes/database.php';
$email=strtolower(trim($argv[1]??''));
if (!filter_var($email,FILTER_VALIDATE_EMAIL)) { fwrite(STDERR,"Usage: php tools/make-admin.php EMAIL\n"); exit(1); }
try { $db=spellstorm_database(); $stmt=$db->prepare("UPDATE public.users SET role='admin' WHERE email=? RETURNING id"); $stmt->execute([$email]); if (!$stmt->fetchColumn()) { fwrite(STDERR,"No matching account. Register first.\n"); exit(1); } echo "Administrator role assigned.\n"; } catch (Throwable $e) { fwrite(STDERR,"Could not assign role. Check database connectivity.\n"); exit(1); }
