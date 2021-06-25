const merge = require('webpack-merge');
const devConfig = require('./dev');
const serverConfig = require('./server');

module.exports = merge(devConfig, serverConfig, {
    module: {
        rules: [{
            test: /\.css$/i,
            use: [{
                loader: 'css-loader',
                options: {
                    onlyLocals: true,
                    sourceMap: true,
                    modules: {
                        localIdentName: '[path][name]__[local]'
                    }
                }
            }]
        }]
    }
})