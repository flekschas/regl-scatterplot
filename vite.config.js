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

const watch = (file, cb) => {
  cb(file);
  return fs.watchFile(file, () => cb(file));
};

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

watch('index.html', build);


/** @returns {import('rollup').Plugin}*/
const resolveJs = () => {
  const exts = new Set(['.vs', '.fs']);
  return {
    name: 'resolve-js',
    transform: async (src, id) => {
      if (!exts.has(path.extname(id))) return;
      return { code: src, mapp: null };
    }
  }
}

export default defineConfig({
  resolve: {
    alias: {
      'regl-scatterplot': '/src/index.js',
      'regl-line': '/node_modules/regl-line/dist/regl-line.js'
    }
  },
  plugins: [ resolveJs() ],
  esbuild: {
    loader: {
      '.fs': 'js',
      '.vs': 'js'
    }
  }
});
