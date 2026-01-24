import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', () => {
    // Rejestracja
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            const messageDiv = document.getElementById('auth-message');
            messageDiv.textContent = ''; // Clear previous messages

            try {
                const result = await apiClient.post('/api/register', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Konto utworzone! Przekierowywanie do logowania...';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = error.message;
            }
        });
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            const messageDiv = document.getElementById('auth-message');
            messageDiv.textContent = '';

            try {
                const result = await apiClient.post('/api/login', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Zalogowano pomyślnie! Przekierowywanie...';

                // Store user info if needed, but session is key
                // localStorage.setItem('user_name', result.user.name);

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = error.message;
            }
        });
    }
});
