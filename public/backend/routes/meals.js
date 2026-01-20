const express = require('express');
const router = express.Router();

// Importiamo il controller
const mealsController = require('../controllers/mealsController');

// Rotta principale: GET /api/meals
// Chiama la funzione getAllMeals del controller
router.get('/', mealsController.getAllMeals);

// Rotta dettaglio: GET /api/meals/:id
// Chiama la funzione getMealById del controller
router.get('/:id', mealsController.getMealById);

module.exports = router;