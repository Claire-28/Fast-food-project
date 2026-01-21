const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
  info: {
    title: 'LemonLime API Documentation',
    description: 'Sistema completo per la gestione di ordini e ristoranti',
    version: '1.0.0'
  },
  host: 'localhost:3019',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Inserisci il token nel formato: Bearer <JWT>'
    }
  },
  definitions: {
    Login: { $email: "mario@esempio.it", $password: "Password123" },
    NuovoPiatto: { $idMeal: "52772", $prezzo: 12.50 },
    NuovoOrdine: {
      $ristoranteId: "ID_RISTORANTE",
      $carrello: [{ mealId: "52772", quantita: 2 }],
      $tipoConsegna: "Consegna a domicilio",
      indirizzoConsegna: "Via Roma 10, Milano"
    }
  }
};

const outputFile = path.join(__dirname, 'swagger-output.json');

// AGGIUNGI QUI TUTTI I FILE DELLE ROTTE
const endpointsFiles = [
    path.join(__dirname, 'config/server.js'),
    path.join(__dirname, 'routes/auth.js'),
    path.join(__dirname, 'routes/meals.js'),
    path.join(__dirname, 'routes/order.js'),
    path.join(__dirname, 'routes/restaurant.js')
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("✅ Swagger aggiornato con tutte le rotte!");
});