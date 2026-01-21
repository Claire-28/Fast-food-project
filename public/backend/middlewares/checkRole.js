module.exports = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Token non fornito o non valido. Autenticazione richiesta.'});
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`Accesso negato: Utente ${req.user.id} con role ${req.user.role} ha tentato di accedere a una risorsa limitata a: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ error: 'Permesso negato.', message: `Non hai il role necessario (${req.user.role}) per accedere a questa risorsa. Ruoli richiesti: ${allowedRoles.join(' o ')}.`});
        }
        next();
    };
};