<?php
if (PHP_SAPI !== 'cli') exit;
require __DIR__.'/../includes/session-store.php';
$live=in_array('--postgres',$argv,true);
if ($live) { require __DIR__.'/../includes/database.php'; $db=spellstorm_database(); }
else {
    $db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $db->exec("ATTACH DATABASE ':memory:' AS public; CREATE TABLE public.spellstorm_sessions (id_hash TEXT PRIMARY KEY, data TEXT NOT NULL, expires_at INTEGER NOT NULL)");
}
$a=new DatabaseSessionStore($db); $b=new DatabaseSessionStore($live?spellstorm_database():$db);
$id=bin2hex(random_bytes(32));
try {
if (!$a->write($id,'user_id|s:1:"x";')) throw new RuntimeException('Session did not write');
$a->close();
if (!$b->validateId($id) || $b->read($id)!=='user_id|s:1:"x";') throw new RuntimeException('Session did not persist');
$b->close(); $a->destroy($id); $a->close();
if ($b->validateId($id) || $b->read($id)!=='') throw new RuntimeException('Destroyed session remained active');
$b->close();
$a->write($id,'expired'); $a->close(); $s=$db->prepare('UPDATE public.spellstorm_sessions SET expires_at=0 WHERE id_hash=?'); $s->execute([hash('sha256',$id)]);
if ($b->validateId($id) || $b->read($id)!=='') throw new RuntimeException('Expired session remained active');
if (!$live && $b->gc(1)!==1) throw new RuntimeException('Expired session was not removed');
} finally { $b->close(); $a->destroy($id); $a->close(); }
echo "Database session tests passed\n";
