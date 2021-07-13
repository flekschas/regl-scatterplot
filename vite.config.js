import { defineConfig } from 'vite';
import virtualHtmlTemplate from 'vite-plugin-virtual-html-template';

/** @returns {import('vite').Plugin} */
const htmlPlugin = ({ chunks }) => {
  /**
   * `vite-plugin-virtual-html-template` intercepts & handles requests for html
   * from the client. Vite normally handles these requests and injects a script
   * tag during dev (with a client runtime for HMR).
   *
   * The plugin uses `lodash.template` to runder the HTML, so a `<%= vite %>`
   * tag is replaced with the missing vite client during dev. In prod, nothing is
   * added.
   */
  let plugin;
  const init = (isDev) => {
    const vite = isDev
      ? '<script type="module" src="/@vite/client"></script>'
      : '';
    const pages = Object.fromEntries(
      chunks.map((c) => [c, { entry: `example/${c}.js` }])
    );
    return virtualHtmlTemplate({ pages, data: { vite } });
  };
  return {
    config(config, { command }) {
      if (command === 'build') {
        config.build.rollupOptions = {
          ...config.build.rollupOptions,
          input: Object.fromEntries(chunks.map((c) => [c, `${c}.html`])),
        };
      }
      plugin = init(command === 'serve');
    },
    handleHotUpdate({ server }) {
      // force auto refresh
      server.ws.send({ type: 'full-reload' });
    },
    configureServer: (server) => plugin.configureServer(server),
    resolveId: (id) => plugin.resolveId(id),
    load: (id) => plugin.load(id),
  };
};

export default defineConfig({
  base: './',
  plugins: [
    htmlPlugin({
      chunks: [
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
      ],
    }),
  ],
  build: { outDir: 'docs' },
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
