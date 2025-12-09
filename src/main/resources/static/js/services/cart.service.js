// static/js/services/cart.service.js - НОВЫЙ ФАЙЛ

class CartService {
    /**
     * Получить корзину пользователя
     */
    static async getCart() {
        try {
            return await ApiService.get('/cart', true); // true = требуется авторизация
        } catch (error) {
            console.error('Error loading cart:', error);
            
            // Возвращаем локальную корзину для демо
            return {
                items: JSON.parse(localStorage.getItem('cart')) || [],
                totalAmount: 0,
                totalItems: 0
            };
        }
    }

    /**
     * Добавить товар в корзину
     */
    static async addToCart(productId, quantity = 1) {
        try {
            const response = await ApiService.post('/cart/items', {
                productId: productId,
                quantity: quantity
            }, true); // true = требуется авторизация
            
            return { success: true, data: response };
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            
            // Демо-режим: сохраняем в localStorage
            const product = await ProductService.getProductById(productId);
            if (product) {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItem = cart.find(item => item.id == productId);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: quantity,
                        imageUrl: product.imageUrl
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                return { success: true, data: { message: 'Товар добавлен в корзину (демо)' } };
            }
            
            return { success: false, message: error.message };
        }
    }

    /**
     * Обновить количество товара в корзине
     */
    static async updateCartItem(productId, quantity) {
        try {
            return await ApiService.put(`/cart/items/${productId}?quantity=${quantity}`, {}, true);
        } catch (error) {
            console.error('Error updating cart item:', error);
            
            // Демо-режим
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemIndex = cart.findIndex(item => item.id == productId);
            
            if (itemIndex !== -1) {
                if (quantity <= 0) {
                    cart.splice(itemIndex, 1);
                } else {
                    cart[itemIndex].quantity = quantity;
                }
                localStorage.setItem('cart', JSON.stringify(cart));
            }
            
            return { success: true };
        }
    }

    /**
     * Удалить товар из корзины
     */
    static async removeFromCart(productId) {
        try {
            return await ApiService.delete(`/cart/items/${productId}`, true);
        } catch (error) {
            console.error('Error removing from cart:', error);
            
            // Демо-режим
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const newCart = cart.filter(item => item.id != productId);
            localStorage.setItem('cart', JSON.stringify(newCart));
            
            return { success: true };
        }
    }

    /**
     * Очистить корзину
     */
    static async clearCart() {
        try {
            return await ApiService.delete('/cart', true);
        } catch (error) {
            console.error('Error clearing cart:', error);
            
            // Демо-режим
            localStorage.setItem('cart', JSON.stringify([]));
            return { success: true };
        }
    }

    /**
     * Рассчитать общую сумму корзины
     */
    static calculateTotal(cartItems) {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
    }
}

window.CartService = CartService;