const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Definiamo le rotte base che il frontend potrebbe chiamare
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', restaurantController.createRestaurant);

module.exports = router;