// static/js/components/products.js
class ProductsComponent {
    static async init() {
        console.log('Initializing ProductsComponent');

        try {
            // Загружаем товары
            const products = await this.loadProducts();

            // Рендерим товары
            this.renderProducts(products);

        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Не удалось загрузить товары');
        }
    }

    static async loadProducts() {
        // Пока используем тестовые данные
        return [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 99990,
                model: 'A2848',
                category: 'Смартфоны',
                stockQuantity: 10,
                description: 'Новейший смартфон от Apple'
            },
            {
                id: 2,
                name: 'Samsung Galaxy S24',
                price: 89990,
                model: 'SM-S921B',
                category: 'Смартфоны',
                stockQuantity: 8,
                description: 'Флагманский смартфон от Samsung'
            },
            {
                id: 3,
                name: 'MacBook Air M2',
                price: 129990,
                model: 'M2',
                category: 'Ноутбуки',
                stockQuantity: 5,
                description: 'Ультратонкий ноутбук от Apple'
            },
            {
                id: 4,
                name: 'Sony WH-1000XM5',
                price: 29990,
                model: 'WH-1000XM5',
                category: 'Аудиотехника',
                stockQuantity: 15,
                description: 'Беспроводные наушники с шумоподавлением'
            }
        ];
    }

    static renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        const html = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <div class="product-icon">${this.getProductIcon(product.category)}</div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${this.formatPrice(product.price)} ₽</div>
                    <div class="product-model">Модель: ${product.model}</div>
                    <div class="product-category">${product.category}</div>
                    <div class="product-stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stockQuantity > 0 ?
            `В наличии: ${product.stockQuantity} шт.` :
            'Нет в наличии'
        }
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" 
                            data-product-id="${product.id}"
                            ${product.stockQuantity === 0 ? 'disabled' : ''}>
                        ${product.stockQuantity === 0 ? 'Нет в наличии' : 'В корзину'}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    static async searchProducts(query) {
        if (!query.trim()) {
            await this.init();
            return;
        }

        // В реальном приложении здесь будет запрос к API
        console.log('Searching for:', query);
        // Пока просто показываем сообщение
        this.showNotification(`Поиск: "${query}"`, 'info');
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    static getProductIcon(categoryName) {
        const icons = {
            'Смартфоны': '📱',
            'Ноутбуки': '💻',
            'Телевизоры': '📺',
            'Аудиотехника': '🎧',
            'Наушники': '🎧',
            'Колонки': '🔊',
            'Гаджеты': '⌚',
            'default': '🔌'
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (categoryName && categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return icons.default;
    }

    static showError(message) {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                <p style="color: #666; margin-bottom: 1rem;">${message}</p>
                <button onclick="ProductsComponent.init()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static showNotification(message, type = 'info') {
        // Используем функцию showNotification из глобального скрипта
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

window.ProductsComponent = ProductsComponent;