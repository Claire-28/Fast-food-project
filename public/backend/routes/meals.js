const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, mealsController.getAllPlates);

router.get('/common', verifyToken, mealsController.getCommonMeals);

router.get('/search', verifyToken, mealsController.searchMeals);

module.exports = router;