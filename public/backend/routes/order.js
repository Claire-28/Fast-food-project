const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

//crea nuovo ordine (solo clienti)
router.post('/', verifyToken, checkRole(['Cliente']), orderController.createOrder);

//visualizza ordini (ristoratore vede i propri, cliente vede i propri)
router.get('/', verifyToken, orderController.getOrders);

//aggiorna stato degli ordini (solo ristoratore)
router.put('/:id/status', verifyToken, checkRole(['Ristoratore']), orderController.updateOrderStatus);

//router.post('/', verifyToken, checkRole(['Cliente']), orderController.createOrder);

//router.get('/restaurant', verifyToken, orderController.getOrders);

module.exports = router;