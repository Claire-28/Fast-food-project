const mealsData = require('../data/meals');
const Plate = require('../models/plate');

exports.getCommonMeals = (req, res) => {
    try {
        res.status(200).json(mealsData);
    } catch (error) {
        consoleerror('Errore nel recupero della lista comune dei piatti: ', error.message);
        res.status(500).json({error: 'Errore interno del server nel recupero della lista dei piatti comune'});
    }
}

exports.getAllPlates = async (req, res) => {
    try {
        const plates  = await Plate.find().select('-__v');
        res.status(200).json(plates);
    } catch (error) {
        console.error('Errore nel recupero dei piatti dal database: ', error.message);
        res.status(500).json({error: 'Errore interno del server'});
    }
}

exports.searchMeals = async (req, res) => {
    const {tipologia, nome, prezzo, ingredienti, allergie} = req.query;
    const query = {};

    if (tipologia) {
        query.categoria = { $regex: tipologia, $options: 'i'};
    }

    if (nome) {
        query.nome = { $regex: nome, $options: 'i'};
    }

    if (prezzo && !isNaN(prezzo)) {
        query.prezzo = { $lte: parseFloat(prezzo)}; //prezzo minore o uguale al valore della variabile prezzo
    }

    //contiene almeno l'ingrediente specificato
    if (ingredienti) {
        query.ingredienti = { $regex: ingredienti, $options: 'i'};
    }

    //non deve contenere l'allergene
    if (allergie) {
        query.allergie =  { $nin: [new RegExp(allergie, 'i')]}; //nin = not in
    }

    try {
        const meals = await Plate.find(query).select('-__v');
        res.status(200).json(meals);
    } catch (error) {
        console.error('Errore nella ricerca dei piatti:', error.message);
        res.status(500).json({ message: 'Errore nella ricerca dei piatti', error: error.message});
    }
};