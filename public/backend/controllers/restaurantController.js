const Restaurant = require('../models/restaurant');
const User = require('../models/user');
const Plate = require('../models/plate');
const mealsData = require('../data/meals');
const geocodeAddress = require('../utils/geocoder');
const { default: mongoose } = require('mongoose');
const Order = require('../models/Order');

const MAX_POPULAR_PLATE = 9;

async function getRestaurantDocId(proprietarioId) {
    const restaurantDoc = await Restaurant.findOne({ proprietario: proprietarioId });
    if (!restaurantDoc) {
        throw new Error('Nessun ristorante trovato per questo utente');
    }
    return restaurantDoc._id;
};

// CREAZIONE DEL RISTORANTE (POST /api/restaurants/me)
exports.createRestaurant = async (req, res) => {
    try {
        const proprietario = req.user.id;

        const existingRestaurant = await Restaurant.findOne({ proprietario });
        if (existingRestaurant) {
            return res.status(400).json({ error: 'Hai già un ristorante'})
        }

        const { nome, indirizzo, telefono, partitaIVA } = req.body;

        const locationData = await geocodeAddress(indirizzo);

        const newRestaurant = new Restaurant({
            proprietario,
            nome,
            indirizzo,
            telefono,
            partitaIVA,
            location: locationData
        });

        await newRestaurant.save();

        res.status(201).json({
            message:'Ristorante creato con successo',
            restaurant: newRestaurant
        });
    } catch (error) {
        console.error('Errore creazione ristorante: ', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Partita IVA o Ristoratore già usato'});
        }
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

// OTTIENI I DATI DEL PROPRIO RISTORANTE (GET /api/restaurants/me)
exports.getMyRestaurant = async (req, res) => {
    try {
        const proprietario = req.user.id;

        const restaurant = await Restaurant.findOne({proprietario}).populate('piatti');

        if (!restaurant)  {
            return res.status(404).json({ error: 'Nessun ristorante trovato per questo utente'});
        }
        res.status(200).json(restaurant);
    } catch (error) {
        console.error('Errore recupero ristorante personale:', error);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
};

//Ottieni statistiche del Ristoratore
exports.getRestaurantStats = async (req, res) => {
    const proprietarioId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const ristorante = await Restaurant.findOne({ proprietario: proprietarioId }).select('_id');
        if (!ristorante) {
            return res.status(404).json({ error: 'Nessun ristorante associato a questo utente' });
        }
        const ristoranteId = ristorante._id;

        const stats = await Order.aggregate([
            { $match: { ristorante: new mongoose.Types.ObjectId(ristoranteId) } },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $in: ['$stato', ['Consegnato', 'Ritirato']] },
                                        { $gte: ['$dataOrdine', today] }
                                    ]
                                },
                                '$totale',
                                0
                            ]
                        }
                    },
                    pendingOrdersCount: {
                        $sum: {
                            $cond: [
                                { $in: ['$stato', ['Ordinato', 'In Preparazione']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    pendingOrdersCount: 1
                }
            }
        ]);

        res.status(200).json(stats[0] || { totalRevenue: 0, pendingOrdersCount: 0 });
    } catch (error) {
        console.error('Errore nel recupero delle statistiche del ristorante:', error);
        res.status(500).json({ error: 'Errore interno del server durante il recupero delle statistiche.' });
    }
};

// RICERCA RISTORANTI (GET /api/restaurants/search)
exports.searchRestaurants = async (req, res) => {
    try {
        const {nome, luogo} = req.query;
        const searchCriteria = {};

        if (nome) {
            searchCriteria.nome = {$regex: nome, $options: 'i'};
        }

        if (luogo) {
            searchCriteria.indirizzo = {$regex: luogo, $options: 'i'};
        }

        const restaurants = await Restaurant.find(searchCriteria).select('-__v');

        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Errore ricerca ristoranti:', error);
        res.status(500).json({ error: 'Errore interno del server durante la ricerca.' });
    }
};

// OTTIENI TUTTI I RISTORANTI (Utilizzato in routes/restaurant.js)
exports.getAllRestaurant = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().select('-__v -piatti');
        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Errore recupero tutti i ristoranti:', error);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
};

