const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const common = require('./webpack.common.js');
const banner = require("./banner");


module.exports = [
    merge(common, { // Minified
        mode: 'production',
        optimization: {
            minimizer: [ // fix license.txt from bannerPlugin
                new TerserPlugin({
                    extractComments: false,
                }),
            ]
        },
        plugins: [
            new webpack.BannerPlugin(banner),
            new CleanWebpackPlugin(),
        ],
    }),
    // merge(common, { // Not minified
    //     mode: 'production',
    //     devtool: 'source-map',
    //     plugins: [
    //         new webpack.BannerPlugin(banner)
    //     ],
    //     output: {
    //         filename: 'animate-sprite.js',
    //     },
    //     optimization: {
    //         minimize: false
    //     }
    // })
];
