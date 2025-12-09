// js/app.js - С АВТОРИЗАЦИЕЙ БЕЗ ПОЛОМОК

// Глобальная корзина
let cart = {
    items: [],
    
    // Инициализация
    init() {
        this.load();
        this.updateCount();
    },
    
    // Загрузка из localStorage
    load() {
        try {
            const saved = localStorage.getItem('estore_cart');
            this.items = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.items = [];
        }
    },
    
    // Сохранение в localStorage
    save() {
        try {
            localStorage.setItem('estore_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    },
    
    // Добавление товара
    add(product, quantity = 1) {
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
        
        this.save();
        this.updateCount();
        this.showNotification(`"${product.name}" добавлен в корзину!`);
    },
    
    // Удаление товара
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCount();
    },
    
    // Обновление количества
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.remove(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.save();
            this.updateCount();
        }
    },
    
    // Очистка корзины
    clear() {
        this.items = [];
        this.save();
        this.updateCount();
    },
    
    // Обновление счетчика
    updateCount() {
        const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const counter = document.getElementById('cartCount');
        
        if (counter) {
            counter.textContent = total;
            counter.style.display = total > 0 ? 'inline-block' : 'none';
        }
    },
    
    // Получение общей суммы
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    // Показ уведомления
    showNotification(message) {
        console.log('📦', message);
        alert(message);
    }
};

// Система аутентификации
const Auth = {
    // Текущий пользователь
    currentUser: null,
    
    // Инициализация
    init() {
        this.loadUser();
        this.updateAuthUI();
    },
    
    // Загрузка пользователя из localStorage
    loadUser() {
        try {
            const saved = localStorage.getItem('estore_user');
            this.currentUser = saved ? JSON.parse(saved) : null;
            return this.currentUser;
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            this.currentUser = null;
            return null;
        }
    },
    
    // Сохранение пользователя
    saveUser(user) {
        try {
            localStorage.setItem('estore_user', JSON.stringify(user));
            this.currentUser = user;
            this.updateAuthUI();
            return true;
        } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
            return false;
        }
    },
    
    // Выход
    logout() {
        this.currentUser = null;
        localStorage.removeItem('estore_user');
        this.updateAuthUI();
        alert('Вы вышли из системы');
        window.location.hash = '#home';
    },
    
    // Регистрация
    register(email, password, name) {
        // Проверяем данные
        if (!email || !password || !name) {
            return { success: false, message: 'Все поля обязательны для заполнения' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Пароль должен быть не менее 6 символов' };
        }
        
        // Проверяем email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Введите корректный email' };
        }
        
        // Проверяем, существует ли пользователь (демо-версия)
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            email: email,
            name: name,
            password: btoa(password), // В реальном приложении используйте хеширование!
            registrationDate: new Date().toISOString(),
            orders: []
        };
        
        // Сохраняем
        users.push(newUser);
        localStorage.setItem('estore_users', JSON.stringify(users));
        this.saveUser(newUser);
        
        return { success: true, message: 'Регистрация успешна!' };
    },
    
    // Вход
    login(email, password) {
        if (!email || !password) {
            return { success: false, message: 'Введите email и пароль' };
        }
        
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        // Проверяем пароль (демо-версия)
        if (btoa(password) !== user.password) {
            return { success: false, message: 'Неверный пароль' };
        }
        
        // Сохраняем сессию (без пароля)
        const { password: _, ...userWithoutPassword } = user;
        this.saveUser(userWithoutPassword);
        
        return { success: true, message: 'Вход выполнен успешно!' };
    },
    
    // Получение всех пользователей
    getUsers() {
        try {
            const users = localStorage.getItem('estore_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return [];
        }
    },
    
    // Обновление UI в зависимости от авторизации
    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        
        if (loginBtn && userMenu && userName) {
            if (this.currentUser) {
                loginBtn.style.display = 'none';
                userMenu.style.display = 'flex';
                userName.textContent = this.currentUser.name;
            } else {
                loginBtn.style.display = 'block';
                userMenu.style.display = 'none';
            }
        }
    },
    
    // Проверка авторизации
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // Получение имени пользователя
    getUserName() {
        return this.currentUser ? this.currentUser.name : 'Гость';
    }
};

