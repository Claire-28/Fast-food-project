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

    // AGGIORNATO: Ora accetta anche il ruolo
    register: async (name, email, password, role = 'cliente') => {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Inviamo anche il ruolo scelto
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
    getMeals: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/meals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (!response.ok) throw new Error("Errore nel recupero dei piatti");
            return await response.json();
        } catch (error) {
            console.error("API GetMeals Error:", error);
            return [];
        }
    }
};