//AGGIUNGI UN PIATTO AL MENU
exports.addPlateToMenu = async (req, res) => {
    const proprietarioId = req.user.id;
    const {idMeal, prezzo} = req.body;
    if (!idMeal || !prezzo) {
        return res.status(400).json({ error: 'ID del piatto comune (idMeal) e prezzo sono obbligatori'});
    }

    try {
        const restaurantDbId = await getRestaurantDocId(proprietarioId);
        const existingPlate = await Plate.findOne ({
            restaurant: restaurantDbId,
            mealId: idMeal
        });

        if(existingPlate) {
            return res.status(409).json({ error: `Il piatto con ID ${idMeal} è già presente nel tuo menu`});
        }

        const commonMeal = mealsData.find(meal => meal.idMeal === idMeal);

        if(!commonMeal) {
            return res.status(404).json({ error: `Piatto non trovato nella lista comune`});
        }

        const newPlate = new Plate ({
            restaurant: restaurantDbId,
            prezzo : parseFloat(prezzo). toFixed(2),
            mealId: commonMeal.idMeal,
            nome: commonMeal.strMeal,
            //nomeAlternativo: commonMeal.strMealAlternate || null,
            categoria: commonMeal.strCategory,
            //area: commonMeal.strArea,
            //istruzioni: commonMeal.strInstructions,
            foto: commonMeal.strMealThumb,
            //tags: commonMeal.strTags ? commonMeal.strTags.split(',').map(tag => tag.trim()) : [],
            //youtube: commonMeal.strYoutube,
            //source: commonMeal.strSource,
            ingredienti: commonMeal.ingredients || [],
            //misure: commonMeal.measures || [],
            allergie: []
        });

        await newPlate.save();

        await Restaurant.findByIdAndUpdate( restaurantDbId, {$push: {piatti: newPlate._id}});

        res.status(201).json({ message: `Piatto ${commonMeal.strMeal} aggiunto al menu con prezzo ${newPlate.prezzo}€`, plate: newPlate});
    }catch (error) {
        console.error(`Errore nella aggiunta del piatto al menu: `, error);
        res.status(500).json({ error: `Errore interno del server durante la aggiunta del piatto`});
    }
};

//OTTIENI IL MENU DEL RISTORANTE LOGGATO
exports.getRestaurantMenu = async (req, res) => {
    const proprietarioId = req.user.id;

    try{
        const restaurantDbId = await getRestaurantDocId(proprietarioId);
        const menuPlatesDb = await Plate.find({ restaurant: restaurantDbId }).select('-__v');

        const fullMenu = menuPlatesDb.map(plateDb => {
            const commonMeal = mealsData.find(meal => meal.idMeal === plateDb.mealId);

            return {
                ...commonMeal,
                _id: plateDb._id,
                mealId: plateDb.mealId,
                prezzo: plateDb.prezzo
            };
        });
        res.status(200).json(fullMenu);
    } catch (error) {
        console.error('Errore nel recupero del menu: ', error),
        res.status(500).json({error: 'Errore interno del server'});
    }
};

exports.getRestaurantMenuDetails = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;

        const restaurant = await Restaurant.findById(restaurantId).select('-partitaIVA -proprietario -__v');
        if (!restaurant) {
            return res.status(404).json({ error: 'Ristorante non trovato.' });
        }

        const menuPlatesDb = await Plate.find({ restaurant: restaurantId}).select('-__v');

        const fullMenu = menuPlatesDb.map(plateDb => {
            const commonMeal = mealsData.find(meal => meal.idMeal === plateDb.mealId);
            return {
                ...commonMeal,
                _id: plateDb._id,
                mealId: plateDb.mealId,
                prezzo: plateDb.prezzo
            };
        })
        res.status(200).json({ restaurant, menu: fullMenu});
    } catch (error) {
        console.error("Errore nel recupero del menu per il cliente:", error);
        res.status(500).json({ error: 'Errore interno del server durante il recupero del menu.' });
    };
}

//RIMOZIONE PIATTO DAL MENU
exports.removePlateFromMenu = async (req, res) => {
    const plateId = req.params.plateId;
    const proprietarioId = req.user.id;

    if (!plateId) {
        return res.status(400).json({ error: 'ID del prodotto da rimuovere mancante'});
    }

    try {
        const restaurantDbId = await getRestaurantDocId(proprietarioId);
        const result = await Plate.findOneAndDelete({
            _id: plateId,
            restaurant: restaurantDbId
        });

        if (!result) {
            return res.status(404).json({ error: 'Piatto non trovato nel tuo menu o non autorizzato'});
        }

        await Restaurant.findByIdAndUpdate( restaurantDbId, {$pull: {piatti: plateId}});

        res.status(200).json({ message: 'Piatto rimosso dal menu con successo'});
    } catch (error) {
        console.error('Errore durante la rimozione del piatto:', error);
        res.status(500).json({ error: 'Errore interno del server durante la eliminazione.' });
    }
};

//AGGIORNA I DATI DEL RISTORANTE
exports.updateRestaurant = async (req, res) => {
    const restaurantId = req.user.id;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Nessun dato fornito per lo aggiornamento'});
    }

    delete updateData.owner;
    delete updateData._id;

    try {
        const updateRestaurant = await Restaurant.findOneAndUpdate(
            { proprietario: restaurantId },
            { $set: updateData },
            { new: true, runValidators: true}
        );

        if (!updateRestaurant) {
            return res.status(404).json({ error: 'Ristorante non trovato per lo utente loggato.'});
        }

        res.status(200).json({ message: 'Daati del ristorante aggiornarti con successo!', restaurant: updateRestaurant});
    } catch (error) {
        console.error('Errore durante lo aggiornamento del ristorante: ', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Errore interno del server durante lo aggiornamento'});
    }
};

