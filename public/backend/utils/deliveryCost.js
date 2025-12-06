const geocodeAddress = require('./geocoder');

const costoBase = 2.00;
const costoPerKm = 0.50;

// Formula di Haversine per calcolare la distanza tra due coordinate (in km)
function haversineDistance(coords1, coords2) {
    const raggioTerra = 6371; //in km
    const lat1 = coords1.latitudine;
    const lon1 = coords1.longitudine;
    const lat2 = coords2.latitudine;
    const lon2 = coords2.longitudine;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return raggioTerra * c; //distanza in km
}

function toRad(value) {
    return value * Math.PI / 180;
}

const calculateDeliveryConst = async (ristoranteAddress, clienteAddress) => {
    try {
        const resLocation = await geocodeAddress(ristoranteAddress);
        const cliLocation = await geocoddeAddress(clienteAddress);

        //estraggo lat e lon
        const resCoords = {
            latitudine: resLocation.coordinates[1],
            longitudine: resLocation.coordinates[0]
        };
        const cliCoords = {
            latitudine: cliLocation.coordinates[1],
            longitudine: cliLocation.coordinates[0]
        };

        const distanceKm = haversineDistance(resCoords, cliCoords);

        //calcola il costo con minimo una distanza di 1 km e arrotonda all'intero più vicino
        const effectiveDistance = Math.max(1, Math.ceil(distanceKm));

        const totalConst = costoBase + (effectiveDistance * costoPerKm);

        console.log(`Distanza calcolata: ${distanceKm.toFixed(2)} km. Costo: ${totalCost.toFixed(2)}€ (Base: ${COSTO_BASE}€ + ${COSTO_PER_KM}€/km)`);

        return parseFloat(totalCost.toFixed(2));
    } catch (error) {
        console.error('Errore nel calcolo del costo di consegna:', error);
        //in caso di errore o indirizzo non trovato di default costo di 10 euro
        return 10.00;
    }
};

module.exports = { calculateDeliveryConst };