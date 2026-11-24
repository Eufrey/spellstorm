<?php
function site_nav(string $active): void {
    $signedIn=isset($_SESSION['user_id']);
    $links=['play'=>['Play','index.html'],'profile'=>['Profile','account.php'],'leaderboard'=>['Leaderboard','leaderboard.php'],'achievements'=>['Achievements','achievements.php']];
    ?>
    <nav class="site-nav" aria-label="Main navigation">
      <a class="site-brand site-home" href="index.html" aria-label="Return to Spellstorm home" title="Home"><img src="assets/text/spellstorm-home-icon.png" alt="" width="32" height="32"></a>
      <?php if($signedIn): ?><div class="site-primary"><?php foreach($links as $key=>[$label,$href]): ?><a href="<?=escape($href)?>" <?=$active===$key?'aria-current="page"':''?>><?php if($key==='profile'): ?><img src="avatar.php?id=<?=escape($_SESSION['user_id'])?>" alt="" width="24" height="24" style="border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:5px"><?php endif; ?><?=escape($label)?></a><?php endforeach; ?></div><?php endif; ?>
      <div class="site-auth"><?php if($signedIn): ?><form method="post" action="logout.php"><input type="hidden" name="csrf" value="<?=escape(csrf_token())?>"><button type="submit">Log out</button></form><?php else: ?><a href="login.php" <?=$active==='login'?'aria-current="page"':''?>>Log in</a><a href="register.php" <?=$active==='register'?'aria-current="page"':''?>>Register</a><?php endif; ?></div>
    </nav>
    <?php
}
