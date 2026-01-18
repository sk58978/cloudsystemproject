<?php
namespace App\Controllers;

use App\Repositories\CategoryRepository;

class CategoryController
{
    private CategoryRepository $categoryRepository;

    public function __construct()
    {
        $this->categoryRepository = new CategoryRepository();
    }

    public function getAll()
    {
        $categories = $this->categoryRepository->getAll();
        echo json_encode($categories);
    }
}
