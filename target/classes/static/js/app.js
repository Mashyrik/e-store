// js/app.js

class App {
    static init() {
        this.setupEventListeners();
        this.setupRouting();
        this.checkAuthStatus();
        this.loadInitialData();
    }

    static setupEventListeners() {
        // Мобильное меню
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Делегирование событий для кнопок "Добавить в корзину"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addProductToCart(productId);
            }
        });

        // Закрытие мобильного меню при клике на ссылку
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-links a')) {
                navLinks.classList.remove('active');
            }
        });
    }

    static setupRouting() {
        window.addEventListener('hashchange', () => this.route());
        this.route();
    }

    static async route() {
        const hash = window.location.hash.slice(1) || 'home';
        
        // Скрываем все секции
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });

        switch(hash) {
            case 'home':
                document.getElementById('home').style.display = 'block';
                document.getElementById('features').style.display = 'block';
                document.getElementById('categories').style.display = 'block';
                document.getElementById('products').style.display = 'block';
                await this.loadHomePage();
                break;
            case 'products':
                document.getElementById('products').style.display = 'block';
                await this.loadProductsPage();
                break;
            case 'categories':
                document.getElementById('categories').style.display = 'block';
                await this.loadCategoriesPage();
                break;
            case 'cart':
                document.getElementById('cart').style.display = 'block';
                await this.loadCartPage();
                break;
            case 'login':
                await this.loadLoginPage();
                break;
        }
    }

    static async loadHomePage() {
        await this.loadCategories();
        await this.loadProducts();
    }

    static async loadCategoriesPage() {
        await this.loadCategories();
    }

    static async loadProductsPage() {
        await this.loadProducts();
    }

    static async loadCartPage() {
        this.renderCartItems();
        this.renderCartSummary();
    }

    static async loadLoginPage() {
        // Заглушка для страницы логина
        alert('Страница входа будет реализована позже');
        window.location.hash = 'home';
    }

    static async loadCategories() {
        try {
            const categories = await CategoryService.getAll();
            this.renderCategories(categories);
        } catch (error) {
            console.log('Using mock categories data');
            // Временные данные для тестирования
            const mockCategories = [
                { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны' },
                { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры' },
                { id: 3, name: 'Телевизоры', description: 'Телевизоры и мониторы' },
                { id: 4, name: 'Аудиотехника', description: 'Наушники и колонки' },
                { id: 5, name: 'Гаджеты', description: 'Умные устройства' },
                { id: 6, name: 'Аксессуары', description: 'Чехлы и зарядные устройства' }
            ];
            this.renderCategories(mockCategories);
        }
    }

    static renderCategories(categories) {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        container.innerHTML = categories.map(category => `
            <div class="category-card" onclick="App.showCategoryProducts(${category.id})">
                <div class="category-image">
                    ${this.getCategoryIcon(category.name)}
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Современные устройства'}</p>
                </div>
            </div>
        `).join('');
    }

    static async loadProducts() {
        try {
            const products = await ProductService.getAll();
            this.renderProducts(products);
        } catch (error) {
            console.log('Using mock products data');
            // Временные данные для тестирования
            const mockProducts = [
                { 
                    id: 1, 
                    name: 'iPhone 15 Pro', 
                    price: 99990, 
                    model: 'A2848', 
                    stockQuantity: 10,
                    category: { name: 'Смартфоны' },
                    description: 'Новейший смартфон от Apple'
                },
                { 
                    id: 2, 
                    name: 'Samsung Galaxy S24', 
                    price: 89990, 
                    model: 'SM-S921B', 
                    stockQuantity: 8,
                    category: { name: 'Смартфоны' },
                    description: 'Флагманский смартфон от Samsung'
                },
                { 
                    id: 3, 
                    name: 'MacBook Air M2', 
                    price: 129990, 
                    model: 'M2', 
                    stockQuantity: 5,
                    category: { name: 'Ноутбуки' },
                    description: 'Ультратонкий ноутбук от Apple'
                },
                { 
                    id: 4, 
                    name: 'Sony WH-1000XM5', 
                    price: 29990, 
                    model: 'WH-1000XM5', 
                    stockQuantity: 15,
                    category: { name: 'Аудиотехника' },
                    description: 'Беспроводные наушники с шумоподавлением'
                },
                { 
                    id: 5, 
                    name: 'Apple Watch Series 9', 
                    price: 39990, 
                    model: 'A2976', 
                    stockQuantity: 12,
                    category: { name: 'Гаджеты' },
                    description: 'Умные часы от Apple'
                },
                { 
                    id: 6, 
                    name: 'Samsung 55" QLED TV', 
                    price: 79990, 
                    model: 'QE55Q80C', 
                    stockQuantity: 3,
                    category: { name: 'Телевизоры' },
                    description: 'Телевизор с технологией QLED'
                }
            ];
            this.renderProducts(mockProducts);
        }
    }

    static renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        const previewProducts = products.slice(0, 6);
        
        container.innerHTML = previewProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${this.getProductIcon(product.category?.name)}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${product.price} ₽</p>
                    <p class="product-model">${product.model}</p>
                    <p class="product-stock">В наличии: ${product.stockQuantity} шт.</p>
                    <button class="cta-button add-to-cart-btn" 
                            data-product-id="${product.id}"
                            style="width: 100%; margin-top: 1rem;"
                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                        ${product.stockQuantity === 0 ? 'Нет в наличии' : 'В корзину'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    static renderCartItems() {
        const container = document.getElementById('cart-items');
        if (!container) return;
        
        if (cart.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>В корзине пусто</h3>
                    <p>Загляните на главную, чтобы выбрать товары или найдите нужное в поиске</p>
                    <a href="#home" class="continue-shopping">Перейти на главную</a>
                </div>
            `;
            return;
        }

        container.innerHTML = cart.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${this.getProductIcon(item.category?.name)}
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-model">${item.model}</p>
                </div>
                <div class="cart-item-price">${item.price} ₽</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1}); App.renderCartItems(); App.renderCartSummary();">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" max="${item.maxQuantity || 99}"
                           onchange="cart.updateQuantity(${item.id}, parseInt(this.value)); App.renderCartItems(); App.renderCartSummary();">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1}); App.renderCartItems(); App.renderCartSummary();">+</button>
                </div>
                <button class="remove-btn" onclick="cart.removeItem(${item.id}); App.renderCartItems(); App.renderCartSummary();">
                    Удалить
                </button>
            </div>
        `).join('');
    }

    static renderCartSummary() {
        const container = document.getElementById('cart-summary');
        if (!container) return;
        
        const totalPrice = cart.getTotalPrice();
        const totalItems = cart.getTotalItems();
        const shippingPrice = cart.getShippingPrice();
        const finalPrice = cart.getFinalPrice();
        
        container.innerHTML = `
            <h3>Сумма заказа</h3>
            <div class="summary-row">
                <span>Товары (${totalItems} шт.)</span>
                <span>${totalPrice} ₽</span>
            </div>
            <div class="summary-row">
                <span>Доставка</span>
                <span>${shippingPrice === 0 ? 'Бесплатно' : shippingPrice + ' ₽'}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Итого</span>
                <span>${finalPrice} ₽</span>
            </div>
            <button class="checkout-btn" onclick="cart.checkout()" ${cart.items.length === 0 ? 'disabled' : ''}>
                Оформить заказ
            </button>
            ${cart.items.length > 0 ? `
                <button class="cta-button" style="width: 100%; margin-top: 1rem; background: #666;" 
                        onclick="cart.clear(); App.renderCartItems(); App.renderCartSummary();">
                    Очистить корзину
                </button>
            ` : ''}
        `;
    }

    static async addProductToCart(productId) {
    try {
        console.log('🛒 addProductToCart called with ID:', productId);
        
        // Простые тестовые данные
        const testProduct = {
            id: productId,
            name: 'Тестовый товар ' + productId,
            price: 1000 * productId,
            model: 'TEST' + productId,
            stockQuantity: 10,
            category: { name: 'Тест' },
            imageUrl: ''
        };
        
        console.log('🛒 Test product:', testProduct);
        
        // Пробуем добавить в корзину
        const success = cart.addItem(testProduct, 1);
        console.log('🛒 cart.addItem result:', success);
        
        if (success) {
            console.log('✅ Товар добавлен! Корзина:', cart.items);
        } else {
            console.error('❌ Ошибка при добавлении товара');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Добавьте этот метод для поиска товара в временных данных
static findProductInMockData(productId) {
    const mockProducts = [
        { 
            id: 1, 
            name: 'iPhone 15 Pro', 
            price: 99990, 
            model: 'A2848', 
            stockQuantity: 10,
            category: { name: 'Смартфоны' },
            description: 'Новейший смартфон от Apple'
        },
        { 
            id: 2, 
            name: 'Samsung Galaxy S24', 
            price: 89990, 
            model: 'SM-S921B', 
            stockQuantity: 8,
            category: { name: 'Смартфоны' },
            description: 'Флагманский смартфон от Samsung'
        },
        { 
            id: 3, 
            name: 'MacBook Air M2', 
            price: 129990, 
            model: 'M2', 
            stockQuantity: 5,
            category: { name: 'Ноутбуки' },
            description: 'Ультратонкий ноутбук от Apple'
        },
        { 
            id: 4, 
            name: 'Sony WH-1000XM5', 
            price: 29990, 
            model: 'WH-1000XM5', 
            stockQuantity: 15,
            category: { name: 'Аудиотехника' },
            description: 'Беспроводные наушники с шумоподавлением'
        },
        { 
            id: 5, 
            name: 'Apple Watch Series 9', 
            price: 39990, 
            model: 'A2976', 
            stockQuantity: 12,
            category: { name: 'Гаджеты' },
            description: 'Умные часы от Apple'
        },
        { 
            id: 6, 
            name: 'Samsung 55" QLED TV', 
            price: 79990, 
            model: 'QE55Q80C', 
            stockQuantity: 3,
            category: { name: 'Телевизоры' },
            description: 'Телевизор с технологией QLED'
        }
    ];
    
    return mockProducts.find(p => p.id === productId);
}

    static getCategoryIcon(categoryName) {
        const icons = {
            'Смартфоны': '📱',
            'Ноутбуки': '💻',
            'Планшеты': '📟',
            'Телевизоры': '📺',
            'Аудио': '🎧',
            'Гаджеты': '⌚',
            'Компьютеры': '🖥️',
            'Фото': '📷',
            'Игры': '🎮',
            'Аксессуары': '🔌'
        };
        
        if (!categoryName) return '🔌';
        
        for (const [key, icon] of Object.entries(icons)) {
            if (categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return '🔌';
    }

    static getProductIcon(categoryName) {
        return this.getCategoryIcon(categoryName);
    }

    static showCategoryProducts(categoryId) {
        alert(`Показать товары категории ID: ${categoryId}`);
        // В будущем можно реализовать переход на страницу категории
    }

    static checkAuthStatus() {
        const token = localStorage.getItem('token');
        const loginLink = document.getElementById('login-link');
        const profileLink = document.getElementById('profile-link');
        
        if (token) {
            if (loginLink) loginLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
        }
    }

    static showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 2rem;">
                <p style="color: #666;">${message}</p>
                <button onclick="App.loadInitialData()" class="cta-button" style="margin-top: 1rem;">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static loadInitialData() {
        this.loadCategories();
        this.loadProducts();
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => App.init());