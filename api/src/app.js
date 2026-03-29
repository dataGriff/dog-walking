const express = require('express');
const rateLimit = require('express-rate-limit');
const { OpenApiValidator } = require('express-openapi-validator');
const path = require('path');

const app = express();

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
}));

app.use(express.json());

app.use(
  require('express-openapi-validator').middleware({
    apiSpec: path.join(__dirname, '../../docs/contracts/openapi.yaml'),
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /^(?!\/v1)/,
    fileUploader: { storage: require('multer').memoryStorage() },
  })
);

const routes = require('./routes/index');
app.use('/v1', routes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
