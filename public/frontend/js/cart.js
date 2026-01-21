const Cart = {
    get() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    add(product) {
        let cart = this.get();
        const index = cart.findIndex(item => item.id === product.id);
        if (index > -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateBadge();
    },

    remove(productId) {
        let cart = this.get().filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateBadge();
    },

    clear() {
        localStorage.removeItem('cart');
        this.updateBadge();
    },

    getTotal() {
        return this.get().reduce((sum, item) => sum + (item.prezzo * item.quantity), 0);
    },

    updateBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const count = this.get().reduce((sum, item) => sum + item.quantity, 0);
            badge.innerText = count;
        }
    }
};

// Inizializza badge al caricamento
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());