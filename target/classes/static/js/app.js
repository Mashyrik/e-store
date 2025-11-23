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
            const container = document.getElementById('categories-container');
            
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
        } catch (error) {
            this.showError('categories-container', 'Не удалось загрузить категории');
        }
    }

    static async loadProducts() {
        try {
            const products = await ProductService.getAll();
            const container = document.getElementById('products-container');
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
        } catch (error) {
            this.showError('products-container', 'Не удалось загрузить товары');
        }
    }

    static renderCartItems() {
        const container = document.getElementById('cart-items');
        
        if (cart.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>Ваша корзина пуста</h3>
                    <p>Добавьте товары из каталога, чтобы сделать заказ</p>
                    <a href="#products" class="continue-shopping">Продолжить покупки</a>
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
            const products = await ProductService.getAll();
            const product = products.find(p => p.id === productId);
            
            if (product) {
                if (product.stockQuantity > 0) {
                    cart.addItem(product, 1);
                    // Обновляем корзину, если мы на странице корзины
                    if (window.location.hash === '#cart') {
                        this.renderCartItems();
                        this.renderCartSummary();
                    }
                } else {
                    alert('Этот товар временно отсутствует на складе');
                }
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Ошибка при добавлении товара в корзину');
        }
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
            loginLink.style.display = 'none';
            profileLink.style.display = 'block';
        } else {
            loginLink.style.display = 'block';
            profileLink.style.display = 'none';
        }
    }

    static showError(containerId, message) {
        const container = document.getElementById(containerId);
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