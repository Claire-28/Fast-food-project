const axios = require('axios');

const geocodeAddress = async (address) => {
    const url = 'https://nominatim.openstreetmap.org/search';
    /*
    try {
        const response = await axios.get(url, {
            params: {
                q: address, //indirizzo da cercare
                format: 'json',
                limit: 1,
                addressdetails: 1
            }, headers: {'User-Agent': 'FastFoodwebApp/1.0'}
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];

            const latitudine= parseFloat(result.lat);
            const longitudine = parseFloat(result.lon);

            return {
                type: 'Point',
                coordinates:[longitudine, latitudine]
            };
        } else {
            throw new Error('Indirizzo non trrovato da Nominatim');
        }
    } catch (error) {
        console.error('Errore durante il geocoding: ', error.message);
        throw new Error('Impossibile geocodificare lo indirizzo fornito');
    }*/

    return {
        type: 'Point',
        coordinates: [12.4964, 41.9028]
    };
};

module.exports = geocodeAddress;