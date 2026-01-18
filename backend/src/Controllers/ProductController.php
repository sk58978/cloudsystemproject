<?php
namespace App\Controllers;

use App\Repositories\ProductRepository;

class ProductController
{
    private ProductRepository $productRepository;

    public function __construct()
    {
        $this->productRepository = new ProductRepository();
    }

    public function getAll()
    {
        $categoryId = isset($_GET['category_id']) ? (int) $_GET['category_id'] : null;
        $products = $this->productRepository->getAll($categoryId);
        echo json_encode($products);
    }

    public function getById($id)
    {
        $product = $this->productRepository->getById((int) $id);

        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    }
}
