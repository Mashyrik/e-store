// =================================================================
// 🚨 ВАЖНО: Убедитесь, что AuthService, ApiService, ProductService, CartService
// подключены в index.html ДО этого файла!
// =================================================================

// =================================================================
// ГЛОБАЛЬНАЯ КОРЗИНА (Обновлена для работы с API)
// =================================================================
let cart = {
    items: [],

    // Инициализация (Асинхронная)
    async init() {
        if (Auth.isLoggedIn()) {
            await this.loadFromServer();
        } else {
            this.loadLocal();
        }
        this.updateCount();
    },

    // Загрузка локальной версии
    loadLocal() {
        try {
            const saved = localStorage.getItem('estore_cart');
            this.items = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.items = [];
        }
    },

    // Загрузка с сервера (Требует CartService)
    async loadFromServer() {
        try {
            const serverCart = await CartService.getCart();
            // Предполагаем, что сервер возвращает объект { items: [...] }
            this.items = serverCart.items || [];
            this.saveLocal(); // Сохраняем актуальную серверную версию локально
        } catch (error) {
            // Если не удалось загрузить с сервера (например, 404/пустая), используем локальную
            console.warn('Не удалось загрузить корзину с сервера. Используется локальная версия.', error);
            this.loadLocal();
        }
    },

    // Сохранение в localStorage
    saveLocal() {
        try {
            localStorage.setItem('estore_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    },

    // Очистка локальной корзины (для выхода из системы)
    clearLocal() {
        this.items = [];
        this.saveLocal();
        this.updateCount();
    },

    // Добавление товара (Асинхронная)
    async add(product, quantity = 1) {
        if (Auth.isLoggedIn()) {
            try {
                // Отправка на сервер
                await CartService.updateItem(product.id, quantity);
                await this.loadFromServer(); // Перезагружаем корзину
                this.showNotification(`"${product.name}" добавлен в корзину (API)!`);
                this.updateCount();
                return;
            } catch (error) {
                this.showNotification(`Ошибка API: ${error.message || 'не удалось добавить товар'}`, false);
                return;
            }
        }

        // Локальная логика для неавторизованных (ваш старый код)
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                model: product.model || '',
                category: product.category || '',
                quantity: quantity
            });
        }
        this.saveLocal();
        this.updateCount();
        this.showNotification(`"${product.name}" добавлен в корзину (Локально)!`);
    },

    // Удаление товара (Асинхронная)
    async remove(productId) {
        if (Auth.isLoggedIn()) {
            try {
                await CartService.removeItem(productId);
                await this.loadFromServer();
            } catch (error) {
                this.showNotification(`Ошибка удаления API: ${error.message}`, false);
            }
        } else {
            this.items = this.items.filter(item => item.id !== productId);
            this.saveLocal();
        }
        this.updateCount();
    },

    // Обновление количества (Асинхронная)
    async updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            await this.remove(productId);
            return;
        }

        if (Auth.isLoggedIn()) {
            try {
                await CartService.updateItem(productId, newQuantity);
                await this.loadFromServer();
            } catch (error) {
                this.showNotification(`Ошибка обновления API: ${error.message}`, false);
            }
        } else {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveLocal();
                this.updateCount();
            }
        }
    },

    // Очистка корзины (Асинхронная)
    async clear() {
        if (Auth.isLoggedIn()) {
            try {
                // 💡 Попробуем вызвать специальный эндпоинт очистки
                await CartService.clearCart();
                await this.loadFromServer();
            } catch(error) {
                // ⚠️ Если нет эндпоинта clear, удаляем все по одному
                console.warn('ClearCart failed. Attempting to delete items one by one.');
                try {
                    for (const item of [...this.items]) {
                        await CartService.removeItem(item.id);
                    }
                    await this.loadFromServer();
                } catch (e) {
                    this.showNotification(`Ошибка очистки корзины: ${e.message}`, false);
                }
            }
        } else {
            this.clearLocal();
        }
        this.updateCount();
    },

    // Получение общей суммы (Остается синхронным)
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Обновление счетчика (Остается синхронным)
    updateCount() {
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const counter = document.getElementById('cartCount');

        if (counter) {
            counter.textContent = total;
            counter.style.display = total > 0 ? 'inline-block' : 'none';
        }
    },

    // Показ уведомления (Остается синхронным)
    showNotification(message, isSuccess = true) {
        console.log('📦', message);
        // ... (код для отображения уведомления)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: ${isSuccess ? '#27ae60' : '#e74c3c'};
            color: white; padding: 10px 20px; border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: opacity 0.3s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// =================================================================
// СИСТЕМА АУТЕНТИФИКАЦИИ (Обновлена для работы с AuthService)
// =================================================================
const Auth = {
    currentUser: null,

    init() {
        this.loadUser();
        this.updateAuthUI();
    },

    // Загрузка пользователя (с проверкой токена)
    loadUser() {
        try {
            const savedUser = localStorage.getItem('estore_user');
            const token = localStorage.getItem('estore_token');
            this.currentUser = savedUser ? JSON.parse(savedUser) : null;

            // Если сессия неполная, сбрасываем ее
            if ((this.currentUser && !token) || (!this.currentUser && token)) {
                this.logout();
                return null;
            }
            return this.currentUser;
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            this.currentUser = null;
            return null;
        }
    },

    // Сохранение пользователя и токена
    saveSession(user, token) {
        try {
            localStorage.setItem('estore_token', token);
            localStorage.setItem('estore_user', JSON.stringify(user));
            this.currentUser = user;
            this.updateAuthUI();
            return true;
        } catch (error) {
            console.error('Ошибка сохранения сессии:', error);
            return false;
        }
    },

    // Выход (Очистка токена)
    logout() {
        this.currentUser = null;
        localStorage.removeItem('estore_user');
        localStorage.removeItem('estore_token');
        cart.clearLocal();
        this.updateAuthUI();
        alert('Вы вышли из системы');
        window.location.hash = '#home';
    },

    // Регистрация (Через AuthService)
    async register(email, password, name) {
        return await AuthService.register(email, password, name);
    },

    // Вход (Через AuthService)
    async login(email, password) {
        const result = await AuthService.login(email, password);

        if (result.success) {
            this.saveSession(result.user, result.token); // Сохраняем токен и данные
            await cart.loadFromServer(); // Загружаем серверную корзину после входа
        }
        return result;
    },

    // Обновление UI
    updateAuthUI() {
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const userGreet = document.getElementById('userGreet');

        if (loginLink && logoutBtn) {
            if (this.currentUser) {
                loginLink.style.display = 'none';
                logoutBtn.style.display = 'block';
                if (userGreet) {
                    userGreet.textContent = `Привет, ${this.currentUser.name || this.currentUser.email.split('@')[0]}!`;
                    userGreet.style.display = 'block';
                }
            } else {
                loginLink.style.display = 'block';
                logoutBtn.style.display = 'none';
                if (userGreet) userGreet.style.display = 'none';
            }
        }
    },

    // Проверка авторизации
    isLoggedIn() {
        return this.currentUser !== null;
    },

    getUserName() {
        return this.currentUser ? (this.currentUser.name || this.currentUser.email) : 'Гость';
    }
};


// =================================================================
// ОСНОВНОЕ ПРИЛОЖЕНИЕ (App)
// =================================================================
const App = {
    productsFromServer: [], // Хранилище для данных с API
    currentPage: 1,
    pageSize: 8,
    filteredProducts: [],
    currentCategory: null,
    authMode: 'login',

    // Мок-данные для аварийного режима
    getMockProducts() {
        return [
            { id: 1, name: 'iPhone 15 Pro', price: 99990, model: 'A2848', stockQuantity: 10, category: 'Смартфоны', icon: '📱' },
            { id: 2, name: 'Samsung Galaxy S24', price: 89990, model: 'SM-S921B', stockQuantity: 8, category: 'Смартфоны', icon: '📱' },
            { id: 3, name: 'MacBook Pro 16"', price: 180000, model: 'M3 Max', stockQuantity: 5, category: 'Ноутбуки', icon: '💻' },
            { id: 4, name: 'Sony PlayStation 5', price: 55000, model: 'CFI-1200A', stockQuantity: 0, category: 'Консоли', icon: '🎮' },
            { id: 5, name: 'Apple Watch Series 9', price: 42000, model: 'S9', stockQuantity: 15, category: 'Гаджеты', icon: '⌚' },
            { id: 6, name: 'Logitech MX Master 3S', price: 8500, model: 'MX Master', stockQuantity: 25, category: 'Аксессуары', icon: '🖱️' },
            { id: 7, name: 'Xiaomi 65" TV', price: 45000, model: 'MI-65', stockQuantity: 7, category: 'Телевизоры', icon: '📺' },
            { id: 8, name: 'JBL Charge 5', price: 12000, model: 'Charge 5', stockQuantity: 20, category: 'Аксессуары', icon: '🔊' }
        ];
    },

    // Асинхронная загрузка ВСЕХ данных (Требует ProductService)
    async loadAllData() {
        console.log('API: Попытка загрузки товаров...');
        try {
            this.productsFromServer = await ProductService.getAllProducts();
            console.log(`API: Загружено ${this.productsFromServer.length} товаров.`);

        } catch (error) {
            console.error('❌ Ошибка загрузки данных с API. Используются мок-данные.', error);
            this.productsFromServer = this.getMockProducts();
        }
        this.filteredProducts = [...this.productsFromServer];
    },

    // Инициализация
    async init() {
        console.log('🚀 E-Store запущен');

        // 1. Загружаем данные с API (или мок-данные)
        await this.loadAllData();

        // 2. Инициализируем авторизацию
        Auth.init();

        // 3. Инициализируем корзину (await, чтобы убедиться, что серверная корзина загружена)
        await cart.init();

        this.setupMenu();
        this.setupSearch();
        this.setupRouting();

        this.loadPage();
    },

    // ... (остальные методы setupMenu, setupSearch, handleSearch, setupRouting,
    // loadPage, loadHomePage, loadProductsPage, loadCartPage, loadAuthPage
    // остаются почти такими же, но используют this.productsFromServer и cart.add/remove/updateQuantity)

    // Добавление товара в корзину (Асинхронная)
    addProductToCart(productId) {
        const product = this.productsFromServer.find(p => p.id === productId);

        if (product) {
            // Вызываем асинхронный метод
            cart.add(product, 1).then(() => {
                // Если мы на странице корзины, обновляем ее
                if (window.location.hash === '#cart') {
                    this.loadPage();
                }
            });
        } else {
            cart.showNotification('Товар не найден', false);
        }
    },

    // Обработка входа (Асинхронная, использует Auth.login)
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('authMessage');

        messageEl.style.display = 'none';
        const result = await Auth.login(email, password); // 🔑 Используем Auth.login

        this.showAuthMessage(messageEl, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                window.location.hash = '#home';
            }, 1500);
        }
    },

    // Обработка регистрации (Асинхронная, использует Auth.register)
    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const messageEl = document.getElementById('authMessage');

        if (password !== confirmPassword) {
            this.showAuthMessage(messageEl, 'Пароли не совпадают', false);
            return;
        }

        messageEl.style.display = 'none';
        const result = await Auth.register(email, password, name); // 🔑 Используем Auth.register

        this.showAuthMessage(messageEl, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.authMode = 'login';
                this.loadPage(); // Переходим на страницу входа
            }, 2000);
        }
    },

    // Применение фильтров (использует this.productsFromServer)
    applyFilters() {
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        let filtered = [...this.productsFromServer]; // 💡 Исходные данные с сервера

        // ... (логика фильтрации и сортировки)
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const name = product.name ? product.name.toLowerCase() : '';
                const model = product.model ? product.model.toLowerCase() : '';
                return name.includes(query) || model.includes(query);
            });
        }

        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(product => product.category === categoryFilter.value);
        }

        if (sortFilter) {
            switch(sortFilter.value) {
                case 'price-asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                default:
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.loadPaginatedProducts();
    },

    // ... (все остальные вспомогательные методы: loadHomePage, loadProductsPage, etc.)

    // ⚠️ Остальные вспомогательные методы (loadHomePage, loadProductsPage, loadCartPage,
    // loadAuthPage, setupRouting, getProductIcon и т.д.) не меняются по логике и
    // должны быть скопированы из предыдущей версии файла app.js,
    // убедившись, что они используют this.productsFromServer и this.filteredProducts.

    // === Вспомогательные методы (для полноты) ===

    setupMenu() { /* ... */ },
    setupSearch() { /* ... */ },
    handleSearch() { /* ... */ },
    setupRouting() { /* ... */ },
    loadPage() { /* ... */ },
    loadHomePage(container) { /* ... */ },
    loadHomeProducts() { /* ... */ },
    loadProductsPage(container) { /* ... */ },
    loadCategoriesPage(container) { /* ... */ },
    loadAuthPage(container) { /* ... */ },
    loadLoginPage(container) { /* ... */ },
    loadRegisterPage(container) { /* ... */ },
    showAuthMessage(element, message, isSuccess) { /* ... */ },
    getCategoriesWithCount() { /* ... */ },
    getProductIcon(category) { /* ... */ },
    getProductWord(count) { /* ... */ },
    filterByCategory(category) { /* ... */ },
    clearCategoryFilter() { /* ... */ },
    loadPaginatedProducts() { /* ... */ },
    updatePagination(totalPages) { /* ... */ },
    updateStats() { /* ... */ },
    nextPage() { /* ... */ },
    prevPage() { /* ... */ }
    // ===========================================
};

// Запуск приложения
App.init();