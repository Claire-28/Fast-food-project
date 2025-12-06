const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ruolo: { type: String, enum: ['Cliente', 'Ristoratore'], required: true },
    cardInfoHash: { type: String, default: null, select: false  }, //select: null per non restituirlo ai nella query standard
    defaultAddress: { type: String, default: null },
    notificationPreference: { type: String, enum: ['Email', 'SMS', 'Nessuna'], default: 'Email' }
});

module. exports = mongoose.model('User', userSchema);