/* eslint no-console: 1 */

import '@babel/polyfill';
import test from 'zora';
// import { mat4 } from 'gl-matrix';

import createScatterplot, { createRegl, createTextureFromUrl } from '../src';
import {
  DEFAULT_COLORS,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_COLOR,
  DEFAULT_SHOW_RECTICLE,
  DEFAULT_RECTICLE_COLOR,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_WIDTH,
  LASSO_MIN_DELAY,
  LASSO_MIN_DIST
} from '../src/constants';

import { asyncForEach, createCanvas, createMouseEvent, wait } from './utils';

/* ------------------------------ constructors ------------------------------ */

test('createRegl()', t => {
  const dim = 200;
  const canvas = createCanvas(dim, dim);
  const gl = canvas.getContext('webgl');

  t.equal(gl.drawingBufferWidth, dim, `width should be ${dim}px`);
  t.equal(gl.drawingBufferHeight, dim, `height should be ${dim}px`);

  const regl = createRegl(canvas);

  t.ok(!!regl, 'regl should be instanciated');
});

test('createScatterplot()', t => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  t.equal(scatterplot.get('canvas'), canvas, 'canvas object should equal');
  t.equal(
    scatterplot.get('colors'),
    DEFAULT_COLORS,
    'scatterplot should have default colors'
  );
  t.equal(
    scatterplot.get('pointSize'),
    DEFAULT_POINT_SIZE,
    'scatterplot should have default point size'
  );
  t.equal(
    scatterplot.get('pointSizeSelected'),
    DEFAULT_POINT_SIZE_SELECTED,
    'scatterplot should have default selected point size'
  );
  t.equal(
    scatterplot.get('pointOutlineWidth'),
    DEFAULT_POINT_OUTLINE_WIDTH,
    'scatterplot should have default point outline width'
  );
  t.equal(
    scatterplot.get('width'),
    DEFAULT_WIDTH,
    'scatterplot should have default width'
  );
  t.equal(
    scatterplot.get('height'),
    DEFAULT_HEIGHT,
    'scatterplot should have default height'
  );
});

test('createTextureFromUrl()', async t => {
  const regl = createRegl(createCanvas());

  const texture = await createTextureFromUrl(
    regl,
    'https://picsum.photos/300/200/',
    true
  );

  t.equal(
    texture._reglType, // eslint-disable-line no-underscore-dangle
    'texture2d',
    'texture should be a Regl texture object'
  );
});

/* ---------------------------- get() and set() ----------------------------- */

test('get("canvas"), get("regl"), and get("version")', async t => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const scatterplot = createScatterplot({ canvas, regl });

  t.equal(
    scatterplot.get('canvas'),
    canvas,
    'canvas should be a canvas element'
  );

  t.equal(scatterplot.get('regl'), regl, 'regl should be a regl instance');

  t.equal(
    scatterplot.get('version'),
    VERSION,
    `version should be set to ${VERSION}`
  );
});

test('set({ width, height })', t => {
  const w1 = 200;
  const h1 = 200;

  const canvas = createCanvas(w1, h1);
  const gl = canvas.getContext('webgl');
  const scatterplot = createScatterplot({ canvas, width: w1, height: h1 });

  t.equal(
    gl.drawingBufferWidth,
    w1 * window.devicePixelRatio,
    `width should be ${w1 * window.devicePixelRatio}px`
  );
  t.equal(
    gl.drawingBufferHeight,
    h1 * window.devicePixelRatio,
    `height should be ${h1 * window.devicePixelRatio}px`
  );

  const w2 = 400;
  const h2 = 300;

  scatterplot.set({ width: w2, height: h2 });

  t.equal(scatterplot.get('width'), w2, `width should be set to ${w2}px`);
  t.equal(scatterplot.get('height'), h2, `height should be set to ${h2}px`);

  t.equal(
    gl.drawingBufferWidth,
    w2 * window.devicePixelRatio,
    `width should be set to ${w2 * window.devicePixelRatio}px`
  );
  t.equal(
    gl.drawingBufferHeight,
    h2 * window.devicePixelRatio,
    `height should be set to ${h2 * window.devicePixelRatio}px`
  );
});

