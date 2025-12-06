const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const restaurantController = require('../controllers/restaurantController');

// ROTTE PER RISTORATORE (Gestione del proprio ristorante)
router.post( '/me', verifyToken, checkRole(['Ristoratore']), restaurantController.createRestaurant);

// GET /api/restaurants/me - Visualizza i dati del proprio ristorante
router.get( '/me', verifyToken, checkRole(['Ristoratore']), restaurantController.getMyRestaurant);

// PUT /api/restaurants/me - Modifica i dati del proprio ristorante 
router.put('/me', verifyToken, checkRole(['Ristoratore']), restaurantController.updateRestaurant);

// ROTTE PER CLIENTE/UTENTI LOGGATI (Ricerca/Visualizzazione)

// GET /api/restaurants/search?nome=...&luogo=... - Ricerca dei ristoranti
router.get( '/search', verifyToken, restaurantController.searchRestaurants);

// GET /api/restaurants - Visualizza tutti i ristoranti (endpoint generico)
router.get( '/', verifyToken, restaurantController.getAllRestaurant);

// GET /api/restaurants/:id - Visualizza i dettagli (e il menu) di un singolo ristorante
router.get('/:id', verifyToken, restaurantController.getRestaurantMenuDetails);

// POST /api/restaurants/menu (Aggiunge un piatto dalla lista comune al menu)
router.post('/menu', verifyToken, checkRole(['Ristoratore']), restaurantController.addPlateToMenu);

// GET /api/restaurants/menu (Ottiene i piatti aggiunti al menu dal Ristoratore)
router.get('/menu', verifyToken, checkRole(['Ristoratore']), restaurantController.getRestaurantMenu);

router.delete('/menu/:plateId', verifyToken, checkRole(['Ristoratore']), restaurantController.removePlateFromMenu);

router.put('/menu/:plateId', verifyToken, checkRole(['Ristoratore']), restaurantController.updatePlate);

//GET /api/restaurants/:id/popular (visualizza la lista dei piatti più venduti per un ristorante)
router.get('/:id/popular', verifyToken, restaurantController.getCommonPlates); // CORREZIONE: Usiamo /:id/popular

module.exports = router;