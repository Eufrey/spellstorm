<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/avatar.php';
$account=require_account();
if ($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); exit; }
verify_csrf();
try {
    $file=$_FILES['avatar']??null;
    if (!is_array($file) || ($file['error']??null)!==UPLOAD_ERR_OK || !is_string($file['tmp_name']??null) || !is_uploaded_file($file['tmp_name']) || filesize($file['tmp_name'])>524288) throw new InvalidArgumentException('Choose an image up to 512 KB.');
    $bytes=file_get_contents($file['tmp_name']);
    if ($bytes===false) throw new InvalidArgumentException('Unable to read image.');
    save_avatar(spellstorm_database(),$account['id'],$bytes);
    $_SESSION['avatar_notice']='Profile picture saved.';
} catch (InvalidArgumentException $e) { $_SESSION['avatar_notice']=$e->getMessage(); }
catch (Throwable $e) { $_SESSION['avatar_notice']='Unable to save profile picture.'; }
redirect_to($account['role']==='admin' && field('return_to')==='admin'?'admin-settings.php':'account.php');
