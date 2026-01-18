USE marketplace;

-- Hasło: 'password123' (hash bcrypt)
INSERT INTO users (email, password_hash, name, role)
VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin'),
('user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Przykładowy Jan', 'customer');

INSERT INTO categories (name, slug) VALUES
('Elektronika', 'elektronika'),
('Moda', 'moda'),
('Sport', 'sport');

INSERT INTO products (category_id, name, description, price, image_url) VALUES
(1, 'Smartfon X', 'Nowoczesny smartfon z doskonałym aparatem.', 1999.99, 'https://via.placeholder.com/300?text=Smartfon'),
(2, 'Garnitur męski', 'Elegancki garnitur na każdą okazję.', 499.00, 'https://via.placeholder.com/300?text=Garnitur'),
(3, 'Piłka nożna', 'Profesjonalna piłka do gry.', 59.90, 'https://via.placeholder.com/300?text=Pilka');
