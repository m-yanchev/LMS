const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const devConfig = require('./dev');
const clientConfig = require('./client')

module.exports = merge(devConfig, clientConfig, {
    module: {
        rules: [{
            test: /\.css$/i,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true,
                        modules: {
                            localIdentName: '[path][name]__[local]'
                        }
                    }
                }
            ]
        }]
    }
})