const merge = require('webpack-merge');
const clientDevConfig = require('./client.dev');
const mainConfig = require('./main');

module.exports = merge(clientDevConfig, mainConfig)