class ProfileService {
    static async getProfile(orders = null) {
        try {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            
            // Если заказы не переданы, загружаем их
            if (!orders) {
                orders = await this.getOrders();
            }
            
            // Подсчитываем статистику из реальных заказов
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => {
                return sum + (parseFloat(order.totalAmount) || 0);
            }, 0);

            // Безопасное получение cartItems
            let cartItems = 0;
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                cartItems = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
            } catch (e) {
                cartItems = 0;
            }

            return {
                id: user.id || 1,
                username: user.username || 'Гость',
                email: user.email || 'guest@example.com',
                role: user.role || 'ROLE_USER',
                createdAt: new Date().toISOString(),
                totalOrders: totalOrders,
                totalSpent: totalSpent,
                cartItems: cartItems
            };
        } catch (error) {
            console.error('Failed to load profile:', error);
            return this.getMockProfile();
        }
    }

    static async getOrders(forceRefresh = false) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token, returning empty orders');
                return [];
            }

            // Добавляем параметр для предотвращения кеширования
            const url = 'http://localhost:8080/api/orders' + (forceRefresh ? '?t=' + Date.now() : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const orders = await response.json();
            console.log('Orders loaded from API:', orders);
            return orders;

        } catch (error) {
            console.warn('API недоступен, переключаемся на демо-режим:', error.message);
            // Если API недоступен, пытаемся загрузить из localStorage (демо-режим)
            const demoOrders = this.getDemoOrders();
            console.log('Заказы из localStorage (демо-режим):', demoOrders);
            if (demoOrders && demoOrders.length > 0) {
                console.log(`Используем ${demoOrders.length} заказов из localStorage`);
                return demoOrders;
            }
            // Иначе используем статические мок-данные
            console.log('Используем статические мок-данные');
            return this.getMockOrders();
        }
    }

    static async updateProfile(data) {
        try {
            console.log('Updating profile:', data);
            // Пока просто симулируем успешное обновление
            return { success: true, message: 'Профиль обновлен' };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return { success: false, message: 'Ошибка обновления профиля' };
        }
    }

    // Мок-данные для профиля
    static getMockProfile() {
        const user = JSON.parse(localStorage.getItem('user')) || {};

        // Безопасное получение cartItems
        let cartItems = 0;
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cartItems = Array.isArray(cart) ? cart.length : 0;
        } catch (e) {
            cartItems = 0;
        }

        return {
            id: user.id || 1,
            username: user.username || 'Гость',
            email: user.email || 'guest@example.com',
            role: user.role || 'ROLE_USER',
            createdAt: new Date().toISOString(),
            totalOrders: 3,
            totalSpent: 45500,
            cartItems: cartItems
        };
    }

    // Получить заказы из localStorage (демо-режим)
    static getDemoOrders() {
        try {
            const ordersStr = localStorage.getItem('demoOrders');
            if (!ordersStr) {
                console.log('localStorage не содержит demoOrders');
                return [];
            }
            
            const orders = JSON.parse(ordersStr);
            if (!Array.isArray(orders)) {
                console.warn('demoOrders в localStorage не является массивом:', orders);
                return [];
            }
            
            // Фильтруем заказы текущего пользователя
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Текущий пользователь:', user);
            
            if (user.id) {
                const filteredOrders = orders.filter(order => {
                    // Поддерживаем оба формата: userId (число) и userId (строка)
                    return order.userId === user.id || order.userId === String(user.id) || order.userId === Number(user.id);
                });
                console.log(`Отфильтровано заказов для пользователя ${user.id}: ${filteredOrders.length} из ${orders.length}`);
                return filteredOrders;
            }
            
            // Если у пользователя нет id, возвращаем все заказы
            console.log(`Возвращаем все ${orders.length} заказов (пользователь без id)`);
            return orders;
        } catch (error) {
            console.error('Ошибка загрузки демо-заказов из localStorage:', error);
            return [];
        }
    }

    // Мок-данные для заказов
    static getMockOrders() {
        return [
            {
                id: 1,
                createdAt: '2024-01-15T14:30:00',
                status: 'DELIVERED',
                totalAmount: 29990,
                items: [
                    { productName: 'iPhone 15 Pro', quantity: 1, price: 29990 }
                ]
            },
            {
                id: 2,
                createdAt: '2024-01-10T10:15:00',
                status: 'SHIPPED',
                totalAmount: 89990,
                items: [
                    { productName: 'MacBook Air M2', quantity: 1, price: 89990 }
                ]
            },
            {
                id: 3,
                createdAt: '2024-01-05T16:45:00',
                status: 'PENDING',
                totalAmount: 15980,
                items: [
                    { productName: 'Sony WH-1000XM5', quantity: 1, price: 29990 },
                    { productName: 'USB-C Кабель', quantity: 2, price: 1490 }
                ]
            }
        ];
    }

    static formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    static formatPrice(price) {
        if (!price) return '0 BYN';
        // Если price - это объект BigDecimal, преобразуем в число
        const numPrice = typeof price === 'object' ? parseFloat(price) : parseFloat(price);
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numPrice) + ' BYN';
    }

    static getStatusText(status) {
        const statusMap = {
            'PENDING': 'Ожидание',
            'CONFIRMED': 'Подтвержден',
            'SHIPPED': 'Отправлен',
            'DELIVERED': 'Доставлен',
            'CANCELLED': 'Отменен'
        };
        return statusMap[status] || status;
    }
}

window.ProfileService = ProfileService;