class AdminService {
    // ============ ПОЛЬЗОВАТЕЛИ ============

    static async getUsers(forceRefresh = false) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация. Войдите в систему.');
            }

            // Загружаем пользователей из API
            const response = await fetch('http://localhost:8080/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Недостаточно прав для просмотра пользователей. Войдите как администратор.');
                }
                
                throw new Error(`Ошибка загрузки пользователей: HTTP ${response.status}`);
            }

            const users = await response.json();
            console.log('Users loaded from API:', users);
            
            if (!Array.isArray(users)) {
                throw new Error('Некорректный формат данных от сервера');
            }
            
            return users;

        } catch (error) {
            console.error('Failed to load users from API:', error);
            throw error;
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

    static async toggleUserStatus(userId, enabled) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/status?enabled=${enabled}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const updatedUser = await response.json();
            console.log('User status updated:', updatedUser);
            return {
                success: true,
                message: enabled ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
                user: updatedUser
            };

        } catch (error) {
            console.error('Failed to toggle user status:', error);
            throw error;
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
            // Загружаем товары из API
            const response = await fetch('http://localhost:8080/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки товаров: HTTP ${response.status}`);
            }

            const products = await response.json();
            console.log('Products loaded from API for admin:', products.length);
            
            // Преобразуем товары в нужный формат для админ-панели
            return products.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category ? (typeof product.category === 'object' ? product.category.name : product.category) : '',
                stock: product.stockQuantity || 0,
                createdAt: product.createdAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to load products:', error);
            throw error;
        }
    }

    static async createProduct(productData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            console.log('Creating product:', productData);

            try {
                const response = await fetch('http://localhost:8080/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
                }

                const product = await response.json();
                console.log('Product created:', product);
                return {
                    success: true,
                    message: 'Товар успешно создан',
                    product: product
                };
            } catch (apiError) {
                // Если API недоступен, используем демо-режим
                if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
                    console.warn('API недоступен, используем демо-режим');
                    return {
                        success: true,
                        message: 'Товар создан (демо-режим)',
                        product: { id: Date.now(), ...productData }
                    };
                }
                throw apiError;
            }
        } catch (error) {
            console.error('Failed to create product:', error);
            return {
                success: false,
                message: error.message || 'Ошибка создания товара'
            };
        }
    }

    static async updateProduct(productId, productData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            console.log(`Updating product ${productId}:`, productData);

            try {
                const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
                }

                const product = await response.json();
                console.log('Product updated:', product);
                return {
                    success: true,
                    message: 'Товар успешно обновлен',
                    product: product
                };
            } catch (apiError) {
                // Если API недоступен, используем демо-режим
                if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
                    console.warn('API недоступен, используем демо-режим');
                    return {
                        success: true,
                        message: 'Товар обновлен (демо-режим)'
                    };
                }
                throw apiError;
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            return {
                success: false,
                message: error.message || 'Ошибка обновления товара'
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
            const response = await fetch('http://localhost:8080/api/categories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки категорий: HTTP ${response.status}`);
            }

            const categories = await response.json();
            console.log('Categories loaded from API:', categories);
            return categories;
        } catch (error) {
            console.error('Failed to load categories:', error);
            throw error;
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

    static async getOrders(statusFilter = 'all', forceRefresh = false) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация. Войдите в систему.');
            }

            const url = 'http://localhost:8080/api/orders/all';
            console.log('Fetching orders from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Недостаточно прав для просмотра заказов. Проверьте, что вы вошли как администратор.');
                }
                
                throw new Error(`Ошибка загрузки заказов: HTTP ${response.status}`);
            }

            const orders = await response.json();
            console.log('Orders loaded from API:', orders);
            
            if (!Array.isArray(orders)) {
                throw new Error('Некорректный формат данных от сервера');
            }
            
            return this.filterOrdersByStatus(orders, statusFilter);

        } catch (error) {
            console.error('Failed to load orders from API:', error);
            throw error;
        }
    }

    static filterOrdersByStatus(orders, statusFilter) {
        if (!statusFilter || statusFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === statusFilter);
    }

    static async updateOrderStatus(orderId, newStatus) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const updatedOrder = await response.json();
            console.log('Order status updated:', updatedOrder);
            
            return {
                success: true,
                message: 'Статус заказа обновлен',
                order: updatedOrder
            };
        } catch (error) {
            console.error('Failed to update order status:', error);
            return {
                success: false,
                message: error.message || 'Ошибка обновления статуса заказа'
            };
        }
    }

    // ============ СТАТИСТИКА ============

    static async getStats() {
        try {
            // Получаем реальные данные для статистики
            const users = await this.getUsers();
            const orders = await this.getOrders('all');
            const products = await this.getProducts();
            
            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
            
            // Вычисляем выручку за сегодня
            const today = new Date();
            const todayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate.toDateString() === today.toDateString();
            });
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
            
            // Вычисляем месячную выручку
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthlyOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate >= monthStart;
            });
            const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

            return {
                totalUsers: users.length,
                totalProducts: products.length,
                todayRevenue: todayRevenue,
                pendingOrders: pendingOrders,
                monthlyRevenue: monthlyRevenue,
                popularProducts: [] // Можно добавить логику для популярных товаров в будущем
            };
        } catch (error) {
            console.error('Failed to load stats:', error);
            throw error;
        }
    }


    // ============ УТИЛИТЫ ============

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' BYN';
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

    static formatDateTime(dateString) {
        if (!dateString) return 'Не указана';
        
        try {
            // Если дата в формате "yyyy-MM-dd HH:mm:ss", нужно заменить пробел на 'T'
            let dateValue = dateString;
            if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
                dateValue = dateString.replace(' ', 'T');
            }
            
            const date = new Date(dateValue);
            
            // Проверяем, что дата валидна
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return dateString;
            }
            
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.warn('Error formatting date:', dateString, e);
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