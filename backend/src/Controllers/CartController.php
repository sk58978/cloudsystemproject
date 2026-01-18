<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

class CartController
{
    private PDO $db;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->db = Database::getConnection();
        // Assume headers are set in index.php, but good to be safe if accessed directly differently (though index handles it)
        // header('Content-Type: application/json; charset=utf-8');
    }

    private function requireAuth(): int
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit;
        }
        return (int) $_SESSION['user_id'];
    }

    public function get()
    {
        $userId = $this->requireAuth();
        $sql = 'SELECT ci.id, ci.quantity, ci.product_id, p.name, p.price, p.image_url
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();

        echo json_encode($items);
    }

    public function add()
    {
        $userId = $this->requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = (int) ($data['product_id'] ?? 0);
        $quantity = max(1, (int) ($data['quantity'] ?? 1));

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product_id']);
            return;
        }

        // Sprawdź, czy już jest w koszyku
        $stmt = $this->db->prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$userId, $productId]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $this->db->prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?');
            $stmt->execute([$quantity, $row['id']]);
        } else {
            $stmt = $this->db->prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
            $stmt->execute([$userId, $productId, $quantity]);
        }

        echo json_encode(['message' => 'Added to cart']);
    }

    public function remove()
    {
        $userId = $this->requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $itemId = (int) ($data['item_id'] ?? 0);

        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?');
        $stmt->execute([$itemId, $userId]);

        echo json_encode(['message' => 'Removed']);
    }
}
