const jwt = require('jsonwebtoken');

const JWT_SECRET = 'la_mia_chiave_segreta_123_test';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Accesso negato. Token mancante.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Errore verifica token:", err.message);
        return res.status(401).json({ error: 'Sessione scaduta o token non valido.' });
    }
};