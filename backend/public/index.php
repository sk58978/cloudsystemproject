<?php
declare(strict_types=1);
session_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    // === UZUPEŁNIJ TO ===
    $host = 'localhost';
    $db   = 'marketplace';
    $user = 'marketplace_user';   // <- zmień na swojego usera
    $pass = 'zaq12wsx';        // <- zmień na swoje hasło
    // ====================

    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
    $opt = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $opt);
    return $pdo;
}

$route  = $_GET['route'] ?? '/';
$route  = '/' . ltrim($route, '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && $route === '/api/health') {
    jsonResponse(['ok' => true, 'time' => date('c')]);
}

if ($method === 'GET' && $route === '/api/user') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['authenticated' => false]);
    }

    jsonResponse([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
        ]
    ]);
}

/**
 * GET /api/categories
 */
if ($method === 'GET' && $route === '/api/categories') {
    try {
        $pdo = db();
        $rows = $pdo->query("SELECT id, name, slug FROM categories ORDER BY name")->fetchAll();
        jsonResponse($rows);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

/**
 * GET /api/products
 * opcje:
 *  - ?q=tekst
 *  - ?category_id=3
 */
if ($method === 'GET' && $route === '/api/products') {
    try {
        $pdo = db();

        $q = trim((string)($_GET['q'] ?? ''));
        $categoryId = (int)($_GET['category_id'] ?? 0);

        $sql = "SELECT id, category_id, name, description, price, image_url, created_at
                FROM products
                WHERE 1=1";
        $params = [];

        if ($categoryId > 0) {
            $sql .= " AND category_id = :cat";
            $params[':cat'] = $categoryId;
        }

	if ($q !== '') {
	    $sql .= " AND (name LIKE :q1 OR COALESCE(description,'') LIKE :q2)";
	    $params[':q1'] = '%' . $q . '%';
	    $params[':q2'] = '%' . $q . '%';
	}


        $sql .= " ORDER BY id DESC LIMIT 200";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        jsonResponse($stmt->fetchAll());
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

/**
 * GET /api/products/{id}
 */
if ($method === 'GET' && preg_match('#^/api/products/(\d+)$#', $route, $m)) {
    try {
        $id = (int)$m[1];

        $pdo = db();
        $stmt = $pdo->prepare(
            "SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.image_url,
                p.created_at
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = :id
             LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            jsonResponse(['error' => 'Not Found', 'path' => $route], 404);
        }

        jsonResponse($row);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && $route === '/api/register') {
    try {
        $pdo = db();
        $raw = file_get_contents('php://input') ?: '';
        $in = json_decode($raw, true);
        if (!is_array($in)) jsonResponse(['error' => 'Bad JSON'], 400);

        $email = trim((string)($in['email'] ?? ''));
        $pass  = (string)($in['password'] ?? '');
        $name  = trim((string)($in['name'] ?? ''));

        if ($email === '' || $pass === '') jsonResponse(['error' => 'Email and password required'], 400);

        // dopasuj nazwę kolumn pod swoją tabelę users:
        // poniżej zakładam: users(id, email, password_hash, name, created_at)
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :e LIMIT 1");
        $stmt->execute([':e' => $email]);
        if ($stmt->fetch()) jsonResponse(['error' => 'Email already exists'], 409);

        $hash = password_hash($pass, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users(email, password_hash, name) VALUES(:e,:p,:n)");
        $stmt->execute([':e' => $email, ':p' => $hash, ':n' => $name]);

        jsonResponse(['ok' => true]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}
if ($method === 'POST' && $route === '/api/login') {
    try {
        $pdo = db();
        $raw = file_get_contents('php://input') ?: '';
        $in = json_decode($raw, true);
        if (!is_array($in)) jsonResponse(['error' => 'Bad JSON'], 400);

        $email = trim((string)($in['email'] ?? ''));
        $pass  = (string)($in['password'] ?? '');
        if ($email === '' || $pass === '') jsonResponse(['error' => 'Email and password required'], 400);

        $stmt = $pdo->prepare("SELECT id, email, password_hash, name FROM users WHERE email = :e LIMIT 1");
        $stmt->execute([':e' => $email]);
        $u = $stmt->fetch();

if (!$u || !password_verify($pass, (string)$u['password_hash'])) {
    jsonResponse(['error' => 'Invalid credentials'], 401);
}

// === SESJA (DODAJ TO) ===
$_SESSION['user_id']    = (int)$u['id'];
$_SESSION['user_email'] = (string)$u['email'];
$_SESSION['user_name']  = (string)$u['name'];

jsonResponse(['ok' => true, 'user' => ['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name']]]);

    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && $route === '/api/cart/add') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    try {
        $pdo = db();
        $raw = file_get_contents('php://input') ?: '';
        $in  = json_decode($raw, true);

        if (!is_array($in)) {
            jsonResponse(['error' => 'Bad JSON'], 400);
        }

        $productId = (int)($in['product_id'] ?? 0);
        $qty       = max(1, (int)($in['qty'] ?? 1));
        $userId    = (int)$_SESSION['user_id'];

        if ($productId <= 0) {
            jsonResponse(['error' => 'Invalid product'], 400);
        }

        // sprawdź czy produkt istnieje
        $stmt = $pdo->prepare("SELECT id FROM products WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $productId]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Product not found'], 404);
        }

        // czy już jest w koszyku?
        $stmt = $pdo->prepare(
            "SELECT id, quantity FROM cart_items 
             WHERE user_id = :u AND product_id = :p"
        );
        $stmt->execute([':u' => $userId, ':p' => $productId]);
        $row = $stmt->fetch();

        if ($row) {
            // zwiększ ilość
            $stmt = $pdo->prepare(
                "UPDATE cart_items 
                 SET quantity = quantity + :q 
                 WHERE id = :id"
            );
            $stmt->execute([':q' => $qty, ':id' => $row['id']]);
        } else {
            // dodaj nowy
            $stmt = $pdo->prepare(
                "INSERT INTO cart_items (user_id, product_id, quantity)
                 VALUES (:u, :p, :q)"
            );
            $stmt->execute([':u' => $userId, ':p' => $productId, ':q' => $qty]);
        }

        jsonResponse(['ok' => true]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'GET' && $route === '/api/cart') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    try {
        $pdo = db();
        $userId = (int)$_SESSION['user_id'];

        // dopasuj nazwy kolumn do cart_items (zakładam: user_id, product_id, quantity)
        $stmt = $pdo->prepare("
            SELECT
              ci.product_id,
              ci.quantity,
              p.name,
              p.price,
              p.image_url
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = :u
            ORDER BY ci.product_id
        ");
        $stmt->execute([':u' => $userId]);
        $items = $stmt->fetchAll();

        $total = 0.0;
        foreach ($items as $it) {
            $total += ((float)$it['price']) * ((int)$it['quantity']);
        }

        jsonResponse([
            'items' => $items,
            'total' => round($total, 2),
        ]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

/**
 * POST /api/cart/remove
 * body: { product_id }
 */
if ($method === 'POST' && $route === '/api/cart/remove') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    try {
        $pdo = db();
        $raw = file_get_contents('php://input') ?: '';
        $in  = json_decode($raw, true);
        if (!is_array($in)) jsonResponse(['error' => 'Bad JSON'], 400);

        $userId = (int)$_SESSION['user_id'];
        $productId = (int)($in['product_id'] ?? 0);
        if ($productId <= 0) jsonResponse(['error' => 'Invalid product_id'], 400);

        $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = :u AND product_id = :p");
        $stmt->execute([':u' => $userId, ':p' => $productId]);

        jsonResponse(['ok' => true]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && $route === '/api/cart/update') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    try {
        $pdo = db();
        $raw = file_get_contents('php://input') ?: '';
        $in  = json_decode($raw, true);
        if (!is_array($in)) jsonResponse(['error' => 'Bad JSON'], 400);

        $userId    = (int)$_SESSION['user_id'];
        $productId = (int)($in['product_id'] ?? 0);

        // 🔒 LIMIT 1–50
        $qty = min(50, max(1, (int)($in['qty'] ?? 1)));

        if ($productId <= 0) {
            jsonResponse(['error' => 'Invalid product_id'], 400);
        }

        $stmt = $pdo->prepare(
            "UPDATE cart_items
             SET quantity = :q
             WHERE user_id = :u AND product_id = :p"
        );
        $stmt->execute([
            ':q' => $qty,
            ':u' => $userId,
            ':p' => $productId
        ]);

        jsonResponse(['ok' => true, 'qty' => $qty]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'DB error', 'detail' => $e->getMessage()], 500);
    }
}

if ($method === 'POST' && $route === '/api/logout') {
    session_destroy();
    jsonResponse(['ok' => true]);
}


jsonResponse(['error' => 'Not Found', 'path' => $route], 404);
