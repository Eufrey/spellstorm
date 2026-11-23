<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/admin-layout.php';
$account=require_account(true); admin_header('Settings','settings',$account); ?>
<section class="admin-panel"><h2>Administrator profile</h2><dl><dt>Username</dt><dd><?=escape($account['username'])?></dd><dt>Email</dt><dd><?=escape($account['email'])?></dd><dt>Role</dt><dd>Administrator</dd></dl><a href="account.php">View account</a></section><?php admin_footer(); ?>
