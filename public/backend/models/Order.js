const mongoose = require('mongoose');

const orderPlateScheme = new mongoose.Schema({
    mealId: { type: String, required: true},
    nome: { type: String, required: true},
    prezzoUnitario: { type: Number, required: true},
    quantita: { type: Number, required: true, min:1},
    plateDbId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plate'}
});

const orderSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    ristorante: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true},
    piatti: [orderPlateScheme],
    stato: { type: String, enum: ['Ordinato', 'In Preparazione', 'In Consegna', 'Consegnato', 'Ritirato', 'Annullato'], default: 'Ordinato'},
    tipoConsegna: { type: String, enum: ['Ritiro','Consegna a domicilio'], required: true },
    costoConsegna: { type: Number, required: true, default : 0},
    indirizzoConsegna: {type: String, required: function () {
        return this.tipoConsegna === 'Consegna a domicilio';
    }, default: null},
    dataOrdine: { type: Date, default: Date.now},
    totale: { type: Number, required: true}
});

module.exports = mongoose. model('Order', orderSchema);