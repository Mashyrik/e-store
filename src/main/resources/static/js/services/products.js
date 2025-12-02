// js/services/products.js
class ProductService {
    static async getAllProducts() {
        try {
            const products = await ApiService.get('/products');
            console.log('Products loaded:', products);
            return products;
        } catch (error) {
            console.error('Failed to load products:', error);
            // Возвращаем тестовые данные при ошибке
            return this.getMockProducts();
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
    
    // Тестовые данные на случай недоступности API
    static getMockProducts() {
        return [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                price: 99990,
                model: 'A2848',
                description: 'Новейший смартфон от Apple',
                stockQuantity: 10,
                category: { id: 1, name: 'Смартфоны' },
                imageUrl: ''
            },
            {
                id: 2,
                name: 'Samsung Galaxy S24',
                price: 89990,
                model: 'SM-S921B',
                description: 'Флагманский смартфон от Samsung',
                stockQuantity: 8,
                category: { id: 1, name: 'Смартфоны' },
                imageUrl: ''
            },
            {
                id: 3,
                name: 'MacBook Air M2',
                price: 129990,
                model: 'M2',
                description: 'Ультратонкий ноутбук от Apple',
                stockQuantity: 5,
                category: { id: 2, name: 'Ноутбуки' },
                imageUrl: ''
            },
            {
                id: 4,
                name: 'Sony WH-1000XM5',
                price: 29990,
                model: 'WH-1000XM5',
                description: 'Беспроводные наушники с шумоподавлением',
                stockQuantity: 15,
                category: { id: 3, name: 'Аудиотехника' },
                imageUrl: ''
            }
        ];
    }
}

window.ProductService = ProductService;
