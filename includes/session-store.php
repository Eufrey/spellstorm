<?php
declare(strict_types=1);

final class DatabaseSessionStore implements SessionHandlerInterface, SessionUpdateTimestampHandlerInterface {
    private ?string $locked = null;
    public function __construct(private PDO $db, private int $ttl=86400) {}
    private function key(string $id): string { return hash('sha256',$id); }
    private function lock(string $id): void {
        if ($this->db->getAttribute(PDO::ATTR_DRIVER_NAME)!=='pgsql') return;
        $key=$this->key($id);
        if ($this->locked===$key) return;
        $this->close();
        $s=$this->db->prepare('SELECT pg_advisory_lock(hashtextextended(?,0))'); $s->execute([$key]); $s->closeCursor();
        $this->locked=$key;
    }
    public function open(string $path,string $name): bool { return true; }
    public function close(): bool {
        if ($this->locked!==null) {
            $s=$this->db->prepare('SELECT pg_advisory_unlock(hashtextextended(?,0))'); $s->execute([$this->locked]); $s->closeCursor(); $this->locked=null;
        }
        return true;
    }
    public function validateId(string $id): bool {
        $this->lock($id);
        $s=$this->db->prepare('SELECT 1 FROM public.spellstorm_sessions WHERE id_hash=? AND expires_at>?'); $s->execute([$this->key($id),time()]); return (bool)$s->fetchColumn();
    }
    public function read(string $id): string|false {
        $this->lock($id);
        $s=$this->db->prepare('SELECT data FROM public.spellstorm_sessions WHERE id_hash=? AND expires_at>?'); $s->execute([$this->key($id),time()]); $data=$s->fetchColumn();
        return $data===false?'':base64_decode($data,true);
    }
    public function write(string $id,string $data): bool {
        $this->lock($id);
        $s=$this->db->prepare('INSERT INTO public.spellstorm_sessions(id_hash,data,expires_at) VALUES (?,?,?) ON CONFLICT(id_hash) DO UPDATE SET data=excluded.data,expires_at=excluded.expires_at');
        return $s->execute([$this->key($id),base64_encode($data),time()+$this->ttl]);
    }
    public function updateTimestamp(string $id,string $data): bool { return $this->write($id,$data); }
    public function destroy(string $id): bool {
        $this->lock($id); $s=$this->db->prepare('DELETE FROM public.spellstorm_sessions WHERE id_hash=?'); return $s->execute([$this->key($id)]);
    }
    public function gc(int $max_lifetime): int|false {
        $s=$this->db->prepare('DELETE FROM public.spellstorm_sessions WHERE expires_at<=?'); $s->execute([time()]); return $s->rowCount();
    }
}
