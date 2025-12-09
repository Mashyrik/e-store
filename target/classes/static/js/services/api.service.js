// js/services/api.service.js

class ApiService {
    // Базовый URL для API
    static API_BASE_URL = '/api';

    /**
     * Универсальный метод для выполнения API-запросов
     * @param {string} endpoint - Конечная точка (например, /products)
     * @param {string} method - Метод HTTP (GET, POST, DELETE и т.д.)
     * @param {object|null} data - Тело запроса для POST/PUT
     * @param {boolean} requiresAuth - Требуется ли токен авторизации
     */
    static async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
        const url = `${ApiService.API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        // 🛡️ ДОБАВЛЕНИЕ JWT-ТОКЕНА
        if (requiresAuth) {
            // Используем 'estore_token', как мы договорились
            const token = localStorage.getItem('estore_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                // Если требуется авторизация, но токена нет - выбрасываем ошибку
                throw new Error('Требуется аутентификация. Токен отсутствует.');
            }
        }

        const config = {
            method: method,
            headers: headers
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);

        // ⚠️ Обработка ошибок авторизации/доступа
        if (response.status === 401 || response.status === 403) {
            console.error('API Error: Unauthorized or Forbidden. Logging out.');
            // Автоматический выход при недействительном токене
            if (typeof Auth !== 'undefined' && Auth.logout) {
                Auth.logout();
            }
            throw new Error('Сессия истекла или нет доступа');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Ошибка API: ${response.status}`);
        }

        try {
            // Пытаемся распарсить JSON. Если ответ пустой (например, 204 No Content),
            // возвращаем пустой объект.
            return await response.json();
        } catch (e) {
            return {};
        }
    }

    // Вспомогательные методы
    static get(endpoint, requiresAuth = false) {
        return this.request(endpoint, 'GET', null, requiresAuth);
    }

    static post(endpoint, data, requiresAuth = false) {
        return this.request(endpoint, 'POST', data, requiresAuth);
    }

    static delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'DELETE', null, requiresAuth);
    }

    static put(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, 'PUT', data, requiresAuth);
    }
}

// Делаем доступным глобально
window.ApiService = ApiService;