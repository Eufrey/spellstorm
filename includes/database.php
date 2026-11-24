<?php
declare(strict_types=1);

function spellstorm_database(): PDO
{
    if (getenv('VERCEL') === '1' || getenv('SPELLSTORM_DB_HOST') !== false) {
        $config = [];
        foreach (['host','port','database','username','password'] as $key) {
            $config[$key] = getenv('SPELLSTORM_DB_'.strtoupper($key));
        }
    } else {
    $path = dirname(__DIR__) . '/config/config.local.php';
    if (!is_file($path)) {
        throw new RuntimeException('Database configuration is missing.');
    }
    $config = require $path;
    // Pooler connection settings; the password stays in the local configuration.
    $poolerPath = dirname(__DIR__) . '/config/config.pooler.local.php';
    if (is_file($poolerPath)) $config = array_replace($config, require $poolerPath);
    }
    foreach (['host', 'port', 'database', 'username', 'password'] as $key) {
        if (!isset($config[$key]) || $config[$key] === '' || $config[$key] === false) {
            throw new RuntimeException('Database configuration is incomplete.');
        }
    }
    if (!extension_loaded('pdo_pgsql')) {
        throw new RuntimeException('The PDO PostgreSQL extension is not enabled.');
    }
    $dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s;sslmode=require', $config['host'], $config['port'], $config['database']);
    return new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
