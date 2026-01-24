import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check for header link
    try {
        const authData = await apiClient.get('/api/user');
        const authLink = document.getElementById('auth-link');
        if (authLink && authData.authenticated) {
            authLink.textContent = authData.user.name;
            authLink.href = 'profile.html';
        }
    } catch (_) { }

    const contactForm = document.getElementById('contact-form');
    const messageDiv = document.getElementById('contact-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';
            messageDiv.textContent = '';
            messageDiv.style.color = '';

            try {
                await apiClient.post('/api/contact', data);

                messageDiv.style.color = 'green';
                messageDiv.innerHTML = '<strong>Dziękujemy!</strong> Twoja wiadomość została wysłana.';

                contactForm.reset();

            } catch (error) {
                console.error('Contact error:', error);

                messageDiv.style.color = 'red';
                messageDiv.textContent = error.message || 'Wystąpił błąd podczas wysyłania wiadomości.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});
