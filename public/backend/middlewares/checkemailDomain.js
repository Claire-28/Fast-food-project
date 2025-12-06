module.exports = (req, res, next) => {
    const { email } = req.body;

    const allowedDomains =['gmail.com', 'libero.it', 'outlook.com', 'hotmail.com'];

    if(!email) {
        return res.status(400).json({error: 'Email obbligatoria'});
    }

    const domain = email.split('@')[1];
    if(!domain ||  !allowedDomains.includes(domain)) {
        return res.status(400).json({ error: 'Dominio email non consentito'});
    }

    next();
};