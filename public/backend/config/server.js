require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { fileURLToPath } = require('url'); // Importa fileURLToPath per ottenere __dirname
const { dirname } = require('path'); // Importa dirname
//const bodyParser = require('body-parser')

const MONGO_URI = process.env.MONGODB_URI;

const app = express();
const port = 3019;

//routes
const authRoutes =require('../routes/auth');
const mealsRoutes = require('../routes/meals');
const restaurantRoutes = require('../routes/restaurant');
const orderRoutes = require('../routes/order');
const loadCommonMeals = require('../utils/dataLoader');

// Middleware per servire file statici e analizzare il corpo delle richieste
app.use(express.static(__dirname));

// Middleware per analizzare il corpo delle richieste
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Aggiunta la gestione del corpo JSON

//connessione a mongodb
mongoose.connect(MONGO_URI).then(() => {
    console.log('MongoDB connection successful');
    loadCommonMeals();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use(express.static(path.join(__dirname, '../../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);

//home page
app.get('/home_page', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/HomePage.html'));
    //console.log('File path:', filePath);
})

//login
app.get('/log_in', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/LogIn.html'));
    //console.log('File path:', filePath);
})

//pagina per clienti
app.get('/SearchRestaurants.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/SearchRestaurants.html'));
});

app.get('/ClientOrders.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/ClientOrders.html'));
});

//altre pagine
app.get('/DashboardRistoratore.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/DashboardRistoratore.html'));
});

app.get('/Piatti.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Piatti.html'));
});

app.get('/Profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Profile.html'));
});

app.get('/RegisterRestaurant.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/RegisterRestaurant.html'));
});

app.get('/MenuCliente.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/MenuCliente.html'));
});

app.get('/CheckOut.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/CheckOut.html'));
});

//gestione errori
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
})

app.listen(port, () => {
    console.log("server started")
})