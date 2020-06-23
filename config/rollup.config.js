import { terser } from "rollup-plugin-terser";
const banner = require("./banner");

const bannerWithComments = "/*!\n" + banner + "\n*/";

export default {
    input: "./src/animate-sprite.js",
    output: [
        {
            file: './build/animate-sprite.esm.js',
            format: 'es',
            banner: bannerWithComments,
            sourcemap: true
        },
        {
            file: './build/animate-sprite.esm.min.js',
            format: 'es',
            banner: bannerWithComments,
            sourcemap: true,
            plugins: [terser()]
        }
    ],
};