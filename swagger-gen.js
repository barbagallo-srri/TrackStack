const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
      title: 'Trackstack API',
      description: 'Richieste per la gestione dell\'utente',
      version: '1.0.0',
    },
    host : 'localhost:3000',
    schemes : ['http']
};

const outputFile = 'swagger-output.json';
const endpointsFiles = ['app.js']

swaggerAutogen(outputFile, endpointsFiles, doc);
