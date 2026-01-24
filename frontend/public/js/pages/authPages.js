import { ApiClient } from '../api/apiClient.js';

const apiClient = new ApiClient('/backend/public/index.php');
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
                const result = await apiClient.post('/api/register', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Account created! Redirecting to login...';
                setTimeout(() => {
			window.dispatchEvent(new CustomEvent("open-login-modal"));
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
                const result = await apiClient.post('/api/login', data);
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Logged in! Redirecting...';

                // Zapisz dane (opcjonalnie, choć sesja jest w httpOnly cookie)
                // localStorage.setItem('user', JSON.stringify(result.user));

// NIE ROBIMY REDIRECTA
messageDiv.style.color = 'green';
messageDiv.textContent = 'Zalogowano pomyślnie';

// jeśli login.html był otwarty samodzielnie
setTimeout(() => {
    if (window.opener) {
        window.close();
    }
}, 500);

            } catch (error) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = error.message;
            }
        });
    }
});
