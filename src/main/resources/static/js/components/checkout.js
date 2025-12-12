// static/js/components/checkout.js
class CheckoutComponent {
    static async init() {
        console.log('Initializing CheckoutComponent');

        // Проверяем авторизацию
        if (!AuthService.isAuthenticated()) {
            this.showError('Для оформления заказа необходимо войти в систему');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Проверяем, что корзина не пуста
        if (!window.cart || window.cart.items.length === 0) {
            this.showEmptyCart();
            return;
        }

        // Загружаем товары из корзины
        this.loadCartItems();

        // Настраиваем обработчик формы
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    static loadCartItems() {
        const orderItemsContainer = document.getElementById('orderItems');
        const itemsTotalEl = document.getElementById('itemsTotal');
        const totalAmountEl = document.getElementById('totalAmount');

        if (!window.cart || window.cart.items.length === 0) {
            this.showEmptyCart();
            return;
        }

        const items = window.cart.items;
        let itemsTotal = 0;

        const itemsHtml = items.map(item => {
            const itemTotal = item.price * (item.quantity || 1);
            itemsTotal += itemTotal;

            return `
                <div class="order-item">
                    <div class="order-item-info">
                        <div class="order-item-name">${item.name || 'Товар'}</div>
                        <div class="order-item-details">
                            ${item.model ? `Модель: ${item.model}` : ''} 
                            ${item.quantity > 1 ? `× ${item.quantity}` : ''}
                        </div>
                    </div>
                    <div class="order-item-price">
                        ${this.formatPrice(itemTotal)} BYN
                    </div>
                </div>
            `;
        }).join('');

        orderItemsContainer.innerHTML = itemsHtml;
        itemsTotalEl.textContent = `${this.formatPrice(itemsTotal)} BYN`;
        totalAmountEl.textContent = `${this.formatPrice(itemsTotal)} BYN`;
    }

    static async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitOrderBtn');
        const form = document.getElementById('checkoutForm');

        // Очищаем предыдущие ошибки
        this.clearErrors();

        // Собираем данные формы
        const city = document.getElementById('city').value.trim();
        const street = document.getElementById('street').value.trim();
        const house = document.getElementById('house').value.trim();
        const apartment = document.getElementById('apartment').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        const notes = document.getElementById('notes').value.trim();

        // Валидация
        if (!city || !street || !house) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            if (!city) this.showFieldError('city', 'Город обязателен для заполнения');
            if (!street) this.showFieldError('street', 'Улица обязательна для заполнения');
            if (!house) this.showFieldError('house', 'Дом обязателен для заполнения');
            return;
        }

        // Формируем адрес доставки
        let shippingAddress = `${city}, ${street}, д. ${house}`;
        if (apartment) {
            shippingAddress += `, кв. ${apartment}`;
        }
        if (postalCode) {
            shippingAddress += `, ${postalCode}`;
        }

        // Подготавливаем данные заказа
        const orderData = {
            shippingAddress: shippingAddress,
            notes: notes || null
        };

        // Отключаем кнопку и показываем загрузку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Оформление...';

        try {
            // Синхронизируем корзину с сервером перед созданием заказа
            await this.syncCartToServer();

            // Отправляем заказ на сервер
            const order = await this.createOrder(orderData);

            // Показываем успешное сообщение
            this.showSuccess('Заказ успешно оформлен!');

            // Очищаем корзину (и локальную, и серверную уже очищена сервером)
            if (window.cart) {
                window.cart.clear();
            }

            // Перенаправляем на страницу успеха или профиля
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);

        } catch (error) {
            console.error('Error creating order:', error);
            this.showError(error.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Оформить заказ';
        }
    }

    static async syncCartToServer() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Необходима авторизация');
        }

        if (!window.cart || window.cart.items.length === 0) {
            console.log('Корзина пуста, синхронизация не требуется');
            return;
        }

        try {
            // Очищаем серверную корзину перед синхронизацией
            await fetch('http://localhost:8080/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Добавляем все товары из localStorage корзины в серверную корзину
            const items = window.cart.items;
            for (const item of items) {
                await fetch('http://localhost:8080/api/cart/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: item.id,
                        quantity: item.quantity || 1
                    })
                });
            }

            console.log('Корзина синхронизирована с сервером');
        } catch (error) {
            console.error('Ошибка синхронизации корзины:', error);
            // Не бросаем ошибку, продолжаем создание заказа
            // Если API недоступен, сервер может создать заказ из пустой корзины
        }
    }

    static async createOrder(orderData) {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Необходима авторизация');
        }

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const order = await response.json();
            console.log('Order created:', order);
            
            // Сохраняем заказ в localStorage для демо-режима
            // Это позволит видеть заказы даже если API временно недоступен
            try {
                const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
                // Проверяем, не существует ли уже этот заказ
                const orderExists = existingOrders.some(o => o.id === order.id);
                if (!orderExists) {
                    // Преобразуем формат заказа из API в формат для localStorage
                    // Убеждаемся, что userId - число
                    const demoOrder = {
                        id: order.id,
                        userId: Number(order.userId) || order.userId,
                        username: order.username || 'Пользователь',
                        shippingAddress: order.shippingAddress || '',
                        notes: order.notes || '',
                        status: order.status || 'PENDING',
                        totalAmount: order.totalAmount || 0,
                        createdAt: order.createdAt || new Date().toISOString(),
                        items: order.items || []
                    };
                    existingOrders.unshift(demoOrder);
                    localStorage.setItem('demoOrders', JSON.stringify(existingOrders));
                    console.log(`Заказ #${order.id} также сохранен в localStorage для демо-режима (userId: ${demoOrder.userId})`);
                } else {
                    console.log(`Заказ #${order.id} уже существует в localStorage`);
                }
            } catch (e) {
                console.warn('Ошибка сохранения заказа в localStorage:', e);
            }
            
            return order;

        } catch (error) {
            // Если API недоступен, симулируем успешное создание заказа
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.log('API недоступен, используем демо-режим');
                return this.createDemoOrder(orderData);
            }
            throw error;
        }
    }

    static createDemoOrder(orderData) {
        // Демо-режим: создаем заказ и сохраняем в localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user.userId || 1;
        
        const order = {
            id: Date.now(),
            userId: userId, // Сохраняем userId как число
            username: user.username || 'Пользователь',
            shippingAddress: orderData.shippingAddress || '',
            notes: orderData.notes || '',
            status: 'PENDING',
            totalAmount: window.cart ? window.cart.getTotal() : 0,
            createdAt: new Date().toISOString(),
            items: window.cart ? window.cart.items.map((item, index) => ({
                id: Date.now() + index,
                productId: item.id,
                productName: item.name || 'Товар',
                productPrice: item.price,
                quantity: item.quantity || 1,
                subTotal: item.price * (item.quantity || 1)
            })) : []
        };

        // Сохраняем заказ в localStorage
        const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        existingOrders.unshift(order); // Добавляем в начало списка
        localStorage.setItem('demoOrders', JSON.stringify(existingOrders));

        console.log(`Демо-заказ #${order.id} сохранен в localStorage для пользователя ${userId}:`, order);
        return order;
    }

    static showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.style.borderColor = '#ef4444';
        }
        
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    static clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.textContent = '');

        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e5e7eb';
        });
    }

    static showError(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    static showSuccess(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    static showEmptyCart() {
        const container = document.querySelector('.checkout-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Корзина пуста</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Добавьте товары в корзину перед оформлением заказа</p>
                    <a href="products.html" class="btn btn-primary">Перейти к товарам</a>
                </div>
            `;
        }
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }
}

window.CheckoutComponent = CheckoutComponent;

