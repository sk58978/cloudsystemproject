<?php
namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = 'localhost';
            $db_name = 'marketplace';
            $username = 'root';
            // Domyślne hasło w XAMPP to pusty ciąg znaków
            $password = '';

            try {
                self::$instance = new PDO(
                    "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
                    $username,
                    $password
                );
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                die("Connection error: " . $e->getMessage());
            }
        }

        return self::$instance;
    }
}
