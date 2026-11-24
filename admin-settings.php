<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/admin-layout.php'; require __DIR__.'/includes/avatar.php';
$account=require_account(true); admin_header('Settings','settings',$account); ?>
<section class="admin-panel"><img src="avatar.php?id=<?=escape($account['id'])?>" width="80" height="80" class="rounded-circle object-fit-cover" alt="Profile picture"><?php if(isset($_SESSION['avatar_notice'])): ?><p role="status"><?=escape($_SESSION['avatar_notice'])?></p><?php unset($_SESSION['avatar_notice']); endif; avatar_form(true); ?></section>
<section class="admin-panel"><h2>Administrator profile</h2><dl><dt>Username</dt><dd><?=escape($account['username'])?></dd><dt>Email</dt><dd><?=escape($account['email'])?></dd><dt>Role</dt><dd>Administrator</dd></dl><a href="account.php">View account</a></section><?php admin_footer(); ?>
