import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './tests/index.js',
  output: {
    name: 'test',
    format: 'iife',
    sourcemap: 'inline',
  },
  plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' }), json()],
  onwarn: (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  },
};
