import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const emailEl = document.getElementById('profile-email');
    const nameEl = document.getElementById('profile-name');
    const avEl = document.getElementById('profile-avatar');
    const msgEl = document.getElementById('profile-msg');
    const btn = document.getElementById('btn-logout');

    let me;
    try {
        me = await apiClient.get('/api/user');
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }

    if (!me?.authenticated) {
        window.location.href = 'login.html';
        return;
    }

    const email = me.user?.email || '';
    const name = me.user?.name || 'Użytkownik';
    const letter = email.trim().charAt(0).toUpperCase() || '?';

    avEl.textContent = letter;
    emailEl.textContent = email || '—';
    nameEl.textContent = name;

    btn.addEventListener('click', async () => {
        msgEl.textContent = '';
        try {
            await apiClient.post('/api/logout', {});
            msgEl.style.color = 'green';
            msgEl.textContent = 'Wylogowano.';
            setTimeout(() => (window.location.href = 'index.html'), 400);
        } catch (e) {
            msgEl.style.color = 'red';
            msgEl.textContent = e?.message || 'Błąd wylogowania';
        }
    });
});
