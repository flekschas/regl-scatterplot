import { defineConfig } from 'vite';
import virtualHtmlTemplate from 'vite-plugin-virtual-html-template';

const chunks = [
  'index',
  'axes',
  'connected-points-by-segments',
  'connected-points',
  'dynamic-opacity',
  'embedded',
  'performance-mode',
  'size-encoding',
  'texture-background',
  'transition',
  'two-instances',
];

const pages = Object.fromEntries(
  chunks.map((chunk) => [
    chunk,
    { template: 'public/index.html', entry: `example/${chunk}.js` },
  ])
);

export default defineConfig({
  base: './',
  plugins: [
    virtualHtmlTemplate({ pages }),
    {
      name: 'inject-vite-client',
      apply: 'serve', // only for dev server
      transform(code, id) {
        if (id.includes('example')) {
          return `import "/@vite/client";\n${code}`;
        }
        return null;
      },
      handleHotUpdate({ server }) {
        server.ws.send({ type: 'full-reload' });
      },
    },
  ],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: Object.fromEntries(
        chunks.map((chunk) => [chunk, `${chunk}.html`])
      ),
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
