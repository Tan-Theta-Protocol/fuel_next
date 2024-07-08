
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./routes/route');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/api/sample', router);

module.exports = app;
