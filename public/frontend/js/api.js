// public/frontend/js/api.js
const BASE_URL = 'http://localhost:3019/api'; 

const API = {
    // --- AUTENTICAZIONE ---

    login: async (email, password) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("API Login Error:", error);
            return { success: false, message: "Errore di connessione al server" };
        }
    },

    // AGGIORNATO: Ora accetta anche il role
    register: async (name, email, password, role = 'cliente') => {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Inviamo anche il role scelto
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("API Register Error:", error);
            return { success: false, message: "Errore di connessione al server" };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'LogIn.html';
    },

    getAuthHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },
    
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // --- PIATTI & MENU ---
    // Funzione generica per supportare il tuo codice "apiRequest"
    request: async (endpoint, method = 'GET', body = null) => {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        const headers = API.getAuthHeaders();
        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        const response = await fetch(url, config);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Errore nella richiesta');
        }
        return await response.json();
    },

    // Funzione specifica per ottenere i piatti con filtri
    getMeals: async (filters = {}) => {
        // Converte oggetto filtri in query string (es. ?nome=Pizza&tipologia=Main)
        const params = new URLSearchParams(filters).toString();
        return await API.request(`/meals?${params}`, 'GET');
    },

    getOrders: async () => {
        try {
            return await API.request('/orders', 'GET');
        } catch (error) {
            console.error("Errore recupero ordini:", error);
            return [];
        }
    },

    // Utile per creare l'ordine dal CheckOut
    createOrder: async (orderData) => {
        const token = localStorage.getItem('token'); // Recupera il token salvato al login

        const response = await fetch('http://localhost:3019/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- QUESTA RIGA È FONDAMENTALE
            },
            body: JSON.stringify(orderData)
        });

        return await response.json();
    },

    // --- RISTORANTE ---
    createRestaurant: async (restaurantData) => {
        return await API.request('/restaurants/me', 'POST', restaurantData);
    },

    getMyRestaurant: async () => {
        try {
            return await API.request('/restaurants/me', 'GET');
        } catch (error) {
            return null; // Ritorna null se il ristorante non esiste ancora
        }
    },

    // --- MENU ---
    addPlateToMenu: async (idMeal, prezzo) => {
        return await API.request('/restaurants/menu', 'POST', { idMeal, prezzo });
    }
};

// Esportiamo una funzione globale per compatibilità col tuo vecchio codice HTML
window.apiRequest = API.request;