<?php
require __DIR__.'/includes/database.php'; require __DIR__.'/includes/avatar.php';
$id=$_GET['id']??'';
$image=null;
if (is_string($id) && preg_match('/\A[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\z/i',$id)) {
    try { $image=avatar_data(spellstorm_database(),$id); } catch (Throwable $e) {}
}
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
if (!$image) { header('Content-Type: image/png'); readfile(__DIR__.'/assets/text/spellstorm-home-icon.png'); exit; }
header('Content-Type: '.$image[0]);
header('Content-Disposition: inline; filename="avatar-'.$id.'.'.(['image/png'=>'png','image/jpeg'=>'jpg','image/webp'=>'webp'][$image[0]]).'"');
echo $image[1];
