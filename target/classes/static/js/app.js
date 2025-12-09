// static/js/utils/app.js - ОБНОВЛЕННАЯ ВЕРСИЯ

class App {
    static init() {
        console.log('E-Store Frontend Initializing...');
        
        // Проверяем, на какой странице находимся
        const path = window.location.pathname;
        
        if (path.includes('login.html') || path.endsWith('login')) {
            this.initLoginPage();
        } else if (path.includes('index.html') || path === '/') {
            this.initMainPage();
        }
        
        // Инициализируем общие компоненты
        this.initCommonComponents();
    }

    static initCommonComponents() {
        // Обновляем UI авторизации
        if (typeof AuthService !== 'undefined') {
            AuthService.updateAuthUI();
        }
        
        // Обработчик выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof AuthService !== 'undefined') {
                    AuthService.logout();
                }
            });
        }
        
        // Мобильное меню
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Корзина (пока локальная)
        this.initCart();
    }

    static initLoginPage() {
        console.log('Initializing login page...');
        
        // Проверяем, уже авторизован ли пользователь
        const token = localStorage.getItem('token');
        if (token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Инициализация форм будет в login.html
    }

    static initMainPage() {
        console.log('Initializing main page...');
        
        // Загружаем данные с API
        this.loadInitialData();
    }

    static async loadInitialData() {
        try {
            // Загружаем категории
            if (typeof CategoryService !== 'undefined') {
                const categories = await CategoryService.getAllCategories();
                this.displayCategories(categories);
            }
            
            // Загружаем товары
            if (typeof ProductService !== 'undefined') {
                const products = await ProductService.getAllProducts();
                this.displayProducts(products);
            }
            
            // Обновляем счетчик корзины
            this.updateCartCounter();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showErrorMessage('Не удалось загрузить данные. Проверьте подключение к серверу.');
        }
    }

    static displayCategories(categories) {
        const container = document.getElementById('categories-container');
        if (!container || !categories || categories.length === 0) return;
        
        const html = categories.map(category => `
            <div class="category-card">
                <div class="category-image">
                    ${this.getCategoryIcon(category.name)}
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Товары данной категории'}</p>
                    <button class="btn btn-outline view-category-btn" 
                            data-category-id="${category.id}">
                        Смотреть товары
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        // Добавляем обработчики кнопок
        document.querySelectorAll('.view-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = btn.getAttribute('data-category-id');
                this.showCategoryProducts(categoryId);
            });
        });
    }

    static displayProducts(products) {
        const container = document.getElementById('products-container');
        if (!container || !products || products.length === 0) {
            if (container) {
                container.innerHTML = '<p class="empty-message">Товары не найдены</p>';
            }
            return;
        }
        
        const html = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" alt="${product.name}" 
                              onerror="this.style.display='none'; this.parentElement.innerHTML='${this.getProductIcon(product.category?.name)}'">` : 
                        `<div class="product-icon">${this.getProductIcon(product.category?.name)}</div>`
                    }
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${this.formatPrice(product.price)} руб.</div>
                    <div class="product-model">Модель: ${product.model}</div>
                    <div class="product-category">${product.category?.name || 'Без категории'}</div>
                    <div class="product-stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stockQuantity > 0 ? 
                            `В наличии: ${product.stockQuantity} шт.` : 
                            'Нет в наличии'
                        }
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" 
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                        ${product.stockQuantity === 0 ? 'Нет в наличии' : 'В корзину'}
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        // Добавляем обработчики кнопок "В корзину"
        this.setupAddToCartButtons();
    }

    static setupAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = button.getAttribute('data-product-id');
                const productName = button.getAttribute('data-product-name');
                const productPrice = button.getAttribute('data-product-price');
                
                // Проверяем авторизацию для корзины
                if (!AuthService.isAuthenticated()) {
                    this.showAuthRequiredMessage();
                    return;
                }
                
                try {
                    // Используем API для добавления в корзину
                    if (typeof CartService !== 'undefined') {
                        const result = await CartService.addToCart(productId, 1);
                        if (result.success) {
                            this.showNotification(`Товар "${productName}" добавлен в корзину`, 'success');
                            this.updateCartCounter();
                        }
                    } else {
                        // Локальная корзина для демо
                        this.addToLocalCart({
                            id: productId,
                            name: productName,
                            price: parseFloat(productPrice),
                            quantity: 1
                        });
                        this.showNotification(`Товар "${productName}" добавлен в корзину`, 'success');
                        this.updateCartCounter();
                    }
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    this.showNotification('Ошибка при добавлении в корзину', 'error');
                }
            });
        });
    }

    static initCart() {
        // Проверяем существование корзины в localStorage
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        this.updateCartCounter();
    }

    static addToLocalCart(product) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            cart.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCounter();
    }

    static updateCartCounter() {
        const counter = document.getElementById('cartCount');
        if (!counter) return;
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        counter.textContent = totalItems;
        counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    static formatPrice(price) {
        // Форматируем цену для белорусских рублей
        if (!price) return '0.00';
        return new Intl.NumberFormat('ru-BY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }

    static getCategoryIcon(categoryName) {
        if (!categoryName) return '📦';
        
        const icons = {
            'смартфон': '📱',
            'ноутбук': '💻',
            'телевизор': '📺',
            'наушник': '🎧',
            'колонка': '🔊',
            'планшет': '📟',
            'монитор': '🖥️',
            'клавиатура': '⌨️',
            'мышь': '🖱️',
            'камера': '📷',
            'часы': '⌚'
        };
        
        const lowerName = categoryName.toLowerCase();
        for (const [key, icon] of Object.entries(icons)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return '📦';
    }

    static getProductIcon(categoryName) {
        return this.getCategoryIcon(categoryName);
    }

    static showCategoryProducts(categoryId) {
        console.log('Showing products for category:', categoryId);
        // Реализуем позже
        alert(`Показать товары категории ${categoryId} - в разработке`);
    }

    static showAuthRequiredMessage() {
        if (confirm('Для добавления товаров в корзину необходимо войти в систему. Перейти на страницу входа?')) {
            window.location.href = 'login.html';
        }
    }

    static showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    static showErrorMessage(message) {
        const container = document.getElementById('mainContent');
        if (!container) return;
        
        const errorHtml = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #d32f2f; margin-bottom: 1rem;">Ошибка загрузки</h3>
                <p style="color: #666; margin-bottom: 2rem;">${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    Обновить страницу
                </button>
            </div>
        `;
        
        container.innerHTML = errorHtml;
    }

    // Тестовые данные для демо
    static getMockProducts() {
        return [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 4999.99,
                model: 'A2848',
                description: 'Новейший смартфон от Apple',
                stockQuantity: 10,
                category: { id: 1, name: 'Смартфоны' }
            },
            {
                id: 2,
                name: 'Samsung Galaxy S24',
                price: 4499.99,
                model: 'SM-S921B',
                description: 'Флагманский смартфон от Samsung',
                stockQuantity: 8,
                category: { id: 1, name: 'Смартфоны' }
            }
        ];
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;