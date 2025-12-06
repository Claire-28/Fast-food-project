const fs = require('fs');
const path = require('path');
const Plate = require('../models/plate');

const commonMealsPath = path.join(__dirname, '../data/meals.json');

const loadCommonMeals = async () => {
    try {
        const count = await Plate.countDocuments({isCommon: true});

        if (count > 0) {
            console.log('piatti comuni gia caricati nel db, salto la fase di setup');
            return;
        }

        const data = fs.readFileSync(commonMealsPath, 'utf8');
        const commonMeals = JSON.parse(data);

        const mealsToInsert = commonMeals.map(meal => ({
            ...meal,
            isCommon: true
        }));
        await Plate.insertMany(mealsToInsert);
        console.log(`caricamento iniziale completato. Aggiunti ${mealsToInsert.length} piatti comuni`);
    } catch (error) {
        console.error('errore nel caricamento dei piatti comuni: ', error.message);
    }
};

module.exports = loadCommonMeals;