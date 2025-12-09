// static/js/services/category.service.js - НОВЫЙ ФАЙЛ

class CategoryService {
    /**
     * Получить все категории
     */
    static async getAllCategories() {
        try {
            return await ApiService.get('/categories');
        } catch (error) {
            console.error('Error loading categories:', error);
            
            // Возвращаем тестовые данные при ошибке
            return [
                { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны и гаджеты' },
                { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры' },
                { id: 3, name: 'Телевизоры', description: 'Телевизоры и мониторы' },
                { id: 4, name: 'Аудиотехника', description: 'Наушники и колонки' },
                { id: 5, name: 'Периферия', description: 'Клавиатуры, мыши, аксессуары' }
            ];
        }
    }

    /**
     * Получить категорию по ID
     */
    static async getCategoryById(id) {
        try {
            return await ApiService.get(`/categories/${id}`);
        } catch (error) {
            console.error(`Error loading category ${id}:`, error);
            return null;
        }
    }

    /**
     * Создать категорию (админ)
     */
    static async createCategory(categoryData) {
        try {
            return await ApiService.post('/categories', categoryData, true);
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    /**
     * Обновить категорию (админ)
     */
    static async updateCategory(id, categoryData) {
        try {
            return await ApiService.put(`/categories/${id}`, categoryData, true);
        } catch (error) {
            console.error(`Error updating category ${id}:`, error);
            throw error;
        }
    }

    /**
     * Удалить категорию (админ)
     */
    static async deleteCategory(id) {
        try {
            return await ApiService.delete(`/categories/${id}`, true);
        } catch (error) {
            console.error(`Error deleting category ${id}:`, error);
            throw error;
        }
    }
}

window.CategoryService = CategoryService;