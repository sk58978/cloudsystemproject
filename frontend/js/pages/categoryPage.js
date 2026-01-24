import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');
    const productsContainer = document.getElementById('category-products');
    const title = document.getElementById('category-title');

    // Auth check (simple update of header link)
    try {
        const authData = await apiClient.get('/api/user');
        const authLink = document.getElementById('auth-link');
        if (authLink && authData.authenticated) {
            authLink.textContent = authData.user.name;
            authLink.href = 'profile.html';
        }
    } catch (_) { }

    if (!categoryId) {
        title.textContent = 'Wszystkie Kategorie';
        await loadAllCategories(productsContainer);
        return;
    }

    // Load specific category products using backend filtering
    try {
        // First try to find category name (optional enhancement)
        const categories = await apiClient.get('/api/categories');
        const currentCat = categories.find(c => String(c.id) === String(categoryId));
        if (currentCat) {
            title.textContent = currentCat.name;
        }

        const products = await apiClient.get(`/api/products?category_id=${categoryId}`);

        if (products && products.length > 0) {
            productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
              <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}">
              <h3>${product.name}</h3>
              <div class="price">${parseFloat(product.price).toFixed(2)} zł</div>
              <button class="btn-primary" onclick="window.location.href='product.html?id=${product.id}'">
                Zobacz szczegóły
              </button>
            </div>
          `).join('');
        } else {
            productsContainer.innerHTML = '<p>Brak produktów w tej kategorii.</p>';
        }
    } catch (e) {
        console.error(e);
        productsContainer.innerHTML = '<p>Błąd ładowania produktów.</p>';
    }
});

async function loadAllCategories(container) {
    try {
        const categories = await apiClient.get('/api/categories');
        if (categories && categories.length > 0) {
            container.innerHTML = categories.map(cat => `
            <div class="category-pill" style="cursor:pointer; display:inline-block; margin:10px; padding:10px; background:#eee; border-radius:5px;" onclick="window.location.href='category.html?id=${cat.id}'">
                <strong>${cat.name}</strong>
            </div>
          `).join('');
        } else {
            container.innerHTML = '<p>Brak kategorii.</p>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Brak kategorii.</p>';
    }
}
