/* eslint no-console: 1 */

import '@babel/polyfill';
import { test } from 'zora';
import { version } from '../package.json';

// import { mat4 } from 'gl-matrix';

import createScatterplot, { createRegl, createTextureFromUrl } from '../src';
import {
  DEFAULT_COLOR_NORMAL,
  DEFAULT_COLOR_ACTIVE,
  DEFAULT_COLOR_HOVER,
  DEFAULT_COLOR_BG,
  DEFAULT_HEIGHT,
  DEFAULT_LASSO_COLOR,
  DEFAULT_SHOW_RECTICLE,
  DEFAULT_RECTICLE_COLOR,
  DEFAULT_POINT_OUTLINE_WIDTH,
  DEFAULT_POINT_SIZE,
  DEFAULT_POINT_SIZE_SELECTED,
  DEFAULT_WIDTH,
  LASSO_MIN_DELAY,
  LASSO_MIN_DIST,
} from '../src/constants';

import {
  asyncForEach,
  createCanvas,
  createMouseEvent,
  flatArrayEqual,
  wait,
} from './utils';

const EPS = 1e-7;

const floatEqual = (a, b) => Math.abs(a - b) <= EPS;

/* ------------------------------ constructors ------------------------------ */

test('createRegl()', (t) => {
  const dim = 200;
  const canvas = createCanvas(dim, dim);
  const gl = canvas.getContext('webgl');

  t.equal(gl.drawingBufferWidth, dim, `width should be ${dim}px`);
  t.equal(gl.drawingBufferHeight, dim, `height should be ${dim}px`);

  const regl = createRegl(canvas);

  t.ok(!!regl, 'regl should be instanciated');
});

