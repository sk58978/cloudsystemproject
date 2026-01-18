class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Request failed with status ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, 'GET');
    }

    post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    }

    delete(endpoint, data = null) {
        return this.request(endpoint, 'DELETE', data);
    }
}

// Adjust this base URL if your server configuration differs
// Assuming XAMPP structure: localhost/projekt-marketplace/tworzenie/backend/public/index.php/api...
const apiClient = new ApiClient('/projekt-marketplace/tworzenie/backend/public/index.php/api');

export default apiClient;
