<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/admin-layout.php'; require __DIR__.'/includes/admin-data.php';
$account=require_account(true); $error=''; $metrics=[]; $players=[]; $runs=[]; $activity=[];
try { $db=spellstorm_database(); $metrics=admin_metrics($db); $players=array_slice(admin_players($db),0,5); $runs=array_slice(admin_runs($db),0,5); $activity=admin_activity($db); } catch(Throwable $e) { $error='Dashboard data is temporarily unavailable.'; }
admin_header('Overview','overview',$account); ?>
<p>Monitor Spellstorm's community and game performance.</p>
<?php if($error): ?><p class="error" role="alert"><?=escape($error)?></p><?php endif; ?>
<div class="metric-grid"><?php foreach(['players'=>'Total players','runs'=>'Games played','best_score'=>'Highest score','win_rate'=>'Victory rate'] as $k=>$label): ?><div class="metric"><small><?=escape($label)?></small><strong><?=isset($metrics[$k])?($k==='win_rate'?number_format((float)$metrics[$k],1).'%':number_format((float)$metrics[$k])):'—'?></strong></div><?php endforeach; ?></div>
<section class="admin-panel"><h2>Recent game activity</h2><?php if(!$activity): ?><p class="empty">Activity will appear when game results are saved.</p><?php else: $max=max(array_column($activity,'runs')); foreach(array_reverse($activity) as $day): ?><div class="bar-row"><span><?=escape($day['day'])?></span><div class="bar-track"><div class="bar-fill" style="width:<?=100*(int)$day['runs']/$max?>%"></div></div><span><?=(int)$day['runs']?></span></div><?php endforeach; endif; ?></section>
<div class="row"><div class="col-lg-6"><section class="admin-panel"><h2>Recent registrations</h2><?php admin_table($players,['username'=>'Player','role'=>'Role','created_at'=>'Joined']); ?><a href="admin-players.php">View players</a></section></div><div class="col-lg-6"><section class="admin-panel"><h2>Latest results</h2><?php admin_table($runs,['username'=>'Player','score'=>'Score','result'=>'Result']); ?><a href="admin-leaderboard.php">View results</a></section></div></div>
<section class="admin-panel"><h2>Quick actions</h2><a class="btn btn-primary" href="admin-challenges.php">Manage challenges</a> <a class="btn btn-outline-light" href="admin-players.php">Manage players</a></section>
<?php admin_footer(); ?>
