const merge = require('webpack-merge');
const clientDevConfig = require('./client.dev');
const courseConfig = require('./course');

module.exports = merge(clientDevConfig, courseConfig)