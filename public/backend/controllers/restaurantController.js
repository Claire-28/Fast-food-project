// Funzioni placeholder per evitare crash
const getAllRestaurants = (req, res) => {
    // Ritorna un array vuoto o dati finti
    res.json([{
        _id: "1",
        nome: "Fast Food Demo",
        indirizzo: "Via Roma 1",
        tipologia: "Generale"
    }]);
};

const getRestaurantById = (req, res) => {
    res.json({ _id: req.params.id, nome: "Fast Food Demo" });
};

const createRestaurant = (req, res) => {
    res.status(201).json({ message: "Ristorante creato" });
};

module.exports = { getAllRestaurants, getRestaurantById, createRestaurant };