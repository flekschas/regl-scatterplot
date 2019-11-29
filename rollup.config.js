import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import visualizer from 'rollup-plugin-visualizer';

const VERSION = require('./version.js');

const configurator = (file, format, plugins) => ({
  input: 'src/index.js',
  output: {
    name: 'createScatterplot',
    format,
    file,
    globals: {
      'pub-sub-es': 'createPubSub',
      regl: 'createREGL'
    },
    intro: `${format === 'es' ? 'const' : 'var'} VERSION = ${VERSION};`
  },
  plugins,
  external: ['pub-sub-es', 'regl']
});

const devConfig = configurator('dist/regl-scatterplot.js', 'umd', [
  resolve(),
  commonjs({ sourceMap: false }),
  babel(),
  filesize(),
  visualizer()
]);

const devConfigEsm = configurator('dist/regl-scatterplot.esm.js', 'es', [
  resolve(),
  commonjs({ sourceMap: false }),
  babel(),
  filesize(),
  visualizer()
]);

const prodConfig = configurator('dist/regl-scatterplot.min.js', 'umd', [
  resolve(),
  commonjs({ sourceMap: false }),
  babel(),
  terser()
]);

const prodConfigEsm = configurator('dist/regl-scatterplot.esm.min.js', 'es', [
  resolve(),
  commonjs({ sourceMap: false }),
  babel(),
  terser()
]);

export default [devConfig, devConfigEsm, prodConfig, prodConfigEsm];
