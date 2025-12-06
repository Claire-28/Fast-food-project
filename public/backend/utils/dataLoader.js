const fs = require('fs');
const path = require('path');
const Plate = require('../models/plate');

const commonMealsPath = path.join(__dirname, '../data/meals.json');

const loadCommonMeals = async () => {
    try {
        //controlla se ci sono piatti comuni così evita di ricaricarli
        const count = await Plate.countDocuments({isCommon: true});

        if (count > 0) {
            console.log('piatti comuni gia caricati nel db, salto la fase di setup');
            return;
        }

        const data = fs.readFileSync(commonMealsPath, 'utf8');
        const commonMeals = JSON.parse(data);

        const mealsToInsert = commonMeals.map(meal => (
            {
                mealId: meal.idMeal,
                nome: meal.strMeal,
                categoria: meal.strCategory,
                foto: meal.strMealThumb,
                ingredienti: meal.ingredients || [],
                prezzo: 9.99, //prezzo placeholder per i piatti comuni
                isCommon: true, //+indica che questo è un piatto del catalogo base
            }
        ));
        await Plate.insertMany(mealsToInsert, { ordered: false });
        console.log(`Caricamento iniziale completato. Aggiunti ${mealsToInsert.length} piatti comuni`);
    } catch (error) {
        if (error.code !== 11000) {
            console.error('Errore nel caricamento dei piatti comuni: ', error.message);
        } else {
            console.log('Piatti comuni già presenti nel DB, caricamento parzialmente saltato.');
        }
    }
};

module.exports = loadCommonMeals;