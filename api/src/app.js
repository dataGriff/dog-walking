const express = require('express');
const app = express();

app.use(express.json());

const routes = require('./routes/index');
app.use('/v1', routes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
