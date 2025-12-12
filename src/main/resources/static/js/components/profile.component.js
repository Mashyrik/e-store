class ProfileComponent {
    static async init() {
        console.log('Initializing ProfileComponent');

        // Проверяем авторизацию
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        // Загружаем данные профиля
        await this.loadProfile();

        // Настраиваем обработчики событий
        this.setupEventListeners();

        // Показываем админские ссылки если пользователь админ
        this.checkAdminAccess();
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!token && !!user;
    }

    static redirectToLogin() {
        window.location.href = 'login.html';
    }

    static async loadProfile(forceRefresh = false) {
        try {
            // Показываем загрузку
            this.showLoading();

            // Загружаем заказы (обновляем всегда)
            const orders = await ProfileService.getOrders(forceRefresh);

            // Загружаем данные профиля (используем актуальные заказы для статистики)
            const profile = await ProfileService.getProfile(orders);

            // Обновляем UI
            this.updateProfileUI(profile);
            
            // Обновляем заказы только для обычных пользователей (не админов)
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role !== 'ROLE_ADMIN') {
                this.updateOrdersUI(orders);
                this.updateRecentOrdersUI(orders.slice(0, 3));
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Не удалось загрузить профиль');
        } finally {
            this.hideLoading();
        }
    }

    static updateProfileUI(profile) {
        // Обновляем информацию пользователя
        document.getElementById('userName').textContent = profile.username;
        document.getElementById('userEmail').textContent = profile.email;
        const loginEl = document.getElementById('userLogin');
        if (loginEl) {
            loginEl.textContent = profile.username;
        }
        const emailMeta = document.getElementById('userEmailMeta');
        if (emailMeta) {
            emailMeta.textContent = profile.email;
        }

        // Обновляем роль
        const roleElement = document.getElementById('userRole');
        roleElement.textContent = profile.role === 'ROLE_ADMIN' ? 'Администратор' : 'Пользователь';
        roleElement.className = 'role-badge ' + (profile.role === 'ROLE_ADMIN' ? 'admin' : 'user');
        const roleBadge = document.getElementById('userRoleBadge');
        if (roleBadge) {
            roleBadge.textContent = roleElement.textContent;
            roleBadge.className = roleElement.className;
        }

        // Обновляем статистику
        document.getElementById('totalOrders').textContent = profile.totalOrders;
        document.getElementById('totalSpent').textContent = ProfileService.formatPrice(profile.totalSpent);
        document.getElementById('cartItems').textContent = profile.cartItems;

        // Заполняем поля формы
        document.getElementById('usernameInput').value = profile.username;
        document.getElementById('emailInput').value = profile.email;
    }

    static updateOrdersUI(orders) {
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>У вас пока нет заказов</p>
                    <a href="index.html" class="btn btn-primary">Начать покупки</a>
                </div>
            `;
            return;
        }

        const html = orders.map(order => this.createOrderCard(order)).join('');
        container.innerHTML = html;
    }

    static updateRecentOrdersUI(orders) {
        const container = document.getElementById('recentOrdersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>Нет последних заказов</p>';
            return;
        }

        const html = orders.map(order => this.createOrderCard(order)).join('');
        container.innerHTML = html;
    }

    static createOrderCard(order) {
        const statusClass = order.status ? order.status.toLowerCase() : 'pending';
        const itemsHtml = order.items && order.items.length > 0
            ? order.items.map(item => `
                <div class="order-item-row">
                    <span class="order-item-name">${item.productName || 'Товар'}</span>
                    <span class="order-item-quantity">× ${item.quantity || 1}</span>
                    <span class="order-item-price">${ProfileService.formatPrice(item.subTotal || item.productPrice * (item.quantity || 1))}</span>
                </div>
            `).join('')
            : '<p>Товары не найдены</p>';

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Заказ #${order.id || 'N/A'}</span>
                        <span class="order-date">${ProfileService.formatDate(order.createdAt)}</span>
                    </div>
                    <span class="order-status status-${statusClass}">
                        ${ProfileService.getStatusText(order.status || 'PENDING')}
                    </span>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                ${order.shippingAddress ? `
                    <div class="order-address">
                        <strong>Адрес доставки:</strong> ${order.shippingAddress}
                    </div>
                ` : ''}
                ${order.notes ? `
                    <div class="order-notes">
                        <strong>Комментарий:</strong> ${order.notes}
                    </div>
                ` : ''}
                <div class="order-total">
                    Итого: ${ProfileService.formatPrice(order.totalAmount || 0)}
                </div>
            </div>
        `;
    }

    static checkAdminAccess() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const adminLinks = document.getElementById('adminLinks');

        if (user.role === 'ROLE_ADMIN') {
            // Показываем админские ссылки
            if (adminLinks) {
                adminLinks.style.display = 'block';
            }

            // Скрываем вкладки "Обзор" и "Мои заказы" для админа
            const overviewLink = document.querySelector('[data-tab="overview"]');
            const ordersLink = document.querySelector('[data-tab="orders"]');
            const statsLink = document.querySelector('[data-tab="stats"]');

            if (overviewLink) {
                overviewLink.style.display = 'none';
            }
            if (ordersLink) {
                ordersLink.style.display = 'none';
            }
            if (statsLink) {
                statsLink.style.display = 'none';
            }

            // Скрываем содержимое вкладок
            const overviewTab = document.getElementById('overviewTab');
            const ordersTab = document.getElementById('ordersTab');

            if (overviewTab) {
                overviewTab.style.display = 'none';
            }
            if (ordersTab) {
                ordersTab.style.display = 'none';
            }

            // Переключаемся на вкладку "Настройки" по умолчанию для админа
            const settingsLink = document.querySelector('[data-tab="settings"]');
            if (settingsLink) {
                settingsLink.classList.add('active');
                const settingsTab = document.getElementById('settingsTab');
                if (settingsTab) {
                    settingsTab.classList.add('active');
                }
            }

            // Убираем активность с других вкладок
            if (overviewTab) {
                overviewTab.classList.remove('active');
            }
            if (ordersTab) {
                ordersTab.classList.remove('active');
            }
        }
    }

    static setupEventListeners() {
        // Навигация по табам
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.dataset.tab);
            });
        });

        // Кнопка сохранения настроек
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    static switchTab(tabName) {
        // Обновляем активные ссылки
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabName);
        });

        // Показываем соответствующий контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    static async saveSettings() {
        const username = document.getElementById('usernameInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();

        if (!username || !email) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        // Валидация username
        if (username.length < 3 || username.length > 50) {
            this.showNotification('Имя пользователя должно быть от 3 до 50 символов', 'error');
            return;
        }

        try {
            const result = await ProfileService.updateProfile({ username, email });

            if (result.success) {
                // Обновляем данные в localStorage с данными из ответа сервера
                const user = JSON.parse(localStorage.getItem('user')) || {};
                if (result.profile) {
                    user.username = result.profile.username;
                    user.email = result.profile.email;
                } else {
                    user.username = username;
                    user.email = email;
                }
                localStorage.setItem('user', JSON.stringify(user));

                // Обновляем UI
                document.getElementById('userName').textContent = user.username;
                document.getElementById('userEmail').textContent = user.email;

                // Перезагружаем профиль для обновления статистики
                await this.loadProfile(true);

                this.showNotification('Настройки успешно сохранены', 'success');
            } else {
                this.showNotification(result.message || 'Ошибка сохранения настроек', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Ошибка сохранения настроек: ' + error.message, 'error');
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static showLoading() {
        document.body.classList.add('loading');
    }

    static hideLoading() {
        document.body.classList.remove('loading');
    }

    static showError(message) {
        const container = document.querySelector('.profile-content');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😕</div>
                <p>${message}</p>
                <button onclick="ProfileComponent.loadProfile()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;

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
}

// Инициализируем когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    ProfileComponent.init();
});

// Перезагружаем заказы при фокусе на окне (если пользователь вернулся с другой страницы)
window.addEventListener('focus', () => {
    if (ProfileComponent && document.getElementById('ordersList')) {
        ProfileComponent.loadProfile(true);
    }
});

window.ProfileComponent = ProfileComponent;