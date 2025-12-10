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

    static async loadProfile() {
        try {
            // Показываем загрузку
            this.showLoading();

            // Загружаем данные профиля
            const profile = await ProfileService.getProfile();

            // Загружаем заказы
            const orders = await ProfileService.getOrders();

            // Обновляем UI
            this.updateProfileUI(profile);
            this.updateOrdersUI(orders);
            this.updateRecentOrdersUI(orders.slice(0, 3));

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

        // Обновляем роль
        const roleElement = document.getElementById('userRole');
        roleElement.textContent = profile.role === 'ROLE_ADMIN' ? 'Администратор' : 'Пользователь';
        roleElement.className = 'role-badge ' + (profile.role === 'ROLE_ADMIN' ? 'admin' : 'user');

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
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Заказ #${order.id}</span>
                        <span class="order-date">${ProfileService.formatDate(order.createdAt)}</span>
                    </div>
                    <span class="order-status status-${order.status.toLowerCase()}">
                        ${ProfileService.getStatusText(order.status)}
                    </span>
                </div>
                <div class="order-items">
                    ${order.items.map(item =>
            `${item.productName} × ${item.quantity}`
        ).join(', ')}
                </div>
                <div class="order-total">
                    Итого: ${ProfileService.formatPrice(order.totalAmount)}
                </div>
            </div>
        `;
    }

    static checkAdminAccess() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const adminLinks = document.getElementById('adminLinks');

        if (user.role === 'ROLE_ADMIN' && adminLinks) {
            adminLinks.style.display = 'block';
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

        try {
            const result = await ProfileService.updateProfile({ username, email });

            if (result.success) {
                // Обновляем данные в localStorage
                const user = JSON.parse(localStorage.getItem('user')) || {};
                user.username = username;
                user.email = email;
                localStorage.setItem('user', JSON.stringify(user));

                // Обновляем UI
                document.getElementById('userName').textContent = username;
                document.getElementById('userEmail').textContent = email;

                this.showNotification('Настройки сохранены', 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка сохранения настроек', 'error');
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

window.ProfileComponent = ProfileComponent;