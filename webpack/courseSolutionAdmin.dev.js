const merge = require('webpack-merge');
const clientDevConfig = require('./client.dev');
const courseSolutionAdminConfig = require('./courseSolutionAdmin');

module.exports = merge(clientDevConfig, courseSolutionAdminConfig)