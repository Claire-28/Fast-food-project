const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'la_mia_chiave_segreta_123_test';

exports.register = async (req, res) => {
    try {
        console.log("🔹 [REGISTER] Dati ricevuti:", req.body);

        // Ora ci aspettiamo anche il campo 'role' (opzionale, default 'cliente')
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Se l'utente non seleziona nulla, è 'cliente'
        // Se seleziona qualcosa, ci assicuriamo che sia valido
        let userRole = 'cliente';
        if (role === 'Ristoratore') userRole = 'ristoratore';
        
        const newUser = new User({
            username: name,
            email: email,
            password: hashedPassword,
            ruolo: userRole 
        });

        await newUser.save();
        console.log("✅ [REGISTER] Utente creato:", email, "role:", userRole);
        
        res.status(201).json({ message: "Utente registrato con successo" });

    } catch (error) {
        console.error("🔥 [REGISTER] Errore:", error);
        
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: `Errore validazione: ${error.message}` });
        }
        res.status(500).json({ message: "Errore durante la registrazione" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.ruolo },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.ruolo
            }
        });
    } catch (error) {
        console.error("🔥 [LOGIN] Errore:", error);
        res.status(500).json({ message: "Errore durante il login" });
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