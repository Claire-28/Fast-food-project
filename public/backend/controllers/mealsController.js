const fs = require('fs');
const path = require('path');

// Carica i piatti dal file meal.json
const getMealsFromFile = () => {
    const filePath = path.join(__dirname, '../data/meals.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

exports.getAllMeals = async (req, res) => {
    try {
        const meals = getMealsFromFile();
        res.status(200).json(meals);
    } catch (error) {
        res.status(500).json({ message: "Errore nel caricamento dei piatti" });
    }
};

exports.getMealById = async (req, res) => {
    try {
        const meals = getMealsFromFile();
        const meal = meals.find(m => m.id == req.params.id);
        if (!meal) return res.status(404).json({ message: "Piatto non trovato" });
        res.status(200).json(meal);
    } catch (error) {
        res.status(500).json({ message: "Errore nel recupero del dettaglio" });
    }
};