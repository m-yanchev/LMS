const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const prodConfig = require('./prod');
const clientConfig = require('./client')

module.exports = merge(prodConfig, clientConfig, {
    module: {
        rules: [{
            test: /\.css$/i,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: '[hash:base64]'
                        }
                    }
                }
            ]
        }]
    }
})