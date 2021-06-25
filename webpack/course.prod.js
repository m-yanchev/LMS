const merge = require('webpack-merge');
const clientProdConfig = require('./client.prod');
const courseConfig = require('./course');

module.exports = merge(clientProdConfig, courseConfig)