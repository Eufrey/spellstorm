<?php
declare(strict_types=1);

function register_player(PDO $db, string $email, string $username, string $password): string {
    $email = strtolower(trim($email)); $username = trim($username);
    if (!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254 || !preg_match('/\A[A-Za-z0-9_ -]{3,32}\z/', $username) || strlen($password)<8 || strlen($password)>72 || str_contains($password,"\0")) {
        throw new InvalidArgumentException('Enter a valid email, a 3–32 character username, and an 8–72 byte password.');
    }
    $db->beginTransaction();
    try {
        $stmt=$db->prepare("INSERT INTO public.users(email,password_hash,role) VALUES (?,?,'player') RETURNING id");
        $stmt->execute([$email,password_hash($password,PASSWORD_DEFAULT)]); $id=(string)$stmt->fetchColumn(); $stmt->closeCursor();
        $stmt=$db->prepare('INSERT INTO public.player_profiles(user_id,username) VALUES (?,?)'); $stmt->execute([$id,$username]);
        $db->commit(); return $id;
    } catch (Throwable $e) { if ($db->inTransaction()) $db->rollBack(); throw $e; }
}
function account_by_id(PDO $db,string $id): ?array {
    $stmt=$db->prepare('SELECT u.id,u.email,u.role,p.username FROM public.users u JOIN public.player_profiles p ON p.user_id=u.id WHERE u.id=?');
    $stmt->execute([$id]); return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}
function authenticate_player(PDO $db,string $email,string $password): ?array {
    $stmt=$db->prepare('SELECT id,password_hash FROM public.users WHERE email=?'); $stmt->execute([strtolower(trim($email))]);
    $row=$stmt->fetch(PDO::FETCH_ASSOC);
    if (strlen($password)>72 || str_contains($password,"\0") || !password_verify($password,$row['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') || !$row) return null;
    return account_by_id($db,$row['id']);
}
