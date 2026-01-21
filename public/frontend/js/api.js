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

            if (response.ok && data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || "Errore login" };
            }
        } catch (error) {
            console.error("API Login Error:", error);
            return { success: false, message: "Errore di connessione" };
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            return { success: response.ok, message: data.message };
        } catch (error) {
            console.error("API Register Error:", error);
            return { success: false, message: "Errore di connessione" };
        }
    },

    getAuthHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
};

window.API = API; // Rende API disponibile globalmente