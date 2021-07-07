import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const outDir = 'pages';
const chunks = [
  'index.js',
  'axes.js',
  'connected-points-by-segments.js',
  'connected-points.js',
  'dynamic-opacity.js',
  'embedded.js',
  'performance-mode.js',
  'size-encoding.js',
  'texture-background.js',
  'transition.js',
  'two-instances.js',
];

const render = (template) => {
  const html = fs.readFileSync(template).toString();
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  chunks.forEach((file) => {
    fs.writeFileSync(
      path.join(outDir, file.replace('.js', '.html')),
      html.replace(
        '<!-- INSERT_ENTRYPOINT -->',
        `<script type="module" src="../example/${file}"></script>`
      )
    );
  });
};

const pages = chunks.map((chunk) => {
  const name = chunk.replace('.js', '');
  return [name, path.resolve(__dirname, outDir, `${name}.html`)];
});

const build = (temp, watch) => {
  render(temp);
  return watch && fs.watchFile(temp, () => render(temp));
};

export default ({ command }) => {
  build('index.html', command === 'serve');

  return defineConfig({
    base: './',
    root: outDir,
    build: {
      outDir: path.resolve(__dirname, 'docs'),
      rollupOptions: {
        input: Object.fromEntries(pages),
      },
    },
    resolve: {
      alias: {
        // vite pre-bundling (esbuild) can't be configured to
        // resolve .fs/.vs in regl-line. This alias forces vite
        // use the UMD build since it can transform this module correctly.
        'regl-line': path.resolve(
          __dirname,
          'node_modules/regl-line/dist/regl-line.js'
        ),
      },
    },
  });
};
