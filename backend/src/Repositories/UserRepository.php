<?php
namespace App\Repositories;

use App\Config\Database;
use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(string $email, string $passwordHash, string $name): bool
    {
        $sql = "INSERT INTO users (email, password_hash, name) VALUES (:email, :password_hash, :name)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':email' => $email,
            ':password_hash' => $passwordHash,
            ':name' => $name
        ]);
    }

    public function findByEmail(string $email)
    {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }
}
