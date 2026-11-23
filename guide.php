<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/account-layout.php'; require __DIR__.'/includes/guide.php';
$entries=[]; $error=''; try { $entries=guide_entries(spellstorm_database()); } catch (Throwable $e) { $error='The guide is temporarily unavailable.'; }
account_header('Spellstorm codex',true); ?>
<?php if ($error): ?><p role="alert" class="error"><?=escape($error)?></p><?php elseif (!$entries): ?><p>The codex is awaiting its first entry.</p><?php endif; ?>
<?php foreach ($entries as $entry): ?><article class="guide-item"><p><?=escape($entry['category'])?></p><h2><?=escape($entry['title'])?></h2><?php if (!empty($entry['image_url']) && strtolower(parse_url($entry['image_url'],PHP_URL_SCHEME)??'')==='https'): ?><img class="img-fluid rounded mb-3" src="<?=escape($entry['image_url'])?>" alt="" loading="lazy" referrerpolicy="no-referrer"><?php endif; ?><p><?=nl2br(escape($entry['description']))?></p></article><?php endforeach; ?>
<?php account_footer(); ?>
