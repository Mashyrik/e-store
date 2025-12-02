// js/cart.js

class Cart {
    constructor() {
        this.items = this.loadCartFromStorage();
        this.updateCartCount();
    }

    // Загрузка корзины из localStorage
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('estore_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    // Сохранение корзины в localStorage
    saveCartToStorage() {
        try {
            localStorage.setItem('estore_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Добавление товара в корзину - ИСПРАВЛЕННАЯ ВЕРСИЯ
    addItem(product, quantity = 1) {
        try {
            console.log('🛒 cart.addItem called with:', product);
            
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                // Увеличиваем количество, если товар уже в корзине
                const newQuantity = existingItem.quantity + quantity;
                if (existingItem.maxQuantity && newQuantity > existingItem.maxQuantity) {
                    this.showStockLimitNotification(product.name, existingItem.maxQuantity);
                    existingItem.quantity = existingItem.maxQuantity;
                } else {
                    existingItem.quantity = newQuantity;
                }
                console.log('✅ Quantity updated for:', product.name);
            } else {
                // Добавляем новый товар
                this.items.push({
                    id: product.id,
                    name: product.name,
                    model: product.model,
                    price: product.price,
                    image: product.imageUrl || '',
                    category: product.category || { name: '' },
                    quantity: quantity,
                    maxQuantity: product.stockQuantity || 99
                });
                console.log('✅ New item added:', product.name);
            }
            
            this.saveCartToStorage();
            this.updateCartCount();
            this.showAddToCartNotification(product.name);
            
            console.log('🛒 Cart items after add:', this.items);
            return true; // Успешно добавлено
            
        } catch (error) {
            console.error('❌ Error in cart.addItem:', error);
            return false; // Ошибка при добавлении
        }
    }

    // Удаление товара из корзины
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartCount();
    }

    // Изменение количества товара
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            // Проверяем, не превышает ли количество доступный запас
            if (item.maxQuantity && newQuantity > item.maxQuantity) {
                newQuantity = item.maxQuantity;
                this.showStockLimitNotification(item.name, item.maxQuantity);
            }
            
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartCount();
        }
    }

    // Очистка корзины
    clear() {
        this.items = [];
        this.saveCartToStorage();
        this.updateCartCount();
    }

    // Получение общей стоимости
    getTotalPrice() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Получение стоимости доставки
    getShippingPrice() {
        return this.getTotalPrice() > 5000 ? 0 : 500;
    }

    // Получение итоговой стоимости
    getFinalPrice() {
        return this.getTotalPrice() + this.getShippingPrice();
    }

    // Получение общего количества товаров
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Обновление счетчика в хедере
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.getTotalItems();
        
        if (cartCount) {
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'inline-block';
                console.log('🛒 Cart count updated:', totalItems);
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    // Уведомление о добавлении в корзину
    showAddToCartNotification(productName) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <strong>✅ Добавлено в корзину!</strong><br>
            ${productName}
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Уведомление о лимите запаса
    showStockLimitNotification(productName, maxQuantity) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ffa726;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <strong>⚠️ Лимит запаса</strong><br>
            Максимальное количество для "${productName}": ${maxQuantity}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Получить товар по ID
    getItem(productId) {
        return this.items.find(item => item.id === productId);
    }

    // Проверить есть ли товар в корзине
    hasItem(productId) {
        return this.items.some(item => item.id === productId);
    }

    // Оформление заказа
    async checkout() {
        if (this.items.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        try {
            // Проверяем авторизацию
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для оформления заказа необходимо войти в систему');
                window.location.hash = 'login';
                return;
            }

            // Создаем заказ на сервере
            const orderItems = this.items.map(item => ({
                product: { id: item.id },
                quantity: item.quantity,
                price: item.price
            }));

            const response = await ApiService.post('/orders', {
                userId: this.getCurrentUserId(),
                orderItems: orderItems
            });

            // Очищаем корзину после успешного заказа
            this.clear();
            alert('Заказ успешно оформлен! Номер заказа: ' + response.id);
            window.location.hash = 'home';

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
        }
    }

    getCurrentUserId() {
        // В реальном приложении нужно получать ID из токена или API
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData).id : 1;
    }
}

// Глобальный экземпляр корзины
const cart = new Cart();