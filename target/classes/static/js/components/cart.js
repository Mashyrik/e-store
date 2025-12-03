// js/components/cart.js - УПРОЩЕННАЯ ВЕРСИЯ
class SimpleCart {
    constructor() {
        this.items = this.load();
    }
    
    load() {
        try {
            return JSON.parse(localStorage.getItem('simple_cart')) || [];
        } catch {
            return [];
        }
    }
    
    save() {
        localStorage.setItem('simple_cart', JSON.stringify(this.items));
        this.updateUI();
    }
    
    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += product.quantity || 1;
        } else {
            this.items.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        this.save();
        this.showNotification(`"${product.name}" добавлен в корзину`);
    }
    
    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    }
    
    clear() {
        this.items = [];
        this.save();
    }
    
    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    updateUI() {
        const counter = document.getElementById('cartCount');
        if (counter) {
            const count = this.getCount();
            counter.textContent = count;
            counter.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
    
    showNotification(message) {
        // Можно заменить на красивый toast
        console.log('📦 Корзина:', message);
    }
}

// Экспорт
window.SimpleCart = SimpleCart;