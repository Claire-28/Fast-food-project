const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servire i file del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Importazione rotte
const authRoutes = require('../routes/auth');
const mealRoutes = require('../routes/meals');
const orderRoutes = require('../routes/order');
const restaurantRoutes = require('../routes/restaurant');

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);

const PORT = 3019;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fastfood_project';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connesso');
        app.listen(PORT, () => console.log(`🚀 Server attivo: http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ Errore DB:', err.message);
        app.listen(PORT, () => console.log(`⚠️ Server attivo (No DB): http://localhost:${PORT}`));
    });