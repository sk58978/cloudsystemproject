import apiClient from "../api/apiClient.js";

/* ===================== HTML (AUTO-INJECT) ===================== */

const LOGIN_HTML = `
<div id="loginModal" class="modal hidden" aria-hidden="true">
  <div class="modal-backdrop" data-close="login"></div>

  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
  <button type="button" class="modal-close" data-close-btn="login" aria-label="Zamknij">✕</button>

    <h2 id="loginTitle">Zaloguj się</h2>
    <p class="muted">Zaloguj się, aby przejść do koszyka i profilu.</p>

    <div id="loginMsg" class="msg"></div>

    <form id="loginModalForm">
      <label>Email
        <input type="email" name="email" required autocomplete="email">
      </label>

      <label>Hasło
        <input type="password" name="password" required autocomplete="current-password">
      </label>

      <button class="btn-primary" type="submit">Zaloguj</button>

      <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px;">
        <a href="#" id="openRegisterLink">Załóż konto</a>
      </div>
    </form>
  </div>
</div>
`;

const REGISTER_HTML = `
<div id="registerModal" class="modal hidden" aria-hidden="true">
  <div class="modal-backdrop" data-close="register"></div>

  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="registerTitle">
  <button type="button" class="modal-close" data-close-btn="register" aria-label="Zamknij">✕</button>

    <h2 id="registerTitle">Rejestracja</h2>
    <p class="muted">Utwórz konto. Hasło musi być wpisane 2 razy.</p>

    <div id="registerMsg" class="msg"></div>

    <form id="registerModalForm">
      <label>Email
        <input type="email" name="email" required autocomplete="email">
      </label>

      <label>Hasło
        <input type="password" name="password" required autocomplete="new-password" minlength="4">
      </label>

      <label>Powtórz hasło
        <input type="password" name="password2" required autocomplete="new-password" minlength="4">
      </label>

      <button class="btn-primary" type="submit">Utwórz konto</button>

      <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px;">
        <a href="#" id="openLoginLink">Mam konto – zaloguj</a>
      </div>
    </form>
  </div>
</div>
`;

/* ===================== Helpers ===================== */

function ensureModalsExist() {
  if (!document.getElementById("loginModal")) {
    document.body.insertAdjacentHTML("beforeend", LOGIN_HTML);
  }
  if (!document.getElementById("registerModal")) {
    document.body.insertAdjacentHTML("beforeend", REGISTER_HTML);
  }
}

function showMsg(id, text, type = "err") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = "msg";
  if (type === "ok") el.classList.add("ok");
  if (type === "err") el.classList.add("err");
  el.textContent = text || "";
}

function openModal(which) {
  ensureModalsExist();

  const login = document.getElementById("loginModal");
  const reg   = document.getElementById("registerModal");

  // zamknij oba (twardo)
  [login, reg].forEach(m => {
    if (!m) return;
    m.classList.add("hidden");
    m.setAttribute("aria-hidden", "true");
  });

  document.body.classList.add("modal-open");

  if (which === "register") {
    if (reg) {
      reg.classList.remove("hidden");
      reg.setAttribute("aria-hidden", "false");
      showMsg("registerMsg", "");
      reg.querySelector('input[name="email"]')?.focus();
    }
  } else {
    if (login) {
      login.classList.remove("hidden");
      login.setAttribute("aria-hidden", "false");
      showMsg("loginMsg", "");
      login.querySelector('input[name="email"]')?.focus();
    }
  }
}


