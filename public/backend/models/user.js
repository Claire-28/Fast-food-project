const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ruolo: { type: String, enum: ['cliente', 'ristoratore'], required: true },
    cardInfoHash: { type: String, default: null, select: false }, //select: null per non restituirlo nella query standard
    lastFourCardDigits: { type: String, default: null },
    defaultAddress: { type: String, default: null },
    notificationPreference: { type: String, enum: ['Email', 'SMS', 'Nessuna'], default: 'Email' }
});

module. exports = mongoose.model('User', userSchema);