<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (!is_file(__DIR__.'/../includes/guide.php')) { fwrite(STDERR,"Guide layer missing\n"); exit(1); }
require __DIR__.'/../includes/guide.php';
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.guide_categories(id INTEGER PRIMARY KEY,name TEXT); INSERT INTO public.guide_categories VALUES(1,'Grimoires'); CREATE TABLE public.guide_entries(id INTEGER PRIMARY KEY,category_id INTEGER,author_id TEXT,title TEXT,description TEXT,image_url TEXT,updated_at TEXT DEFAULT CURRENT_TIMESTAMP)");
function check(bool $condition,string $message): void { if (!$condition) throw new RuntimeException($message); }
$id=guide_save($db,null,1,'Basic Grimoire','Starting spellbook','', 'admin');
check(guide_entries($db)[0]['category']==='Grimoires','Category join failed');
guide_save($db,$id,1,'Basic Grimoire','Updated description','','admin');
check(guide_entries($db)[0]['description']==='Updated description','Update failed');
try { guide_save($db,null,99,'Invalid','Description','','admin'); throw new RuntimeException('Invalid category accepted'); } catch (InvalidArgumentException $e) {}
guide_delete($db,$id);
check(guide_entries($db)===[],'Delete failed');
echo "Guide CRUD tests passed\n";
