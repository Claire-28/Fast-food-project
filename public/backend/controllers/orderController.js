const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        // Creiamo un ordine semplice
        const newOrder = new Order({
            user: req.user.id, // Preso dal token
            items: req.body.items,
            total: req.body.total,
            status: 'In preparazione',
            createdAt: new Date()
        });

        await newOrder.save();
        res.status(201).json({ message: "Ordine inviato con successo!", orderId: newOrder._id });
    } catch (error) {
        console.error("Errore creazione ordine:", error);
        // Rispondiamo comunque positivo per la demo se il DB fallisce (fallback) o 500 se preferisci strict
        res.status(500).json({ message: "Errore durante la creazione dell'ordine" });
    }
};

exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Errore recupero ordini" });
    }
};