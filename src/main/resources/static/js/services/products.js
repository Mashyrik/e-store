// js/services/products.js
class ProductService {
    static async getAllProducts() {
        try {
            const products = await ApiService.get('/products');
            console.log('Products loaded:', products);
            return products;
        } catch (error) {
            console.error('Failed to load products:', error);
            throw error;
        }
    }
    
    static async getProductById(id) {
        try {
            return await ApiService.get(`/products/${id}`);
        } catch (error) {
            console.error(`Failed to load product ${id}:`, error);
            return null;
        }
    }
    
    static async getProductsByCategory(categoryId) {
        try {
            return await ApiService.get(`/products/category/${categoryId}`);
        } catch (error) {
            console.error(`Failed to load category ${categoryId} products:`, error);
            return [];
        }
    }
    
    static async searchProducts(query) {
        try {
            return await ApiService.get(`/products/search?query=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error(`Search failed for "${query}":`, error);
            return [];
        }
    }
}

window.ProductService = ProductService;
