const fs = require('fs');
const path = require('path');

// Carica i piatti dal file meal.json
const getMealsFromFile = () => {
    try {
        const filePath = path.join(__dirname, '../data/meals.json');
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Errore lettura meals.json", e);
        return [];
    }
};

exports.getAllMeals = (req, res) => {
    const meals = getMealsFromFile();
    res.status(200).json(meals);
};

exports.getMealById = (req, res) => {
    const meals = getMealsFromFile();
    const meal = meals.find(m => m.id == req.params.id);
    if (!meal) return res.status(404).json({ message: "Piatto non trovato" });
    res.status(200).json(meal);
};