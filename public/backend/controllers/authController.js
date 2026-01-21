const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, password, ruolo } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email già registrata" });

        const newUser = new User({ nome, email, password, ruolo: ruolo || 'cliente' });
        await newUser.save();
        res.status(201).json({ message: "Registrazione completata" });
    } catch (error) {
        res.status(500).json({ message: "Errore durante la registrazione" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Credenziali non valide" });
        }

        const token = jwt.sign(
            { id: user._id, ruolo: user.ruolo },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: user._id, nome: user.nome, ruolo: user.ruolo }
        });
    } catch (error) {
        res.status(500).json({ message: "Errore durante il login" });
    }
};