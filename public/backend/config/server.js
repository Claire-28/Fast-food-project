const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

/**
 * 1. CONFIGURAZIONE AMBIENTE
 */
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const Plate = require('../models/plate');
const authRoutes = require('../routes/auth');
const restaurantRoutes = require('../routes/restaurant');
const mealsRoutes = require('../routes/meals');
const orderRoutes = require('../routes/order');

const app = express();

// --- MIDDLEWARE ESSENZIALI ---
app.use(cors());
app.use(express.json()); // NECESSARIO per leggere req.body delle POST

// Logger avanzato per debuggare il payload e capire il motivo del 400
app.use((req, res, next) => {
    if (req.method === 'POST' && req.url.includes('login')) {
        console.log(`\n--- [DEBUG LOGIN] ---`);
        console.log(`Data: ${new Date().toLocaleTimeString()}`);
        console.log(`Payload ricevuto:`, req.body);
    }
    next();
});

/**
 * 2. SERVIRE IL FRONTEND
 */
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

/**
 * 3. CONNESSIONE DATABASE
 */
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fastfood_db';

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
})
    .then(() => {
        console.log('✅ Database: Connesso correttamente.');
        seedDatabase();
    })
    .catch(err => {
        console.log('⚠️ Database: Servizio locale non trovato. Verifica MongoDB Compass.');
    });

/**
 * Funzione Seed per i piatti
 */
async function seedDatabase() {
    try {
        const count = await Plate.countDocuments();
        if (count === 0) {
            const dataPath = path.resolve(__dirname, '../data/meals.json');
            if (fs.existsSync(dataPath)) {
                let meals = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
                const cleanedMeals = meals.map(meal => {
                    const clean = { ...meal };
                    if (clean._id && typeof clean._id === 'object') delete clean._id;
                    if (clean.mealId && typeof clean.mealId === 'object') {
                        clean.mealId = clean.mealId.$numberInt || clean.mealId.$oid || String(Date.now());
                    }
                    if (!clean.nome) clean.nome = "Piatto Speciale";
                    if (!clean.prezzo) clean.prezzo = 9.99;
                    if (!clean.restaurant) clean.restaurant = new mongoose.Types.ObjectId();
                    if (!clean.mealId) clean.mealId = String(Math.floor(Math.random() * 1000));
                    return clean;
                });
                await Plate.insertMany(cleanedMeals);
                console.log('✨ Database: Piatti caricati correttamente.');
            }
        } else {
            console.log('✅ Database: I piatti sono già presenti.');
        }
    } catch (e) { console.error('❌ Errore Seed:', e.message); }
}

/**
 * 4. ROTTE API
 */
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'HomePage.html'));
});

/**
 * 5. GESTORE ERRORI GLOBALE
 */
app.use((err, req, res, next) => {
    console.error('\n🚨 ERRORE INTERNO RILEVATO:');
    console.error(err.stack);
    res.status(500).json({
        message: 'Errore interno del server',
        details: err.message
    });
});

/**
 * 6. AVVIO DEL SERVER (Default 3019)
 */
let PORT = process.env.PORT || 3019;

function startServer(port) {
    const server = app.listen(port, () => {
        console.log('\n===================================================');
        console.log(`🚀 LEMONLIME BACKEND ATTIVO`);
        console.log(`🔗 HOME PAGE: http://localhost:${port}/HomePage.html`);
        console.log(`📡 API BASE:  http://localhost:${port}/api`);
        console.log('===================================================\n');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Porta ${port} occupata, provo la ${parseInt(port) + 1}...`);
            startServer(parseInt(port) + 1);
        }
    });
}

startServer(PORT);