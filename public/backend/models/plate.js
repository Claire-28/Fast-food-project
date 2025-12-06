const mongoose = require('mongoose');
const restaurant = require('./restaurant');

const plateSchema = new mongoose.Schema({
    mealId: { type: String, required: true }, 
    nome: { type: String, required: true },
    //nomeAlternativo: String,
    categoria: String,
    //area: String,
    //istruzioni: String,
    foto: String,
    //tags: String,
    //youtube: String,
    //source: String,
    ingredienti: [String],
    //misure: [String],
    prezzo: { type: Number, required: true },
    allergie: [String],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: function () {
            return this.isCommon === false;
        }
    },
    isCommon: { type: Boolean, default: false}
});

plateSchema.index({ restaurant: 1, mealId: 1 }, { unique: true });

module.exports = mongoose.model('Plate', plateSchema);