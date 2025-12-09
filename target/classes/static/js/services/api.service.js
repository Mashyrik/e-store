// static/js/services/auth.service.js - ОБНОВЛЕННАЯ ВЕРСИЯ

class AuthService {
    /**
     * Вход пользователя
     */
    static async login(username, password) {
        try {
            const response = await ApiService.post('/auth/login', {
                username: username,
                password: password
            });

            // Сохраняем токен и данные пользователя
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    role: response.role
                }));
                
                console.log('✅ Login successful:', response);
                return { success: true, data: response };
            }
            
            throw new Error('Не получен токен');
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            return { 
                success: false, 
                message: error.message || 'Ошибка входа'
            };
        }
    }

    /**
     * Регистрация нового пользователя
     */
    static async register(userData) {
        try {
            const response = await ApiService.post('/auth/register', {
                username: userData.username,
                email: userData.email,
                password: userData.password
            });

            console.log('✅ Registration successful');
            return { success: true, message: 'Регистрация успешна!' };
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return { 
                success: false, 
                message: error.message || 'Ошибка регистрации'
            };
        }
    }

    /**
     * Выход
     */
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    /**
     * Проверка авторизации
     */
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    /**
     * Получить текущего пользователя
     */
    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Проверка роли администратора
     */
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
    }

    /**
     * Обновление UI в зависимости от авторизации
     */
    static updateAuthUI() {
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const user = this.getCurrentUser();

        if (loginLink && logoutBtn) {
            if (this.isAuthenticated()) {
                loginLink.style.display = 'none';
                logoutBtn.style.display = 'block';
                logoutBtn.textContent = `Выйти (${user?.username || 'Пользователь'})`;
            } else {
                loginLink.style.display = 'block';
                logoutBtn.style.display = 'none';
            }
        }

        // Показываем админские элементы если нужно
        if (this.isAdmin()) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    }
}

window.AuthService = AuthService;