const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');

router.get('/', mealsController.getAllMeals);
router.get('/:id', mealsController.getMealById);

module.exports = router;