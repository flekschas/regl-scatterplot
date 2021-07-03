const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

const outDir = '__html';
const exclude = new Set([
  'favicon.png',
  'utils.js',
  'template.html',
  'performance-mode-point-worker.js',
]);

const watch = (file, cb) => {
  cb(file);
  return fs.watchFile(file, () => cb(file));
};

const build = (template) => {
  const html = fs.readFileSync(template).toString();
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  fs.readdirSync('example').forEach((file) => {
    if (exclude.has(file)) return;
    const outfile = path.join(outDir, file.replace('.js', '.html'));
    fs.writeFileSync(
      outfile,
      html.replace(
        '<!-- INSERT_ENTRYPOINT -->',
        `<script type="module" src="%PUBLIC_URL%${file}"></script>`
      )
    );
  });
};

// Build html entrypoints in '__html'
watch(path.join('example', 'template.html'), build);

/** @type {import('snowpack').SnowpackUserConfig} */
module.exports = {
  alias: {
    'regl-scatterplot': './src/index.js',
  },
  mount: {
    [outDir]: '/',
    example: '/',
    src: '/_dist_',
  },
  env: {
    version: pkg.version,
  },
  buildOptions: {
    out: 'docs',
    baseUrl: './',
  },
  optimize: {
    bundle: true,
    splitting: true,
    minify: true,
  },
};