test('set({ aspectRatio })', t => {
  const canvas = createCanvas(400, 200);
  const scatterplot = createScatterplot({ canvas, width: 400, height: 200 });

  const aspectRatio = 2;
  scatterplot.set({ aspectRatio });

  t.equal(
    scatterplot.get('aspectRatio'),
    aspectRatio,
    `aspectRatio should be set to ${aspectRatio}`
  );
});

test('set({ background })', t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const backgroundHex = '#ff0000';
  const backgroundNrgba = [1, 0, 0, 1];
  scatterplot.set({ background: backgroundHex });

  t.ok(
    scatterplot.get('background').every((v, i) => v === backgroundNrgba[i]),
    'background should be red and and converted to normalized RGBA'
  );
});

test('set({ backgroundImage })', async t => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const scatterplot = createScatterplot({ canvas, regl });

  const backgroundImage = await createTextureFromUrl(
    regl,
    'https://picsum.photos/300/200/',
    true
  );

  scatterplot.set({ backgroundImage });

  t.equal(
    scatterplot.get('backgroundImage'),
    backgroundImage,
    'background image should be a Regl texture'
  );

  scatterplot.set({ backgroundImage: null });

  t.equal(
    scatterplot.get('backgroundImage'),
    null,
    'background image should be nullifyable'
  );
});

test('set({ colorBy })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const colorBy = 'category';

  scatterplot.set({ colorBy });

  t.equal(
    scatterplot.get('colorBy'),
    colorBy,
    `colorBy should be set to ${colorBy}`
  );

  scatterplot.set({ colorBy: null });

  t.equal(scatterplot.get('colorBy'), null, 'colorBy should be nullifyable');
});

test('set({ colors })', t => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  const rgba6 = [
    [0.22745098039215686, 0.47058823529411764, 0.6666666666666666, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0, 0, 1],
    [0.6666666666666666, 0.22745098039215686, 0.6, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [0, 0, 0, 1]
  ];

  const rgba2 = [
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [0, 0, 0, 1]
  ];

  const rgba2a = [
    [0, 0.5529411764705883, 1, 0.4980392156862745],
    [0, 0.5529411764705883, 1, 1],
    [0, 0.5529411764705883, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0.8549019607843137, 0.4980392156862745],
    [1, 0, 0.8549019607843137, 1],
    [1, 0, 0.8549019607843137, 1],
    [0, 0, 0, 1]
  ];

  scatterplot.set({
    colors: [
      ['#3a78aa', '#008dff', '#008dff'],
      ['#aa3a99', '#ff00da', '#ff00da']
    ]
  });

  t.ok(
    scatterplot
      .get('colors')
      .every((color, i) => color.every((c, j) => c === rgba6[i][j])),
    'should create 8 normalized RGBAs from 6 HEX'
  );

  scatterplot.set({ colors: ['#008dff', '#ff00da'] });

  t.ok(
    scatterplot
      .get('colors')
      .every((color, i) => color.every((c, j) => c === rgba2[i][j])),
    'should create 8 normalized RGBAs from 2 HEX'
  );

  scatterplot.set({ colors: [[0, 141, 255], [255, 0, 218]] });
  t.ok(
    scatterplot
      .get('colors')
      .every((color, i) => color.every((c, j) => c === rgba2[i][j])),
    'should create 8 normalized RGBAs from 2 non-normalized RGB'
  );

  scatterplot.set({ colors: [[0, 141, 255, 127], [255, 0, 218, 127]] });
  t.ok(
    scatterplot
      .get('colors')
      .every((color, i) => color.every((c, j) => c === rgba2a[i][j])),
    'should create 8 normalized RGBAs from 2 non-normalized RGBAs'
  );
});

test('set({ opacity })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const opacity = 0.5;

  scatterplot.set({ opacity });

  t.equal(
    scatterplot.get('opacity'),
    opacity,
    `opacity should be set to ${opacity}`
  );

  scatterplot.set({ opacity: 0 });

  t.equal(
    scatterplot.get('opacity'),
    opacity,
    'opacity should not be nullifyable'
  );
});

