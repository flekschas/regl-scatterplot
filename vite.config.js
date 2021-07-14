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

const mapObject = (arr, fn) => Object.fromEntries(arr.map(d => [d, fn(d)]))

/** @returns {import('vite').Plugin} */
const htmlPlugin = ({ isDev }) => {
  /**
   * `vite-plugin-virtual-html-template` intercepts & handles requests for html
   * from the client. Vite normally handles these requests and injects a script
   * tag during dev (with a client runtime for HMR).
   *
   * The plugin uses `lodash.template` to runder the HTML, so a `<%= vite %>`
   * tag is replaced with the missing vite client during dev. In prod, nothing is
   * added.
   */
  const vite = isDev
    ? '<script type="module" src="/@vite/client"></script>'
    : '';
  const pages = mapObject(chunks, (c) => ({ entry: `example/${c}.js`}));
  return virtualHtmlTemplate({ pages, data: { vite } });
};

export default ({ command }) =>
  defineConfig({
    base: './',
    plugins: [
      htmlPlugin({ isDev: command === 'serve' }),
      {
        name: 'simple-reload-template',
        handleHotUpdate({ file, server }) {
          if (file.includes('index.html')) {
            server.ws.send({ type: 'full-reload' });
          }
        }
      }
    ],
    build: {
      outDir: 'docs',
      rollupOptions: {
        input: mapObject(chunks, (c) => `${c}.html`),
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
