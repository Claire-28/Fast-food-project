const fs = require('fs');
const path = require('path');

// Percorso corretto al file JSON
const mealsFilePath = path.join(__dirname, '../data/meals.json');

// Unica funzione per ottenere tutti i piatti o filtrarli
exports.getAllMeals = (req, res) => {
    fs.readFile(mealsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Errore lettura meals.json:", err);
            return res.status(500).json({ error: 'Errore nel caricamento dei piatti' });
        }

        try {
            let meals = JSON.parse(data);

            // Parametri query dal frontend (es. ?nome=Pizza&tipologia=Dessert)
            const { nome, tipologia, ingredienti, allergie } = req.query;

            // 1. Filtro Nome
            if (nome) {
                meals = meals.filter(m =>
                    m.strMeal.toLowerCase().includes(nome.toLowerCase())
                );
            }

            // 2. Filtro Categoria
            if (tipologia) {
                meals = meals.filter(m =>
                    m.strCategory && m.strCategory.toLowerCase().includes(tipologia.toLowerCase())
                );
            }

            // 3. Filtro Ingredienti
            if (ingredienti) {
                const searchIng = ingredienti.toLowerCase();
                meals = meals.filter(m =>
                    m.ingredients && m.ingredients.some(ing => ing.toLowerCase().includes(searchIng))
                );
            }

            // 4. Filtro Allergie (Esclusione)
            if (allergie) {
                const searchAllergen = allergie.toLowerCase();
                meals = meals.filter(m => {
                    if (!m.ingredients) return true;
                    // Mantiene il piatto solo se NESSUN ingrediente contiene la parola dell'allergene
                    return !m.ingredients.some(ing => ing.toLowerCase().includes(searchAllergen));
                });
            }

            // Ordine alfabetico
            meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));

            res.status(200).json(meals);

        } catch (parseError) {
            console.error("Errore parsing JSON:", parseError);
            res.status(500).json({ error: 'Dati dei piatti non validi' });
        }
    });
};

// Funzione per singolo piatto
exports.getMealById = (req, res) => {
    const { id } = req.params;
    fs.readFile(mealsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Errore server' });
        const meals = JSON.parse(data);
        const meal = meals.find(m => m.idMeal === id);
        if (!meal) return res.status(404).json({ error: 'Piatto non trovato' });
        res.json(meal);
    });
};