const BASE_URL = 'http://127.0.0.1:3019/api';

const getToken = () => localStorage.getItem('token');

export const callApi = async (endpoint, method = 'GET', data = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();

    const headers = { 'Content-Type': 'application/json'};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, config) ;

        if (response.status === 401) {
            alert("Sessione scaduta o non autorizzata. Effettua nuovamente il login");
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Errore API: ${response.status}`)
        }

        return responseData;
    } catch (error) {
        console.error('Errore nella chiamata API: ', error);
        throw error;
    }
};

export const searchRestaurants = (query) => {
    return callApi(`/restaurant/search?${new URLSearchParams(query).toString()}`);
};

export const getRestaurantDetails = (id) => {
    return callApi(`/restaurant/${id}`);
}; 