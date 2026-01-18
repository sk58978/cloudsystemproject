import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-detail');

    // Auth check
    try {
        const authData = await apiClient.get('/user');
        const authLink = document.getElementById('auth-link');
        if (authData.authenticated) {
            authLink.textContent = authData.user.name;
            authLink.href = 'profile.html';
        } else {
            authLink.textContent = 'Zaloguj się';
            authLink.href = 'login.html';
        }
    } catch (e) { }

    if (!productId) {
        container.innerHTML = '<p>Brak ID produktu.</p>';
        return;
    }

    try {
        const product = await apiClient.get(`/products/${productId}`);

        container.innerHTML = `
            <div style="display: flex; gap: 40px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px;">
                    <img src="${product.image_url || 'https://via.placeholder.com/400'}" alt="${product.name}" style="width: 100%; border-radius: 12px;">
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <h1 style="font-size: 32px; margin-bottom: 16px;">${product.name}</h1>
                    <p style="color: #666; font-weight: 700; margin-bottom: 8px;">Kategoria: ${product.category_name || 'Inne'}</p>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">${parseFloat(product.price).toFixed(2)} zł</div>
                    <p style="margin-bottom: 24px; line-height: 1.6;">${product.description || 'Brak opisu.'}</p>
                    
                    <button id="addToCartBtn" class="btn-primary" style="font-size: 16px; padding: 14px 24px;">Dodaj do koszyka</button>
                    <div id="msg" style="margin-top: 10px;"></div>
                </div>
            </div>
        `;

        // Logic for Add to Cart
        document.getElementById('addToCartBtn').addEventListener('click', async () => {
            const msg = document.getElementById('msg');
            try {
                // Call API (will work once Task 18 is done)
                await apiClient.post('/cart/add', { product_id: product.id, quantity: 1 });
                msg.style.color = 'green';
                msg.textContent = 'Dodano do koszyka!';
                // refresh cart count logic could go here later
            } catch (error) {
                console.error(error);
                msg.style.color = 'red';
                if (error.message.includes('401')) {
                    msg.innerHTML = 'Musisz się <a href="login.html">zalogować</a>.';
                } else {
                    msg.textContent = 'Błąd dodawania do koszyka (API not ready?)';
                }
            }
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Produkt nie został znaleziony.</p>';
    }
});
