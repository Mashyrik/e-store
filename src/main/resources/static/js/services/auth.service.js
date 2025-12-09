// js/services/auth.service.js

class AuthService {

    /**
     * Регистрация нового пользователя (POST /api/auth/register)
     */
    static async register(email, password, name) {
        if (!email || !password || !name) {
            return { success: false, message: 'Все поля обязательны для заполнения' };
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password, name: name })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка регистрации');
            }

            return { success: true, message: 'Регистрация успешна! Теперь вы можете войти.' };

        } catch (error) {
            console.error('Ошибка регистрации через API:', error);
            return { success: false, message: error.message || 'Ошибка регистрации или сервер недоступен' };
        }
    }

    /**
     * Вход пользователя (POST /api/auth/login)
     */
    static async login(email, password) {
        if (!email || !password) {
            return { success: false, message: 'Введите email и пароль' };
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ВАЖНО: В бэкенде поле часто называется 'username'
                body: JSON.stringify({ username: email, password: password })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Неверные учетные данные');
            }

            const data = await response.json();

            // 2. Возвращаем токен и базовые данные пользователя
            const user = {
                id: data.id || email,
                email: email,
                name: data.name || email,
                role: data.role || 'USER'
            };

            return {
                success: true,
                message: 'Вход выполнен успешно!',
                token: data.token, // 🔑 Ключ для API
                user: user
            };

        } catch (error) {
            console.error('Ошибка входа через API:', error);
            return { success: false, message: error.message || 'Ошибка подключения к серверу' };
        }
    }
}

window.AuthService = AuthService;