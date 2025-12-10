class AdminService {
    // ============ ПОЛЬЗОВАТЕЛИ ============

    static async getUsers() {
        try {
            // Пока используем мок-данные
            return this.getMockUsers();
        } catch (error) {
            console.error('Failed to load users:', error);
            return this.getMockUsers();
        }
    }

    static async updateUserRole(userId, newRole) {
        try {
            console.log(`Updating user ${userId} role to ${newRole}`);
            // Пока просто симулируем успешное обновление
            return {
                success: true,
                message: 'Роль пользователя обновлена'
            };
        } catch (error) {
            console.error('Failed to update user role:', error);
            return {
                success: false,
                message: 'Ошибка обновления роли'
            };
        }
    }

    static async deleteUser(userId) {
        try {
            console.log(`Deleting user ${userId}`);
            // Пока просто симулируем успешное удаление
            return {
                success: true,
                message: 'Пользователь удален'
            };
        } catch (error) {
            console.error('Failed to delete user:', error);
            return {
                success: false,
                message: 'Ошибка удаления пользователя'
            };
        }
    }

    // ============ ТОВАРЫ ============

    static async getProducts() {
        try {
            // Пока используем мок-данные
            return this.getMockProducts();
        } catch (error) {
            console.error('Failed to load products:', error);
            return this.getMockProducts();
        }
    }

    static async createProduct(productData) {
        try {
            console.log('Creating product:', productData);
            // Пока просто симулируем успешное создание
            return {
                success: true,
                message: 'Товар создан',
                product: { id: Date.now(), ...productData }
            };
        } catch (error) {
            console.error('Failed to create product:', error);
            return {
                success: false,
                message: 'Ошибка создания товара'
            };
        }
    }

    static async updateProduct(productId, productData) {
        try {
            console.log(`Updating product ${productId}:`, productData);
            // Пока просто симулируем успешное обновление
            return {
                success: true,
                message: 'Товар обновлен'
            };
        } catch (error) {
            console.error('Failed to update product:', error);
            return {
                success: false,
                message: 'Ошибка обновления товара'
            };
        }
    }

    static async deleteProduct(productId) {
        try {
            console.log(`Deleting product ${productId}`);
            // Пока просто симулируем успешное удаление
            return {
                success: true,
                message: 'Товар удален'
            };
        } catch (error) {
            console.error('Failed to delete product:', error);
            return {
                success: false,
                message: 'Ошибка удаления товара'
            };
        }
    }

    // ============ КАТЕГОРИИ ============

    static async getCategories() {
        try {
            return this.getMockCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
            return this.getMockCategories();
        }
    }

    static async createCategory(categoryData) {
        try {
            console.log('Creating category:', categoryData);
            return {
                success: true,
                message: 'Категория создана',
                category: { id: Date.now(), ...categoryData }
            };
        } catch (error) {
            console.error('Failed to create category:', error);
            return {
                success: false,
                message: 'Ошибка создания категории'
            };
        }
    }

    static async updateCategory(categoryId, categoryData) {
        try {
            console.log(`Updating category ${categoryId}:`, categoryData);
            return {
                success: true,
                message: 'Категория обновлена'
            };
        } catch (error) {
            console.error('Failed to update category:', error);
            return {
                success: false,
                message: 'Ошибка обновления категории'
            };
        }
    }

    static async deleteCategory(categoryId) {
        try {
            console.log(`Deleting category ${categoryId}`);
            return {
                success: true,
                message: 'Категория удалена'
            };
        } catch (error) {
            console.error('Failed to delete category:', error);
            return {
                success: false,
                message: 'Ошибка удаления категории'
            };
        }
    }

    // ============ ЗАКАЗЫ ============

    static async getOrders() {
        try {
            return this.getMockOrders();
        } catch (error) {
            console.error('Failed to load orders:', error);
            return this.getMockOrders();
        }
    }

    static async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`Updating order ${orderId} status to ${newStatus}`);
            return {
                success: true,
                message: 'Статус заказа обновлен'
            };
        } catch (error) {
            console.error('Failed to update order status:', error);
            return {
                success: false,
                message: 'Ошибка обновления статуса заказа'
            };
        }
    }

    // ============ СТАТИСТИКА ============

    static async getStats() {
        try {
            return {
                totalUsers: 42,
                totalProducts: 156,
                todayRevenue: 245000,
                pendingOrders: 8,
                monthlyRevenue: this.getMonthlyRevenue(),
                popularProducts: this.getPopularProducts()
            };
        } catch (error) {
            console.error('Failed to load stats:', error);
            return this.getDefaultStats();
        }
    }

    // ============ МОК-ДАННЫЕ ============

    static getMockUsers() {
        return [
            { id: 1, username: 'admin', email: 'admin@estore.com', role: 'ROLE_ADMIN', createdAt: '2024-01-01', totalOrders: 0 },
            { id: 2, username: 'user', email: 'user@estore.com', role: 'ROLE_USER', createdAt: '2024-01-02', totalOrders: 3 },
            { id: 3, username: 'john_doe', email: 'john@example.com', role: 'ROLE_USER', createdAt: '2024-01-03', totalOrders: 5 },
            { id: 4, username: 'jane_smith', email: 'jane@example.com', role: 'ROLE_USER', createdAt: '2024-01-04', totalOrders: 2 },
            { id: 5, username: 'alex_wong', email: 'alex@example.com', role: 'ROLE_USER', createdAt: '2024-01-05', totalOrders: 7 }
        ];
    }

    static getMockProducts() {
        return [
            { id: 1, name: 'iPhone 15 Pro', price: 99990, category: 'Смартфоны', stock: 15, createdAt: '2024-01-10' },
            { id: 2, name: 'Samsung Galaxy S24', price: 89990, category: 'Смартфоны', stock: 22, createdAt: '2024-01-11' },
            { id: 3, name: 'MacBook Air M2', price: 129990, category: 'Ноутбуки', stock: 8, createdAt: '2024-01-12' },
            { id: 4, name: 'Dell XPS 13', price: 119990, category: 'Ноутбуки', stock: 12, createdAt: '2024-01-13' },
            { id: 5, name: 'Sony WH-1000XM5', price: 29990, category: 'Аудиотехника', stock: 45, createdAt: '2024-01-14' },
            { id: 6, name: 'Apple AirPods Pro', price: 24990, category: 'Аудиотехника', stock: 32, createdAt: '2024-01-15' }
        ];
    }

    static getMockCategories() {
        return [
            { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны', productCount: 8 },
            { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры', productCount: 12 },
            { id: 3, name: 'Телевизоры', description: 'Телевизоры и мониторы', productCount: 6 },
            { id: 4, name: 'Аудиотехника', description: 'Наушники и колонки', productCount: 15 },
            { id: 5, name: 'Гаджеты', description: 'Умные устройства', productCount: 9 }
        ];
    }

    static getMockOrders() {
        return [
            { id: 1001, user: 'john_doe', total: 29990, status: 'DELIVERED', createdAt: '2024-01-15', items: 2 },
            { id: 1002, user: 'jane_smith', total: 129990, status: 'SHIPPED', createdAt: '2024-01-14', items: 1 },
            { id: 1003, user: 'alex_wong', total: 89990, status: 'PENDING', createdAt: '2024-01-14', items: 3 },
            { id: 1004, user: 'user', total: 15980, status: 'CONFIRMED', createdAt: '2024-01-13', items: 2 },
            { id: 1005, user: 'john_doe', total: 24990, status: 'DELIVERED', createdAt: '2024-01-12', items: 1 },
            { id: 1006, user: 'new_user', total: 119990, status: 'CANCELLED', createdAt: '2024-01-11', items: 1 }
        ];
    }

    static getMonthlyRevenue() {
        return [
            { month: 'Янв', revenue: 450000 },
            { month: 'Фев', revenue: 520000 },
            { month: 'Мар', revenue: 480000 },
            { month: 'Апр', revenue: 610000 },
            { month: 'Май', revenue: 550000 },
            { month: 'Июн', revenue: 730000 }
        ];
    }

    static getPopularProducts() {
        return [
            { name: 'iPhone 15 Pro', sales: 45 },
            { name: 'AirPods Pro', sales: 38 },
            { name: 'MacBook Air M2', sales: 22 },
            { name: 'Galaxy S24', sales: 19 },
            { name: 'Sony XM5', sales: 17 }
        ];
    }

    static getDefaultStats() {
        return {
            totalUsers: 0,
            totalProducts: 0,
            todayRevenue: 0,
            pendingOrders: 0,
            monthlyRevenue: [],
            popularProducts: []
        };
    }

    // ============ УТИЛИТЫ ============

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    static formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
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

window.AdminService = AdminService;