import apiClient from '../api/apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('id');
  const productsContainer = document.getElementById('category-products');
  const title = document.getElementById('category-title');

  // Auth (opcjonalnie)
  try {
    const authData = await apiClient.get('/api/user');
    const authLink = document.getElementById('auth-link');
    if (authLink) {
      if (authData.authenticated) {
        authLink.textContent = authData.user.name;
        authLink.href = 'profile.html';
      } else {
        authLink.textContent = 'Zaloguj się';
	authLink.href = "#";
	authLink.textContent = "Zaloguj";
	authLink.onclick = (e) => {
	  e.preventDefault();
	  window.dispatchEvent(new CustomEvent("open-login-modal"));
	};

      }
    }
  } catch (_) {}

  if (!categoryId) {
    title.textContent = 'Wszystkie Kategorie';
    await loadAllCategories(productsContainer);
    return;
  }

  // Produkty z kategorii (na razie filtr po stronie frontu)
  try {
    const products = await apiClient.get('/api/products');
    const filtered = (products || []).filter(p => String(p.category_id) === String(categoryId));

    if (filtered.length > 0) {
      productsContainer.innerHTML = filtered.map(product => `
        <div class="product-card">
          <img src="${product.image_url || '../assets/img/placeholder.svg'}" alt="${product.name}">
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
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '16px';

    container.innerHTML = (categories || []).map(cat => `
      <div class="category-pill" style="cursor:pointer" onclick="window.location.href='category.html?id=${cat.id}'">
        <strong>${cat.name}</strong>
      </div>
    `).join('') || '<p>Brak kategorii.</p>';
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>Brak kategorii.</p>';
  }
}
