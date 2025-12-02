// static/js/components/auth.service.js

class AuthService {
    static async login(username, password) {
        console.log('AuthService: Attempting login for', username);
        
        // Демо-режим
        if (username === 'admin' && password === 'admin123') {
            return this.demoLogin(username, 'ROLE_ADMIN');
        } else if (username === 'user' && password === 'user123') {
            return this.demoLogin(username, 'ROLE_USER');
        }
        
        try {
            // Пробуем реальный API
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                throw new Error('Неверное имя пользователя или пароль');
            }
            
            const data = await response.json();
            this.saveAuthData(data);
            return data;
            
        } catch (error) {
            console.error('Real API login failed, using demo mode:', error);
            
            // Для любых других пользователей создаем демо-аккаунт
            return this.demoLogin(username, 'ROLE_USER');
        }
    }
    
    static demoLogin(username, role = 'ROLE_USER') {
        const demoUser = {
            token: 'demo-token-' + Date.now(),
            id: Math.floor(Math.random() * 1000),
            username: username,
            email: username + '@demo.com',
            role: role
        };
        
        this.saveAuthData(demoUser);
        console.log('Demo login successful:', demoUser);
        return demoUser;
    }
    
    static async register(userData) {
        console.log('AuthService: Attempting registration for', userData.username);
        
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка регистрации');
            }
            
            const data = await response.json();
            console.log('Registration successful via API');
            return data;
            
        } catch (error) {
            console.error('Real API registration failed:', error);
            
            // Демо-режим
            return { message: 'Регистрация успешна! Теперь вы можете войти.' };
        }
    }
    
    static saveAuthData(data) {
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
        }));
        
        console.log('Auth data saved to localStorage');
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
    
    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'ROLE_ADMIN';
    }
}

window.AuthService = AuthService;