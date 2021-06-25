const path = require('path');

module.exports = {
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: "babel-loader"
        }]
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/'
    }
};