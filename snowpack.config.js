const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

function generateHtml(outDir) {
  const source = path.join(__dirname, 'example', 'template.html');
  const template = fs.readFileSync(source).toString();

  const outdir = path.join(__dirname, outDir);
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
  }

  const exclude = new Set(['favicon.png', 'utils.js', 'template.html']);
  fs.readdirSync(path.join(__dirname, 'example')).forEach((file) => {
    if (exclude.has(file)) return;
    const htmlPath = path.join(outdir, file.replace('.js', '.html'));
    const contents = template.replace(
      '<!-- INSERT_ENTRYPOINT -->',
      `<script type="module" src="/${file}"></script>`
    );
    fs.writeFileSync(htmlPath, contents);
  });
}

generateHtml('__html');

/** @type {import('snowpack').SnowpackUserConfig} */
module.exports = {
  alias: {
    'regl-scatterplot': './src/index.js',
  },
  mount: {
    __html: '/',
    example: '/',
    src: '/_dist_',
  },
  env: {
    version: pkg.version,
  },
  optimize: {
    bundle: true,
    splitting: true,
    minify: true,
  },
};
