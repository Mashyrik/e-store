// js/services/cart.service.js

class CartService {

    /**
     * Получить корзину текущего пользователя (защищенный маршрут: GET /api/cart)
     */
    static async getCart() {
        // true = требуется авторизация
        return await ApiService.get('/cart', true);
    }

    /**
     * Добавить товар или обновить количество (защищенный маршрут: POST /api/cart/items)
     * @param {number} productId - ID товара
     * @param {number} quantity - Новое количество
     */
    static async updateItem(productId, quantity) {
        // Предполагаем, что бэкенд использует POST для добавления/обновления
        return await ApiService.post('/cart/items', {
            productId: parseInt(productId),
            quantity: parseInt(quantity)
        }, true);
    }

    /**
     * Удалить товар из корзины (защищенный маршрут: DELETE /api/cart/items/{productId})
     */
    static async removeItem(productId) {
        return await ApiService.delete(`/cart/items/${productId}`, true);
    }

    /**
     * Очистить всю корзину (защищенный маршрут: POST /api/cart/clear)
     * ⚠️ Примечание: Если бэкенд не имеет такого эндпоинта, этот метод придется переписать
     * в cart.js, чтобы удалять все элементы по одному.
     */
    static async clearCart() {
        return await ApiService.post(`/cart/clear`, {}, true);
    }
}

window.CartService = CartService;