test('createScatterplot()', (t) => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  t.equal(scatterplot.get('canvas'), canvas, 'canvas object should equal');
  t.equal(
    scatterplot.get('backgroundColor'),
    DEFAULT_COLOR_BG,
    'scatterplot should have default colors'
  );
  t.equal(
    scatterplot.get('pointColor'),
    DEFAULT_COLOR_NORMAL,
    'scatterplot should have default colors'
  );
  t.equal(
    scatterplot.get('pointColorActive'),
    DEFAULT_COLOR_ACTIVE,
    'scatterplot should have default colors'
  );
  t.equal(
    scatterplot.get('pointColorHover'),
    DEFAULT_COLOR_HOVER,
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

test('createScatterplot({ cameraTarget, cameraDistance, cameraRotation, cameraView })', (t) => {
  const cameraTarget = [1, 1];
  const cameraDistance = 2;
  const cameraRotation = Math.PI / 4;
  const scatterplot = createScatterplot({
    cameraTarget,
    cameraDistance,
    cameraRotation,
  });

  t.ok(
    flatArrayEqual([1, 1], scatterplot.get('cameraTarget'), floatEqual),
    `The camera target should be ${cameraTarget}`
  );

  t.ok(
    floatEqual(cameraDistance, scatterplot.get('cameraDistance')),
    `The camera distance should be ${cameraDistance}`
  );

  t.ok(
    floatEqual(cameraRotation, scatterplot.get('cameraRotation')),
    `The camera rotation should be ${cameraRotation}`
  );

  const cameraView = new Float32Array([
    0.5,
    0,
    0,
    0.5,
    0,
    0.5,
    0,
    0.5,
    0,
    0,
    0.5,
    0,
    0,
    0,
    0,
    1,
  ]);
  const scatterplot2 = createScatterplot({ cameraView });

  t.equal(
    cameraView,
    scatterplot2.get('cameraView'),
    `The camera view should be ${cameraView}`
  );
});

test('createTextureFromUrl()', async (t) => {
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

test('get("canvas"), get("regl"), and get("version")', async (t) => {
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
    version,
    `version should be set to ${version}`
  );
});

test('set({ width, height })', (t) => {
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

test('set({ aspectRatio })', (t) => {
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

test('set({ backgroundColor })', (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const backgroundHex = '#ff0000';
  const backgroundNrgba = [1, 0, 0, 1];
  scatterplot.set({ backgroundColor: backgroundHex });

  t.ok(
    scatterplot
      .get('backgroundColor')
      .every((v, i) => v === backgroundNrgba[i]),
    'background color should be red and and converted to normalized RGBA'
  );
});

test('set({ backgroundImage })', async (t) => {
  const canvas = createCanvas();
  const regl = createRegl(canvas);
  const scatterplot = createScatterplot({ canvas, regl });

  let backgroundImage = await createTextureFromUrl(
    regl,
    'https://picsum.photos/300/200/'
  );

  scatterplot.set({ backgroundImage });

  t.equal(
    scatterplot.get('backgroundImage'),
    backgroundImage,
    'background image should be a Regl texture'
  );

  backgroundImage = await scatterplot.createTextureFromUrl(
    'https://picsum.photos/300/200/'
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

  scatterplot.set({ backgroundImage: 'https://picsum.photos/300/200/' });

  await new Promise((resolve) =>
    scatterplot.subscribe('background-image-ready', resolve, 1)
  );

  t.equal(
    scatterplot.get('backgroundImage').width,
    300,
    'background image should be loaded by scatterplot'
  );
});

test('set({ cameraTarget, cameraDistance, cameraRotation, cameraView })', (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const settings = {
    cameraTarget: [1.337, 1.337],
    cameraDistance: 1.337,
    cameraRotation: Math.PI / 1.337,
  };

  const comparators = {
    cameraTarget: (a, b) => flatArrayEqual(a, b, floatEqual),
    cameraDistance: (a, b) => floatEqual(a, b),
    cameraRotation: (a, b) => floatEqual(a, b),
  };

  Object.entries(settings).forEach(([setting, value]) => {
    scatterplot.set({ [setting]: value });

    t.ok(
      comparators[setting](value, scatterplot.get(setting)),
      `${setting} should be set to ${value}`
    );

    scatterplot.set({ [setting]: null });

    t.ok(
      comparators[setting](value, scatterplot.get(setting)),
      `${setting} should not be nullifyable`
    );
  });
});

test('set({ colorBy })', (t) => {
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

test('set({ pointColor, pointColorActive, pointColorHover }) single color', (t) => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  const rgbaPointColor = [
    0.22745098039215686,
    0.47058823529411764,
    0.6666666666666666,
    1,
  ];
  const rgbaPointColorActive = [0, 0.5529411764705883, 1, 1];
  const rgbaPointColorHover = [0, 0.5529411764705883, 1, 1];

  // Set a single color
  scatterplot.set({
    pointColor: '#3a78aa',
    pointColorActive: '#008dff',
    pointColorHover: '#008dff',
  });

  t.ok(
    scatterplot
      .get('pointColor')
      .every((component, i) => component === rgbaPointColor[i]),
    'should create normalized RGBA for point color'
  );

  t.ok(
    scatterplot
      .get('pointColorActive')
      .every((component, i) => component === rgbaPointColorActive[i]),
    'should create normalized RGBA for point color active'
  );

  t.ok(
    scatterplot
      .get('pointColorHover')
      .every((component, i) => component === rgbaPointColorHover[i]),
    'should create normalized RGBA for point color hover'
  );

  // Set an invalid color, which should default to white
  scatterplot.set({
    pointColor: 'shouldnotwork',
  });

  t.ok(
    scatterplot.get('pointColor').every((component) => component === 1),
    'should default to white when setting an invalid color point color from before'
  );
});

test('set({ pointColor }) multiple colors', (t) => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  const pointColor = [
    [0, 0.5, 1, 0.5],
    [1, 0.5, 1, 0.5],
  ];

  // Set a single color
  scatterplot.set({ pointColor });

  t.ok(
    scatterplot
      .get('pointColor')
      .every((color, i) => color.every((c, j) => c === pointColor[i][j])),
    'should accepts multiple normalized RGBA for point color'
  );
});

test('set({ pointColor, pointColorActive, pointColorHover }) multiple colors', (t) => {
  const canvas = createCanvas();
  const scatterplot = createScatterplot({ canvas });

  const pointColor = [
    [0, 0.5, 1, 0.5],
    [0, 0.5, 0.5, 0.5],
  ];
  const pointColorActive = [
    [0.5, 0, 1, 0.5],
    [0.5, 0, 0.5, 0.5],
  ];
  const pointColorHover = [
    [0.5, 0.5, 0, 0.5],
    [0.5, 0.5, 0, 0.5],
  ];

  // Set a single color
  scatterplot.set({
    pointColor,
    pointColorActive,
    pointColorHover,
  });

  t.ok(
    scatterplot
      .get('pointColor')
      .every((color, i) => color.every((c, j) => c === pointColor[i][j])),
    'should accepts multiple normalized RGBA for point color'
  );

  t.ok(
    scatterplot
      .get('pointColorActive')
      .every((color, i) => color.every((c, j) => c === pointColorActive[i][j])),
    'should accepts multiple normalized RGBA for point color active'
  );

  t.ok(
    scatterplot
      .get('pointColorHover')
      .every((color, i) => color.every((c, j) => c === pointColorHover[i][j])),
    'should accepts multiple normalized RGBA for point color hover'
  );
});

test('set({ opacity })', async (t) => {
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

test('set({ lassoColor })', async (t) => {
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

test('set({ pointOutlineWidth })', async (t) => {
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

test('set({ pointSize })', async (t) => {
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

test('set({ pointSizeSelected })', async (t) => {
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

test('set({ showRecticle, recticleColor })', async (t) => {
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

test('draw(), clear(), publish("select")', async (t) => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  scatterplot.draw(points);
  // The second draw call should not block the drawing of the points!
  // This test is related to a previous issue caused by `drawRaf` as `withRaf`
  // overwrites previous arguments. While that is normally expected, this
  // should not overwrite the points from above
  scatterplot.draw();

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
  canvas.dispatchEvent(createMouseEvent('mousedown', hdim, hdim));
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  t.equal(selectedPoints.length, 1, 'should have selected one point');
  t.equal(selectedPoints[0], 0, 'should have selected the first point');

  // Test deselection
  canvas.dispatchEvent(createMouseEvent('dblclick', hdim, hdim));

  t.equal(selectedPoints.length, 0, 'should have deselected one point');

  // Test that mousedown + mousemove + click is not interpreted as a click when
  // the cursor moved more than `LASSO_MIN_DIST` in between mousedown and
  // mouseup
  canvas.dispatchEvent(
    createMouseEvent('mousedown', hdim - LASSO_MIN_DIST, hdim)
  );
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  t.equal(selectedPoints.length, 0, 'should *not* have selected one point');

  // Test that clearing the points works. The selection that worked previously
  // should not work anymore
  scatterplot.clear();
  window.dispatchEvent(createMouseEvent('mousedown', hdim, hdim));
  canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

  t.equal(selectedPoints.length, 0, 'should *not* have selected one point');
});

test('lasso selection with publish("select")', async (t) => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
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
  canvas.dispatchEvent(
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
    [dim * 1.125, dim * 1.125],
  ];

  await asyncForEach(mousePositions, async (mousePosition) => {
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

test('point hover with publish("pointover") and publish("pointout")', async (t) => {
  const dim = 200;
  const hdim = dim / 2;
  const canvas = createCanvas(dim, dim);
  const scatterplot = createScatterplot({ canvas, width: dim, height: dim });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  scatterplot.draw(points);

  // TODO: fix this!
  await wait(250);

  let hoveredPoint = null;
  const pointoverHandler = (point) => {
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
