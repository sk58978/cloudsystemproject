import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoriesContainer = document.getElementById('categories');

    // Check auth status for navbar
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
    } catch (e) {
        console.warn('Auth check failed', e);
    }

    // Load categories
    try {
        const categories = await apiClient.get('/categories');
        if (categories && categories.length > 0) {
            categoriesContainer.innerHTML = categories.map(cat => `
                <a href="category.html?id=${cat.id}" class="category-pill">
                    ${cat.name}
                </a>
            `).join('');
        } else {
            categoriesContainer.innerHTML = '<p>Brak kategorii</p>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }

    // Load products
    try {
        const products = await apiClient.get('/products');

        if (products && products.length > 0) {
            productsGrid.innerHTML = products.map(product => `
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
            productsGrid.innerHTML = '<p>Brak produktów.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Błąd ładowania produktów.</p>';
    }
});
