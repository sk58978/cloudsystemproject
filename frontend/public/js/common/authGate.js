import apiClient from "../api/apiClient.js";

export async function requireAuthOrLoginModal() {
  try {
    const me = await apiClient.get("/api/user");
    if (me?.authenticated) return true;
  } catch {}

  // niezalogowany -> pokaż modal
  window.dispatchEvent(new Event("open-login-modal"));
  return false;
}
