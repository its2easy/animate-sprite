import { defineConfig } from 'rollup';
import { terser } from "rollup-plugin-terser";
import { babel } from '@rollup/plugin-babel';

const { LIB_FILE_NAME } = require( './shared');
const banner = require("./banner");
const bannerWithComments = "/*!\n" + banner + "\n*/";

export default defineConfig([
    { // Transpiled bundle
        input: `./src/${LIB_FILE_NAME}.js`,
        plugins: [babel({
            babelHelpers: 'bundled',
            exclude: "node_modules/**"
        })],
        output: [
            {
                file: `./build/${LIB_FILE_NAME}.esm.js`,
                format: 'es',
                banner: bannerWithComments,
                sourcemap: true,
            },
            {
                file: `./build/${LIB_FILE_NAME}.esm.min.js`,
                format: 'es',
                banner: bannerWithComments,
                sourcemap: true,
                plugins: [ terser() ]
            }
        ],
    },
    { // Untranspiled bundle
        input: `./src/${LIB_FILE_NAME}.js`,
        output: [
            {
                file: `./build/untranspiled/${LIB_FILE_NAME}.esm.js`,
                format: 'es',
                banner: bannerWithComments,
                sourcemap: true,
            },
            {
                file: `./build/untranspiled/${LIB_FILE_NAME}.esm.min.js`,
                format: 'es',
                banner: bannerWithComments,
                sourcemap: true,
                plugins: [ terser() ]
            }
        ],
    },
]);
