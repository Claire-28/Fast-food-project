//const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');
const restaurantcontroller = require('../controllers/restaurantController');

//creazione ristorante solo per ristoratori (spostato in restaurant.js)
//router.post('/me', verifyToken, checkRole(['Ristoratore']), restaurantcontroller.createRestaurant);

//modifica ordine solo per ristoratori o clienti che modificano il proprio ordine (spostato in routes/order.js)
//router.put('/status/:orderId', verifyToken, checkRole(['Ristoratore']), orderController.updateOrderStatus);

//visualizzare tutti i piatti ma solo se si è loggati (spostato in routes/meals.js)
//router.get('/plates', verifyToken, mealsController.getAllPlates);

module.exports = router;