// js/app.js
class App {
    static async init() {
        console.log('App initializing...');
        
        // Инициализируем компоненты
        await this.initComponents();
        
        // Настраиваем маршрутизацию
        this.setupRouting();
        
        // Проверяем авторизацию
        this.checkAuth();
        
        console.log('App initialized');
    }
    
    static async initComponents() {
        // Инициализируем все компоненты
        const components = [
            { name: 'CategoriesComponent', condition: () => document.getElementById('categories-container') },
            { name: 'ProductsComponent', condition: () => document.getElementById('products-container') },
            { name: 'CartComponent', condition: () => document.getElementById('cart-container') }
        ];
        
        for (const component of components) {
            if (component.condition() && window[component.name] && window[component.name].init) {
                try {
                    await window[component.name].init();
                    console.log(`${component.name} initialized`);
                } catch (error) {
                    console.error(`Failed to initialize ${component.name}:`, error);
                }
            }
        }
    }
    
    static setupRouting() {
        // Обработка изменения hash в URL
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Обработка начального роута
        this.handleRoute();
        
        // Навигация по клику на ссылки
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                window.location.hash = route;
            }
        });
    }
    
    static handleRoute() {
        const hash = window.location.hash.substring(1);
        const route = hash || 'home';
        
        console.log('Route changed to:', route);
        
        // Скрываем все секции
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Показываем нужную секцию
        const targetSection = document.getElementById(route);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Инициализируем компоненты для этой страницы
            setTimeout(() => this.initComponents(), 100);
        }
    }
    
    static checkAuth() {
        const token = localStorage.getItem('token');
        const loginLink = document.getElementById('login-link');
        const profileLink = document.getElementById('profile-link');
        
        if (token) {
            // Пользователь авторизован
            if (loginLink) loginLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'inline-block';
        } else {
            // Пользователь не авторизован
            if (loginLink) loginLink.style.display = 'inline-block';
            if (profileLink) profileLink.style.display = 'none';
        }
    }
    
    // Вспомогательные методы
    static showLoading() {
        // Показать индикатор загрузки
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'block';
    }
    
    static hideLoading() {
        // Скрыть индикатор загрузки
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
    
    static async withLoading(callback) {
        this.showLoading();
        try {
            return await callback();
        } finally {
            this.hideLoading();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing App...');
    App.init();
});

// Экспортируем глобально
window.App = App;