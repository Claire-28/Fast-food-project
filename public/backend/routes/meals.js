const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');

// Verifica che il controller sia stato importato correttamente
if (!mealsController || !mealsController.getMeals) {
    console.error("ERRORE: mealsController non caricato correttamente in routes/meals.js");
}

/**
 * @swagger
 * tags:
 * name: Meals
 * description: Gestione dei piatti
 */

/**
 * @swagger
 * /meals:
 * get:
 * summary: Recupera la lista dei piatti
 * tags: [Meals]
 * parameters:
 * - in: query
 * name: nome
 * schema:
 * type: string
 * description: Filtra per nome del piatto
 * - in: query
 * name: tipologia
 * schema:
 * type: string
 * description: Filtra per categoria (es. Dessert)
 * responses:
 * 200:
 * description: Lista dei piatti trovati
 */
router.get('/', mealsController.getMeals);

/**
 * @swagger
 * /meals/{id}:
 * get:
 * summary: Recupera un piatto specifico per ID
 * tags: [Meals]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Dettagli del piatto
 * 404:
 * description: Piatto non trovato
 */
router.get('/:id', mealsController.getMealById);

module.exports = router;