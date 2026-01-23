<?php
namespace App\Repositories;

use App\Config\Database;
use PDO;

class CartRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getItems(int $userId): array
    {
        $sql = "SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.user_id = :userId
                ORDER BY ci.product_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetchAll();
    }

    public function findItem(int $userId, int $productId)
    {
        $sql = "SELECT id, quantity FROM cart_items WHERE user_id = :userId AND product_id = :productId";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':userId' => $userId, ':productId' => $productId]);
        return $stmt->fetch();
    }

    public function updateQuantity(int $id, int $quantity): bool
    {
        $sql = "UPDATE cart_items SET quantity = :quantity WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':quantity' => $quantity, ':id' => $id]);
    }

    public function add(int $userId, int $productId, int $quantity): bool
    {
        $sql = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (:userId, :productId, :quantity)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':userId' => $userId, ':productId' => $productId, ':quantity' => $quantity]);
    }

    public function remove(int $userId, int $productId): bool
    {
        $sql = "DELETE FROM cart_items WHERE user_id = :userId AND product_id = :productId";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':userId' => $userId, ':productId' => $productId]);
    }

    public function updateItemQuantity(int $userId, int $productId, int $quantity): bool
    {
        $sql = "UPDATE cart_items SET quantity = :quantity WHERE user_id = :userId AND product_id = :productId";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':quantity' => $quantity, ':userId' => $userId, ':productId' => $productId]);
    }
}
