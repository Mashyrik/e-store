// js/services/categories.js
class CategoryService {
    static async getAllCategories() {
        try {
            return await ApiService.get('/categories');
        } catch (error) {
            console.error('Failed to load categories:', error);
            throw error;
        }
    }
    
    static async getCategoryById(id) {
        try {
            return await ApiService.get(`/categories/${id}`);
        } catch (error) {
            console.error(`Failed to load category ${id}:`, error);
            throw error;
        }
    }
}

window.CategoryService = CategoryService;