// Основное приложение
const App = {
    // Демо-данные товаров
    demoProducts: [],
    
    // Переменные для пагинации
    currentPage: 1,
    pageSize: 8,
    filteredProducts: [],
    
    // Текущая выбранная категория
    currentCategory: null,
    
    // Режим страницы авторизации (login/register)
    authMode: 'login',
    
    // Инициализация
    init() {
        console.log('🚀 E-Store запущен');
        
        // Загружаем демо-данные
        this.loadDemoData();
        
        // Инициализируем корзину
        cart.init();
        
        // Инициализируем авторизацию
        Auth.init();
        
        // Настраиваем меню
        this.setupMenu();
        
        // Настраиваем поиск
        this.setupSearch();
        
        // Настраиваем роутинг
        this.setupRouting();
        
        // Загружаем текущую страницу
        this.loadPage();
    },
    
    // Настройка мобильного меню
    setupMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                console.log('🍔 Меню переключено');
            });
        }
        
        // Обработчик кнопки выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }
    },
    
    // Настройка поиска
    setupSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }
    },
    
    // Обработка поиска
    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (query) {
            window.location.hash = `#products`;
            // Устанавливаем поиск на странице товаров
            setTimeout(() => {
                const productSearch = document.getElementById('productSearch');
                if (productSearch) {
                    productSearch.value = query;
                    this.applyFilters();
                }
            }, 100);
        }
    },
    
    // Настройка роутинга
    setupRouting() {
        // Обработчик изменения hash
        window.addEventListener('hashchange', () => {
            console.log('📍 Hash изменился:', window.location.hash);
            this.loadPage();
        });
        
        // Обработчик кликов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addProductToCart(productId);
            }
            
            if (e.target.classList.contains('remove-from-cart')) {
                const productId = parseInt(e.target.dataset.productId);
                cart.remove(productId);
                this.loadPage();
            }
            
            if (e.target.id === 'clearCartBtn') {
                if (confirm('Очистить корзину?')) {
                    cart.clear();
                    this.loadPage();
                }
            }
            
            // Обработка кликов по категориям
            if (e.target.classList.contains('category-card') || 
                e.target.closest('.category-card')) {
                const categoryCard = e.target.classList.contains('category-card') 
                    ? e.target 
                    : e.target.closest('.category-card');
                const category = categoryCard.dataset.category;
                if (category) {
                    this.filterByCategory(category);
                }
            }
            
            if (e.target.classList.contains('view-all-category')) {
                const category = e.target.dataset.category;
                if (category) {
                    this.filterByCategory(category);
                }
            }
            
            // Обработка переключения режима авторизации
            if (e.target.id === 'switchToRegister' || e.target.classList.contains('switch-to-register')) {
                e.preventDefault();
                this.authMode = 'register';
                this.loadPage();
            }
            
            if (e.target.id === 'switchToLogin' || e.target.classList.contains('switch-to-login')) {
                e.preventDefault();
                this.authMode = 'login';
                this.loadPage();
            }
            
            // Обработка отправки форм
            if (e.target.id === 'loginSubmitBtn') {
                e.preventDefault();
                this.handleLogin();
            }
            
            if (e.target.id === 'registerSubmitBtn') {
                e.preventDefault();
                this.handleRegister();
            }
        });
    },
    
    // Загрузка страницы
    loadPage() {
        const hash = window.location.hash.slice(1) || 'home';
        const content = document.getElementById('pageContent');
        
        console.log('📄 Загрузка страницы:', hash);
        
        if (!content) {
            console.error('❌ Не найден pageContent');
            return;
        }
        
        try {
            switch(hash) {
                case 'home':
                    this.loadHomePage(content);
                    break;
                case 'products':
                    this.loadProductsPage(content);
                    break;
                case 'cart':
                    this.loadCartPage(content);
                    break;
                case 'categories':
                    this.loadCategoriesPage(content);
                    break;
                case 'login':
                    this.loadAuthPage(content);
                    break;
                default:
                    this.loadHomePage(content);
            }
        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            content.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <h2>Ошибка загрузки</h2>
                    <p>${error.message}</p>
                    <a href="#home" class="cta-button">На главную</a>
                </div>
            `;
        }
    },
    
    // Главная страница
    loadHomePage(container) {
        container.innerHTML = `
            <section class="hero">
                <div class="container">
                    <h1>Техника будущего уже сегодня</h1>
                    <p>Широкий выбор электроники, гаджетов и аксессуаров по лучшим ценам.</p>
                    <a href="#products" class="cta-button">Начать покупки</a>
                </div>
            </section>
            
            <section class="features">
                <div class="container">
                    <h2 class="section-title">Почему выбирают нас</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🚚</div>
                            <h3>Быстрая доставка</h3>
                            <p>Доставка за 24 часа. Бесплатно от 5000₽</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🛡️</div>
                            <h3>Гарантия качества</h3>
                            <p>Все товары проходят проверку</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">💳</div>
                            <h3>Удобная оплата</h3>
                            <p>Карты, онлайн-платежи, рассрочка</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="products-preview">
                <div class="container">
                    <h2 class="section-title">Популярные товары</h2>
                    <div class="products-grid" id="productsGrid">
                        <!-- Товары загружаются отдельно -->
                    </div>
                    <div style="text-align: center; margin-top: 2rem;">
                        <a href="#products" class="cta-button" style="background: #666;">Смотреть все товары</a>
                    </div>
                </div>
            </section>
        `;
        
        this.loadHomeProducts();
    },
    
    // Загрузка товаров на главную
    loadHomeProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        const products = this.demoProducts.slice(0, 6);
        
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 2.5rem;">
                    ${this.getProductIcon(product.category)}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${product.price.toLocaleString()} ₽</p>
                    <p class="product-model">${product.model}</p>
                    <p class="product-stock" style="${product.stockQuantity > 0 ? 'color: #27ae60;' : 'color: #e74c3c;'}">
                        ${product.stockQuantity > 0 ? `✓ В наличии: ${product.stockQuantity} шт.` : '✗ Нет в наличии'}
                    </p>
                    <button class="cta-button add-to-cart-btn" 
                            data-product-id="${product.id}"
                            style="width: 100%; margin-top: 1rem; padding: 0.8rem;"
                            ${product.stockQuantity === 0 ? 'disabled style="background: #ccc; cursor: not-allowed;"' : ''}>
                        ${product.stockQuantity === 0 ? 'Нет в наличии' : '🛒 В корзину'}
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Страница всех товаров
    loadProductsPage(container) {
        const categories = [...new Set(this.demoProducts.map(p => p.category))];
        
        container.innerHTML = `
            <section class="products-preview" style="padding: 4rem 0; min-height: 60vh;">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                        <h2 class="section-title" style="margin: 0;">
                            ${this.currentCategory ? `Товары: ${this.currentCategory}` : 'Все товары'}
                            ${this.currentCategory ? '<button onclick="App.clearCategoryFilter()" style="margin-left: 1rem; padding: 0.3rem 0.8rem; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Сбросить фильтр</button>' : ''}
                        </h2>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <input type="text" id="productSearch" placeholder="Поиск по названию..." 
                                   style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 5px; min-width: 200px;">
                            <select id="categoryFilter" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 5px;">
                                <option value="">Все категории</option>
                                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                            <select id="sortFilter" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 5px;">
                                <option value="name">По названию</option>
                                <option value="price-asc">По цене (дешевые)</option>
                                <option value="price-desc">По цене (дорогие)</option>
                            </select>
                            <button onclick="App.applyFilters()" style="padding: 0.5rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Применить
                            </button>
                        </div>
                    </div>
                    
                    <div class="products-grid" id="allProductsGrid">
                        <!-- Товары загружаются здесь -->
                    </div>
                    
                    <div style="text-align: center; margin-top: 3rem;">
                        <div style="display: inline-flex; gap: 1rem; align-items: center;">
                            <button onclick="App.prevPage()" style="padding: 0.8rem 1.5rem; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
                                ← Назад
                            </button>
                            <span style="padding: 0.8rem 1.5rem;">Страница <span id="currentPage">1</span> из <span id="totalPages">1</span></span>
                            <button onclick="App.nextPage()" style="padding: 0.8rem 1.5rem; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
                                Вперед →
                            </button>
                        </div>
                        <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                            Показано <span id="showingCount">0</span> из <span id="totalCount">0</span> товаров
                        </p>
                    </div>
                </div>
            </section>
        `;
        
        // Если выбрана категория, устанавливаем ее в фильтре
        if (this.currentCategory) {
            setTimeout(() => {
                const categoryFilter = document.getElementById('categoryFilter');
                if (categoryFilter) {
                    categoryFilter.value = this.currentCategory;
                }
            }, 100);
        }
        
        this.currentPage = 1;
        this.pageSize = 8;
        this.filteredProducts = this.currentCategory 
            ? this.demoProducts.filter(p => p.category === this.currentCategory)
            : [...this.demoProducts];
        
        this.loadPaginatedProducts();
        
        // Назначаем обработчики для фильтров
        setTimeout(() => {
            const searchInput = document.getElementById('productSearch');
            const categoryFilter = document.getElementById('categoryFilter');
            const sortFilter = document.getElementById('sortFilter');
            
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.applyFilters();
                });
            }
            
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => this.applyFilters());
            }
            
            if (sortFilter) {
                sortFilter.addEventListener('change', () => this.applyFilters());
            }
        }, 100);
    },
    
    // Страница категорий
    loadCategoriesPage(container) {
        const categories = this.getCategoriesWithCount();
        const popularProducts = this.demoProducts.slice(0, 4);
        
        container.innerHTML = `
            <section style="padding: 4rem 0;">
                <div class="container">
                    <h2 class="section-title" style="text-align: center; margin-bottom: 3rem;">Категории товаров</h2>
                    
                    <div style="text-align: center; margin-bottom: 3rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                        <p style="color: #666; font-size: 1.1rem;">
                            Выберите интересующую категорию электроники, чтобы посмотреть товары
                        </p>
                    </div>
                    
                    <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
                        ${categories.map(category => `
                            <div class="category-card" data-category="${category.name}" style="background: white; border-radius: 12px; padding: 2rem; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s ease; border: 2px solid transparent;" 
                                 onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='#667eea';" 
                                 onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='transparent';">
                                <div style="font-size: 3rem; margin-bottom: 1rem; color: #667eea;">
                                    ${this.getProductIcon(category.name)}
                                </div>
                                <h3 style="margin: 0 0 0.5rem 0; color: #333;">${category.name}</h3>
                                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                                    ${category.count} ${this.getProductWord(category.count)}
                                </p>
                                <button style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    Смотреть товары
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; padding: 2rem; margin-bottom: 4rem; text-align: center;">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1.8rem;">Не нашли что искали?</h3>
                        <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem;">
                            Используйте поиск или посмотрите все товары в каталоге
                        </p>
                        <a href="#products" class="cta-button" style="background: white; color: #667eea; border: none; padding: 0.8rem 2rem;">
                            Весь каталог
                        </a>
                    </div>
                    
                    <div>
                        <h3 style="text-align: center; margin-bottom: 2rem;">Популярные товары</h3>
                        <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                            ${popularProducts.map(product => `
                                <div class="product-card" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 2rem; padding: 1.5rem; text-align: center;">
                                        ${this.getProductIcon(product.category)}
                                    </div>
                                    <div style="padding: 1rem;">
                                        <h4 style="margin: 0 0 0.5rem 0;">${product.name}</h4>
                                        <p style="margin: 0 0 0.5rem 0; color: #27ae60; font-weight: bold; font-size: 1.2rem;">
                                            ${product.price.toLocaleString()} ₽
                                        </p>
                                        <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">
                                            ${product.category}
                                        </p>
                                        <button class="add-to-cart-btn cta-button" 
                                                data-product-id="${product.id}"
                                                style="width: 100%; padding: 0.5rem; font-size: 0.9rem;">
                                            🛒 В корзину
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    // Страница авторизации (НОВАЯ)
    loadAuthPage(container) {
        if (this.authMode === 'login') {
            this.loadLoginPage(container);
        } else {
            this.loadRegisterPage(container);
        }
    },
    
    // Страница входа
    loadLoginPage(container) {
        container.innerHTML = `
            <section style="padding: 4rem 0; min-height: 70vh;">
                <div class="container">
                    <div style="max-width: 400px; margin: 0 auto;">
                        <div style="background: white; border-radius: 12px; padding: 2.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                            <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">Вход в аккаунт</h2>
                            
                            <div id="authMessage" style="display: none; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem; text-align: center;"></div>
                            
                            <form id="loginForm">
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Email</label>
                                    <input type="email" id="loginEmail" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="ваш@email.com">
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Пароль</label>
                                    <input type="password" id="loginPassword" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="••••••••">
                                </div>
                                
                                <button type="submit" id="loginSubmitBtn"
                                        style="width: 100%; padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-bottom: 1.5rem;">
                                    Войти
                                </button>
                            </form>
                            
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <a href="#" id="switchToRegister" style="color: #667eea; text-decoration: none; font-weight: 500;">
                                    Нет аккаунта? Зарегистрироваться
                                </a>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    // Страница регистрации
    loadRegisterPage(container) {
        container.innerHTML = `
            <section style="padding: 4rem 0; min-height: 70vh;">
                <div class="container">
                    <div style="max-width: 400px; margin: 0 auto;">
                        <div style="background: white; border-radius: 12px; padding: 2.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                            <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">Регистрация</h2>
                            
                            <div id="authMessage" style="display: none; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem; text-align: center;"></div>
                            
                            <form id="registerForm">
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Имя</label>
                                    <input type="text" id="registerName" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="Ваше имя">
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Email</label>
                                    <input type="email" id="registerEmail" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="ваш@email.com">
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Пароль</label>
                                    <input type="password" id="registerPassword" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="Не менее 6 символов">
                                </div>
                                
                                <div style="margin-bottom: 2rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; color: #666; font-weight: 500;">Подтвердите пароль</label>
                                    <input type="password" id="registerConfirmPassword" required 
                                           style="width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"
                                           placeholder="Повторите пароль">
                                </div>
                                
                                <button type="submit" id="registerSubmitBtn"
                                        style="width: 100%; padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-bottom: 1.5rem;">
                                    Зарегистрироваться
                                </button>
                            </form>
                            
                            <div style="text-align: center;">
                                <a href="#" id="switchToLogin" style="color: #667eea; text-decoration: none; font-weight: 500;">
                                    Уже есть аккаунт? Войти
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    
    // Обработка входа
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('authMessage');
        
        const result = Auth.login(email, password);
        
        this.showAuthMessage(messageEl, result.message, result.success);
        
        if (result.success) {
            setTimeout(() => {
                window.location.hash = '#home';
            }, 1500);
        }
    },
    
    // Обработка регистрации
    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const messageEl = document.getElementById('authMessage');
        
        // Проверяем совпадение паролей
        if (password !== confirmPassword) {
            this.showAuthMessage(messageEl, 'Пароли не совпадают', false);
            return;
        }
        
        const result = Auth.register(email, password, name);
        
        this.showAuthMessage(messageEl, result.message, result.success);
        
        if (result.success) {
            setTimeout(() => {
                this.authMode = 'login';
                this.loadPage();
            }, 2000);
        }
    },
    
    // Показать сообщение авторизации
    showAuthMessage(element, message, isSuccess) {
        if (!element) return;
        
        element.textContent = message;
        element.style.display = 'block';
        element.style.background = isSuccess ? '#d4edda' : '#f8d7da';
        element.style.color = isSuccess ? '#155724' : '#721c24';
        element.style.border = isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    },
    
    // Вспомогательные методы для категорий
    getCategoriesWithCount() {
        const categories = {};
        
        this.demoProducts.forEach(product => {
            if (product.category) {
                if (!categories[product.category]) {
                    categories[product.category] = 0;
                }
                categories[product.category]++;
            }
        });
        
        return Object.entries(categories).map(([name, count]) => ({
            name,
            count,
            icon: this.getProductIcon(name)
        })).sort((a, b) => b.count - a.count);
    },
    
    getProductWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'товар';
        if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'товара';
        return 'товаров';
    },
    
    // Фильтрация по категории
    filterByCategory(category) {
        this.currentCategory = category;
        window.location.hash = '#products';
    },
    
    // Сброс фильтра категории
    clearCategoryFilter() {
        this.currentCategory = null;
        this.loadPage();
    },
    
    // Загрузка товаров с пагинацией
    loadPaginatedProducts() {
        const container = document.getElementById('allProductsGrid');
        if (!container) return;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        
        container.innerHTML = productsToShow.map(product => `
            <div class="product-card">
                <div class="product-image" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 2.5rem;">
                    ${this.getProductIcon(product.category)}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${product.price.toLocaleString()} ₽</p>
                    <p class="product-model">Модель: ${product.model}</p>
                    <p class="product-category" style="color: #667eea;">${product.category}</p>
                    <p class="product-stock" style="${product.stockQuantity > 0 ? 'color: #27ae60;' : 'color: #e74c3c;'}">
                        ${product.stockQuantity > 0 ? `✓ В наличии: ${product.stockQuantity} шт.` : '✗ Нет в наличии'}
                    </p>
                    <button class="cta-button add-to-cart-btn" 
                            data-product-id="${product.id}"
                            style="width: 100%; margin-top: 1rem; padding: 0.8rem;"
                            ${product.stockQuantity === 0 ? 'disabled style="background: #ccc; cursor: not-allowed;"' : ''}>
                        ${product.stockQuantity === 0 ? 'Нет в наличии' : '🛒 В корзину'}
                    </button>
                </div>
            </div>
        `).join('');
        
        this.updatePagination(totalPages);
        this.updateStats();
    },
    
    // Обновление пагинации
    updatePagination(totalPages) {
        const currentPageEl = document.getElementById('currentPage');
        const totalPagesEl = document.getElementById('totalPages');
        
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
    },
    
    // Обновление статистики
    updateStats() {
        const showingCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (showingCount) {
            const start = (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
            showingCount.textContent = this.filteredProducts.length > 0 ? `${start}-${end}` : '0';
        }
        
        if (totalCount) {
            totalCount.textContent = this.filteredProducts.length;
        }
    },
    
    // Следующая страница
    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.loadPaginatedProducts();
        }
    },
    
    // Предыдущая страница
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPaginatedProducts();
        }
    },
    
    // Применение фильтров
    applyFilters() {
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        let filtered = [...this.demoProducts];
        
        // Поиск по тексту
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const name = product.name ? product.name.toLowerCase() : '';
                const model = product.model ? product.model.toLowerCase() : '';
                return name.includes(query) || model.includes(query);
            });
        }
        
        // Фильтрация по категории
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(product => product.category === categoryFilter.value);
        }
        
        // Сортировка
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
        
        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.loadPaginatedProducts();
    },
    
    // Страница корзины
    loadCartPage(container) {
        console.log('Загрузка корзины, товаров:', cart.items.length);
        
        if (cart.items.length === 0) {
            container.innerHTML = `
                <div style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
                        <h2 style="margin-bottom: 1rem;">Ваша корзина пуста</h2>
                        <p style="color: #666; margin-bottom: 2rem;">Добавьте товары из каталога</p>
                        <a href="#products" class="cta-button">Перейти к товарам</a>
                    </div>
                </div>
            `;
            return;
        }
        
        const total = cart.getTotal();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        container.innerHTML = `
            <div style="padding: 4rem 0; min-height: 60vh;">
                <div class="container">
                    <h2 class="section-title" style="margin-bottom: 2rem;">🛒 Ваша корзина</h2>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 3rem;">
                        <div>
                            <h3 style="margin-bottom: 1rem;">Товары (${totalItems})</h3>
                            <div style="background: white; border-radius: 10px; padding: 1.5rem; border: 1px solid #eee;">
                                ${cart.items.map(item => `
                                    <div style="display: grid; grid-template-columns: 80px 1fr auto auto auto; gap: 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee;">
                                        <div style="background: #f8f9fa; border-radius: 5px; padding: 1rem; text-align: center; color: #667eea; font-size: 1.5rem;">
                                            ${this.getProductIcon(item.category)}
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 0.5rem 0;">${item.name}</h4>
                                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.model}</p>
                                        </div>
                                        <div style="font-weight: bold; color: #27ae60;">
                                            ${item.price} ₽
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1}); App.loadPage();" style="padding: 0.3rem 0.6rem; border: 1px solid #ddd; background: white; border-radius: 3px; cursor: pointer;">-</button>
                                            <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1}); App.loadPage();" style="padding: 0.3rem 0.6rem; border: 1px solid #ddd; background: white; border-radius: 3px; cursor: pointer;">+</button>
                                        </div>
                                        <button class="remove-from-cart" data-product-id="${item.id}" style="padding: 0.5rem 1rem; background: #ffebee; color: #e74c3c; border: none; border-radius: 5px; cursor: pointer;">
                                            Удалить
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="margin-bottom: 1rem;">Сумма заказа</h3>
                            <div style="background: white; border-radius: 10px; padding: 1.5rem; border: 1px solid #eee;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                    <span>Товары (${totalItems} шт.)</span>
                                    <span>${total} ₽</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
                                    <span>Доставка</span>
                                    <span style="color: #27ae60;">Бесплатно</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; border-top: 2px solid #667eea; padding-top: 1rem;">
                                    <span>Итого</span>
                                    <span>${total} ₽</span>
                                </div>
                                <button onclick="App.checkout()" style="width: 100%; padding: 1rem; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 1.5rem;">
                                    Оформить заказ
                                </button>
                                <button id="clearCartBtn" style="width: 100%; padding: 0.8rem; background: #666; color: white; border: none; border-radius: 8px; font-size: 0.9rem; cursor: pointer; margin-top: 0.8rem;">
                                    Очистить корзину
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Загрузка демо-данных
    loadDemoData() {
        this.demoProducts = [
            { id: 1, name: 'iPhone 15 Pro', price: 99990, model: 'A2848', stockQuantity: 10, category: 'Смартфоны' },
            { id: 2, name: 'iPhone 15', price: 84990, model: 'A2849', stockQuantity: 15, category: 'Смартфоны' },
            { id: 3, name: 'Samsung Galaxy S24 Ultra', price: 109990, model: 'SM-S928B', stockQuantity: 8, category: 'Смартфоны' },
            { id: 4, name: 'Samsung Galaxy S24', price: 89990, model: 'SM-S921B', stockQuantity: 12, category: 'Смартфоны' },
            { id: 5, name: 'Xiaomi 14 Pro', price: 74990, model: '23116PN5BC', stockQuantity: 20, category: 'Смартфоны' },
            { id: 6, name: 'MacBook Air M2', price: 129990, model: 'MLY13', stockQuantity: 5, category: 'Ноутбуки' },
            { id: 7, name: 'MacBook Pro 16 M3', price: 249990, model: 'MRW43', stockQuantity: 3, category: 'Ноутбуки' },
            { id: 8, name: 'ASUS ROG Zephyrus G14', price: 159990, model: 'GA403', stockQuantity: 7, category: 'Ноутбуки' },
            { id: 9, name: 'Lenovo ThinkPad X1 Carbon', price: 179990, model: '21HN', stockQuantity: 6, category: 'Ноутбуки' },
            { id: 10, name: 'Sony WH-1000XM5', price: 29990, model: 'WH-1000XM5', stockQuantity: 15, category: 'Аудиотехника' },
            { id: 11, name: 'Apple AirPods Pro 2', price: 24990, model: 'A2931', stockQuantity: 25, category: 'Аудиотехника' },
            { id: 12, name: 'Samsung Galaxy Buds2 Pro', price: 14990, model: 'SM-R510', stockQuantity: 18, category: 'Аудиотехника' },
            { id: 13, name: 'Samsung 55" QLED Q80C', price: 79990, model: 'QE55Q80C', stockQuantity: 3, category: 'Телевизоры' },
            { id: 14, name: 'LG 65" OLED C3', price: 149990, model: 'OLED65C3', stockQuantity: 2, category: 'Телевизоры' },
            { id: 15, name: 'Sony 55" Bravia XR', price: 129990, model: 'KD-55X80L', stockQuantity: 4, category: 'Телевизоры' },
            { id: 16, name: 'Apple Watch Series 9', price: 39990, model: 'A2976', stockQuantity: 12, category: 'Гаджеты' },
            { id: 17, name: 'Samsung Galaxy Watch 6', price: 29990, model: 'SM-R930', stockQuantity: 14, category: 'Гаджеты' },
            { id: 18, name: 'PlayStation 5', price: 59990, model: 'CFI-1216A', stockQuantity: 6, category: 'Игровые консоли' },
            { id: 19, name: 'Xbox Series X', price: 54990, model: 'RRT-00001', stockQuantity: 8, category: 'Игровые консоли' },
            { id: 20, name: 'Nintendo Switch OLED', price: 34990, model: 'HEG-001', stockQuantity: 10, category: 'Игровые консоли' }
        ];
        
        this.filteredProducts = [...this.demoProducts];
    },
    
    // Добавление товара в корзину
    addProductToCart(productId) {
        const product = this.demoProducts.find(p => p.id === productId);
        if (product) {
            cart.add(product, 1);
        }
    },
    
    // Получение иконки для товара
    getProductIcon(category) {
        if (!category) return '📦';
        
        const categoryStr = typeof category === 'string' ? category : String(category);
        
        const icons = {
            'смартфон': '📱',
            'ноутбук': '💻',
            'телевизор': '📺',
            'аудиотехника': '🎧',
            'аудио': '🎧',
            'наушники': '🎧',
            'гаджет': '⌚',
            'часы': '⌚',
            'игровой': '🎮',
            'консоль': '🎮',
            'default': '📦'
        };
        
        const lowerCategory = categoryStr.toLowerCase();
        
        for (const [key, icon] of Object.entries(icons)) {
            if (lowerCategory.includes(key)) {
                return icon;
            }
        }
        
        return icons.default;
    },
    
    // Оформление заказа
    checkout() {
        if (cart.items.length === 0) {
            alert('Корзина пуста!');
            return;
        }
        
        const total = cart.getTotal();
        if (confirm(`Оформить заказ на сумму ${total} ₽?`)) {
            alert(`✅ Заказ оформлен!\nСумма: ${total} ₽\nНомер заказа: #${Date.now()}\n\nТовары будут доставлены в течение 2-3 дней.`);
            cart.clear();
            window.location.hash = '#home';
        }
    }
};

// Делаем App и Auth глобальными
window.App = App;
window.cart = cart;
window.Auth = Auth;

// Запуск приложения когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}