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

            try {
                const result = await apiClient.post('/register', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Account created! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = error.message;
            }
        });
    }

    // Placeholder for Login logic (User Task 12)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            const messageDiv = document.getElementById('auth-message');

            try {
                const result = await apiClient.post('/login', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Logged in! Redirecting...';

                // Zapisz dane (opcjonalnie, choć sesja jest w httpOnly cookie)
                // localStorage.setItem('user', JSON.stringify(result.user));

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
