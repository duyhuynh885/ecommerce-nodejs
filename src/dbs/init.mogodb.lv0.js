'use strict';

const { default: mongoose } = require('mongoose');

const connectString = `mongodb://127.0.0.1:27017/local`;

mongoose
    .connect(connectString)
    .then((_) => console.log('Connected MongoDB Success'))
    .catch((err) => console.log('Error Connect DB!', err));

module.exports = mongoose;
