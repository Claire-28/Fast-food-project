const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true},
    indirizzo: { type: String, required: true, trim: true}, 
    telefono: { type: String, trim: true},
    partitaIVA: { type: String, required: true, unique: true, trim: true},

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitudine, latitudine]
            index: '2dsphere' // Indice per query spaziali
        },
        city: { type: String } // Utile per la ricerca per luogo
    },

    piatti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plate'}],
    proprietario: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true}
}, {timestamps: true});

module.exports = mongoose.model('Restaurant', restaurantSchema);