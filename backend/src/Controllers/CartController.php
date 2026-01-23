<?php
namespace App\Controllers;

use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;

class CartController
{
    private CartRepository $cartRepository;

    public function __construct()
    {
        // Session should be started in index.php
        $this->cartRepository = new CartRepository();
    }

    private function requireAuth(): int
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        return (int) $_SESSION['user_id'];
    }

    public function get()
    {
        $userId = $this->requireAuth();
        $items = $this->cartRepository->getItems($userId);

        $total = 0.0;
        foreach ($items as $it) {
            $total += ((float) $it['price']) * ((int) $it['quantity']);
        }

        echo json_encode([
            'items' => $items,
            'total' => round($total, 2),
        ]);
    }

    public function add()
    {
        $userId = $this->requireAuth();
        $in = json_decode(file_get_contents('php://input'), true);

        if (!is_array($in)) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad JSON']);
            return;
        }

        $productId = (int) ($in['product_id'] ?? 0);
        $qty = max(1, (int) ($in['qty'] ?? 1));

        if ($productId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid product']);
            return;
        }

        // Check if product exists (using ProductRepository just for check or assume valid key)
        $productRepo = new ProductRepository();
        if (!$productRepo->getById($productId)) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        $row = $this->cartRepository->findItem($userId, $productId);

        if ($row) {
            $this->cartRepository->updateQuantity($row['id'], $row['quantity'] + $qty);
        } else {
            $this->cartRepository->add($userId, $productId, $qty);
        }

        echo json_encode(['ok' => true]);
    }

    public function remove()
    {
        $userId = $this->requireAuth();
        $in = json_decode(file_get_contents('php://input'), true);

        $productId = (int) ($in['product_id'] ?? 0);
        if ($productId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid product_id']);
            return;
        }

        $this->cartRepository->remove($userId, $productId);
        echo json_encode(['ok' => true]);
    }

    public function update()
    {
        $userId = $this->requireAuth();
        $in = json_decode(file_get_contents('php://input'), true);

        $productId = (int) ($in['product_id'] ?? 0);
        $qty = min(50, max(1, (int) ($in['qty'] ?? 1)));

        if ($productId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid product_id']);
            return;
        }

        $this->cartRepository->updateItemQuantity($userId, $productId, $qty);
        echo json_encode(['ok' => true, 'qty' => $qty]);
    }
}
