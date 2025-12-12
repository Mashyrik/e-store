// static/js/components/products.js
class ProductsComponent {
    static productsCache = [];
    static activeCategory = '';
    static activeQuery = '';
    static currentPage = 1;
    static itemsPerPage = 8;

    static async init() {
        console.log('Initializing ProductsComponent');

        try {
            // Загружаем товары
            const products = await this.loadProducts();
            this.productsCache = products;
            this.currentPage = 1;

            // Проверяем параметр категории из URL
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            
            if (categoryParam) {
                // Применяем фильтр по категории
                this.activeCategory = decodeURIComponent(categoryParam);
                // Устанавливаем значение в селект фильтра
                const categoryFilter = document.getElementById('categoryFilter');
                if (categoryFilter) {
                    categoryFilter.value = this.activeCategory;
                }
            }

            // Рендерим товары (с учетом фильтра, если есть)
            const filtered = this.applyFilters();
            this.renderProducts(filtered);

        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Не удалось загрузить товары');
        }
    }

    static async loadProducts() {
        try {
            // Пробуем загрузить товары из API
            const response = await fetch('http://localhost:8080/api/products');
            
            if (response.ok) {
                const products = await response.json();
                console.log('Products loaded from API:', products.length);
                
                // Преобразуем товары в нужный формат
                return products.map(product => {
                    // Обрабатываем цену (BigDecimal может быть объектом или числом)
                    let price = product.price;
                    if (typeof price === 'object' && price !== null) {
                        price = parseFloat(price) || 0;
                    }
                    price = parseFloat(price) || 0;
                    
                    // Обрабатываем категорию
                    let category = '';
                    if (product.category) {
                        if (typeof product.category === 'object' && product.category.name) {
                            category = product.category.name;
                        } else if (typeof product.category === 'string') {
                            category = product.category;
                        }
                    }
                    
                    return {
                        id: product.id,
                        name: product.name || '',
                        price: price,
                        model: product.model || '',
                        category: category,
                        stockQuantity: product.stockQuantity || 0,
                        description: product.description || ''
                    };
                });
            } else {
                console.warn('Failed to load products from API, using mock data');
                return this.getMockProducts();
            }
        } catch (error) {
            console.warn('API недоступен, используем мок-данные:', error.message);
            return this.getMockProducts();
        }
    }

