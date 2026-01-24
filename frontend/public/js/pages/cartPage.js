import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const cartContainer = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');

  // 1) Auth check
  try {
    const authData = await apiClient.get('/api/user');
    if (!authData.authenticated) {
      localStorage.setItem("returnTo", window.location.pathname);
	window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }
  } catch {
    localStorage.setItem("returnTo", window.location.pathname);
	window.dispatchEvent(new CustomEvent("open-login-modal"));

    return;
  }

  // 2) Load cart
  await loadCart();

  async function loadCart() {
    try {
      const res = await apiClient.get('/api/cart'); // {items,total}
      const items = Array.isArray(res?.items) ? res.items : [];
      const total = Number(res?.total || 0);

      if (items.length === 0) {
        cartContainer.innerHTML = '<p>Twój koszyk jest pusty.</p>';
        totalSpan.textContent = '0.00';
        return;
      }

      cartContainer.innerHTML = items.map(item => `
        <div class="cart-item">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image_url || 'https://via.placeholder.com/50'}"
                 style="width:50px; height:50px; border-radius:4px; object-fit:cover;">
            <div>
              <div style="font-weight:700;">${item.name}</div>
              <div style="font-size:12px; color:#666;">
                ${Number(item.price).toFixed(2)} zł / szt
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="qty-btn" data-delta="-1" data-id="${item.product_id}">−</button>

            <input type="number"
                   min="1"
                   max="50"
                   value="${item.quantity}"
                   class="qty-input"
                   data-id="${item.product_id}"
                   style="width:50px; text-align:center;">

            <button class="qty-btn" data-delta="1" data-id="${item.product_id}">+</button>

            <!-- ✅ tu czytamy data-id -->
            <button class="btn-remove"
                    data-id="${item.product_id}"
                    style="color:red; background:none; border:none; text-decoration:underline; font-size:12px;">
              Usuń
            </button>
          </div>
        </div>
      `).join('');

      totalSpan.textContent = total.toFixed(2);

      // + / -
      document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          const delta = Number(btn.dataset.delta);

          const input = document.querySelector(`.qty-input[data-id="${productId}"]`);
          const newQty = Math.min(50, Math.max(1, Number(input.value) + delta));

          await updateQty(productId, newQty);
        });
      });

      // ręczna zmiana
      document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', async () => {
          const productId = input.dataset.id;
          const newQty = Math.min(50, Math.max(1, Number(input.value)));
          await updateQty(productId, newQty);
        });
      });

      // Remove
      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id; // ✅ to istnieje
          await removeItem(productId);
        });
      });

    } catch (error) {
      console.error(error);
      cartContainer.innerHTML = '<p>Błąd ładowania koszyka.</p>';
      totalSpan.textContent = '0.00';
    }
  }

  async function updateQty(productId, qty) {
    try {
      await apiClient.post('/api/cart/update', {
        product_id: Number(productId),
        qty: Number(qty),
      });
      await loadCart();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Nie udało się zmienić ilości');
    }
  }

  async function removeItem(productId) {
    try {
      await apiClient.post('/api/cart/remove', { product_id: Number(productId) });
      await loadCart();
    } catch (error) {
      console.error(error);
      alert('Nie udało się usunąć: ' + (error.message || error));
    }
  }
});
