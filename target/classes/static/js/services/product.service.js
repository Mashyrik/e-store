// js/services/product.service.js

class ProductService {

    /**
     * Получить все товары (публичный маршрут: GET /api/products)
     */
    static async getAllProducts() {
        try {
            // false = не нужна авторизация
            return await ApiService.get('/products', false);
        } catch (error) {
            console.warn('API Products failed. Check Spring Boot /products endpoint.', error);
            // Возвращаем мок-данные, если API недоступно
            return typeof App !== 'undefined' ? App.getMockProducts() : [];
        }
    }

    /**
     * Получить товар по ID (публичный маршрут: GET /api/products/{id})
     */
    static async getProductById(id) {
        try {
            return await ApiService.get(`/products/${id}`, false);
        } catch (error) {
            console.error(`Failed to load product ${id}:`, error);
            return null;
        }
    }

    /**
     * Поиск товаров (публичный маршрут: GET /api/products/search?query=...)
     */
    static async searchProducts(query) {
        try {
            return await ApiService.get(`/products/search?query=${encodeURIComponent(query)}`, false);
        } catch (error) {
            console.warn(`Search failed for "${query}".`);
            return [];
        }
    }
}

window.ProductService = ProductService;