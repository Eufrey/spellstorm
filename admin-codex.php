<?php
require __DIR__.'/includes/session.php'; require __DIR__.'/includes/admin-layout.php'; require __DIR__.'/includes/guide.php';
$account=require_account(true); $error=''; $entries=[]; $categories=[]; $editing=null;
try {
    $db=spellstorm_database();
    if ($_SERVER['REQUEST_METHOD']==='POST') {
        verify_csrf(); $id=filter_var(field('id'),FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
        if (field('action')==='delete' && $id) guide_delete($db,$id);
        elseif (field('action')==='save') { if (field('id')!=='' && !$id) throw new InvalidArgumentException('Invalid entry ID.'); guide_save($db,$id?:null,(int)field('category'),field('title'),field('description'),field('image_url'),$account['id']); }
        else throw new InvalidArgumentException('Invalid action.');
        redirect_to('admin-codex.php?saved=1');
    }
} catch (InvalidArgumentException $e) { $error=$e->getMessage(); } catch (Throwable $e) { $error='Unable to save the guide entry.'; }
try { $db=spellstorm_database(); $categories=guide_categories($db); $entries=guide_entries($db); } catch (Throwable $e) { $error='Guide service unavailable.'; }
$edit=filter_var($_GET['edit']??null,FILTER_VALIDATE_INT); foreach ($entries as $entry) if ((int)$entry['id']===$edit) $editing=$entry;
admin_header('Codex Management','codex',$account); ?>
<p>Welcome, <?=escape($account['username'])?>. Manage the Spellstorm guide.</p>
<?php if ($error): ?><p role="alert" class="error"><?=escape($error)?></p><?php elseif (isset($_GET['saved'])): ?><p role="status">Changes saved.</p><?php endif; ?>
<h2><?= $editing?'Edit entry':'Create entry' ?></h2>
<form method="post"><input type="hidden" name="csrf" value="<?=csrf_token()?>"><input type="hidden" name="action" value="save"><input type="hidden" name="id" value="<?=escape((string)($editing['id']??''))?>">
<label for="category">Category</label><select class="form-select" id="category" name="category" required><?php foreach ($categories as $category): ?><option value="<?=(int)$category['id']?>" <?=($editing && $editing['category_id']==$category['id'])?'selected':''?>><?=escape($category['name'])?></option><?php endforeach; ?></select>
<label for="title">Title</label><input class="form-control" id="title" name="title" required maxlength="150" value="<?=escape($editing['title']??'')?>">
<label for="description">Description</label><textarea class="form-control" id="description" name="description" rows="5" required maxlength="20000"><?=escape($editing['description']??'')?></textarea>
<label for="image_url">Image URL (optional)</label><input class="form-control" id="image_url" name="image_url" type="url" value="<?=escape($editing['image_url']??'')?>"><button class="btn btn-primary my-3">Save entry</button> <a href="admin-codex.php">Cancel</a></form>
<h2>Published entries</h2><?php if (!$entries): ?><p>No entries yet.</p><?php endif; ?>
<?php foreach ($entries as $entry): ?><article class="guide-item"><strong><?=escape($entry['title'])?></strong> <span><?=escape($entry['category'])?></span><div><a href="admin-codex.php?edit=<?=(int)$entry['id']?>">Edit</a><form class="d-inline" method="post" onsubmit="return confirm('Delete this entry?')"><input type="hidden" name="csrf" value="<?=csrf_token()?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=(int)$entry['id']?>"><button class="btn btn-sm btn-outline-danger">Delete</button></form></div></article><?php endforeach; ?>
<?php admin_footer(); ?>
