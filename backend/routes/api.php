<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ✅ ROUTE bierzemy ZAWSZE z query string, niezależnie od scope
$route = $_GET['route'] ?? '/';
$route = '/' . ltrim($route, '/');
$requestUri = strtok($route, '?'); // na wszelki wypadek

// ---------- HEALTH ----------
if ($requestMethod === 'GET' && $requestUri === '/api/health') {
    jsonResponse(['ok' => true, 'time' => date('c')]);
}

// ---------- STUBY ----------
if ($requestMethod === 'GET' && $requestUri === '/api/user') {
    jsonResponse(['authenticated' => false]);
}
if ($requestMethod === 'GET' && $requestUri === '/api/categories') {
    jsonResponse([
        ['id' => 1, 'name' => 'Elektronika'],
        ['id' => 2, 'name' => 'Dom i ogród'],
        ['id' => 3, 'name' => 'Sport'],
    ]);
}
if ($requestMethod === 'GET' && $requestUri === '/api/products') {
    jsonResponse([
        ['id' => 1, 'name' => 'Laptop 14"', 'price' => 2999.99, 'category_id' => 1, 'image_url' => null],
        ['id' => 2, 'name' => 'Słuchawki', 'price' => 199.90, 'category_id' => 1, 'image_url' => null],
        ['id' => 3, 'name' => 'Hantle 2x5kg', 'price' => 149.00, 'category_id' => 3, 'image_url' => null],
    ]);
}

jsonResponse(['error' => 'Not Found', 'path' => $requestUri], 404);
