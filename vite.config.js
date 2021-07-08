import { defineConfig } from 'vite';
import path from 'path';
import fs, { promises as fsp } from 'fs';

const resolve = (...args) => path.resolve(__dirname, ...args);

const nameToChunk = (name) => ({
  name,
  js: `${name}.js`,
  html: `${name}.html`,
});

/** Generates HTML pages for each JavaScript chunk */
class HTMLBuilder {
  /** @param {{inDir: string, outDir: string, chunks: ReturnType<nameToChunk>[], assets: string[]}} config */
  constructor({ inDir, outDir, chunks, assets }) {
    this.inDir = inDir;
    this.outDir = outDir;
    this.chunks = chunks;
    this.assets = assets;

    this.importAlias = '/ENTRYPOINT';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  }

  /** @returns {string} Path to HTML template */
  get template() {
    return resolve(this.inDir, 'index.html');
  }

  /** Renders each HTML chunk and copies assets to `this.outDir` */
  async build() {
    const buffer = await fsp.readFile(this.template);
    const html = buffer.toString();
    // Render HTML
    const chunkPromises = this.chunks.map((chunk) =>
      fsp.writeFile(
        resolve(this.outDir, chunk.html),
        html.replace(
          '<!-- INSERT_ENTRYPOINT -->',
          `<script type="module" src="${this.importAlias}/${chunk.js}"></script>`
        )
      )
    );
    // Copy assets
    const assetPromises = this.assets.map((file) =>
      fsp.copyFile(resolve(this.inDir, file), resolve(this.outDir, file))
    );
    await Promise.all([...chunkPromises, ...assetPromises]);
  }

  /** Starts a file watcher on index.html. */
  watch() {
    return fs.watchFile(this.template, this.build);
  }
}

export default async ({ command }) => {
  const builder = new HTMLBuilder({
    inDir: 'example',
    outDir: '_pages',
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
    ].map(nameToChunk),
    assets: ['favicon.png'],
  });

  await builder.build();
  if (command === 'serve') {
    builder.watch();
  }

  return defineConfig({
    root: builder.outDir,
    base: './',
    build: {
      outDir: resolve('docs'),
      emptyOutDir: true,
      rollupOptions: {
        // https://vitejs.dev/guide/build.html#multi-page-app
        input: Object.fromEntries(
          builder.chunks.map((c) => [c.name, resolve(builder.outDir, c.html)])
        ),
      },
    },
    resolve: {
      alias: {
        /**
         * Aliases the inserted script tag src to ./example/*
         */
        [builder.importAlias]: resolve(builder.inDir),
        /**
         * vite pre-bundling (esbuild) can't be configured to
         * resolve .fs/.vs in regl-line. This alias forces vite
         * use the UMD build since it can transform this module correctly.
         */
        'regl-line': resolve('node_modules/regl-line/dist/regl-line.js'),
      },
    },
  });
};
