<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/account-layout.php';
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    verify_csrf();
    if (($_SESSION['next_login']??0)>time()) $error='Please wait a moment before trying again.';
    else { $_SESSION['next_login']=time()+2; try { $account=authenticate_player(spellstorm_database(),field('email'),field('password')); if ($account) { login_account($account['id']); redirect_to('account.php'); } $error='Invalid email or password.'; } catch (Throwable $e) { $error='Sign in is temporarily unavailable.'; } }
}
account_header('Welcome back'); ?>
<?php if ($error): ?><p class="error" role="alert"><?=escape($error)?></p><?php endif; ?>
<form method="post"><input type="hidden" name="csrf" value="<?=csrf_token()?>"><label for="email">Email</label><input class="form-control" id="email" name="email" type="email" required autocomplete="username"><label for="password">Password</label><input class="form-control" id="password" name="password" type="password" required autocomplete="current-password"><button class="btn btn-primary w-100 my-3">Sign in</button></form><p>New player? <a href="register.php">Create an account</a>.</p><?php account_footer(); ?>
