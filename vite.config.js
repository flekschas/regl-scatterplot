import { defineConfig } from 'vite';
import virtualHtmlTemplate from 'vite-plugin-virtual-html-template';

const chunks = [
  'index',
  'axes',
  'text-labels',
  'connected-points-by-segments',
  'connected-points',
  'dynamic-opacity',
  'embedded',
  'performance-mode',
  'size-encoding',
  'texture-background',
  'transition',
  'multiple-instances',
];

const pages = Object.fromEntries(
  chunks.map((chunk) => [
    chunk,
    { template: 'public/index.html', entry: `example/${chunk}.js` },
  ])
);

const manualChunks = (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('apache-arrow')) {
      return 'apache-arrow';
    }
    if (id.includes('d3')) {
      return 'd3';
    }
    return 'vendor';
  }
  return undefined;
};

export default defineConfig({
  base: './',
  plugins: [virtualHtmlTemplate({ pages })],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: Object.fromEntries(
        chunks.map((chunk) => [chunk, `${chunk}.html`])
      ),
      output: { manualChunks },
    },
  },
  resolve: {
    alias: {
      /**
       * vite pre-bundling (esbuild) can't be configured to
       * resolve .fs/.vs in regl-line. This alias forces
       * resolution with rollup, which avoids this error.
       */
      'regl-line': '/node_modules/regl-line/src/index.js',
    },
  },
});
