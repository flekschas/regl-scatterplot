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

const chunkMapping = (fn) => Object.fromEntries(chunks.map((c) => [c, fn(c)]));

/**
 * `vite-plugin-virtual-html-template` intercepts & handles requests for html
 * from the client. Vite normally handles these requests and injects a script
 * tag during dev (with a client runtime for HMR).
 *
 * The plugin uses `lodash.template` to render the HTML, so a `<%= vite %>`
 * tag is replaced with the missing vite client during dev. In prod, nothing is
 * added.
 */
const viteModule = '<script type="module" src="/@vite/client"></script>';

export default ({ command }) =>
  defineConfig({
    base: './',
    plugins: [
      virtualHtmlTemplate({
        pages: chunkMapping((c) => ({ entry: `example/${c}.js` })),
        data: { vite: command === 'build' ? '' : viteModule },
      }),
      {
        name: 'simple-reload-template',
        handleHotUpdate({ file, server }) {
          if (file.includes('index.html')) {
            server.ws.send({ type: 'full-reload' });
          }
        },
      },
    ],
    build: {
      outDir: 'docs',
      rollupOptions: {
        input: chunkMapping((c) => `${c}.html`),
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
