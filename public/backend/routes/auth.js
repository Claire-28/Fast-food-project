const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware
const verifyToken = require('../middlewares/verifyToken');
const checkEmailDomain = require('../middlewares/checkemailDomain');

// Rotta per la registrazione
// POST /api/auth/register
router.post('/register', (req, res) => {
    /* #swagger.tags = ['Autenticazione']
        #swagger.summary = 'Registra un nuovo utente'
        #swagger.description = 'Crea un nuovo profilo. Il sistema controlla automaticamente il dominio della mail tramite middleware.'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Dati di registrazione',
            schema: {
                $nome: 'Mario Rossi',
                $email: 'mario@esempio.it',
                $password: 'Password123!',
                $ruolo: 'cliente'
            }
        }
        #swagger.responses[201] = { description: 'Utente creato con successo' }
        #swagger.responses[400] = { description: 'Dati non validi o email già esistente' }
    */
    authController.register(req, res);
});

// Rotta per il login
// POST /api/auth/login
router.post('/login', (req, res) => {
    /* #swagger.tags = ['Autenticazione']
        #swagger.summary = 'Effettua il login'
        #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Credenziali di accesso',
            schema: {
                $email: 'mario@esempio.it',
                $password: 'Password123!'
            }
        }
        #swagger.responses[200] = { 
            description: 'Login effettuato',
            schema: { token: 'JWT_TOKEN_HERE', user: { nome: 'Mario', ruolo: 'cliente' } }
        }
    */
    authController.login(req, res);
});

// Rotta per il logout
// GET /api/auth/logout
router.get('/logout', (req, res) => {
    /* #swagger.tags = ['Autenticazione']
        #swagger.summary = 'Effettua il logout'
        #swagger.description = 'Termina la sessione dell'utente (solitamente lato client rimuovendo il token).'
        #swagger.responses[200] = { description: 'Logout effettuato con successo' }
    */
    authController.logout(req, res);
});

// Esempio di rotta protetta per ottenere i dati dell'utente loggato
// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
    /* #swagger.tags = ['Autenticazione']
        #swagger.summary = 'Ottieni profilo utente corrente'
        #swagger.description = 'Richiede un token JWT valido nell'header Authorization.'
        #swagger.security = [{ "apiKeyAuth": [] }]
        #swagger.responses[200] = { description: 'Dati profilo recuperati' }
        #swagger.responses[401] = { description: 'Non autorizzato' }
    */
    authController.getMe(req, res);
});

module.exports = router;