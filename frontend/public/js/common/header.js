import apiClient from "../api/apiClient.js";

async function refreshHeader() {
  // ===== Avatar/Login link =====
  const authLink = document.getElementById("auth-link");
  if (authLink) {
    try {
      const me = await apiClient.get("/api/user");

      if (me?.authenticated && me?.user?.email) {
        const email = me.user.email;
        const letter = email.trim().charAt(0).toUpperCase() || "U";

        authLink.href = "profile.html";
        authLink.textContent = letter;
        authLink.classList.add("avatar");
        authLink.title = email;
      } else {
	authLink.href = "#";
	authLink.textContent = "Zaloguj";
	authLink.classList.remove("avatar");
	authLink.removeAttribute("title");

	authLink.onclick = (e) => {
	  e.preventDefault();
	  window.dispatchEvent(new CustomEvent("open-login-modal"));
	};
        authLink.textContent = "Zaloguj";
        authLink.classList.remove("avatar");
        authLink.removeAttribute("title");
      }
    } catch {
	authLink.href = "#";
	authLink.textContent = "Zaloguj";
	authLink.classList.remove("avatar");
	authLink.removeAttribute("title");

	authLink.onclick = (e) => {
	  e.preventDefault();
	  window.dispatchEvent(new CustomEvent("open-login-modal"));
	};

      authLink.classList.remove("avatar");
      authLink.removeAttribute("title");
    }
  }

  // ===== Cart count =====
  const el = document.getElementById("cart-count");
  if (!el) return;

  try {
    const me = await apiClient.get("/api/user");
    if (!me.authenticated) {
      el.textContent = "0";
      return;
    }

    const cart = await apiClient.get("/api/cart"); // {items,total}
    const items = Array.isArray(cart.items) ? cart.items : [];
    const count = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    el.textContent = String(count);
  } catch {
    el.textContent = "0";
  }
}

document.addEventListener("DOMContentLoaded", refreshHeader);
