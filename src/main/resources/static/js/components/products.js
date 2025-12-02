// js/components/products.js
class ProductsComponent {
    static async init() {
        console.log('Initializing ProductsComponent');
        await this.loadProducts();
        this.setupEventListeners();
    }
    
    static async loadProducts() {
        try {
            const products = await ProductService.getAllProducts();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Не удалось загрузить товары');
        }
    }
    
    static renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) {
            console.warn('Products container not found');
            return;
        }
        
        const html = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">` : 
                        `<div class="product-icon">${this.getProductIcon(product.category?.name)}</div>`
                    }
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${this.formatPrice(product.price)} ₽</div>
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
                e.preventDefault();
                const productId = button.getAttribute('data-product-id');
                await this.addToCart(productId);
            });
        });
    }
    
    static async addToCart(productId) {
        try {
            // Сначала получаем информацию о товаре
            const product = await ProductService.getProductById(productId);
            if (!product) {
                throw new Error('Товар не найден');
            }
            
            // Добавляем в корзину (локальную или серверную)
            // Пока используем локальную корзину
            if (typeof cart !== 'undefined') {
                cart.addItem(product, 1);
                this.showNotification(`Товар "${product.name}" добавлен в корзину`, 'success');
            } else {
                this.showNotification('Корзина не инициализирована', 'error');
            }
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification(error.message || 'Ошибка при добавлении в корзину', 'error');
        }
    }
    
    static setupEventListeners() {
        // Поиск товаров
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => this.searchProducts(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts(searchInput.value);
                }
            });
        }
    }
    
    static async searchProducts(query) {
        if (!query.trim()) {
            await this.loadProducts();
            return;
        }
        
        try {
            const products = await ProductService.searchProducts(query);
            if (products.length === 0) {
                this.showNotification('Товары не найдены', 'info');
            }
            this.renderProducts(products);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Ошибка поиска', 'error');
        }
    }
    
    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }
    
    static getProductIcon(categoryName) {
        return CategoriesComponent.getCategoryIcon(categoryName);
    }
    
    static showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;
        
        // Стили для уведомления
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
    
    static showError(message) {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">😕</div>
                <p style="color: #666; margin-bottom: 1rem;">${message}</p>
                <button onclick="ProductsComponent.loadProducts()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

window.ProductsComponent = ProductsComponent;