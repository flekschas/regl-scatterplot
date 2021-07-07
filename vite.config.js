import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const outDir = 'pages';
const pages = [
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
  pages.forEach((file) => {
    fs.writeFileSync(
      path.join(outDir, file.replace('.js', '.html')),
      html.replace('/example/index.js', `/example/${file}`)
    );
  });
};

const build = (temp, watch) => {
  render(temp);
  return watch && fs.watchFile(temp, () => render(temp));
};

export default ({ command }) => {
  build('index.html', command === 'serve');

  return defineConfig({
    base: './',
    build: {
      outDir: 'docs',
      rollupOptions: {
        input: {
          main: 'index.html',
          ...Object.fromEntries(
            pages.map((page) => {
              const base = page.replace('.js', '');
              return [base, `./${outDir}/${base}.html`];
            })
          ),
        },
      },
    },
    resolve: {
      alias: {
        // vite pre-bundling (esbuild) can't be configured to
        // resolve .fs/.vs in regl-line. This alias forces vite
        // use the UMD build since it can transform this module correctly.
        'regl-line': '/node_modules/regl-line/dist/regl-line.js',
      },
    },
  });
};
