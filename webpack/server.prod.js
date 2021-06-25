const merge = require('webpack-merge');
const prodConfig = require('./prod');
const serverConfig = require('./server');

module.exports = merge(prodConfig, serverConfig, {
    module: {
        rules: [{
            test: /\.css$/i,
            use: [{
                loader: 'css-loader',
                options: {
                    onlyLocals: true,
                    modules: {
                        localIdentName: '[hash:base64]'
                    }
                }
            }]
        }]
    }
})