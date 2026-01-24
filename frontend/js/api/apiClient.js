export class ApiClient {
    constructor(base) {
        this.base = base;
    }

    async request(path, options = {}) {
        const ts = Date.now();
        const [p, qs] = String(path).split("?", 2);

        const baseUrl = this.base.endsWith('/') ? this.base.slice(0, -1) : this.base;
        const pathWithSlash = p.startsWith('/') ? p : '/' + p;

        let url = `${baseUrl}${pathWithSlash}`;
        const symbol = url.includes('?') ? '&' : '?';
        url += `${symbol}_ts=${ts}`;

        if (qs) {
            url += `&${qs}`;
        }

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

const apiClient = new ApiClient('/projekt-marketplace/tworzenie/backend/public/index.php');
export default apiClient;