    static getMockProducts() {
        // Мок-данные на случай если API недоступен
        return [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 1899,
                model: 'A2848',
                category: 'Смартфоны',
                stockQuantity: 10,
                description: 'Новейший смартфон от Apple'
            },
            {
                id: 2,
                name: 'Samsung Galaxy S24',
                price: 1699,
                model: 'SM-S921B',
                category: 'Смартфоны',
                stockQuantity: 8,
                description: 'Флагманский смартфон от Samsung'
            },
            {
                id: 3,
                name: 'MacBook Air M2',
                price: 3499,
                model: 'M2',
                category: 'Ноутбуки',
                stockQuantity: 5,
                description: 'Ультратонкий ноутбук от Apple'
            },
            {
                id: 4,
                name: 'Sony WH-1000XM5',
                price: 799,
                model: 'WH-1000XM5',
                category: 'Аудиотехника',
                stockQuantity: 15,
                description: 'Беспроводные наушники с шумоподавлением'
            },
            {
                id: 5,
                name: 'Xiaomi 14 Pro',
                price: 1299,
                model: 'Xiaomi 14 Pro',
                category: 'Смартфоны',
                stockQuantity: 12,
                description: 'Флагманский смартфон от Xiaomi с отличной камерой'
            },
            {
                id: 6,
                name: 'Dell XPS 15',
                price: 4299,
                model: 'XPS 15 9530',
                category: 'Ноутбуки',
                stockQuantity: 6,
                description: 'Мощный ноутбук для работы и творчества'
            },
            {
                id: 7,
                name: 'AirPods Pro 2',
                price: 699,
                model: 'A2931',
                category: 'Аудиотехника',
                stockQuantity: 20,
                description: 'Беспроводные наушники с активным шумоподавлением'
            },
            {
                id: 8,
                name: 'ASUS ROG Strix G15',
                price: 3899,
                model: 'G513IE',
                category: 'Ноутбуки',
                stockQuantity: 4,
                description: 'Игровой ноутбук с мощной видеокартой'
            },
            {
                id: 9,
                name: 'OnePlus 12',
                price: 1199,
                model: 'CPH2581',
                category: 'Смартфоны',
                stockQuantity: 9,
                description: 'Флагманский смартфон с быстрой зарядкой'
            },
            {
                id: 10,
                name: 'HP Spectre x360',
                price: 3799,
                model: '14-ef2013dx',
                category: 'Ноутбуки',
                stockQuantity: 7,
                description: 'Премиальный ноутбук-трансформер'
            },
            {
                id: 11,
                name: 'JBL Flip 6',
                price: 399,
                model: 'JBLFLIP6BLKAM',
                category: 'Аудиотехника',
                stockQuantity: 18,
                description: 'Портативная Bluetooth колонка'
            },
            {
                id: 12,
                name: 'Google Pixel 8',
                price: 1399,
                model: 'GE9DP',
                category: 'Смартфоны',
                stockQuantity: 11,
                description: 'Смартфон с лучшей камерой от Google'
            },
            {
                id: 13,
                name: 'Lenovo ThinkPad X1 Carbon',
                price: 4499,
                model: '21HMCTO1WW',
                category: 'Ноутбуки',
                stockQuantity: 5,
                description: 'Бизнес-ноутбук премиум класса'
            },
            {
                id: 14,
                name: 'Bose QuietComfort 45',
                price: 899,
                model: 'QC45',
                category: 'Аудиотехника',
                stockQuantity: 14,
                description: 'Наушники с премиальным шумоподавлением'
            },
            {
                id: 15,
                name: 'Honor Magic 6 Pro',
                price: 1099,
                model: 'BVL-AN16',
                category: 'Смартфоны',
                stockQuantity: 13,
                description: 'Флагманский смартфон с продвинутой камерой'
            },
            {
                id: 16,
                name: 'Sony WF-1000XM5',
                price: 599,
                model: 'WF-1000XM5',
                category: 'Аудиотехника',
                stockQuantity: 16,
                description: 'Беспроводные TWS наушники с шумоподавлением'
            },
            {
                id: 17,
                name: 'Nothing Phone 2',
                price: 999,
                model: 'A142',
                category: 'Смартфоны',
                stockQuantity: 10,
                description: 'Уникальный смартфон с прозрачным дизайном'
            },
            {
                id: 18,
                name: 'Microsoft Surface Laptop 5',
                price: 3999,
                model: '1950',
                category: 'Ноутбуки',
                stockQuantity: 6,
                description: 'Элегантный ноутбук от Microsoft'
            },
            {
                id: 19,
                name: 'Sennheiser Momentum 4',
                price: 749,
                model: 'M4AEBT',
                category: 'Аудиотехника',
                stockQuantity: 12,
                description: 'Премиальные наушники с отличным звуком'
            },
            {
                id: 20,
                name: 'Motorola Edge 40 Pro',
                price: 899,
                model: 'XT2301-4',
                category: 'Смартфоны',
                stockQuantity: 8,
                description: 'Смартфон с изогнутым экраном и быстрой зарядкой'
            }
        ];
    }

    static renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🧐</div>
                    <p>По выбранным фильтрам товаров нет</p>
                    <button class="btn btn-outline" onclick="ProductsComponent.resetFilters()">Сбросить фильтры</button>
                </div>
            `;
            this.renderPagination(0);
            return;
        }

        // Вычисляем пагинацию
        const totalPages = Math.ceil(products.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        const html = paginatedProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <div class="product-icon">${this.getProductIcon(product.category)}</div>
                </div>
                <div class="product-info">
                    <h3>
                        <a href="product.html?id=${product.id}" style="color: inherit; text-decoration: none; cursor: pointer;">
                            ${product.name}
                        </a>
                    </h3>
                    <div class="product-price">${this.formatPrice(product.price)} BYN</div>
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
        
        // Рендерим пагинацию
        this.renderPagination(totalPages);
        
        // Добавляем обработчики для кнопок "В корзину"
        this.attachCartHandlers();

        // Добавляем стили для ссылок названий товаров
        const style = document.createElement('style');
        style.textContent = `
            .product-info h3 a:hover {
                color: #6366f1 !important;
                text-decoration: underline !important;
            }
        `;
        document.head.appendChild(style);
    }

    static attachCartHandlers() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(button.getAttribute('data-product-id'));
                this.addToCart(productId);
            });
        });
    }

    static addToCart(productId) {
        // Находим товар в кэше
        const product = this.productsCache.find(p => p.id === productId);
        
        if (!product) {
            this.showNotification('Товар не найден', 'error');
            return;
        }

        // Проверяем наличие товара
        if (product.stockQuantity === 0) {
            this.showNotification('Товар отсутствует на складе', 'error');
            return;
        }

        // Инициализируем корзину, если её нет
        if (!window.cart) {
            window.cart = new SimpleCart();
        }

        // Подготавливаем данные товара для корзины
        const cartProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            model: product.model,
            category: product.category,
            quantity: 1
        };

        // Добавляем товар в корзину
        window.cart.add(cartProduct);

        // Показываем уведомление
        this.showNotification(`"${product.name}" добавлен в корзину`, 'success');
        
        // Обновляем счетчик корзины
        if (typeof App !== 'undefined' && App.updateCartCount) {
            App.updateCartCount();
        }
    }

    static renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const html = `
            <div class="pagination">
                <button class="btn btn-outline pagination-btn" 
                        onclick="ProductsComponent.goToPage(${this.currentPage - 1})"
                        ${this.currentPage === 1 ? 'disabled' : ''}>
                    ← Назад
                </button>
                <span class="pagination-info">
                    Страница ${this.currentPage} из ${totalPages}
                </span>
                <button class="btn btn-outline pagination-btn" 
                        onclick="ProductsComponent.goToPage(${this.currentPage + 1})"
                        ${this.currentPage === totalPages ? 'disabled' : ''}>
                    Вперед →
                </button>
            </div>
        `;

        paginationContainer.innerHTML = html;
    }

    static goToPage(page) {
        const filtered = this.applyFilters();
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProducts(filtered);
        
        // Прокручиваем страницу вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    static async searchProducts(query) {
        this.activeQuery = query.trim().toLowerCase();
        this.currentPage = 1; // Сбрасываем на первую страницу при поиске
        const filtered = this.applyFilters();
        this.renderProducts(filtered);
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

    static filterByCategory(category) {
        this.activeCategory = category;
        this.currentPage = 1; // Сбрасываем на первую страницу при фильтрации
        
        // Обновляем URL с параметром категории
        const url = new URL(window.location);
        if (category) {
            url.searchParams.set('category', category);
        } else {
            url.searchParams.delete('category');
        }
        window.history.replaceState({}, '', url);
        
        const filtered = this.applyFilters();
        this.renderProducts(filtered);
    }

    static resetFilters() {
        this.activeCategory = '';
        this.activeQuery = '';
        this.currentPage = 1; // Сбрасываем на первую страницу
        
        // Очищаем параметры из URL
        const url = new URL(window.location);
        url.searchParams.delete('category');
        window.history.replaceState({}, '', url);
        
        // Сбрасываем значение в селекте
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
        }
        
        // Сбрасываем значение в поиске
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.renderProducts(this.productsCache);
    }

    static applyFilters() {
        return this.productsCache.filter(product => {
            const matchCategory = this.activeCategory ? product.category === this.activeCategory : true;
            const matchQuery = this.activeQuery
                ? (product.name?.toLowerCase().includes(this.activeQuery) ||
                    product.model?.toLowerCase().includes(this.activeQuery))
                : true;
            return matchCategory && matchQuery;
        });
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