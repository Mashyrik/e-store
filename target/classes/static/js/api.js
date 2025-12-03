// js/api.js - МОК ВЕРСИЯ
const MockApi = {
    getProducts: async () => {
        return [
            { id: 1, name: 'iPhone 15 Pro', price: 99990, model: 'A2848', stockQuantity: 10, category: 'Смартфоны' },
            { id: 2, name: 'Samsung Galaxy S24', price: 89990, model: 'SM-S921B', stockQuantity: 8, category: 'Смартфоны' },
            { id: 3, name: 'MacBook Air M2', price: 129990, model: 'M2', stockQuantity: 5, category: 'Ноутбуки' }
        ];
    },
    
    getCategories: async () => {
        return [
            { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны' },
            { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры' },
            { id: 3, name: 'Телевизоры', description: 'Телевизоры и мониторы' }
        ];
    }
};

// Экспорт
window.MockApi = MockApi;