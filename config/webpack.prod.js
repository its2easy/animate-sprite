const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const banner = require("./banner");

module.exports = [
    merge(common, { // Minified
        mode: 'production',
        plugins: [
            new webpack.BannerPlugin(banner)
        ],
    }),
    merge(common, { // Not minified
        mode: 'production',
        devtool: 'source-map',
        plugins: [
            new webpack.BannerPlugin(banner)
        ],
        output: {
            filename: 'animate-sprite.js',
        },
        optimization: {
            minimize: false
        }
    })
];