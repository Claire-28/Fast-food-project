const fs = require('fs');
const path = require('path');

exports.getAllMeals = (req, res) => {
    try {
        const dataPath = path.join(__dirname, '../data/meals.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        let meals = JSON.parse(data);

        // --- FILTRAGGIO DATI ---
        const { nome, tipologia, ingredienti, allergie } = req.query;

        // 1. Filtro per Nome
        if (nome) {
            meals = meals.filter(meal => 
                meal.strMeal.toLowerCase().includes(nome.toLowerCase())
            );
        }

        // 2. Filtro per Categoria (Tipologia)
        if (tipologia) {
            meals = meals.filter(meal => 
                meal.strCategory && meal.strCategory.toLowerCase().includes(tipologia.toLowerCase())
            );
        }

        // 3. Filtro per Ingredienti (Cerca nell'array o nelle stringhe)
        if (ingredienti) {
            const searchIng = ingredienti.toLowerCase();
            meals = meals.filter(meal => {
                // Se esiste un array 'ingredients'
                if (meal.ingredients && Array.isArray(meal.ingredients)) {
                    return meal.ingredients.some(ing => ing.toLowerCase().includes(searchIng));
                }
                // Fallback: cerca in strIngredient1, strIngredient2...
                // (Logica semplificata: controlliamo se la stringa JSON grezza contiene l'ingrediente)
                return JSON.stringify(meal).toLowerCase().includes(searchIng);
            });
        }

        // 4. Filtro per Esclusione Allergeni (opzionale, se presente nel JSON)
        if (allergie) {
            const excludeAllergen = allergie.toLowerCase();
            meals = meals.filter(meal => {
                // Se il piatto ha una lista allergeni, escludilo se contiene quello cercato
                if (meal.allergens) {
                    return !meal.allergens.toLowerCase().includes(excludeAllergen);
                }
                return true; // Se non ha info, lo teniamo
            });
        }

        res.status(200).json(meals);

    } catch (error) {
        console.error("Errore lettura meals.json:", error);
        res.status(500).json({ message: "Impossibile recuperare il menu." });
    }
};