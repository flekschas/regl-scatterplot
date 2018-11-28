import { terser } from 'rollup-plugin-terser';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import visualizer from 'rollup-plugin-visualizer';

const configurator = (file, format, plugins) => ({
  input: 'src/index.js',
  output: {
    name: 'createScatterplot',
    format,
    file,
    globals: {
      'pub-sub-es': 'createPubSub',
      regl: 'createREGL'
    }
  },
  plugins,
  external: ['pub-sub-es', 'regl']
});

const devConfig = configurator('dist/regl-scatterplot.js', 'umd', [
  resolve(),
  commonjs({ sourceMap: false }),
  buble(),
  filesize(),
  visualizer()
]);

const prodConfig = configurator('dist/regl-scatterplot.js', 'umd', [
  resolve(),
  commonjs({ sourceMap: false }),
  buble(),
  terser()
]);

export default [devConfig, prodConfig];
