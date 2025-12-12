class AdminComponent {
    static async init() {
        console.log('Initializing AdminComponent');

        // Проверяем авторизацию и права админа
        if (!this.isAdmin()) {
            this.redirectToProfile();
            return;
        }

        // Инициализируем тестовые данные (если их еще нет)
        this.initializeTestData();

        // Загружаем статистику
        await this.loadStats();

        // Настраиваем обработчики событий
        this.setupEventListeners();

        // Загружаем первую вкладку (по умолчанию - товары, но можно изменить на orders)
        const defaultTab = new URLSearchParams(window.location.search).get('tab') || 'products';
        await this.loadTab(defaultTab);
    }

    static initializeTestData() {
        // Инициализируем тестовые данные принудительно
        try {
            console.log('Initializing test data...');
            
            // Проверяем, нужно ли обновить данные
            const existingUsers = localStorage.getItem('demoUsers');
            const existingOrders = localStorage.getItem('demoOrders');
            
            let usersCount = 0;
            let ordersCount = 0;
            
            try {
                if (existingUsers) {
                    usersCount = JSON.parse(existingUsers).length;
                }
                if (existingOrders) {
                    ordersCount = JSON.parse(existingOrders).length;
                }
            } catch (e) {
                console.warn('Error parsing existing data:', e);
            }
            
            // Принудительно инициализируем пользователей если их меньше 12
            if (usersCount < 12) {
                const users = AdminService.getMockUsers(true);
                console.log(`Initialized ${users.length} test users (was ${usersCount})`);
            } else {
                console.log(`Users already initialized: ${usersCount}`);
            }
            
            // Принудительно инициализируем заказы если их меньше 12
            if (ordersCount < 12) {
                const orders = AdminService.getMockOrders(true);
                console.log(`Initialized ${orders.length} test orders (was ${ordersCount})`);
            } else {
                console.log(`Orders already initialized: ${ordersCount}`);
            }
        } catch (e) {
            console.warn('Error initializing test data:', e);
        }
    }

    static isAdmin() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        return user.role === 'ROLE_ADMIN';
    }

    static redirectToProfile() {
        window.location.href = 'profile.html';
    }

    static async loadStats() {
        try {
            const stats = await AdminService.getStats();

            // Обновляем статистику
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalProducts').textContent = stats.totalProducts;
            document.getElementById('todayRevenue').textContent = AdminService.formatPrice(stats.todayRevenue);
            document.getElementById('pendingOrders').textContent = stats.pendingOrders;

            // Обновляем графики
            this.updateAnalytics(stats);

        } catch (error) {
            console.error('Error loading stats:', error);
            this.showNotification('Не удалось загрузить статистику', 'error');
        }
    }

    static async loadTab(tabName) {
        try {
            this.showTabLoading(tabName);

            switch (tabName) {
                case 'products':
                    await this.loadProducts();
                    break;
                case 'categories':
                    await this.loadCategories();
                    break;
                case 'orders':
                    await this.loadOrders();
                    break;
                case 'users':
                    await this.loadUsers();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
            }

        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            this.showTabError(tabName, 'Не удалось загрузить данные');
        } finally {
            this.hideTabLoading(tabName);
        }
    }

    static async loadProducts(forceRefresh = false) {
        // Очищаем кэш если требуется принудительное обновление
        if (forceRefresh && ProductsComponent && ProductsComponent.productsCache) {
            ProductsComponent.productsCache = [];
        }
        const products = await AdminService.getProducts();
        this.renderProductsTable(products);
    }

    static async loadCategories() {
        const categories = await AdminService.getCategories();
        this.renderCategoriesTable(categories);
    }

    static async loadOrders(statusFilter = 'all', forceRefresh = false) {
        try {
            console.log('Loading orders with filter:', statusFilter, 'forceRefresh:', forceRefresh);
            const orders = await AdminService.getOrders(statusFilter, forceRefresh);
            console.log('Loaded orders:', orders.length, orders);
            this.renderOrdersTable(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            const container = document.getElementById('ordersTable');
            if (container) {
                container.innerHTML = `<p style="color: red;">Ошибка загрузки заказов: ${error.message}</p>`;
            }
        }
    }

    static async loadUsers() {
        console.log('Loading users...');
        const users = await AdminService.getUsers(false);
        console.log('Users loaded:', users.length, users);
        this.renderUsersTable(users);
    }

    static async refreshUsers() {
        console.log('Refreshing users...');
        this.showNotification('Обновление пользователей...', 'info');
        // Принудительно обновляем данные
        const users = await AdminService.getUsers(true);
        console.log('Users refreshed:', users.length);
        this.renderUsersTable(users);
        this.showNotification(`Загружено ${users.length} пользователей`, 'success');
    }

    static async refreshOrders() {
        console.log('Refreshing orders...');
        const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
        this.showNotification('Обновление заказов...', 'info');
        // Принудительно обновляем данные
        await this.loadOrders(statusFilter, true);
        const orders = await AdminService.getMockOrders(true);
        this.showNotification(`Загружено ${orders.length} заказов`, 'success');
    }

    static async loadAnalytics() {
        const stats = await AdminService.getStats();
        this.renderAnalytics(stats);
    }

    // ============ РЕНДЕРИНГ ТАБЛИЦ ============

    static renderProductsTable(products) {
        const container = document.getElementById('productsTable');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p>Нет товаров</p>';
            return;
        }

        const html = `
            <table class="table-responsive">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Остаток</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td><strong>${product.name}</strong></td>
                            <td>${product.category}</td>
                            <td>${AdminService.formatPrice(product.price)}</td>
                            <td>${product.stock} шт.</td>
                            <td>${AdminService.formatDate(product.createdAt)}</td>
                            <td class="action-buttons">
                                <button class="btn btn-sm btn-edit" onclick="AdminComponent.editProduct(${product.id})">
                                    ✏️
                                </button>
                                <button class="btn btn-sm btn-delete" onclick="AdminComponent.deleteProduct(${product.id})">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    static renderCategoriesTable(categories) {
        const container = document.getElementById('categoriesTable');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = '<p>Нет категорий</p>';
            return;
        }

        const html = `
            <table class="table-responsive">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Товаров</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(category => `
                        <tr>
                            <td>${category.id}</td>
                            <td><strong>${category.name}</strong></td>
                            <td>${category.description}</td>
                            <td>${category.productCount}</td>
                            <td class="action-buttons">
                                <button class="btn btn-sm btn-edit" onclick="AdminComponent.editCategory(${category.id})">
                                    ✏️
                                </button>
                                <button class="btn btn-sm btn-delete" onclick="AdminComponent.deleteCategory(${category.id})">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    static renderOrdersTable(orders) {
        const container = document.getElementById('ordersTable');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>Нет заказов</p>';
            return;
        }

        const html = `
            <table class="table-responsive">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Адрес доставки</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Товаров</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td><strong>#${order.id}</strong></td>
                            <td>${order.username || 'Пользователь'}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.shippingAddress || 'Не указан'}">
                                ${order.shippingAddress || 'Не указан'}
                            </td>
                            <td><strong>${AdminService.formatPrice(order.totalAmount)}</strong></td>
                            <td>
                                <select class="status-select status-${(order.status || 'PENDING').toLowerCase()}" 
                                        onchange="AdminComponent.changeOrderStatus(${order.id}, this.value)"
                                        style="padding: 0.5rem; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 0.875rem; cursor: pointer;">
                                    <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Ожидание</option>
                                    <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Подтвержден</option>
                                    <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Отправлен</option>
                                    <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Доставлен</option>
                                    <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Отменен</option>
                                </select>
                            </td>
                            <td>${AdminService.formatDateTime(order.createdAt)}</td>
                            <td>${order.items ? order.items.length : 0}</td>
                            <td class="action-buttons">
                                <button class="btn btn-sm btn-view" onclick="AdminComponent.viewOrder(${order.id})" title="Просмотр">
                                    👁️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    static renderUsersTable(users) {
        const container = document.getElementById('usersTable');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<p>Нет пользователей</p>';
            return;
        }

        const html = `
            <table class="table-responsive">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Дата регистрации</th>
                        <th>Заказов</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => {
                        // Определяем статус блокировки
                        const isBlocked = user.blocked === true || user.enabled === false;
                        const isEnabled = user.enabled === true && user.blocked !== true;
                        const statusText = isBlocked ? 'Заблокирован' : 'Активен';
                        const statusClass = isBlocked ? 'blocked' : 'active';
                        
                        return `
                        <tr class="${isBlocked ? 'user-blocked' : ''}">
                            <td>${user.id}</td>
                            <td><strong>${user.username}</strong></td>
                            <td>${user.email}</td>
                            <td>
                                <span class="role-badge ${user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}">
                                    ${user.role === 'ROLE_ADMIN' ? 'Админ' : 'Пользователь'}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge status-${statusClass}">
                                    ${statusText}
                                </span>
                            </td>
                            <td>${AdminService.formatDate(user.createdAt)}</td>
                            <td>${user.totalOrders || 0}</td>
                            <td class="action-buttons">
                                ${user.role !== 'ROLE_ADMIN' ? `
                                    <button class="btn btn-sm ${isBlocked ? 'btn-success' : 'btn-warning'}" 
                                            onclick="AdminComponent.toggleUserStatus(${user.id}, ${!isBlocked})"
                                            title="${isBlocked ? 'Разблокировать' : 'Заблокировать'}">
                                        ${isBlocked ? '🔓' : '🔒'}
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-edit" onclick="AdminComponent.editUser(${user.id})" title="Редактировать">
                                    ✏️
                                </button>
                                ${user.role !== 'ROLE_ADMIN' ? `
                                    <button class="btn btn-sm btn-delete" onclick="AdminComponent.deleteUser(${user.id})" title="Удалить">
                                        🗑️
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    static renderAnalytics(stats) {
        // Обновляем график продаж
        const salesChart = document.getElementById('salesChart');
        if (salesChart) {
            salesChart.innerHTML = `
                <div style="padding: 1rem;">
                    <div style="display: flex; align-items: flex-end; height: 150px; gap: 10px;">
                        ${stats.monthlyRevenue.map(item => `
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div style="background: #667eea; width: 30px; height: ${item.revenue / 10000}px; border-radius: 5px;"></div>
                                <div style="margin-top: 5px; font-size: 12px;">${item.month}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="text-align: center; margin-top: 1rem; color: #666;">
                        Продажи за последние 6 месяцев
                    </div>
                </div>
            `;
        }

        // Обновляем популярные товары
        const popularProducts = document.getElementById('popularProducts');
        if (popularProducts) {
            const maxSales = stats.popularProducts[0]?.sales || 1;
            popularProducts.innerHTML = `
                <ul style="list-style: none; padding: 0;">
                    ${stats.popularProducts.map(product => `
                        <li style="margin-bottom: 0.75rem; padding: 0.5rem; background: white; border-radius: 5px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>${product.name}</span>
                                <span style="color: #27ae60; font-weight: bold;">${product.sales} продаж</span>
                            </div>
                            <div style="margin-top: 0.25rem; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; background: #27ae60; width: ${(product.sales / maxSales) * 100}%;"></div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
        }
    }

    // ============ ОБРАБОТЧИКИ СОБЫТИЙ ============

    static setupEventListeners() {
        // Переключение табов
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Кнопки добавления
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showProductForm());
        }

        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showCategoryForm());
        }

        // Фильтр заказов
        const orderFilter = document.getElementById('orderStatusFilter');
        if (orderFilter) {
            orderFilter.addEventListener('change', async (e) => {
                await this.filterOrders(e.target.value);
            });
        }

        // Поиск пользователей
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => this.searchUsers(e.target.value));
        }

        // Кнопка обновления пользователей
        const refreshUsersBtn = document.getElementById('refreshUsersBtn');
        if (refreshUsersBtn) {
            refreshUsersBtn.addEventListener('click', async () => {
                await this.refreshUsers();
            });
        }

        // Кнопка обновления заказов
        const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
        if (refreshOrdersBtn) {
            refreshOrdersBtn.addEventListener('click', async () => {
                await this.refreshOrders();
            });
        }

        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    static switchTab(tabName) {
        // Обновляем активные табы
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Показываем соответствующий контент
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        // Загружаем данные для таба
        this.loadTab(tabName);
    }

    // ============ ФИЛЬТРАЦИЯ И ПОИСК ============

    static async filterOrders(status) {
        console.log('Filtering orders by status:', status);
        try {
            await this.loadOrders(status);
        } catch (error) {
            console.error('Error filtering orders:', error);
            this.showNotification('Ошибка фильтрации заказов', 'error');
        }
    }

    static async searchUsers(query) {
        console.log('Searching users:', query);
        try {
            const users = await AdminService.getUsers();
            
            if (!query || query.trim() === '') {
                this.renderUsersTable(users);
                return;
            }

            // Фильтруем пользователей по запросу
            const searchTerm = query.toLowerCase().trim();
            const filteredUsers = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                (user.role && user.role.toLowerCase().includes(searchTerm))
            );

            this.renderUsersTable(filteredUsers);
        } catch (error) {
            console.error('Error searching users:', error);
            this.showNotification('Ошибка поиска пользователей', 'error');
        }
    }

    // ============ ОПЕРАЦИИ С ТОВАРАМИ ============

    static async showProductForm(productId = null) {
        const isEdit = productId !== null;
        const title = isEdit ? 'Редактировать товар' : 'Добавить товар';

        const modalHtml = `
            <div class="modal" id="productModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="AdminComponent.closeModal()">×</button>
                    </div>
                    <form id="productForm" class="admin-form">
                        <div class="form-group">
                            <label>Название товара</label>
                            <input type="text" id="productName" required>
                        </div>
                        <div class="form-group">
                            <label>Описание</label>
                            <textarea id="productDescription" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Цена</label>
                            <input type="number" id="productPrice" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Количество на складе</label>
                            <input type="number" id="productStock" required>
                        </div>
                        <div class="form-group">
                            <label>Категория</label>
                            <select id="productCategory" required>
                                <option value="">Выберите категорию</option>
                                <option value="1">Смартфоны</option>
                                <option value="2">Ноутбуки</option>
                                <option value="3">Телевизоры</option>
                                <option value="4">Аудиотехника</option>
                                <option value="5">Гаджеты</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Обновить' : 'Создать'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.showModal(modalHtml);

        // Заполняем форму если редактирование
        if (isEdit) {
            setTimeout(() => {
                document.getElementById('productName').value = 'iPhone 15 Pro';
                document.getElementById('productPrice').value = 99990;
                document.getElementById('productStock').value = 15;
            }, 100);
        }

        // Обработчик формы
        const form = document.getElementById('productForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct(productId);
        });
    }

    static async saveProduct(productId) {
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            categoryId: parseInt(document.getElementById('productCategory').value)
        };

        try {
            const result = productId
                ? await AdminService.updateProduct(productId, formData)
                : await AdminService.createProduct(formData);

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeModal();
                await this.loadTab('products');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка сохранения товара', 'error');
        }
    }

    static editProduct(productId) {
        this.showProductForm(productId);
    }

    static async deleteProduct(productId) {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

        try {
            const result = await AdminService.deleteProduct(productId);

            if (result.success) {
                this.showNotification(result.message, 'success');
                await this.loadTab('products');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка удаления товара', 'error');
        }
    }

    // ============ ОПЕРАЦИИ С КАТЕГОРИЯМИ ============

    static async showCategoryForm(categoryId = null) {
        const isEdit = categoryId !== null;
        const title = isEdit ? 'Редактировать категорию' : 'Добавить категорию';

        const modalHtml = `
            <div class="modal" id="categoryModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="AdminComponent.closeModal()">×</button>
                    </div>
                    <form id="categoryForm" class="admin-form">
                        <div class="form-group">
                            <label>Название категории</label>
                            <input type="text" id="categoryName" required>
                        </div>
                        <div class="form-group">
                            <label>Описание</label>
                            <textarea id="categoryDescription" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'Обновить' : 'Создать'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.showModal(modalHtml);

        if (isEdit) {
            setTimeout(() => {
                document.getElementById('categoryName').value = 'Смартфоны';
                document.getElementById('categoryDescription').value = 'Мобильные телефоны';
            }, 100);
        }

        const form = document.getElementById('categoryForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCategory(categoryId);
        });
    }

    static async saveCategory(categoryId) {
        const formData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value
        };

        try {
            const result = categoryId
                ? await AdminService.updateCategory(categoryId, formData)
                : await AdminService.createCategory(formData);

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeModal();
                await this.loadTab('categories');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка сохранения категории', 'error');
        }
    }

    static editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    }

    static async deleteCategory(categoryId) {
        if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

        try {
            const result = await AdminService.deleteCategory(categoryId);

            if (result.success) {
                this.showNotification(result.message, 'success');
                await this.loadTab('categories');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка удаления категории', 'error');
        }
    }

    // ============ ОПЕРАЦИИ С ПОЛЬЗОВАТЕЛЯМИ ============

    static async toggleUserStatus(userId, block) {
        const action = block ? 'заблокировать' : 'разблокировать';
        if (!confirm(`Вы уверены, что хотите ${action} этого пользователя?`)) return;

        try {
            const result = await AdminService.toggleUserStatus(userId, !block);

            if (result.success) {
                this.showNotification(result.message, 'success');
                // Перезагружаем список пользователей
                await this.loadTab('users');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotification(`Ошибка ${block ? 'блокировки' : 'разблокировки'} пользователя: ${error.message}`, 'error');
        }
    }

    static editUser(userId) {
        console.log('Editing user:', userId);
        this.showNotification(`Редактирование пользователя #${userId}`, 'info');
    }

    static async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

        try {
            const result = await AdminService.deleteUser(userId);

            if (result.success) {
                this.showNotification(result.message, 'success');
                await this.loadTab('users');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка удаления пользователя', 'error');
        }
    }

    // ============ ОПЕРАЦИИ С ЗАКАЗАМИ ============

    static async changeOrderStatus(orderId, newStatus) {
        try {
            // Получаем текущий фильтр статуса
            const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
            
            const result = await AdminService.updateOrderStatus(orderId, newStatus);

            if (result.success) {
                this.showNotification(`Статус заказа #${orderId} обновлен на "${AdminService.getStatusText(newStatus)}"`, 'success');
                // Перезагружаем заказы для обновления таблицы с сохранением фильтра
                await this.loadOrders(statusFilter);
            } else {
                this.showNotification(result.message || 'Ошибка обновления статуса', 'error');
                // Перезагружаем заказы чтобы вернуть предыдущий статус
                await this.loadOrders(statusFilter);
            }
        } catch (error) {
            console.error('Error changing order status:', error);
            this.showNotification(`Ошибка обновления статуса заказа: ${error.message}`, 'error');
            // Перезагружаем заказы
            const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
            await this.loadOrders(statusFilter);
        }
    }

    static viewOrder(orderId) {
        // Можно открыть модальное окно с деталями заказа
        console.log('Viewing order:', orderId);
        this.showNotification(`Просмотр заказа #${orderId}`, 'info');
    }

    // ============ УТИЛИТЫ ============

    static showTabLoading(tabName) {
        const container = document.getElementById(`${tabName}Tab`);
        if (container) {
            container.classList.add('loading');
        }
    }

    static hideTabLoading(tabName) {
        const container = document.getElementById(`${tabName}Tab`);
        if (container) {
            container.classList.remove('loading');
        }
    }

    static showTabError(tabName, message) {
        const container = document.getElementById(`${tabName}Tab`);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😕</div>
                <p>${message}</p>
                <button onclick="AdminComponent.loadTab('${tabName}')" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static showModal(html) {
        // Удаляем существующий модал
        this.closeModal();

        // Создаем новый
        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal.firstElementChild);

        // Показываем с анимацией
        setTimeout(() => {
            const modalElement = document.getElementById('productModal') ||
                document.getElementById('categoryModal');
            if (modalElement) {
                modalElement.classList.add('active');
            }
        }, 10);
    }

    static closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
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

    static updateAnalytics(stats) {
        // Просто вызывает renderAnalytics
        this.renderAnalytics(stats);
    }
}

// Инициализируем когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    AdminComponent.init();
});

window.AdminComponent = AdminComponent;