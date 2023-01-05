import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import json from '@rollup/plugin-json';

const basePlugins = () => [
  json(),
  resolve({
    dedupe: ['gl-matrix'],
    mainFields: ['module', 'main'],
  }),
];

const configurator = (file, format, plugins = []) => ({
  input: 'src/index.js',
  output: {
    name: 'createScatterplot',
    format,
    file,
    globals: {
      'pub-sub-es': 'createPubSub',
      regl: 'createREGL',
    },
  },
  plugins: [...basePlugins(), ...plugins],
  external: ['pub-sub-es', 'regl'],
  onwarn: (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  },
});

const devConfig = configurator('dist/regl-scatterplot.js', 'umd', [
  babel(),
  filesize(),
  visualizer(),
]);

const prodConfig = configurator('dist/regl-scatterplot.min.js', 'umd', [
  babel(),
  terser(),
]);

const esmConfig = configurator('dist/regl-scatterplot.esm.js', 'esm', [
  filesize(),
]);

export default [devConfig, prodConfig, esmConfig];
