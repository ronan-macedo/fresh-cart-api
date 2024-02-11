const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Fresh Cart API',
    description: 'This is an API for an Online Cart'
  },
  host: 'localhost:5500',
  schemes: ['https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);