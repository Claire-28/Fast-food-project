// Gestione del Carrello tramite LocalStorage

const Cart = {
    // Chiave per il localStorage
    KEY: 'fastfood_cart',

    // Ottieni tutti gli elementi
    getItems: function() {
        const stored = localStorage.getItem(this.KEY);
        return stored ? JSON.parse(stored) : [];
    },

    // Aggiungi un piatto
    add: function(product) {
        const cart = this.getItems();
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price) || 10.00, // Prezzo default se manca
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem(this.KEY, JSON.stringify(cart));
        this.updateBadge();
        alert('Piatto aggiunto al carrello!');
    },

    // Rimuovi un piatto
    remove: function(id) {
        let cart = this.getItems();
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem(this.KEY, JSON.stringify(cart));
        this.updateBadge();
    },

    // Svuota tutto
    clear: function() {
        localStorage.removeItem(this.KEY);
        this.updateBadge();
    },

    // Calcola il totale
    total: function() {
        const cart = this.getItems();
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    },

    // Aggiorna un contatore visivo (se presente nell'header)
    updateBadge: function() {
        const count = this.getItems().reduce((acc, item) => acc + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) badge.innerText = count;
    }
};

// Inizializza il badge al caricamento
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());