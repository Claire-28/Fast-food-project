const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const checkDomain = require('../middlewares/checkemailDomain');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middlewares/verifyToken');

router.post('/signup',
    [
        body('username')
        .trim()
        .notEmpty().withMessage('Username obbligatorio')
        .isLength({ min: 3, max: 30}).withMessage('Lo username deve avere minimo 3 caratteri e massimo 30')
        .escape(), //per injection HTML

        body('email')
        .isEmail().withMessage('Email non valida')
        .normalizeEmail(),

        body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('La password deve contenere almeno 8 caratteri, una lettera minuscola e una maiuscola, un numero e un simbolo'),

        body('confirmPassword')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Le password non coincidono');
            }
            return true;
        }),

        body('ruolo')
        .isIn(['Cliente', 'Ristoratore'])
        .withMessage('Ruolo non valido'),
    ],

    checkDomain,
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ error: errors.array()[0].msg});
        }
        next();
    },

    authController.signup);

router.post('/login',
    [
        body('email')
        .isEmail().withMessage('Email non valida')
        .normalizeEmail(),

        body('password')
        .notEmpty().withMessage('Password obbligatoria'),
    ],

    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ error: errors.array()[0].msg});
        }
        next();
    },

authController.login);

router.get('/me', verifyToken, authController.getLoggedInUser);

router.put('/me', 
    verifyToken,
    [
        body('email')
            .optional()
            .isEmail().withMessage('Email non valida')
            .normalizeEmail(),

        body('password')
            .optional()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage('La nuova password deve contenere almeno 8 caratteri, una lettera minuscola e una maiuscola, un numero e un simbolo'),

        body('username')
            .optional()
            .trim()
            .notEmpty().withMessage('Username obbligatorio')
            .isLength({ min: 3, max: 30}).withMessage('Lo username deve avere minimo 3 caratteri e massimo 30')
            .escape(),
    ],

    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    },
    authController.updateProfile
);

router.delete('/me', verifyToken, authController.deleteProfile);

module.exports = router;