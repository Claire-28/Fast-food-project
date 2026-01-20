const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware opzionale per proteggere le rotte
const verifyToken = require('../middlewares/verifyToken');

// Middleware per il controllo del dominio
const checkEmailDomain = require('../middlewares/checkemailDomain');

// Rotta per la registrazione
// POST /api/auth/signup
router.post('/signup', checkEmailDomain, authController.signup);

// Rotta per il login
// POST /api/auth/login
router.post('/login', authController.login);

// Rotta per il logout
// GET /api/auth/logout
// L'errore "undefined callback" succedeva probabilmente qui se authController.logout non esisteva
router.get('/logout', authController.logout);

// Esempio di rotta protetta per ottenere i dati dell'utente loggato
// GET /api/auth/me
// router.get('/me', verifyToken, authController.getMe);

module.exports = router;