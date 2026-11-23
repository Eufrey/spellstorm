<?php
declare(strict_types=1);
function guide_categories(PDO $db): array { return $db->query('SELECT id,name FROM public.guide_categories ORDER BY id')->fetchAll(PDO::FETCH_ASSOC); }
function guide_entries(PDO $db): array { return $db->query('SELECT e.*,c.name AS category FROM public.guide_entries e JOIN public.guide_categories c ON c.id=e.category_id ORDER BY c.id,e.title')->fetchAll(PDO::FETCH_ASSOC); }
function guide_save(PDO $db,?int $id,int $category,string $title,string $description,string $image,string $author): int {
    $title=trim($title); $description=trim($description); $image=trim($image);
    if ($title==='' || mb_strlen($title)>150 || $description==='' || mb_strlen($description)>20000) throw new InvalidArgumentException('Enter a valid title and description.');
    if ($image!=='' && (!filter_var($image,FILTER_VALIDATE_URL) || strtolower(parse_url($image,PHP_URL_SCHEME)??'')!=='https')) throw new InvalidArgumentException('Use an HTTPS image URL.');
    $stmt=$db->prepare('SELECT id FROM public.guide_categories WHERE id=?'); $stmt->execute([$category]); if (!$stmt->fetchColumn()) throw new InvalidArgumentException('Select a valid category.');
    if ($id===null) { $stmt=$db->prepare('INSERT INTO public.guide_entries(category_id,title,description,image_url,author_id) VALUES (?,?,?,?,?) RETURNING id'); $stmt->execute([$category,$title,$description,$image?:null,$author]); }
    else { $stmt=$db->prepare('UPDATE public.guide_entries SET category_id=?,title=?,description=?,image_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING id'); $stmt->execute([$category,$title,$description,$image?:null,$id]); }
    $saved=$stmt->fetchColumn(); if (!$saved) throw new InvalidArgumentException('Entry not found.'); return (int)$saved;
}
function guide_delete(PDO $db,int $id): void { $stmt=$db->prepare('DELETE FROM public.guide_entries WHERE id=?'); $stmt->execute([$id]); }
