class ProfileService {
    static async getProfile() {
        try {
            // Пока используем мок-данные
            return this.getMockProfile();
        } catch (error) {
            console.error('Failed to load profile:', error);
            return this.getMockProfile();
        }
    }

    static async getOrders() {
        try {
            return this.getMockOrders();
        } catch (error) {
            console.error('Failed to load orders:', error);
            return [];
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
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
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