import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');
    const productsContainer = document.getElementById('category-products');
    const title = document.getElementById('category-title');

    // Check auth
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

    if (!categoryId) {
        // Jeśli brak ID, pobierz wszystkie kategorie (widok listy kategorii)
        title.textContent = 'Wszystkie Kategorie';
        loadAllCategories(productsContainer);
        return;
    }

    // Load products for category
    try {
        const products = await apiClient.get(`/products?category_id=${categoryId}`);

        if (products && products.length > 0) {
            // Ustaw tytuł na podstawie pierwszego produktu (bo API zwraca category_name)
            if (products[0].category_name) {
                title.textContent = products[0].category_name;
            }

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
            title.textContent = 'Kategoria';
            productsContainer.innerHTML = '<p>Brak produktów w tej kategorii.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        productsContainer.innerHTML = '<p>Błąd ładowania produktów.</p>';
    }
});

async function loadAllCategories(container) {
    try {
        const categories = await apiClient.get('/categories');
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '16px';

        container.innerHTML = categories.map(cat => `
            <div class="category-pill" style="cursor: pointer;" onclick="window.location.href='category.html?id=${cat.id}'">
                <strong>${cat.name}</strong>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p>Brak kategorii.</p>';
    }
}
