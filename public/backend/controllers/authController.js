const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Assicurati di avere bcryptjs installato (npm install bcryptjs)

const JWT_SECRET = 'tua_chiave_segreta_super_sicura'; // In produzione usa variabili d'ambiente

// REGISTRAZIONE
exports.signup = async (req, res) => {
    try {
        const { username, email, password, ruolo } = req.body;

        // Controllo esistenza utente
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email già registrata' });
        }

        // Criptazione password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            ruolo
        });

        await newUser.save();

        res.status(201).json({ message: 'Utente creato con successo' });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Errore durante la registrazione' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Inserisci email e password' });
        }

        // Cerca utente
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Verifica password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Genera Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, ruolo: user.ruolo },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ruolo: user.ruolo
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
};

// LOGOUT (Semplice risposta, il logout vero avviene lato client cancellando il token)
exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout effettuato con successo' });
};

// PROFILO UTENTE (Opzionale, serve per testare il token)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Errore server' });
    }
};