export class ApiClient {
  constructor(base) {
    this.base = base; // np. "/backend/public/index.php"
  }

async request(path, options = {}) {
  const ts = Date.now();
  const [p, qs] = String(path).split("?", 2);
  const url = `${this.base}?route=${encodeURIComponent(p)}${qs ? `&${qs}` : ""}&_ts=${ts}`;


  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  // ✅ jeśli serwer zwrócił pustą odpowiedź (np. 204), nie parsuj JSON
  let data = null;
  if (text && text.trim() !== "") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`API is not JSON (HTTP ${res.status}). RAW: ${text.slice(0, 160)}`);
    }
  }

  if (!res.ok) {
    throw new Error((data && data.error) ? data.error : `HTTP ${res.status}`);
  }

  return data;
}

  get(path) {
    return this.request(path);
  }

  post(path, bodyObj) {
    return this.request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });
  }
}
const apiClient = new ApiClient('http://152.70.179.135/backend/public/index.php');
export default apiClient;
