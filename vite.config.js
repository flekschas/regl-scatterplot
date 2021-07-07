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

const build = (template) => {
  const html = fs.readFileSync(template).toString();
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  pages.forEach((file) => {
    fs.writeFileSync(
      path.join(outDir, file.replace('.js', '.html')),
      html.replace('/example/index.js', `/example/${file}`),
    );
  });
};


export default ({ command }) => {
  const template = 'index.html';
  build(template);
  if (command !== 'build') {
    fs.watchFile(template, () => build(template));
  }

  return defineConfig({
    base: './',
    resolve: {
      alias: {
        // vite pre-bundling (esbuild) can't be configured to
        // resolve .fs/.vs in regl-line. This alias forces vite
        // use the UMD build since it can transform this module correctly.
        'regl-line': '/node_modules/regl-line/dist/regl-line.js',
      }
    }
  });
};
