// js/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
    static async request(endpoint, options = {}) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            console.log(`API Request: ${endpoint}`, options);
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            console.log(`API Response status: ${response.status}`);
            
            // Если ответ 204 (No Content), возвращаем null
            if (response.status === 204) {
                return null;
            }
            
            // Пробуем распарсить JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
            
            if (!response.ok) {
                const error = data?.message || `HTTP ${response.status}`;
                throw new Error(error);
            }
            
            return data;
            
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Экспортируем для использования
window.ApiService = ApiService;