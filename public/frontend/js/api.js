/**
 * api.js - Configurazione centralizzata per le chiamate al backend LemonLime.
 * Gestisce automaticamente i token, i reindirizzamenti in caso di sessione scaduta
 * e la pulizia dei dati.
 */

const BASE_URL = 'http://localhost:3019/api';

/**
 * Funzione core per le chiamate API.
 * Gestisce l'iniezione del Token JWT e gli errori di rete/autenticazione.
 */
async function callApi(endpoint, method = 'GET', data = null) {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json'
    };

    // Inserisce il token di autorizzazione se presente
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, config);

        // Gestione Sessione Scaduta (401 Unauthorized)
        if (response.status === 401) {
            console.warn("Sessione scaduta o non autorizzata. Reindirizzamento al login...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (!window.location.pathname.includes('LogIn.html')) {
                window.location.href = 'LogIn.html';
            }
            return null;
        }

        const responseData = await response.json();

        // Gestione errori restituiti dal backend (es. 400 Bad Request / 401 Wrong Password)
        // Modificato per leggere sia .error che .message in base alla risposta del server
        if (!response.ok) {
            const errorMsg = responseData.error || responseData.message || `Errore API: ${response.status}`;
            console.error('Dettaglio Errore Backend:', responseData);
            throw new Error(errorMsg);
        }

        return responseData;
    } catch (error) {
        console.error('Errore nella chiamata API:', error.message);
        throw error;
    }
}

/**
 * Esportazione delle funzioni globali per l'uso negli HTML.
 * Nota: Il confronto della password (bcrypt) avviene lato server.
 * Il frontend si occupa di inviare il payload corretto.
 */
window.api = {
    BASE_URL,

    // Funzione generica per chiamate custom
    callApi,

    // Autenticazione: Login
    // Utilizza la logica di confronto bcrypt definita nel backend
    login: async (email, password) => {
        return await callApi('/auth/login', 'POST', { email, password });
    },

    // Autenticazione: Registrazione
    register: async (userData) => {
        return await callApi('/auth/register', 'POST', userData);
    },

    // Ricerca Ristoranti
    searchRestaurants: (query) => {
        const params = new URLSearchParams(query).toString();
        return callApi(`/restaurants/search?${params}`);
    },

    // Dettagli Ristorante
    getRestaurantDetails: (id) => {
        return callApi(`/restaurants/${id}`);
    },

    // Recupero Piatti Generale
    getMeals: () => {
        return callApi('/meals');
    }
};