test('set({ lassoColor })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  // Check default lasso color
  t.equal(
    scatterplot.get('lassoColor'),
    DEFAULT_LASSO_COLOR,
    `lassoColor should be set to ${DEFAULT_LASSO_COLOR}`
  );

  const lassoColor = [1, 0, 0, 1];

  scatterplot.set({ lassoColor });

  t.equal(
    scatterplot.get('lassoColor'),
    lassoColor,
    `lassoColor should be set to ${lassoColor}`
  );

  scatterplot.set({ lassoColor: null });

  t.equal(
    scatterplot.get('lassoColor'),
    lassoColor,
    'lassoColor should not be nullifyable'
  );
});

test('set({ pointOutlineWidth })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const pointOutlineWidth = 42;

  scatterplot.set({ pointOutlineWidth });

  t.equal(
    scatterplot.get('pointOutlineWidth'),
    pointOutlineWidth,
    `pointOutlineWidth should be set to ${pointOutlineWidth}`
  );

  scatterplot.set({ pointOutlineWidth: 0 });

  t.equal(
    scatterplot.get('pointOutlineWidth'),
    pointOutlineWidth,
    'pointOutlineWidth should not be nullifyable'
  );
});

test('set({ pointSize })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const pointSize = 42;

  scatterplot.set({ pointSize });

  t.equal(
    scatterplot.get('pointSize'),
    pointSize,
    `pointSize should be set to ${pointSize}`
  );

  scatterplot.set({ pointSize: 0 });

  t.equal(
    scatterplot.get('pointSize'),
    pointSize,
    'pointSize should not be nullifyable'
  );
});

test('set({ pointSizeSelected })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const pointSizeSelected = 42;

  scatterplot.set({ pointSizeSelected });

  t.equal(
    scatterplot.get('pointSizeSelected'),
    pointSizeSelected,
    `pointSizeSelected should be set to ${pointSizeSelected}`
  );

  scatterplot.set({ pointSizeSelected: 0 });

  t.equal(
    scatterplot.get('pointSizeSelected'),
    pointSizeSelected,
    'pointSizeSelected should not be nullifyable'
  );
});

test('set({ showRecticle, recticleColor })', async t => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  t.equal(
    scatterplot.get('showRecticle'),
    DEFAULT_SHOW_RECTICLE,
    `showRecticle should be set to ${JSON.stringify(
      DEFAULT_SHOW_RECTICLE
    )} by default`
  );

  t.equal(
    scatterplot.get('recticleColor'),
    DEFAULT_RECTICLE_COLOR,
    `recticleColor should be set to ${DEFAULT_RECTICLE_COLOR} by default`
  );

  const showRecticle = !DEFAULT_SHOW_RECTICLE;
  const recticleColor = [1, 0, 0, 0.5];

  scatterplot.set({ showRecticle, recticleColor });

  t.equal(
    scatterplot.get('showRecticle'),
    showRecticle,
    `showRecticle should be set to ${showRecticle}`
  );

  scatterplot.set({ showRecticle: null });

  t.equal(
    scatterplot.get('showRecticle'),
    showRecticle,
    'showRecticle should not be nullifyable'
  );

  t.equal(
    scatterplot.get('recticleColor'),
    recticleColor,
    `recticleColor should be set to ${recticleColor}`
  );

  scatterplot.set({ recticleColor: null });

  t.equal(
    scatterplot.get('recticleColor'),
    recticleColor,
    'recticleColor should not be nullifyable'
  );
});

/* ---------------------------------- events -------------------------------- */

