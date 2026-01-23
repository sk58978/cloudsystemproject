<?php
namespace App\Repositories;

use App\Config\Database;
use PDO;

class ProductRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(?int $categoryId = null, ?string $searchQuery = null): array
    {
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.id
                WHERE 1=1";

        $params = [];
        if ($categoryId) {
            $sql .= " AND p.category_id = :category_id";
            $params[':category_id'] = $categoryId;
        }

        if ($searchQuery) {
            $sql .= " AND (p.name LIKE :q1 OR COALESCE(p.description, '') LIKE :q2)";
            $params[':q1'] = '%' . $searchQuery . '%';
            $params[':q2'] = '%' . $searchQuery . '%';
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById(int $id)
    {
        $sql = "SELECT p.id, p.category_id, c.name as category_name, p.name, p.description, p.price, p.image_url, p.created_at
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }
}
