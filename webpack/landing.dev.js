const merge = require('webpack-merge');
const clientDevConfig = require('./client.dev');
const landingConfig = require('./landing');

module.exports = merge(clientDevConfig, landingConfig)