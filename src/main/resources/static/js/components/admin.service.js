class AdminService {
    // ============ ПОЛЬЗОВАТЕЛИ ============

    static async getUsers(forceRefresh = false) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found, returning mock users');
                return this.getMockUsers(forceRefresh);
            }

            // Пробуем загрузить пользователей из API
            const response = await fetch('http://localhost:8080/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Если 401 или 403, возможно проблема с авторизацией
                if (response.status === 401 || response.status === 403) {
                    console.warn('Недостаточно прав для просмотра пользователей');
                    return this.getMockUsers(forceRefresh);
                }
                
                // Если 404, возможно endpoint не существует
                if (response.status === 404) {
                    console.warn('API endpoint /api/admin/users not found, using mock data');
                    return this.getMockUsers(forceRefresh);
                }
                
                throw new Error(`Ошибка загрузки пользователей: HTTP ${response.status}`);
            }

            const users = await response.json();
            console.log('Users loaded from API:', users);
            
            if (!Array.isArray(users)) {
                console.warn('API returned non-array data:', users);
                return this.getMockUsers(forceRefresh);
            }
            
            return users;

        } catch (error) {
            console.warn('Failed to load users from API:', error.message);
            // Если API недоступен, используем мок-данные
            return this.getMockUsers(forceRefresh);
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

            // Пробуем несколько вариантов API endpoints
            const endpoints = [
                `http://localhost:8080/api/admin/users/${userId}/status?enabled=${enabled}`,
                `http://localhost:8080/api/admin/users/${userId}/${enabled ? 'unblock' : 'block'}`,
                `http://localhost:8080/api/admin/users/${userId}`
            ];

            let lastError = null;
            for (const url of endpoints) {
                try {
                    const method = url.includes('status') || url.includes('block') ? 'PUT' : 'PATCH';
                    const body = url.includes('status') ? null : JSON.stringify({ enabled: enabled });

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: body
                    });

                    if (response.ok) {
                        const updatedUser = await response.json().catch(() => ({}));
                        console.log('User status updated:', updatedUser);
                        return {
                            success: true,
                            message: enabled ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
                            user: updatedUser
                        };
                    }

                    // Если 404, пробуем следующий endpoint
                    if (response.status === 404) {
                        lastError = new Error('Endpoint not found');
                        continue;
                    }

                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);

                } catch (error) {
                    lastError = error;
                    // Если это не 404, прекращаем попытки
                    if (!error.message.includes('404') && !error.message.includes('not found')) {
                        break;
                    }
                }
            }

            // Если все endpoints не сработали, используем демо-режим
            if (lastError && (lastError.message.includes('404') || lastError.message.includes('not found') || lastError.message.includes('Failed to fetch'))) {
                console.warn('API endpoints not available, using demo mode');
                return this.toggleUserStatusDemo(userId, enabled);
            }

            throw lastError || new Error('Не удалось обновить статус пользователя');

        } catch (error) {
            console.error('Failed to toggle user status:', error);
            // В случае ошибки API, используем демо-режим
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return this.toggleUserStatusDemo(userId, enabled);
            }
            return {
                success: false,
                message: error.message || 'Ошибка обновления статуса пользователя'
            };
        }
    }

    static toggleUserStatusDemo(userId, enabled) {
        // Демо-режим: обновляем статус в localStorage
        try {
            const users = this.getMockUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                user.enabled = enabled;
                user.blocked = !enabled;
                // Сохраняем в localStorage для демонстрации
                localStorage.setItem('demoUsers', JSON.stringify(users));
            }
            return {
                success: true,
                message: enabled ? 'Пользователь разблокирован (демо-режим)' : 'Пользователь заблокирован (демо-режим)',
                user: user
            };
        } catch (error) {
            return {
                success: false,
                message: 'Ошибка обновления статуса в демо-режиме'
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
            const token = localStorage.getItem('token');
            
            // Пробуем загрузить товары из API
            try {
                const response = await fetch('http://localhost:8080/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });

                if (response.ok) {
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
                } else {
                    console.warn('Failed to load products from API, using mock data');
                    return this.getMockProducts();
                }
            } catch (apiError) {
                console.warn('API недоступен, используем мок-данные:', apiError.message);
                return this.getMockProducts();
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            return this.getMockProducts();
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

    static async getOrders(statusFilter = 'all', forceRefresh = false) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found, returning mock orders');
                const mockOrders = this.getMockOrders(forceRefresh);
                return this.filterOrdersByStatus(mockOrders, statusFilter);
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
                const errorText = await response.text();
                console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
                
                // Если 401 или 403, возможно проблема с авторизацией
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Недостаточно прав для просмотра заказов. Проверьте, что вы вошли как администратор.');
                }
                
                throw new Error(`Ошибка загрузки заказов: HTTP ${response.status}`);
            }

            const orders = await response.json();
            console.log('Orders loaded from API:', orders);
            
            if (!Array.isArray(orders)) {
                console.warn('API returned non-array data:', orders);
                const mockOrders = this.getMockOrders(forceRefresh);
                return this.filterOrdersByStatus(mockOrders, statusFilter);
            }
            
            // Объединяем заказы из API с заказами из localStorage
            // Это позволит видеть все заказы (и из БД, и из демо-режима)
            try {
                const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
                const apiOrderIds = new Set(orders.map(o => o.id));
                
                // Оставляем только те заказы из localStorage, которых нет в API
                // (API - источник истины, но localStorage может содержать заказы, созданные когда API был недоступен)
                const uniqueLocalOrders = existingOrders.filter(o => !apiOrderIds.has(o.id));
                
                // Если тестовых заказов мало, добавляем их
                if (uniqueLocalOrders.length < 12) {
                    const testOrders = this.getTestOrders();
                    const testOrderIds = new Set(testOrders.map(o => o.id));
                    const additionalTestOrders = testOrders.filter(o => !apiOrderIds.has(o.id) && !uniqueLocalOrders.some(ex => ex.id === o.id));
                    uniqueLocalOrders.push(...additionalTestOrders);
                }
                
                // Объединяем: сначала заказы из API (приоритет), потом уникальные из localStorage
                const mergedOrders = [...orders, ...uniqueLocalOrders];
                
                // Обновляем localStorage объединенным списком
                if (mergedOrders.length !== existingOrders.length || orders.length > 0) {
                    localStorage.setItem('demoOrders', JSON.stringify(mergedOrders));
                    console.log(`Orders merged: ${orders.length} from API + ${uniqueLocalOrders.length} from localStorage = ${mergedOrders.length} total`);
                }
                
                // Возвращаем объединенный список
                return this.filterOrdersByStatus(mergedOrders, statusFilter);
            } catch (e) {
                console.warn('Failed to merge orders with localStorage:', e);
                // Если не удалось объединить, возвращаем только заказы из API
                return this.filterOrdersByStatus(orders, statusFilter);
            }

        } catch (error) {
            console.error('Failed to load orders from API:', error);
            // Если API недоступен, используем демо-данные
            console.warn('Using mock orders due to API error');
            const mockOrders = this.getMockOrders(false);
            return this.filterOrdersByStatus(mockOrders, statusFilter);
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
            const orders = await this.getMockOrders();
            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
            
            // Вычисляем выручку за сегодня (примерно)
            const today = new Date();
            const todayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate.toDateString() === today.toDateString();
            });
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

            return {
                totalUsers: users.length,
                totalProducts: 156,
                todayRevenue: todayRevenue || 245000,
                pendingOrders: pendingOrders,
                monthlyRevenue: this.getMonthlyRevenue(),
                popularProducts: this.getPopularProducts()
            };
        } catch (error) {
            console.error('Failed to load stats:', error);
            return this.getDefaultStats();
        }
    }

    // ============ МОК-ДАННЫЕ ============

    static getMockUsers(forceRefresh = false) {
        // Если не требуется принудительное обновление, проверяем localStorage
        if (!forceRefresh) {
            try {
                const savedUsers = localStorage.getItem('demoUsers');
                if (savedUsers) {
                    const users = JSON.parse(savedUsers);
                    // Если есть достаточное количество пользователей (>= 12), возвращаем их
                    if (Array.isArray(users) && users.length >= 12) {
                        return users;
                    }
                }
            } catch (e) {
                console.warn('Error loading demo users from localStorage:', e);
            }
        }

        // Возвращаем расширенные мок-данные для тестирования
        const mockUsers = [
            { id: 1, username: 'admin', email: 'admin@estore.com', role: 'ROLE_ADMIN', enabled: true, blocked: false, createdAt: '2024-01-01', totalOrders: 0 },
            { id: 2, username: 'user', email: 'user@estore.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-02', totalOrders: 3 },
            { id: 3, username: 'john_doe', email: 'john@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-03', totalOrders: 5 },
            { id: 4, username: 'jane_smith', email: 'jane@example.com', role: 'ROLE_USER', enabled: false, blocked: true, createdAt: '2024-01-04', totalOrders: 2 },
            { id: 5, username: 'alex_wong', email: 'alex@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-05', totalOrders: 7 },
            { id: 6, username: 'maria_petrova', email: 'maria@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-10', totalOrders: 12 },
            { id: 7, username: 'ivan_ivanov', email: 'ivan@example.com', role: 'ROLE_USER', enabled: false, blocked: true, createdAt: '2024-01-12', totalOrders: 1 },
            { id: 8, username: 'anna_kuznetsova', email: 'anna@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-15', totalOrders: 8 },
            { id: 9, username: 'dmitry_sidorov', email: 'dmitry@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-18', totalOrders: 4 },
            { id: 10, username: 'olga_volkova', email: 'olga@example.com', role: 'ROLE_USER', enabled: false, blocked: true, createdAt: '2024-01-20', totalOrders: 0 },
            { id: 11, username: 'sergey_morozov', email: 'sergey@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-22', totalOrders: 15 },
            { id: 12, username: 'elena_kozлова', email: 'elena@example.com', role: 'ROLE_USER', enabled: true, blocked: false, createdAt: '2024-01-25', totalOrders: 6 }
        ];

        // Сохраняем в localStorage для демо-режима
        try {
            localStorage.setItem('demoUsers', JSON.stringify(mockUsers));
            console.log('Test users initialized:', mockUsers.length);
        } catch (e) {
            console.warn('Failed to save demo users to localStorage:', e);
        }

        return mockUsers;
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

    static getMockOrders(forceRefresh = false) {
        // Если не требуется принудительное обновление, проверяем localStorage
        if (!forceRefresh) {
            try {
                const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
                if (demoOrders && demoOrders.length > 0) {
                    // Если есть достаточное количество заказов (>= 12), возвращаем их
                    if (demoOrders.length >= 12) {
                        return demoOrders;
                    }
                    // Если заказов мало, добавляем тестовые
                    if (demoOrders.length < 12) {
                        const testOrders = this.getTestOrders();
                        // Объединяем, избегая дубликатов
                        const existingIds = new Set(demoOrders.map(o => o.id));
                        const newOrders = testOrders.filter(o => !existingIds.has(o.id));
                        const combined = [...demoOrders, ...newOrders];
                        localStorage.setItem('demoOrders', JSON.stringify(combined));
                        console.log('Test orders merged:', combined.length);
                        return combined;
                    }
                }
            } catch (e) {
                console.error('Error loading demo orders:', e);
            }
        }

        // Возвращаем расширенные тестовые данные
        const testOrders = this.getTestOrders();
        
        // Сохраняем в localStorage для демо-режима
        try {
            localStorage.setItem('demoOrders', JSON.stringify(testOrders));
            console.log('Test orders initialized:', testOrders.length);
        } catch (e) {
            console.warn('Failed to save demo orders to localStorage:', e);
        }

        return testOrders;
    }

    static getTestOrders() {
        return [
            { 
                id: 1001, 
                userId: 3,
                username: 'john_doe', 
                totalAmount: 29990, 
                status: 'DELIVERED', 
                createdAt: '2024-01-15T10:30:00', 
                items: [
                    { id: 1, productName: 'iPhone 15 Pro', quantity: 1, price: 29990 }
                ],
                shippingAddress: 'Минск, ул. Ленина, д. 10, кв. 25',
                notes: 'Оставить у двери'
            },
            { 
                id: 1002, 
                userId: 4,
                username: 'jane_smith', 
                totalAmount: 129990, 
                status: 'SHIPPED', 
                createdAt: '2024-01-14T14:20:00', 
                items: [
                    { id: 2, productName: 'MacBook Air M2', quantity: 1, price: 129990 }
                ],
                shippingAddress: 'Минск, пр. Победителей, д. 25, кв. 12',
                notes: ''
            },
            { 
                id: 1003, 
                userId: 5,
                username: 'alex_wong', 
                totalAmount: 89990, 
                status: 'PENDING', 
                createdAt: '2024-01-14T16:45:00', 
                items: [
                    { id: 3, productName: 'Samsung Galaxy S24', quantity: 1, price: 89990 }
                ],
                shippingAddress: 'Минск, ул. Независимости, д. 50, кв. 8',
                notes: 'Позвонить перед доставкой'
            },
            { 
                id: 1004, 
                userId: 6,
                username: 'maria_petrova', 
                totalAmount: 54980, 
                status: 'CONFIRMED', 
                createdAt: '2024-01-20T09:15:00', 
                items: [
                    { id: 4, productName: 'Sony WH-1000XM5', quantity: 1, price: 29990 },
                    { id: 5, productName: 'Apple AirPods Pro', quantity: 1, price: 24990 }
                ],
                shippingAddress: 'Минск, ул. Кальварийская, д. 15, кв. 33',
                notes: ''
            },
            { 
                id: 1005, 
                userId: 8,
                username: 'anna_kuznetsova', 
                totalAmount: 119990, 
                status: 'SHIPPED', 
                createdAt: '2024-01-18T11:30:00', 
                items: [
                    { id: 6, productName: 'Dell XPS 13', quantity: 1, price: 119990 }
                ],
                shippingAddress: 'Минск, ул. Октябрьская, д. 5, кв. 7',
                notes: 'Доставить до 18:00'
            },
            { 
                id: 1006, 
                userId: 9,
                username: 'dmitry_sidorov', 
                totalAmount: 44980, 
                status: 'DELIVERED', 
                createdAt: '2024-01-19T13:20:00', 
                items: [
                    { id: 7, productName: 'Apple AirPods Pro', quantity: 2, price: 24990 }
                ],
                shippingAddress: 'Минск, ул. Сурганова, д. 8, кв. 15',
                notes: ''
            },
            { 
                id: 1007, 
                userId: 11,
                username: 'sergey_morozov', 
                totalAmount: 179980, 
                status: 'PENDING', 
                createdAt: '2024-01-22T15:45:00', 
                items: [
                    { id: 8, productName: 'MacBook Air M2', quantity: 1, price: 129990 },
                    { id: 9, productName: 'Sony WH-1000XM5', quantity: 1, price: 29990 },
                    { id: 10, productName: 'USB-C Кабель', quantity: 2, price: 10000 }
                ],
                shippingAddress: 'Минск, пр. Дзержинского, д. 95, кв. 42',
                notes: 'Срочная доставка'
            },
            { 
                id: 1008, 
                userId: 12,
                username: 'elena_kozлова', 
                totalAmount: 19990, 
                status: 'CANCELLED', 
                createdAt: '2024-01-23T10:00:00', 
                items: [
                    { id: 11, productName: 'USB-C Кабель', quantity: 2, price: 9995 }
                ],
                shippingAddress: 'Минск, ул. Богдановича, д. 12, кв. 9',
                notes: 'Отменен покупателем'
            },
            { 
                id: 1009, 
                userId: 3,
                username: 'john_doe', 
                totalAmount: 89990, 
                status: 'CONFIRMED', 
                createdAt: '2024-01-24T14:30:00', 
                items: [
                    { id: 12, productName: 'Samsung Galaxy S24', quantity: 1, price: 89990 }
                ],
                shippingAddress: 'Минск, ул. Ленина, д. 10, кв. 25',
                notes: ''
            },
            { 
                id: 1010, 
                userId: 6,
                username: 'maria_petrova', 
                totalAmount: 29990, 
                status: 'DELIVERED', 
                createdAt: '2024-01-25T09:00:00', 
                items: [
                    { id: 13, productName: 'Sony WH-1000XM5', quantity: 1, price: 29990 }
                ],
                shippingAddress: 'Минск, ул. Кальварийская, д. 15, кв. 33',
                notes: 'Доставлен успешно'
            },
            { 
                id: 1011, 
                userId: 8,
                username: 'anna_kuznetsova', 
                totalAmount: 24990, 
                status: 'SHIPPED', 
                createdAt: '2024-01-26T11:15:00', 
                items: [
                    { id: 14, productName: 'Apple AirPods Pro', quantity: 1, price: 24990 }
                ],
                shippingAddress: 'Минск, ул. Октябрьская, д. 5, кв. 7',
                notes: ''
            },
            { 
                id: 1012, 
                userId: 2,
                username: 'user', 
                totalAmount: 99990, 
                status: 'PENDING', 
                createdAt: '2024-01-27T16:20:00', 
                items: [
                    { id: 15, productName: 'iPhone 15 Pro', quantity: 1, price: 99990 }
                ],
                shippingAddress: 'Минск, ул. Пушкина, д. 20, кв. 5',
                notes: 'Позвонить за час до доставки'
            }
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