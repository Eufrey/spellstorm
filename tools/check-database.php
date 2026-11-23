<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/includes/database.php';
try {
    $db = spellstorm_database();
    $db->query('SELECT 1')->fetchColumn();
    echo "Database connection successful.\n";
} catch (Throwable $e) {
    // Do not print credentials or detailed connection errors.
    fwrite(STDERR, "Database connection failed. Check configuration, PostgreSQL driver and network access.\n");
    exit(1);
}
