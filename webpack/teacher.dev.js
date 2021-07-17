const merge = require('webpack-merge');
const clientDevConfig = require('./client.dev');
const config = require('./teacher');

module.exports = merge(clientDevConfig, config)