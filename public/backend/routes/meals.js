const express = require('express');
const router = express.Router();

// Importiamo il controller
const mealsController = require('../controllers/mealsController');

router.get('/', (req, res) => {
    /* #swagger.tags = ['Meals']
       #swagger.summary = 'Ottiene la lista globale dei piatti'
       #swagger.parameters['nome'] = { in: 'query', type: 'string' }
       #swagger.parameters['tipologia'] = { in: 'query', type: 'string' }
       #swagger.parameters['ingredienti'] = { in: 'query', type: 'string' }
    */
    mealsController.getAllMeals(req, res);
});

router.get('/:id', (req, res) => {
    /* #swagger.tags = ['Meals']
       #swagger.summary = 'Dettaglio singolo piatto da database comune'
    */
    mealsController.getMealById(req, res);
});

module.exports = router;