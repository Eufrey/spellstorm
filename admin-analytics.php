<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/admin-layout.php'; require __DIR__.'/includes/admin-data.php';
$account=require_account(true); $metrics=[]; $grimoires=[]; $activity=[]; $error=''; try { $db=spellstorm_database(); $metrics=admin_metrics($db); $grimoires=admin_grimoires($db); $activity=admin_activity($db); } catch(Throwable $e) { $error='Analytics temporarily unavailable.'; }
admin_header('Game Analytics','analytics',$account); ?>
<p>Performance and progression based on recorded game runs.</p><?php if($error): ?><p class="error"><?=escape($error)?></p><?php endif; ?>
<div class="metric-grid"><?php foreach(['avg_score'=>'Average score','avg_circle'=>'Average circle','win_rate'=>'Victory rate'] as $k=>$label): ?><div class="metric"><small><?=escape($label)?></small><strong><?=isset($metrics[$k])?number_format((float)$metrics[$k],1).($k==='win_rate'?'%':''):'—'?></strong></div><?php endforeach; ?></div>
<section class="admin-panel"><h2>Grimoire popularity</h2><?php admin_table($grimoires,['grimoire'=>'Grimoire','runs'=>'Games']); ?></section><section class="admin-panel"><h2>Recent active days</h2><?php admin_table($activity,['day'=>'Date','runs'=>'Games']); ?></section><?php admin_footer(); ?>
