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
            // Загружаем товары из API
            const response = await fetch('http://localhost:8080/api/products');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

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
        } catch (error) {
            console.error('Failed to load products from API:', error);
            this.showError('Не удалось загрузить товары из базы данных. Проверьте подключение к серверу.');
            return [];
        }
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
            .product-info h3 a {
                display: block;
                transition: color 0.2s ease;
                pointer-events: auto;
            }
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
            'Планшеты': '📱',
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