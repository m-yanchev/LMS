const merge = require('webpack-merge');
const clientProdConfig = require('./client.prod');
const courseSolutionAdminConfig = require('./courseSolutionAdmin');

module.exports = merge(clientProdConfig, courseSolutionAdminConfig)