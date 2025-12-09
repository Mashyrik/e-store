// static/js/services/api.service.js - ОБНОВЛЕННАЯ ВЕРСИЯ

class ApiService {
    static API_BASE_URL = 'http://localhost:8080/api'; // 🔥 Убедитесь, что порт совпадает с Spring Boot

    static async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        // Добавляем JWT токен если требуется авторизация
        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                throw new Error('Требуется аутентификация');
            }
        }

        const config = {
            method: method,
            headers: headers,
            mode: 'cors', // Важно для CORS
            credentials: 'same-origin'
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        console.log(`📡 API Request: ${method} ${url}`, config);

        try {
            const response = await fetch(url, config);
            
            // Логируем ответ для отладки
            console.log(`📡 API Response: ${response.status} ${response.statusText}`);

            // Если статус 401/403 - удаляем токен
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                throw new Error('Сессия истекла');
            }

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Не JSON ответ
                }
                throw new Error(errorMessage);
            }

            // Для пустых ответов (204 No Content)
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    // Вспомогательные методы
    static get(endpoint, requiresAuth = false) {
        return this.request(endpoint, 'GET', null, requiresAuth);
    }

    static post(endpoint, data, requiresAuth = false) {
        return this.request(endpoint, 'POST', data, requiresAuth);
    }

    static put(endpoint, data, requiresAuth = false) {
        return this.request(endpoint, 'PUT', data, requiresAuth);
    }

    static delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'DELETE', null, requiresAuth);
    }
}

window.ApiService = ApiService;