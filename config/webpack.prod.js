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
];
