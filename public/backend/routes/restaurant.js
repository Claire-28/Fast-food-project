const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const restaurantController = require('../controllers/restaurantController');

router.post('/me', verifyToken, checkRole(['Ristoratore']), (req, res) => {
    /* #swagger.tags = ['Restaurant - Admin']
       #swagger.summary = 'Configura il proprio ristorante'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = {
           in: 'body',
           schema: { nome: "Da Mario", indirizzo: "Via Roma 1", telefono: "02123", partitaIVA: "12345678901" }
       }
    */
    restaurantController.createRestaurant(req, res);
});

router.get('/me/stats', verifyToken, checkRole(['Ristoratore']), (req, res) => {
    /* #swagger.tags = ['Restaurant - Admin']
       #swagger.summary = 'Ottiene fatturato odierno e ordini pendenti'
       #swagger.security = [{ "bearerAuth": [] }]
    */
    restaurantController.getRestaurantStats(req, res);
});

// GESTIONE MENU
router.post('/menu', verifyToken, checkRole(['Ristoratore']), (req, res) => {
    /* #swagger.tags = ['Restaurant - Menu']
       #swagger.summary = 'Aggiunge un piatto dalla lista comune al proprio menu'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = { in: 'body', schema: { $ref: '#/definitions/NuovoPiatto' } }
    */
    restaurantController.addPlateToMenu(req, res);
});

// RICERCA (Cliente)
router.get('/search', verifyToken, (req, res) => {
    /* #swagger.tags = ['Restaurant - Search']
       #swagger.summary = 'Cerca ristoranti per nome o luogo'
       #swagger.parameters['nome'] = { in: 'query' }
       #swagger.parameters['luogo'] = { in: 'query' }
    */
    restaurantController.searchRestaurants(req, res);
});

router.get('/:id/popular', verifyToken, (req, res) => {
    /* #swagger.tags = ['Restaurant - Search']
       #swagger.summary = 'Ottiene i piatti più venduti di un ristorante'
    */
    restaurantController.getCommonPlates(req, res);
});

module.exports = router;