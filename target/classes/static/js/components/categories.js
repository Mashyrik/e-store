// js/components/categories.js
class CategoriesComponent {
    static async init() {
        console.log('Initializing CategoriesComponent');
        await this.loadCategories();
    }
    
    static async loadCategories() {
        try {
            const categories = await CategoryService.getAllCategories();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Не удалось загрузить категории');
        }
    }
    
    static renderCategories(categories) {
        const container = document.getElementById('categories-container');
        if (!container) {
            console.warn('Categories container not found');
            return;
        }
        
        const html = categories.map(category => `
            <div class="category-card" data-id="${category.id}" onclick="CategoriesComponent.showCategory(${category.id})">
                <div class="category-image">
                    ${this.getCategoryIcon(category.name)}
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Современные устройства'}</p>
                    <button class="btn btn-outline view-category-btn" data-id="${category.id}">
                        Смотреть товары
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        // Добавляем обработчики кнопок
        document.querySelectorAll('.view-category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = button.getAttribute('data-id');
                this.showCategory(categoryId);
            });
        });
    }
    
    static showCategory(categoryId) {
        console.log('Showing category:', categoryId);
        // Можно перенаправить на страницу товаров категории
        window.location.hash = `#products?category=${categoryId}`;
        // Или показать модальное окно с товарами
        // this.loadCategoryProducts(categoryId);
    }
    
    static async loadCategoryProducts(categoryId) {
        try {
            const products = await ProductService.getProductsByCategory(categoryId);
            // Здесь можно отобразить товары в модальном окне или на отдельной странице
            console.log(`Products for category ${categoryId}:`, products);
        } catch (error) {
            console.error(`Error loading products for category ${categoryId}:`, error);
        }
    }
    
    static getCategoryIcon(categoryName) {
        const icons = {
            'Смартфоны': '📱',
            'Ноутбуки': '💻',
            'Телевизоры': '📺',
            'Аудиотехника': '🎧',
            'Наушники': '🎧',
            'Колонки': '🔊',
            'Гаджеты': '⌚',
            'Аксессуары': '🔌',
            'default': '🔌'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return icons.default;
    }
    
    static showError(message) {
        const container = document.getElementById('categories-container');
        if (!container) return;
        
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p style="color: #666; margin-bottom: 1rem;">${message}</p>
                <button onclick="CategoriesComponent.loadCategories()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

window.CategoriesComponent = CategoriesComponent;