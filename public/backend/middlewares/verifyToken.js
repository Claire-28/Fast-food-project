const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mancante' });
    try {
        const decoded = jwt.verify(token, 'supersecret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token non valido' });
    }
};