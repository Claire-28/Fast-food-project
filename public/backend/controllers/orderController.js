const Order = require('../models/Order');
const Plate = require('../models/plate');
const Restaurant = require('../models/restaurant');
const mealsData  = require('../data/meals');
const { calculateDeliveryCost } = require('../utils/deliveryCost');

exports.createOrder = async (req, res) =>  {
    const clientId = req.user.id;
    const { ristoranteId, carrello, indirizzoConsegna, tipoConsegna, paymentMethod } = req.body;
    let { costoConsegna } = req.body;

    if(!ristoranteId || !carrello || carrello.length === 0 || !indirizzoConsegna) {
        return res.status(400).json({ error: 'Dati dello ordine incompleti (ristorante, carrello o indirizzo mancante)'});
    }

    try {
        const ristorante = await Restaurant.findById(ristoranteId);
        if (!ristorante) {
            return res.status(404).json({ error: 'Ristorante non trovato'});
        }
        
        if (tipoConsegna === 'Consegna a domicilio') {
            if (!indirizzoConsegna) {
                return res.status(400).json({ error: 'Indirizzo di consegna obbligatorio per la consegna a domicilio'});
            }
            costoConsegna = await calculateDeliveryCost(ristorante.indirizzo, indirizzoConsegna);
        } else {
            //se il ritiro è in sede il costo non c'è
            costoConsegna = 0;
        }

        let totaleOrdine = 0;
        const piattiOrdine = [];
        const mealsIds = carrello.map(item => item.mealId);

        const plateFromDB = await Plate.find({ restaurant: ristorante._id, mealId: { $in: mealsIds}});

        const plateMap = plateFromDB.reduce((map, plate) => {
            map[plate.mealId] = plate;
            return map;
        }, {});

        for (const item of carrello) {
            const plateDetails = plateMap[item.mealId];

            if(!plateDetails) {
                return res.status(400).json({ error: `Piatto (ID: ${item.mealId}) non più disponibile o ID non valido nel menu del ristorante`});
            }

            const commonMeal = mealsData.find(meal => meal.idMeal === item.mealId);

            if(!commonMeal) {
                return res.status(400).json({ error: `Dati statici per il piatto  (ID: ${item.mealId}) non trovati`});
            }

            const prezzoUnitario = plateDetails.prezzo;
            const subTotale = prezzoUnitario * item.quantita;

            totaleOrdine += subTotale;
            piattiOrdine.push({
                mealId: item.mealId,
                nome: commonMeal.strMeal,
                prezzoUnitario: prezzoUnitario,
                quantita: item.quantita,
                plateDbId: plateDetails._id
            });
        }

        totaleOrdine += parseFloat(costoConsegna || 0);

        const nuovoOrdine = new Order({
            cliente: clientId,
            ristorante: ristoranteId,
            piatti: piattiOrdine,
            indirizzoConsegna: indirizzoConsegna,
            tipoConsegna: tipoConsegna,
            costoConsegna: costoConsegna,
            paymentMethod: paymentMethod,
            totale: parseFloat(totaleOrdine).toFixed(2),
            stato: 'Ordinato'
        });

        await nuovoOrdine.save();

        res.status(201).json({ message: 'Ordine creato con successo!', ordineId: nuovoOrdine._id, totale: nuovoOrdine.totale, stato: nuovoOrdine.stato});
    } catch (error) {
        console.error('Errore durante la  creazione dello ordine', error);
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

exports.confirmOrderReceipt = async (req, res) => {
    const clientId = req.user.id;
    const orderId = req.params.id;
    const { tipoConsegna } = req.body; // Aspettati il tipo di consegna per impostare lo stato finale

    if (!tipoConsegna || !['Ritiro', 'Consegna a domicilio'].includes(tipoConsegna)) {
        return res.status(400).json({ error: 'Tipo di consegna non valido.' });
    }

    // Determina lo stato finale in base al tipo di consegna
    const statoFinale = tipoConsegna === 'Ritiro' ? 'Ritirato' : 'Consegnato';

    // Lo stato attuale deve essere 'In Consegna' per la consegna a domicilio, o 'In Preparazione' per il ritiro
    const statoPermesso = tipoConsegna === 'Ritiro' ? 'In Preparazione' : 'In Consegna';


    try {
        const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                cliente: clientId,
                stato: statoPermesso // Permetti l'aggiornamento solo se nello stato permesso
            },
            { $set: { stato: statoFinale } },
            { new: true }
        ).populate('ristorante', 'nome');

        if (!updatedOrder) {
            // Controlla se l'ordine esiste ma non è nello stato atteso o non appartiene all'utente
            const existingOrder = await Order.findOne({ _id: orderId, cliente: clientId });
            if (!existingOrder) {
                return res.status(404).json({ error: 'Ordine non trovato o non sei autorizzato.' });
            }
            // Se l'ordine esiste ma lo stato non è quello atteso
            return res.status(400).json({ error: `L'ordine è in stato: ${existingOrder.stato}. Deve essere in stato '${statoPermesso}' per la conferma.` });
        }

        res.status(200).json({ message: `Ordine #${orderId.slice(-6)} confermato come ${statoFinale} dal cliente.`, order: updatedOrder });
    } catch (error) {
        console.error('Errore durante la conferma di ricezione dell\'ordine:', error);
        res.status(500).json({ error: 'Errore interno del server durante la conferma.' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try{
        const orderId = req.params.id;
        const { stato } = req.body;
        const ristoranteOwnerId = req.user.id;

        if (req.user.ruolo !== 'Ristoratore') {
            return res.status(403).json({ error: `Accesso negato, solo i ristoratori possono aggiungere lo stato`});
        }

        const ristorante = await Restaurant.findOne({ owner: ristoranteOwnerId });
        if (!ristorante) {
            return res.status(403).json({ error: 'Non hai un ristorante associato a questo account'});
        }

        const ristoranteId = ristorante._id;

        const validStates = ['Ordinato', 'In Preparazione', 'In Consegna', 'Consegnato', 'Ritirato', 'Annullato'];
        if(!stato || !validStates.includes(stato)) {
            return res.status(400).json({ error: `Stato non valido, stati permessi: ` + validStates.join(`, `)});
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, ristorante: ristoranteId },
            {$set: { stato: stato }},
            { new: true}
        ).populate('cliente', 'username email');

        if (!updatedOrder) {
            return res.status(404).json({ error: `Ordine non trovato o non sei autorizzato a modificarlo`});
        }

        res.status(200).json({ message: `Stato ordine #${orderId} aggiornato a: ${stato}`, order: updatedOrder});
    } catch (error) {
        console.error('Errore durante lo aggiornamento dello stato dello ordine: ', error);
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

exports.getOrders = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.ruolo;

    try {
        let query = {};
        let populationPath = 'ristorante'; //se il cliente cerca mostra  i dettagli del ristorante

        if (userRole === 'Cliente') {

            query = { cliente: userId};
            populationPath = 'ristorante'; //popola il riferimento al ristorante

        } else if (userRole === 'Ristoratore') {
            
            const ristorante = await Restaurant.findOne({ owner: userId });
            if (!ristorante) {
                return res.status(404).json({ error: 'Nessun ristorante associato a questo utente'});
            }

            query = { ristorante: ristorante._id }; //ristoratore vede gli ordini destinati al suo ristorante
            populationPath = 'cliente'; //popola il riferimento al cliente

        } else {
            return res.status(403).json({error: 'Ruolo non autorizzato alla visualizzazione ordini'});
        }

        const orders = await Order.find(query).sort({ dataOrdine: -1}).populate(populationPath, 'username email nome');

        if (orders.length === 0) {
            return res.status(200).json({ message: 'Nessun ordine trovato'});
        }
        res.status(200).json(orders);

    } catch (error) {
        console.error('Errore durante il recupero degli ordini: ', error);
        res.status(500).json({ error: 'Errore interno del server'});
    }
};

exports.getCommonPlates = async (req, res) => {
    try {
        res.status(200).json(mealsData);
    } catch (error) {
        console.error('Errore nel recupero della lista dei piatti comuni: ', error);
        res.status(500).json({ error: 'Errore interno del  server durante il recupero dei piatti comuni'});
    }
};