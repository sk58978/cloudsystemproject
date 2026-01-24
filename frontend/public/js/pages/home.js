import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('products-grid');
  const categoriesContainer = document.getElementById('categories');
  const searchInput = document.getElementById('searchInput');

  function renderProducts(products) {
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
  }

  // SEARCH (debounce)
  let t = null;
  searchInput?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      try {
        const q = searchInput.value.trim();
        const url = q ? `/api/products?q=${encodeURIComponent(q)}` : `/api/products`;
        const products = await apiClient.get(url);
        renderProducts(products);
      } catch (e) {
        console.error('Search error:', e);
      }
    }, 250);
  });

  // Categories
  try {
    const categories = await apiClient.get('/api/categories');
    if (categories && categories.length > 0) {
      categoriesContainer.innerHTML = categories.map(cat => `
        <a href="category.html?id=${cat.id}" class="category-pill">${cat.name}</a>
      `).join('');
    } else {
      categoriesContainer.innerHTML = '<p>Brak kategorii</p>';
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  // Products init
  try {
    const products = await apiClient.get('/api/products');
    renderProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<p>Błąd ładowania produktów.</p>';
  }
});
