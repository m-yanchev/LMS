const merge = require('webpack-merge');
const clientProdConfig = require('./client.prod');
const mainConfig = require('./main');

module.exports = merge(clientProdConfig, mainConfig)