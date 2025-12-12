// static/js/utils/app.js

/**
 * Главный класс приложения E-Store
 * Инициализирует все компоненты и управляет состоянием приложения
 */
class App {
    /**
     * Инициализация приложения
     */
    static async init() {
        console.log('🎉 E-Store App Initializing...');

        // Проверяем авторизацию пользователя
        this.checkAuth();

        // Скрываем кнопку корзины для админа
        this.hideCartForAdmin();

        // Инициализируем компоненты для текущей страницы
        await this.initComponents();

        // Настраиваем глобальные обработчики событий
        this.setupGlobalHandlers();

        console.log('✅ E-Store App Ready!');
    }

    /**
     * Проверяет авторизацию и обновляет UI
     */
    static checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        // Обновляем UI в зависимости от авторизации
        this.updateAuthUI(!!token);

        // Проверяем, нужно ли делать редирект
        this.redirectIfNeeded();
    }

    /**
     * Скрывает кнопку корзины для администраторов
     */
    static hideCartForAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'ROLE_ADMIN') {
                // Находим все ссылки на корзину
                const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href*="cart.html"]');
                let hiddenCount = 0;
                
                cartLinks.forEach(link => {
                    // Проверяем, что это ссылка в навигации (header/navbar)
                    // Исключаем ссылки внутри основного контента страницы
                    const isInNav = link.closest('.nav-links') || 
                                   link.closest('nav') || 
                                   link.closest('.navbar') || 
                                   (link.closest('header') && !link.closest('main'));
                    
                    if (isInNav) {
                        link.style.display = 'none';
                        hiddenCount++;
                    }
                });

                // Также скрываем счетчик корзины в навигации
                const cartCount = document.getElementById('cartCount');
                if (cartCount) {
                    const isInNav = cartCount.closest('.nav-links') || 
                                   cartCount.closest('nav') || 
                                   cartCount.closest('.navbar') || 
                                   (cartCount.closest('header') && !cartCount.closest('main'));
                    if (isInNav) {
                        cartCount.style.display = 'none';
                    }
                }

                if (hiddenCount > 0) {
                    console.log(`🛒 Скрыто ${hiddenCount} кнопок корзины для админа`);
                }
            } else {
                // Если пользователь не админ, показываем кнопки корзины обратно
                const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href*="cart.html"]');
                cartLinks.forEach(link => {
                    const isInNav = link.closest('.nav-links') || 
                                   link.closest('nav') || 
                                   link.closest('.navbar') || 
                                   (link.closest('header') && !link.closest('main'));
                    if (isInNav && link.style.display === 'none') {
                        link.style.display = '';
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка при скрытии корзины для админа:', error);
        }
    }

    /**
     * Обновляет элементы UI связанные с авторизацией
     * @param {boolean} isAuthenticated - Авторизован ли пользователь
     */
    static updateAuthUI(isAuthenticated) {
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileLinks = document.querySelectorAll('[href="profile.html"]');

        if (isAuthenticated) {
            // Пользователь авторизован - показываем кнопку выхода
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
            }

            // Обновляем текст ссылок на профиль
            profileLinks.forEach(link => {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                link.textContent = user.username || 'Профиль';
            });

            // Скрываем корзину для админа
            this.hideCartForAdmin();
        } else {
            // Пользователь не авторизован - показываем кнопку входа
            if (loginLink) {
                loginLink.style.display = 'block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }

    /**
     * Проверяет и выполняет редиректы если нужно
     */
    static redirectIfNeeded() {
        const currentPage = window.location.pathname;
        const isAuthenticated = !!localStorage.getItem('token');

        // Страница профиля без авторизации → логин
        if (currentPage.includes('profile.html') && !isAuthenticated) {
            console.log('⚠️ Неавторизованный доступ к профилю, редирект на логин');
            window.location.href = 'login.html';
        }

        // Страница админки без прав админа → профиль
        if (currentPage.includes('admin.html') && isAuthenticated) {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            if (user.role !== 'ROLE_ADMIN') {
                console.log('⚠️ Недостаточно прав для админ-панели, редирект на профиль');
                window.location.href = 'profile.html';
            }
        }
    }

    /**
     * Инициализирует компоненты для текущей страницы
     */
    static async initComponents() {
        // Определяем на какой странице мы находимся
        const page = this.getCurrentPage();

        console.log(`📄 Текущая страница: ${page}`);

        switch (page) {
            case 'profile':
                // Инициализируем компонент профиля
                if (typeof ProfileComponent !== 'undefined') {
                    console.log('👤 Инициализация ProfileComponent');
                    await ProfileComponent.init();
                } else {
                    console.warn('⚠️ ProfileComponent не найден');
                }
                break;

            case 'admin':
                // Инициализируем админ-панель
                if (typeof AdminComponent !== 'undefined') {
                    console.log('👑 Инициализация AdminComponent');
                    await AdminComponent.init();
                } else {
                    console.warn('⚠️ AdminComponent не найден');
                }
                break;

            case 'login':
                // Для страницы логина компонент уже инициализирован
                console.log('🔐 Страница логина');
                break;

            default:
                // Для главной страницы и каталога
                console.log('🏠 Главная страница или каталог');

                // Инициализируем компонент товаров
                if (typeof ProductsComponent !== 'undefined') {
                    console.log('📦 Инициализация ProductsComponent');
                    await ProductsComponent.init();
                }

                // Инициализируем компонент категорий
                if (typeof CategoriesComponent !== 'undefined') {
                    console.log('📁 Инициализация CategoriesComponent');
                    await CategoriesComponent.init();
                }
        }
    }

    /**
     * Определяет текущую страницу по URL
     * @returns {string} Имя страницы
     */
    static getCurrentPage() {
        const path = window.location.pathname;

        if (path.includes('profile.html')) return 'profile';
        if (path.includes('admin.html')) return 'admin';
        if (path.includes('login.html')) return 'login';
        return 'home';
    }

    /**
     * Настраивает глобальные обработчики событий
     */
    static setupGlobalHandlers() {
        console.log('⚙️ Настройка глобальных обработчиков');

        // Глобальная кнопка выхода (обработка кликов)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });

        // Обновляем количество товаров в корзине
        this.updateCartCount();

        // Проверка онлайн статуса
        window.addEventListener('online', () => {
            this.showNotification('✅ Соединение восстановлено', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('⚠️ Нет подключения к интернету', 'warning');
        });

        // Автоматически обновляем корзину при изменениях
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.updateCartCount();
            }
        });
    }

    /**
     * Выход из системы
     */
    static logout() {
        console.log('🚪 Выход из системы');

        // Удаляем данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Показываем уведомление
        this.showNotification('Вы вышли из системы', 'info');

        // Через секунду делаем редирект на страницу логина
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    /**
     * Обновляет счетчик товаров в корзине
     */
    static updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (!cartCount) return;

        try {
            // Получаем корзину из localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Считаем общее количество товаров
            const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

            // Обновляем UI
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'inline-block' : 'none';

            console.log(`🛒 Товаров в корзине: ${count}`);
        } catch (error) {
            console.error('❌ Ошибка при обновлении корзины:', error);
        }
    }

    /**
     * Показывает уведомление
     * @param {string} message - Текст сообщения
     * @param {string} type - Тип уведомления (success, error, warning, info)
     */
    static showNotification(message, type = 'info') {
        console.log(`📢 Уведомление [${type}]: ${message}`);

        // Пробуем использовать уведомление из ProfileComponent
        if (typeof ProfileComponent !== 'undefined' && ProfileComponent.showNotification) {
            ProfileComponent.showNotification(message, type);
            return;
        }

        // Пробуем использовать уведомление из AdminComponent
        if (typeof AdminComponent !== 'undefined' && AdminComponent.showNotification) {
            AdminComponent.showNotification(message, type);
            return;
        }

        // Если нет специализированной системы - используем alert
        console.warn('⚠️ Система уведомлений не найдена, использую alert');
        alert(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Форматирует цену в российский формат
     * @param {number} price - Цена
     * @returns {string} Отформатированная цена
     */
    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' BYN';
    }

    /**
     * Возвращает тестовые товары для демо
     */
    static getMockProducts() {
        return [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 99990,
                category: 'Смартфоны',
                stock: 15,
                model: 'A2848',
                description: 'Новейший смартфон от Apple'
            },
            {
                id: 2,
                name: 'Samsung Galaxy S24',
                price: 89990,
                category: 'Смартфоны',
                stock: 22,
                model: 'SM-S921B',
                description: 'Флагманский смартфон от Samsung'
            },
            {
                id: 3,
                name: 'MacBook Air M2',
                price: 129990,
                category: 'Ноутбуки',
                stock: 8,
                model: 'M2',
                description: 'Ультратонкий ноутбук от Apple'
            },
            {
                id: 4,
                name: 'Sony WH-1000XM5',
                price: 29990,
                category: 'Аудиотехника',
                stock: 45,
                model: 'WH-1000XM5',
                description: 'Беспроводные наушники с шумоподавлением'
            }
        ];
    }

    /**
     * Показывает/скрывает спиннер загрузки
     * @param {boolean} show - Показать спиннер
     */
    static toggleLoading(show = true) {
        const body = document.body;
        if (show) {
            body.classList.add('loading');
        } else {
            body.classList.remove('loading');
        }
    }

    /**
     * Выполняет запрос к API с обработкой ошибок
     * @param {string} url - URL API
     * @param {object} options - Опции fetch
     * @returns {Promise} Результат запроса
     */
    static async fetchAPI(url, options = {}) {
        try {
            this.toggleLoading(true);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('❌ Ошибка API запроса:', error);
            this.showNotification('Ошибка подключения к серверу', 'error');
            throw error;
        } finally {
            this.toggleLoading(false);
        }
    }
}

/**
 * Инициализация приложения когда DOM загружен
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализация App...');
    App.init();
    // Дополнительно скрываем корзину для админа после загрузки DOM
    // (на случай если навигация загружается динамически)
    App.hideCartForAdmin();
});

/**
 * Делаем App доступным глобально
 */
window.App = App;

console.log('📦 App module loaded');