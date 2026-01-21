const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

router.post('/', verifyToken, checkRole(['cliente']), (req, res) => {
    /* #swagger.tags = ['Orders']
       #swagger.summary = 'Crea un nuovo ordine'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = { in: 'body', schema: { $ref: '#/definitions/NuovoOrdine' } }
    */
    orderController.createOrder(req, res);
});

router.get('/', verifyToken, (req, res) => {
    /* #swagger.tags = ['Orders']
       #swagger.summary = 'Visualizza lo storico ordini (Cliente o Ristoratore)'
       #swagger.security = [{ "bearerAuth": [] }]
    */
    orderController.getOrders(req, res);
});

router.put('/:id/status', verifyToken, checkRole(['ristoratore']), (req, res) => {
    /* #swagger.tags = ['Orders']
       #swagger.summary = 'Aggiorna lo stato di un ordine'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['obj'] = { 
           in: 'body', 
           schema: { stato: 'In Preparazione' } 
       }
    */
    orderController.updateOrderStatus(req, res);
});

module.exports = router;