import { terser } from 'rollup-plugin-terser';
import buble from 'rollup-plugin-buble';

const config = (file, format, plugins) => ({
  input: 'src/index.js',
  output: {
    name: 'createScatterplot',
    format,
    file,
    globals: {
      'canvas-camera-2d': 'canvasCamera2d',
      'mouse-position': 'createMousePos',
      'mouse-pressed': 'createMousePrs',
      'pub-sub-es': 'createPubSub',
      regl: 'createREGL',
      'scroll-speed': 'createScroll',
      'with-raf': 'withRaf',
    },
  },
  plugins,
  external: [
    'camera-2d-simple',
    'canvas-camera-2d',
    'key-pressed',
    'mouse-position',
    'mouse-pressed',
    'pub-sub-es',
    'regl',
    'scroll-speed',
    'with-raf',
  ],
});

export default [
  config('dist/webgl-scatterplot.js', 'umd', [buble()]),
  config('dist/webgl-scatterplot.min.js', 'umd', [buble(), terser()]),
];
