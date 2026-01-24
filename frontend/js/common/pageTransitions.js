function ensureOverlay(){
  let el = document.querySelector(".page-overlay");
  if (!el) {
    el = document.createElement("div");
    el.className = "page-overlay";
    document.body.appendChild(el);
  }
  return el;
}

function isSameOriginLink(a){
  if (!a || !a.href) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.hash && url.pathname === location.pathname) return false; // anchor w tej samej stronie
  return true;
}

function bootTransitions(){
  document.documentElement.classList.add("is-entering");
  setTimeout(() => document.documentElement.classList.remove("is-entering"), 260);

  const overlay = ensureOverlay();

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;

  // 1) linki, które mają otwierać modal – NIE rób transition
  const hrefAttr = (a.getAttribute("href") || "").trim();
  if (
    a.id === "auth-link" ||
    hrefAttr === "login.html" ||
    hrefAttr === "register.html" ||
    a.hasAttribute("data-no-transition")
  ) {
    return;
  }

  if (!isSameOriginLink(a)) return;

  // jeśli modal otwarty, nie rób page-transition
  if (document.body.classList.contains("modal-open")) return;

  e.preventDefault();
  overlay.classList.add("on");

  const href = a.href;
  setTimeout(() => { window.location.href = href; }, 180);
}, true);

  // formularze (GET) – opcjonalnie
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if ((form.method || "get").toLowerCase() !== "get") return;

    overlay.classList.add("on");
  }, true);

  // gdy user wraca (bfcache), schowaj overlay
  window.addEventListener("pageshow", () => overlay.classList.remove("on"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootTransitions);
} else {
  bootTransitions();
}
