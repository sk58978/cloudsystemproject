import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');

    // 1. Check Auth - Cart is protected
    try {
        const authData = await apiClient.get('/user');
        if (!authData.authenticated) {
            window.location.href = 'login.html';
            return;
        }
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Load Cart
    loadCart();

    async function loadCart() {
        try {
            const items = await apiClient.get('/cart');

            if (!items || items.length === 0) {
                cartContainer.innerHTML = '<p>Twój koszyk jest pusty.</p>';
                totalSpan.textContent = '0.00';
                return;
            }

            let total = 0;
            cartContainer.innerHTML = items.map(item => {
                const itemTotal = parseFloat(item.price) * item.quantity;
                total += itemTotal;
                return `
                    <div class="cart-item">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${item.image_url || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; border-radius:4px; object-fit:cover;">
                            <div>
                                <div style="font-weight:700;">${item.name}</div>
                                <div style="font-size:12px; color:#666;">${parseFloat(item.price).toFixed(2)} zł x ${item.quantity}</div>
                            </div>
                        </div>
                        <button class="btn-remove" data-id="${item.id}" style="color:red; background:none; border:none; text-decoration:underline; font-size:12px;">Usuń</button>
                    </div>
                `;
            }).join('');

            totalSpan.textContent = total.toFixed(2);

            // Bind Remove buttons
            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const itemId = e.target.dataset.id;
                    await removeItem(itemId);
                });
            });

        } catch (error) {
            console.error(error);
            cartContainer.innerHTML = '<p>Błąd ładowania koszyka.</p>';
        }
    }

    async function removeItem(itemId) {
        try {
            await apiClient.post('/cart/remove', { item_id: itemId });
            loadCart(); // Reload to refresh list and total
        } catch (error) {
            alert('Nie udało się usunąć: ' + error.message);
        }
    }
});
