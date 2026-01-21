const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definiamo solo le rotte che abbiamo creato nel controller
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;