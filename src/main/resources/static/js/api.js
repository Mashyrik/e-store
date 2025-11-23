// js/api.js

const API_BASE = 'http://localhost:8080/api';

class ApiService {
    static async get(url) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE}${url}`, { headers });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async post(url, data) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async put(url, data) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async delete(url) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'DELETE',
                headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
}

// Сервисы для работы с API
const CategoryService = {
    async getAll() {
        return await ApiService.get('/categories');
    },
    
    async getById(id) {
        return await ApiService.get(`/categories/${id}`);
    }
};

const ProductService = {
    async getAll() {
        return await ApiService.get('/products');
    },
    
    async getById(id) {
        return await ApiService.get(`/products/${id}`);
    },
    
    async getByCategory(categoryId) {
        return await ApiService.get(`/products/category/${categoryId}`);
    },
    
    async search(query) {
        return await ApiService.get(`/products/search?query=${query}`);
    }
};

const AuthService = {
    async login(credentials) {
        return await ApiService.post('/auth/login', credentials);
    },
    
    async register(userData) {
        return await ApiService.post('/auth/register', userData);
    }
};

const OrderService = {
    async create(orderData) {
        return await ApiService.post('/orders', orderData);
    },
    
    async getByUser(userId) {
        return await ApiService.get(`/orders/user/${userId}`);
    },
    
    async getAll() {
        return await ApiService.get('/orders');
    }
};