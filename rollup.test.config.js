import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import pkg from './package.json';

export default {
  input: './tests/index.js',
  output: {
    name: 'test',
    format: 'iife',
    sourcemap: 'inline'
  },
  plugins: [
    replace({
      preventAssignment: true,
      'import.meta.env.version': JSON.stringify(pkg.version),
    }),
    resolve(),
    babel(),
    json(),
    commonjs(),
  ],
};
