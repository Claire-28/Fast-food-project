const Plate = require('../models/plate');

// Recupera tutti i piatti con filtri opzionali
const getMeals = async (req, res) => {
    try {
        const { nome, tipologia, ingredienti, allergie } = req.query;
        let query = {};

        // Filtro per Nome (case insensitive)
        if (nome) {
            query.strMeal = { $regex: nome, $options: 'i' };
        }

        // Filtro per Categoria
        if (tipologia) {
            query.strCategory = { $regex: tipologia, $options: 'i' };
        }

        // Filtro per Ingredienti (cerca nell'array o stringa)
        if (ingredienti) {
            // Assumiamo che ingredienti sia un array nel DB, usiamo $in o $regex su un campo array
            query.ingredients = { $regex: ingredienti, $options: 'i' };
        }

        // Filtro per Allergeni
        if (allergie) {
            // Nota: verifica se nel tuo DB il campo si chiama 'allergens' o 'allergie'
            // Basandoci sul codice precedente del frontend sembra essere 'allergens'
            query.allergens = { $nin: [new RegExp(allergie, 'i')] }; // Esempio: Escludi piatti con questo allergene
            // Oppure se vuoi CERCARE piatti con allergeni (ma di solito si filtrano via):
            // query.allergens = { $regex: allergie, $options: 'i' };
        }

        const meals = await Plate.find(query);
        res.status(200).json(meals);
    } catch (error) {
        console.error("Errore nel recupero piatti:", error);
        res.status(500).json({ message: error.message });
    }
};

// Recupera singolo piatto per ID
const getMealById = async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await Plate.findOne({ idMeal: id });
        
        if (!meal) {
            return res.status(404).json({ message: 'Piatto non trovato' });
        }
        
        res.status(200).json(meal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ESPORTAZIONE CORRETTA
module.exports = {
    getMeals,
    getMealById
};