<?php

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Usuń query string z URI
$requestUri = strtok($requestUri, '?');

// Usuń prefiks katalogu (jeśli aplikacja nie jest w roocie serwera)
// W XAMPP często to np. /projekt-marketplace/tworzenie/backend/public
// Dla uproszczenia w tym środowisku założymy, że pracujemy na względnych ścieżkach od 'api'
// lub po prostu parsujemy końcówkę.

// Prosty router oparty na matchowaniu stringów
// Przyjmujemy konwencję, że zapytania idą na /api/...

// Helper do wysyłania odpowiedzi JSON
if (!function_exists('jsonResponse')) {
    function jsonResponse($data, $code = 200)
    {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}

// Router
if ($requestMethod === 'POST' && strpos($requestUri, '/api/register') !== false) {
    $controller = new \App\Controllers\AuthController();
    $controller->register();
} elseif ($requestMethod === 'POST' && strpos($requestUri, '/api/login') !== false) {
    $controller = new \App\Controllers\AuthController();
    $controller->login();
} elseif ($requestMethod === 'POST' && strpos($requestUri, '/api/logout') !== false) {
    $controller = new \App\Controllers\AuthController();
    $controller->logout();
} elseif ($requestMethod === 'GET' && strpos($requestUri, '/api/user') !== false) {
    $controller = new \App\Controllers\AuthController();
    $controller->check();
} elseif ($requestMethod === 'GET' && strpos($requestUri, '/api/categories') !== false) {
    $controller = new \App\Controllers\CategoryController();
    $controller->getAll();
} elseif ($requestMethod === 'GET' && strpos($requestUri, '/api/products') !== false) {
    // Sprawdź czy to ID czy lista
    // Proste sprawdzenie czy URI kończy się liczbą
    if (preg_match('/\/api\/products\/(\d+)$/', $requestUri, $matches)) {
        $controller = new \App\Controllers\ProductController();
        $controller->getById($matches[1]);
    } else {
        $controller = new \App\Controllers\ProductController();
        $controller->getAll();
    }
} elseif ($requestMethod === 'GET' && strpos($requestUri, '/api/cart') !== false) {
    $controller = new \App\Controllers\CartController();
    $controller->get();
} elseif ($requestMethod === 'POST' && strpos($requestUri, '/api/cart/add') !== false) {
    $controller = new \App\Controllers\CartController();
    $controller->add();
} elseif ($requestMethod === 'POST' && strpos($requestUri, '/api/cart/remove') !== false) {
    $controller = new \App\Controllers\CartController();
    $controller->remove();
} else {
    jsonResponse(['error' => 'Not Found'], 404);
}
