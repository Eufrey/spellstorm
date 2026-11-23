<?php
require __DIR__.'/../includes/achievement-tiers.php';
$rows=[['tier'=>1,'earned_at'=>'today'],['tier'=>1,'earned_at'=>null],['tier'=>2,'earned_at'=>'today'],['tier'=>3,'earned_at'=>'today']];
if(achievement_progress($rows)['title']!==null) throw new RuntimeException('Title must require earlier tiers');
$rows[1]['earned_at']='today'; if(achievement_progress($rows)['title']['title']!=='Stormbreaker') throw new RuntimeException('Highest title missing');
$rows[3]['earned_at']=null; if(achievement_progress($rows)['title']['title']!=='Arcane Vanguard') throw new RuntimeException('Veteran title missing');
echo "Achievement tier tests passed\n";
