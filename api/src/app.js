const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
}));

app.use(express.json());

const routes = require('./routes/index');
app.use('/v1', routes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