function closeModal(which) {
  const modal = document.getElementById(which === "register" ? "registerModal" : "loginModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  const loginHidden = document.getElementById("loginModal")?.classList.contains("hidden");
  const regHidden   = document.getElementById("registerModal")?.classList.contains("hidden");
  if (loginHidden && regHidden) document.body.classList.remove("modal-open");
}

function bindOnce() {
  const login = document.getElementById("loginModal");
  const reg = document.getElementById("registerModal");

  if (login && login.dataset.bound !== "1") {
    login.dataset.bound = "1";

login.querySelector(".modal-close")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeModal("login");
});

login.querySelector(".modal-backdrop")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeModal("login");
});

    login.querySelector("#openRegisterLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("register");
      bindOnce();
    });

    const form = document.getElementById("loginModalForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMsg("loginMsg", "");

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      try {
        await apiClient.post("/api/login", data);
        showMsg("loginMsg", "Zalogowano ✅", "ok");
        setTimeout(() => {
          closeModal("login");
          window.location.reload();
        }, 250);
      } catch (err) {
        showMsg("loginMsg", err?.message || "Błąd logowania", "err");
      }
    });
  }

  if (reg && reg.dataset.bound !== "1") {
    reg.dataset.bound = "1";

    reg.querySelector('[data-close-btn="register"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal("register");
    });

    reg.querySelector('[data-close="register"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal("register");
    });

    reg.querySelector("#openLoginLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("login");
      bindOnce();
    });

    const form = document.getElementById("registerModalForm");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMsg("registerMsg", "");

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      const pass = String(data.password || "");
      const pass2 = String(data.password2 || "");

      if (pass.length < 4) {
        showMsg("registerMsg", "Hasło jest za krótkie (min 4 znaki).", "err");
        return;
      }
      if (pass !== pass2) {
        showMsg("registerMsg", "Hasła nie są takie same.", "err");
        return;
      }

      // wysyłamy tylko to, co backend rozumie
	const payload = {
	  email: String(data.email || "").trim(),
	  password: pass,
	};

      try {
        await apiClient.post("/api/register", payload);
        showMsg("registerMsg", "Konto utworzone ✅ Teraz zaloguj się.", "ok");

        setTimeout(() => {
          openModal("login");
          bindOnce();
          // opcjonalnie: wstępnie wypełnij email
          const emailInput = document.querySelector("#loginModalForm input[name='email']");
          if (emailInput) emailInput.value = payload.email;
        }, 400);
      } catch (err) {
        showMsg("registerMsg", err?.message || "Błąd rejestracji", "err");
      }
    });
  }

}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal("login");
    closeModal("register");
  }
});

/* ===================== Boot ===================== */

function bootLoginModals() {
  ensureModalsExist();
  bindOnce();

  // eventy globalne
  window.addEventListener("open-login-modal", () => { openModal("login"); bindOnce(); });
  window.addEventListener("open-register-modal", () => { openModal("register"); bindOnce(); });

  // przechwyć stare linki
  document.addEventListener("click", (e) => {
    const aLogin = e.target.closest('a[href="login.html"]');
    if (aLogin) { e.preventDefault(); openModal("login"); bindOnce(); }

    const aReg = e.target.closest('a[href="register.html"]');
    if (aReg) { e.preventDefault(); openModal("register"); bindOnce(); }
  });

  // klik w auth-link: jeśli niezalogowany -> login modal
  const authLink = document.getElementById("auth-link");
  if (authLink && authLink.dataset.bound !== "1") {
    authLink.dataset.bound = "1";
    authLink.addEventListener("click", async (e) => {
      try {
        const me = await apiClient.get("/api/user");
        if (me?.authenticated) return;
      } catch {}
      e.preventDefault();
      openModal("login");
      bindOnce();
    });
  }

  // debug na 1 raz:
  console.log("BOOT OK", {
    readyState: document.readyState,
    loginExists: !!document.getElementById("loginModal"),
    loginBound: document.getElementById("loginModal")?.dataset.bound,
    regBound: document.getElementById("registerModal")?.dataset.bound,
  });
}

// ważne: jeśli DOM już gotowy -> odpal od razu
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootLoginModals);
} else {
  bootLoginModals();
}

console.log("login modal exists:", !!document.getElementById("loginModal"));
console.log("login bound:", document.getElementById("loginModal")?.dataset.bound);
