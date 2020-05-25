const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        contentBase: './example',
        port: 7700,
        historyApiFallback: true,
        index: 'index.html',
        open: true,
        overlay: true,
        watchContentBase: true,
    },
});