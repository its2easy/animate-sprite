const path = require('path');

const config = {
    entry: path.join(__dirname, "../src/animate-sprite.js"),
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'animate-sprite.min.js',
        library: 'animateSprite',
        globalObject: 'this',
        //libraryExport: 'default',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ]
    },
    plugins: [ ],
};
module.exports = config;