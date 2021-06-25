const merge = require('webpack-merge');
const commonConfig = require('./common');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    watch: true,
    watchOptions: {
        ignored: ['tests/**', 'public/**', 'dist/**', 'node_modules/**', 'webpack/**']
    }
});