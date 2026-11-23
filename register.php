<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/account-layout.php';
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    verify_csrf();
    try { if (field('password')!==field('confirm')) throw new InvalidArgumentException('Passwords do not match.'); $id=register_player(spellstorm_database(),field('email'),field('username'),field('password')); login_account($id); redirect_to('account.php'); }
    catch (InvalidArgumentException $e) { $error=$e->getMessage(); }
    catch (PDOException $e) { $error=in_array($e->getCode(),['23505','23000'],true)?'That email or username is already registered.':'Registration is temporarily unavailable.'; }
    catch (Throwable $e) { $error='Registration is temporarily unavailable.'; }
}
account_header('Create your account'); ?>
<?php if ($error): ?><p class="error" role="alert"><?=escape($error)?></p><?php endif; ?>
<form method="post"><input type="hidden" name="csrf" value="<?=csrf_token()?>"><label for="username">Username</label><input class="form-control" id="username" name="username" required minlength="3" maxlength="32" autocomplete="username"><label for="email">Email</label><input class="form-control" id="email" type="email" name="email" required maxlength="254" autocomplete="email"><label for="password">Password</label><input class="form-control" id="password" type="password" name="password" required minlength="8" maxlength="72" autocomplete="new-password"><label for="confirm">Confirm password</label><input class="form-control" id="confirm" type="password" name="confirm" required autocomplete="new-password"><button class="btn btn-primary w-100 my-3">Register</button></form><p>Already registered? <a href="login.php">Sign in</a>.</p><?php account_footer(); ?>