exports.updatePlate = async (req, res) => {
    const proprietarioId = req.user.id;
    const plateId = req.params.plateId;
    const { prezzo } = req.body;

    if (!prezzo) {
        return res.status(400).json({ error: 'Il campo è obbligtorio per lo aggiornamento'});
    }

    try {
        const restaurantDbId = await getRestaurantDocId(proprietarioId);
        
        const updatedPlate = await Plate.findOneAndUpdate(
            { _id: plateId, restaurant: restaurantDbId },
            { $set: { prezzo: parseFloat(prezzo).toFixed(2) } },
            { new: true, runValidators: true }
        );

        if (!updatedPlate) {
            return res.status(404).json({ error: 'Piatto non trovato nel tuo menu o non autorizzato'});
        }

        const commonMeal = mealsData.find(meal => meal.idMeal === updatedPlate.mealId);
        const mealName = commonMeal ? commonMeal.strMeal: 'Piatto Sconosciuto';

        res.status(200).json({ message: `Prezzo del piatto '${mealName}' aggiornato a ${updatedPlate.prezzo}€  con successo`, plate: updatedPlate});
    } catch (error) {
        console.error('Errore durante lo aggiornamento del piatto: ', error);
        res.status(500).json({ error: 'Errore interno del server durante lo aggiornamento'});
    }
};

exports.getCommonPlates = async (req, res) => {
    const restaurantId = req.params.id;

    try {
        const popularPlates = await Order.aggregate([
            //filtra ordini in base al ristorante richiesto
            {
                $match: {
                    ristorante: new mongoose.Types.ObjectId(restaurantId),
                    stato: { $in: ['Consegnato', 'Ritirato']}
                }
            },

            //de-normalizzare l'array dei piatti all'interno dell'ordine
            { $unwind: '$piatti' },

            //raggruppa per id del piatto e calccola la quantità totale venduta
            { $group: {
                _id: '$piatti.plateDbId',
                totalSold: {$sum: '$piatti.quantita'},
                nomePiatto: {$first: '$piatti.nome'}
            }},

            //ordina i risultati dal più venduto al meno venduto
            { $sort: { totalSold: -1}},

            //limita al numero massimo di piatti popolari
            { $limit: MAX_POPULAR_PLATE },

            //popola i dettagli completi del piatto dal modello Plate per foto, categoria, ...
            {  $lookup: {
                from: 'plates', //nome della collezione Plate
                localField: '_id',
                foreignField: '_id',
                as: 'plateDetails'
            }},

            //estrae il dettaglio popolato
            { $unwind: '$plateDetails'},

            //proietta l'output finale
            { $project: {
                _id: 0,
                plateId: '$_id',
                nome: '$nomePiatto',
                prezzo: '$plateDetails.prezzo',
                foto: '$plateDetails.foto',
                categoria: '$plateDetails.categoria',
                timesOrdered: '$totalSold'
            }}
        ]);

        res.status(200).json(popularPlates);
    } catch (error) {
        console.error('Errore nel recupero della lista piatti comuni: ', error);
        res.status(500).json({ error: 'Errore interno del server durante il recupero dei piatti comuni'});
    }
};

exports.updatePlatePrice = async (req, res) => {
    const proprietarioId = req.user.id;
    const plateId = req.params.plateId;
    const {prezzo} = req.body;

    if (typeof prezzo === 'undefined' || isNaN(parseFloat(prezzo)) || parseFloat(prezzo) < 0) {
        return res.status(400).json({ error: 'Prezzo non valido'});
    }

    try {
        //cerco il ristorante della persona loggata
        const ristorante = await Restaurant.findOne({ proprietario: proprietarioId});
        if (!ristorante) {
            return res.status(403).json({ error: 'Autorizzazione negata. Nessun ristorante associato'});
        }

        //aggiornare il piatto verificando l'appartenenza al ristorante
        const updatedPlate = await Plate.findOneAndUpdate(
            { _id: plateId, restaurant: ristorante._id },
            { $set: { prezzo: parseFloat(prezzo).toFixed(2) }},
            { new: true, runValidators: true }
        );

        if (!updatedPlate) {
            return res.status(404).json({ error: 'Piatto non trovato nel tuo menu'});
        }

        res.status(200).json({ message: 'Prezzo aggiornato con successo'})
    } catch (error) {
        console.error('Errore aggiornamento del piatto: ', error);
        res.status(500).json({ error: 'Errore interno del server durante lo aggiornamento del piatto'});
    }
};