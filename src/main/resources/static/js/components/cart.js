// static/js/components/cart.js
console.log('🛒 Loading cart component...');

class SimpleCart {
    constructor() {
        console.log('🛒 Creating new cart instance');
        this.items = this.load();
        console.log(`📦 Loaded ${this.items.length} items from storage`);
    }

    load() {
        try {
            const cartData = localStorage.getItem('cart');
            const items = cartData ? JSON.parse(cartData) : [];
            console.log(`📥 Cart loaded: ${items.length} items`);
            return items;
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            console.log(`💾 Cart saved: ${this.items.length} items`);

            // Обновляем UI
            if (typeof App !== 'undefined' && App.updateCartCount) {
                App.updateCartCount();
            }
        } catch (error) {
            console.error('❌ Error saving cart:', error);
        }
    }

    add(product) {
        console.log(`➕ Adding product to cart: ${product.name}`);

        const existing = this.items.find(item => item.id === product.id);

        if (existing) {
            console.log(`📈 Increasing quantity for existing product: ${product.name}`);
            existing.quantity += product.quantity || 1;
        } else {
            console.log(`🎁 Adding new product: ${product.name}`);
            this.items.push({
                ...product,
                quantity: product.quantity || 1
            });
        }

        this.save();

        // Показываем уведомление
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(`"${product.name}" добавлен в корзину`, 'success');
        } else {
            console.log(`✅ "${product.name}" added to cart`);
        }
    }

    remove(id) {
        console.log(`➖ Removing product ${id} from cart`);
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    }

    clear() {
        console.log('🗑️ Clearing cart');
        this.items = [];
        this.save();
    }

    getCount() {
        const count = this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        console.log(`📊 Cart count: ${count} items`);
        return count;
    }

    getTotal() {
        const total = this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        console.log(`💰 Cart total: ${total}`);
        return total;
    }
}

// Создаем глобальную корзину
window.cart = new SimpleCart();
window.SimpleCart = SimpleCart;
console.log('✅ Cart component loaded');