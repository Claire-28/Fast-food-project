const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middlewares/verifyToken');

// Proteggiamo le rotte con il middleware
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getOrdersByUser);

module.exports = router;