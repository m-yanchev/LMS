const merge = require('webpack-merge');
const clientProdConfig = require('./client.prod');
const config = require('./teacher');

module.exports = merge(clientProdConfig, config)