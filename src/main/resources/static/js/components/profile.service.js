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
            throw error;
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
            console.error('Failed to load orders from API:', error);
            throw error;
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