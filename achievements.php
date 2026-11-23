<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/account-layout.php'; require __DIR__.'/includes/achievement-tiers.php'; require __DIR__.'/includes/achievement-view.php';
require_account();
$rows=[]; $error=''; $account=null; try { $account=current_account(); $rows=player_achievement_rows(spellstorm_database(),$account['id']??null); } catch(Throwable $e){$error='Challenges are temporarily unavailable.';}
account_header('Challenges & Achievements',true); ?>
<p>Complete every achievement in each tier to earn a permanent leaderboard title. <?php if(!$account): ?><a href="login.php">Sign in</a> to track your progress.<?php else: ?><a href="account.php">View your profile</a>.<?php endif; ?></p><?php if($error): ?><p class="error"><?=escape($error)?></p><?php else: show_achievement_levels(achievement_progress($rows)); endif; ?>
<?php $extra=array_filter($rows,fn($r)=>$r['tier']===null); if($extra): ?><h2>Additional challenges</h2><?php foreach($extra as $row): ?><article class="guide-item"><strong><?=escape($row['title'])?></strong><p><?=escape($row['description'])?></p><span class="badge <?=$row['earned_at']?'bg-success':'bg-secondary'?>"><?=$row['earned_at']?'Earned':'Locked'?></span></article><?php endforeach; endif; account_footer(); ?>
