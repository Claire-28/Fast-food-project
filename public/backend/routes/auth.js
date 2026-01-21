const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Verifica che authController.register, .login e .logout esistano
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;