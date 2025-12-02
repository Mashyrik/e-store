// js/services/categories.js
class CategoryService {
    static async getAllCategories() {
        try {
            return await ApiService.get('/categories');
        } catch (error) {
            console.error('Failed to load categories:', error);
            return this.getMockCategories();
        }
    }
    
    static async getCategoryById(id) {
        try {
            return await ApiService.get(`/categories/${id}`);
        } catch (error) {
            console.error(`Failed to load category ${id}:`, error);
            return null;
        }
    }
    
    // Тестовые данные
    static getMockCategories() {
        return [
            { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны' },
            { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры' },
            { id: 3, name: 'Телевизоры', description: 'Телевизоры и мониторы' },
            { id: 4, name: 'Аудиотехника', description: 'Наушники и колонки' },
            { id: 5, name: 'Гаджеты', description: 'Умные устройства' },
            { id: 6, name: 'Аксессуары', description: 'Чехлы и зарядные устройства' }
        ];
    }
}

window.CategoryService = CategoryService;