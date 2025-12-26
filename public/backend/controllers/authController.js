const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const Plate = require('../models/plate');
const Order = require('../models/Order');

exports.signup = async (req, res) => {
    try {
        const { username, email, password, ruolo } = req.body;

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
        return res.status(400).json({ error: 'Username già registrato' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
        return res.status(400).json({ error: 'Email già registrata' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

        const newUser = new User({
        username,
        email,
        password: hashedPassword,
        ruolo
        });

        await newUser.save();

        console.log(`Nuovo utente registrato: ${email}`);
        res.status(201).json({message: 'Registrazione completata'});

    } catch (err) {
        console.error('Errore nella registrazione');
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Inserisci email e password' });
        }

        const user = await  User.findOne({email});
        if (!user) return res.status(400).json({ error: 'Email non trovata' });

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) return res.status(400).json({ error: 'Password errata' });

        const token = jwt.sign(
            { id: user._id, ruolo: user.ruolo },
            'supersecret',
            {expiresIn: '1h'}
        );
        
        console.log(`Login riuscito per ${email}`);

        res.status(200).json({
            message: 'Login OK',
            token,
            user: {
                id: user._id,
                username:  user.username,
                ruolo: user.ruolo,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Errore nel login:', err);
        res.status(500).json({ error: 'Errore durante il login' });
    }
};

exports.getLoggedInUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('username email ruolo defaultAddress notificationPreference -password -__v');

        if(!user) {
            return res.status(404).json({ error: 'Utente non trovato nel database'});
        }

        let lastFourDigits = null;
        const fullUser = await User.findById(userId).select('+cardInfoHash');
        if (fullUser && fullUser.cardInfoHash) {
            lastFourDigits = 'Salvata';
        }

        return res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            ruolo: user.ruolo,
            defaultAddress: user.defaultAddress,
            notificationPreference: user.notificationPreference,
            cardStatus: lastFourDigits
        });
    } catch (error) {
        console.error('Errore nel recupero dati utente loggato: ', error);
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

exports.updateProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const { username, email, password, defaultAddress, notificationPreference, cardNumber, cardExpiry, cardCVC } = req.body;

        const updateData = {};

        if (username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername && existingUsername._id.toString() !== userId) {
                return res.status(400).json({ error: 'Username gia in uso da un altro utente'});
            }
            updateData.username = username;
        }

        if (email) {
            const existingEmail = await User.findOne({ email });
            if(existingEmail && existingEmail._id.toString() !== userId) {
                return res.status(400).json({ error: 'Email già in uso da un altro utente'});
            }
            updateData.email= email;
        }

        if(password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        if (defaultAddress !== undefined) {
            updateData.defaultAddress = defaultAddress;
        }

        if (notificationPreference != undefined) {
            updateData.notificationPreference = notificationPreference;
        }

        if (cardNumber && cardExpiry && cardCVC) {
            if (cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) 
                return res.status(400).json({ error: 'Validazione fallita: il numero di carta deve essere di 16 cifre'});

            if ((cardCVC.length !== 3 && cardCVC.length !== 4)|| !/^\d{3,4}$/.test(cardCVC))
                return res.status(400).json({ error: 'Validazione fallita: il CVC deve essere di 3 o 4 cifre'});

            if(!/^\d{2}\/\d{2}$/.test(cardExpiry))
                return res.status(400). json({ error: 'Validazione fallita: la data di scadenza deve essere nel formato MM/YY'});

            const [month, year] = cardExpiry.split('/');
            const expiryMonth = parseInt(month, 10);
            const expiryYear = 2000 + parseInt(year, 10);

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; //getMonth parte da 0

            if (expiryMonth < 1 || expiryMonth > 12) {
                return res.status(400).json({ error: 'Validazione fallita: mese di scadenza non valido'});
            }

            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                return res.status(400).json({ error: 'Validazione fallita: la carta e scaduta'});
            }

            //numero di carta criptato
            const fullCardString = `${cardNumber}|${cardExpiry}|${cardCVC}`;
            const hashedCardInfo = await bcrypt.hash(fullCardString, 10);
            updateData.cardInfoHash = hashedCardInfo;

        } else if ((cardNumber && !cardExpiry) || (cardNumber && !cardCVC) || (cardExpiry && !cardNumber) || (cardCVC && !cardNumber)) {
            return res.status(400).json({error: 'Per aggiornare la carta servono numero, data di scadenza e CVC'});
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nessun dato valido fornito per l\'aggiornamento.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -__v -cardInfoHash');

        if(!updatedUser) {
            return res.status(404).json({ error: 'Utente non trovato'});
        }

        res.status(200).json({ message: 'Profilo aggiornato con successo!', user: updatedUser });

    } catch (error) {
        console.log('Eroore durante lo aggiornamento del profilo: ', error);
        res.status(500).json({ error: 'Errore interno del server durante lo aggiornamento'});
    }
};

exports.deleteProfile = async (req, res) => {
    const userId  = req.user.id;
    const userRole = req.user.ruolo;

    try {
        if (userRole === 'Ristoratore') {
            console.log(`Pulizia dati del Ristoratore (ID: ${userId})...`);

            await Plate.deleteMany({ restaurant: userId});
            console.log(`Piatti eliminati per Ristorante ${userId}`);

            const restauantDeleteResult = await Restaurant.deleteOne({ proprietario: userId});
            console.log(`record e ristorante eliminato: ${restauantDeleteResult.deletedCount}`);
        }

        const userDeleteResult = await User.findByIdAndDelete(userId);

        if (!userDeleteResult) {
            return res.status(404).json({ error: 'Utente non trovato'});
        }

        console.log(`Account utente (ID: ${userId}) eliminato con successo`);
        res.status(204).send();
    } catch (error) {
        console.error('Errore durante la cancellazione del profilo: ', error);
        res.status(500).json({ error: 'Errore interno del server durante la cancellazione'});
    }
};