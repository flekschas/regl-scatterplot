import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

const VERSION = require('./version.js');

export default {
  input: './tests/index.js',
  output: {
    name: 'test',
    format: 'iife',
    sourcemap: 'inline',
    intro: `var VERSION = ${VERSION};`
  },
  plugins: [resolve(), commonjs(), babel(), json()]
};
