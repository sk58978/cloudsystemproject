<?php
namespace App\Controllers;

use App\Repositories\UserRepository;

class AuthController
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        if ($this->userRepository->findByEmail($email)) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        if ($this->userRepository->create($email, $passwordHash, $name)) {
            http_response_code(201);
            echo json_encode(['message' => 'User created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }

    // Placeholder for login (next task)
    public function login()
    {
    }
    public function logout()
    {
    }
    public function check()
    {
    }
}
