<?php
declare(strict_types=1);

function save_avatar(PDO $db,string $user,string $bytes): void {
    if (strlen($bytes)>524288 || $bytes==='') throw new InvalidArgumentException('Choose an image up to 512 KB.');
    $info=@getimagesizefromstring($bytes);
    $mime=(new finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
    if (!$info || !in_array($mime,['image/png','image/jpeg','image/webp'],true) || $info['mime']!==$mime || $info[0]>2048 || $info[1]>2048) throw new InvalidArgumentException('Choose a PNG, JPEG or WebP image up to 2048 × 2048 pixels.');
    $s=$db->prepare('UPDATE public.player_profiles SET avatar_url=? WHERE user_id=?');
    $s->execute(['data:'.$mime.';base64,'.base64_encode($bytes),$user]);
}
function avatar_data(PDO $db,string $user): ?array {
    $s=$db->prepare('SELECT avatar_url FROM public.player_profiles WHERE user_id=?'); $s->execute([$user]);
    $value=$s->fetchColumn();
    if (!is_string($value) || !preg_match('~\Adata:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)\z~D',$value,$m)) return null;
    $bytes=base64_decode($m[2],true);
    return $bytes===false?null:[$m[1],$bytes];
}
function avatar_form(bool $admin=false): void { ?>
<form method="post" action="avatar-upload.php" enctype="multipart/form-data" class="mt-3">
  <input type="hidden" name="csrf" value="<?=escape(csrf_token())?>">
  <?php if($admin): ?><input type="hidden" name="return_to" value="admin"><?php endif; ?>
  <label for="avatar-file">Profile picture</label>
  <input class="form-control" id="avatar-file" type="file" name="avatar" accept="image/png,image/jpeg,image/webp" required>
  <small>PNG, JPEG or WebP · 512 KB max · 2048 × 2048 max</small>
  <button class="btn btn-primary mt-2" type="submit">Save picture</button>
</form><?php }