test('click selection with publish("select")', async t => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [[0, 0], [1, 1], [1, -1], [-1, -1], [-1, 1]];
  scatterplot.draw(points);

  // TODO: fix this!
  await wait(250);

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  // Test single selection via mouse clicks
  window.dispatchEvent(createMouseEvent('mousedown', hdim, hdim));
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  t.equal(selectedPoints.length, 1, 'should have selected 1 point');
  t.equal(selectedPoints[0], 0, 'should have selected the first point');

  // Test deselection
  canvas.dispatchEvent(createMouseEvent('dblclick', hdim, hdim));

  t.equal(selectedPoints.length, 0, 'should have deselected 1 point');

  // Test that mousedown + mousemove + click is not interpreted as a click when
  // the cursor moved more than `LASSO_MIN_DIST` in between mousedown and
  // mouseup
  window.dispatchEvent(
    createMouseEvent('mousedown', hdim - LASSO_MIN_DIST, hdim)
  );
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  t.equal(selectedPoints.length, 0, 'should *not* have selected 1 point');
});

test('lasso selection with publish("select")', async t => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [[0, 0], [1, 1], [1, -1], [-1, -1], [-1, 1]];
  scatterplot.draw(points);

  // TODO: fix this!
  await wait(250);

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  // Test multi selections via mousedown + mousemove
  window.dispatchEvent(
    createMouseEvent('mousedown', dim * 1.125, hdim, { shiftKey: true })
  );

  // Needed to first digest the mousedown event
  await wait(0);

  const mousePositions = [
    [dim * 1.125, hdim],
    [hdim, -dim * 0.125],
    [-dim * 0.125, -dim * 0.125],
    [-dim * 0.125, dim * 0.125],
    [0, dim * 0.9],
    [dim * 0.1, dim * 0.9],
    [dim * 0.1, dim * 1.125],
    [dim * 1.125, dim * 1.125]
  ];

  await asyncForEach(mousePositions, async mousePosition => {
    window.dispatchEvent(createMouseEvent('mousemove', ...mousePosition));
    await wait(LASSO_MIN_DELAY + 5);
  });

  window.dispatchEvent(createMouseEvent('mouseup'));

  t.equal(selectedPoints.length, 3, 'should have selected 3 points');
  t.deepEqual(
    selectedPoints,
    [0, 2, 4],
    'should have selected the first, third, and fifth point'
  );
});

test('point hover with publish("pointover") and publish("pointout")', async t => {
  const dim = 200;
  const hdim = dim / window.devicePixelRatio;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [[0, 0], [1, 1], [1, -1], [-1, -1], [-1, 1]];
  scatterplot.draw(points);

  // TODO: fix this!
  await wait(250);

  let hoveredPoint = null;
  const pointoverHandler = point => {
    hoveredPoint = point;
  };
  const pointoutHandler = () => {
    hoveredPoint = null;
  };
  scatterplot.subscribe('pointover', pointoverHandler);
  scatterplot.subscribe('pointout', pointoutHandler);

  // Test single selection via mouse clicks
  canvas.dispatchEvent(createMouseEvent('mouseenter', hdim, hdim));
  await wait(250);
  window.dispatchEvent(createMouseEvent('mousemove', hdim, hdim));
  await wait(250);

  t.equal(hoveredPoint, 0, 'should be hovering point 0 (in the middle)');

  // Test deselection
  window.dispatchEvent(createMouseEvent('mousemove', hdim / 2, hdim));

  t.equal(hoveredPoint, null, 'should not be hovering any point');
});

// test('publish("view")', async t => {
//   const dim = 200;
//   const hdim = dim / 2;
//   const canvas = createCanvas(dim, dim);
//   const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

//   const translatedView = mat4.fromTranslation([], [-1, 0, 0]);

//   let view;
//   const viewHandler = newView => {
//     view = newView;
//   };
//   scatterplot.subscribe('view', viewHandler);

//   // Test panning with mousedown + mousemove
//   // Somehow the mousedown event is not registered by `mouse-pressed` and hence
//   // panning is not registered
//   canvas.dispatchEvent(createMouseEvent('mousedown', hdim, hdim, { button: 0 }));
//   await wait(50);
//   canvas.dispatchEvent(createMouseEvent('mousemove', 0, hdim));
//   await wait(50);

//   t.deepEqual(
//     view,
//     translatedView,
//     'should have published the translated view'
//   );
// });
