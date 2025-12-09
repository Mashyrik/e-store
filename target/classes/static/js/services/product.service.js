// static/js/services/product.service.js - НОВЫЙ ФАЙЛ

class ProductService {
    /**
     * Получить все товары
     */
    static async getAllProducts() {
        try {
            return await ApiService.get('/products');
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Возвращаем тестовые данные при ошибке
            if (typeof App !== 'undefined') {
                return App.getMockProducts();
            }
            return [];
        }
    }

    /**
     * Получить товар по ID
     */
    static async getProductById(id) {
        try {
            return await ApiService.get(`/products/${id}`);
        } catch (error) {
            console.error(`Error loading product ${id}:`, error);
            return null;
        }
    }

    /**
     * Поиск товаров
     */
    static async searchProducts(query) {
        try {
            // Проверяем, есть ли у бэкенда endpoint поиска
            // Если нет, фильтруем локально
            const allProducts = await this.getAllProducts();
            if (!query || !query.trim()) {
                return allProducts;
            }
            
            const searchTerm = query.toLowerCase().trim();
            return allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.model.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Получить товары по категории
     */
    static async getProductsByCategory(categoryId) {
        try {
            const allProducts = await this.getAllProducts();
            return allProducts.filter(product => 
                product.category && product.category.id == categoryId
            );
        } catch (error) {
            console.error(`Error loading products for category ${categoryId}:`, error);
            return [];
        }
    }

    /**
     * Получить доступные товары (в наличии)
     */
    static async getAvailableProducts() {
        try {
            const allProducts = await this.getAllProducts();
            return allProducts.filter(product => product.stockQuantity > 0);
        } catch (error) {
            console.error('Error loading available products:', error);
            return [];
        }
    }
}

window.ProductService = ProductService;