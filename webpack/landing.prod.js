const merge = require('webpack-merge');
const clientProdConfig = require('./client.prod');
const landingConfig = require('./landing');

module.exports = merge(clientProdConfig, landingConfig)