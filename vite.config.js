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
  'annotations',
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
  optimizeDeps: {
    exclude: ['regl-line'],
  },
});
