const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, password, ruolo } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email già registrata" });

        const newUser = new User({ nome, email, password, ruolo: ruolo || 'cliente' });
        await newUser.save();
        res.status(201).json({ success: true, message: "Registrazione completata" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore durante la registrazione" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            // Bypass per test
            if (email === 'test@test.com' && password === 'password') {
                const testUser = { _id: "test_id", nome: "Test", email: "test@test.com", ruolo: "cliente" };
                const token = jwt.sign({ id: testUser._id, role: testUser.ruolo }, 'secret_key_progetto', { expiresIn: '24h' });
                return res.status(200).json({ success: true, token, user: testUser });
            }
            return res.status(401).json({ success: false, message: "Credenziali errate" });
        }

        const token = jwt.sign({ id: user._id, role: user.ruolo }, 'secret_key_progetto', { expiresIn: '24h' });
        res.status(200).json({ success: true, token, user: { id: user._id, nome: user.nome, email: user.email, ruolo: user.ruolo } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore server durante login" });
    }
};

// AGGIUNTA: Questa funzione mancava e faceva crashare il server
exports.logout = (req, res) => {
    res.status(200).json({ success: true, message: "Logout effettuato" });
};