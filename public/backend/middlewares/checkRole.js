module.exports = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.ruolo) {
            return res.status(401).json({ error: 'Token non fornito o non valido. Autenticazione richiesta.'});
        }

        if (!allowedRoles.includes(req.user.ruolo)) {
            console.warn(`Accesso negato: Utente ${req.user.id} con ruolo ${req.user.ruolo} ha tentato di accedere a una risorsa limitata a: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ error: 'Permesso negato.', message: `Non hai il ruolo necessario (${req.user.ruolo}) per accedere a questa risorsa. Ruoli richiesti: ${allowedRoles.join(' o ')}.`});
        }
        next();
    };
};