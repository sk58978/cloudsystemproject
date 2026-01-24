<?php
namespace App\Controllers;

class ContactController
{
    public function send()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');

        if (empty($name) || empty($email) || empty($message)) {
            http_response_code(400);
            echo json_encode(['error' => 'Wypełnij wymagane pola (Imię, Email, Wiadomość)']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Niepoprawny adres email']);
            return;
        }

        // Symulacja wysyłania (logowanie, zapis do bazy itd.)
        // Na potrzeby zadania zwracamy sukces.

        http_response_code(200);
        echo json_encode(['ok' => true, 'message' => 'Wiadomość wysłana pomyślnie']);
    }
}
