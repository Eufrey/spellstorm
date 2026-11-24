<?php
if (PHP_SAPI !== 'cli') exit;
require __DIR__.'/../includes/avatar.php';
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.player_profiles(user_id TEXT PRIMARY KEY,avatar_url TEXT); INSERT INTO public.player_profiles VALUES('a',NULL),('b',NULL)");
$png=base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1sAAAAASUVORK5CYII=');
save_avatar($db,'a',$png);
if (avatar_data($db,'a')!==['image/png',$png] || avatar_data($db,'b')!==null) throw new RuntimeException('Avatar ownership or storage failed');
foreach (['<svg></svg>',str_repeat('x',524289)] as $invalid) {
    try { save_avatar($db,'a',$invalid); throw new RuntimeException('Invalid avatar accepted'); } catch (InvalidArgumentException $e) {}
}
if (avatar_data($db,'a')!==['image/png',$png]) throw new RuntimeException('Invalid upload changed avatar');
echo "Avatar tests passed\n";
