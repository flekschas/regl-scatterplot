/* eslint no-console: 1, no-undef: 1, no-unused-vars: 1 */

import '@babel/polyfill';
import { test } from 'zora';
import { scaleLinear } from 'd3-scale';
import { mat4 } from 'gl-matrix';

import { version } from '../package.json';

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
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  DEFAULT_LASSO_CLEAR_EVENT,
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

  scatterplot.destroy();
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

  scatterplot.destroy();
  scatterplot2.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
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
    scatterplot.subscribe('backgroundImageReady', resolve, 1)
  );

  t.equal(
    scatterplot.get('backgroundImage').width,
    300,
    'background image should be loaded by scatterplot'
  );

  // Base64 image
  scatterplot.set({
    backgroundImage:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QDeRXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAAA4YwAA6AMAADhjAADoAwAABwAAkAcABAAAADAyMTABkQcABAAAAAECAwCGkgcAFQAAAMAAAAAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAABAAAAADoAQAAQAAABAAAAAAAAAAQVNDSUkAAABQaWNzdW0gSUQ6IDM1AP/bAEMACAYGBwYFCAcHBwkJCAoMFA0MCwsMGRITDxQdGh8eHRocHCAkLicgIiwjHBwoNyksMDE0NDQfJzk9ODI8LjM0Mv/bAEMBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/CABEIABAAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAEBf/EABQBAQAAAAAAAAAAAAAAAAAAAAT/2gAMAwEAAhADEAAAAXqhhMj/xAAZEAADAAMAAAAAAAAAAAAAAAABAgMFERP/2gAIAQEAAQUClkNit1EkQol3PT//xAAYEQACAwAAAAAAAAAAAAAAAAABAwACIf/aAAgBAwEBPwFa6jTP/8QAGBEAAgMAAAAAAAAAAAAAAAAAAAIBAyH/2gAIAQIBAT8Be12yD//EABsQAAIDAAMAAAAAAAAAAAAAAAABAhExIzKR/9oACAEBAAY/AuSHhJraOo1Wo//EABkQAAMBAQEAAAAAAAAAAAAAAAABESFBUf/aAAgBAQABPyHK09GZVWkzrMZfGL//2gAMAwEAAgADAAAAEG//xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAgBAwEBPxCsP//EABURAQEAAAAAAAAAAAAAAAAAAABR/9oACAECAQE/EJG//8QAGxABAAMAAwEAAAAAAAAAAAAAAQARITFBcZH/2gAIAQEAAT8QLFXq/H7McnD32o87LUuUMEBVpM48n//Z',
  });

  await new Promise((resolve) =>
    scatterplot.subscribe('backgroundImageReady', resolve, 1)
  );

  t.equal(
    scatterplot.get('backgroundImage').width,
    16,
    'base64 background image should be supported'
  );

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
});

test('set({ sizeBy })', (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const sizeBy = 'category';

  scatterplot.set({ sizeBy });

  t.equal(
    scatterplot.get('sizeBy'),
    sizeBy,
    `sizeBy should be set to ${sizeBy}`
  );

  scatterplot.set({ sizeBy: null });

  t.equal(scatterplot.get('sizeBy'), null, 'sizeBy should be nullifyable');

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
});

test('set({ lassoColor, lassoMinDist, lassoMinDelay, lassoClearEvent })', async (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  // Check default lasso color, min distance, and min delay
  t.equal(
    scatterplot.get('lassoColor'),
    DEFAULT_LASSO_COLOR,
    `lassoColor should be set to ${DEFAULT_LASSO_COLOR}`
  );
  t.equal(
    scatterplot.get('lassoMinDist'),
    DEFAULT_LASSO_MIN_DIST,
    `lassoMinDist should be set to ${DEFAULT_LASSO_MIN_DIST}`
  );
  t.equal(
    scatterplot.get('lassoMinDelay'),
    DEFAULT_LASSO_MIN_DELAY,
    `lassoMinDelay should be set to ${DEFAULT_LASSO_MIN_DELAY}`
  );
  t.equal(
    scatterplot.get('lassoClearEvent'),
    DEFAULT_LASSO_CLEAR_EVENT,
    `lassoClearEvent should be set to ${DEFAULT_LASSO_CLEAR_EVENT}`
  );

  const lassoColor = [1, 0, 0, 1];
  const lassoMinDist = 10;
  const lassoMinDelay = 150;
  const lassoClearEvent = 'deselect';

  scatterplot.set({ lassoColor, lassoMinDist, lassoMinDelay, lassoClearEvent });

  t.equal(
    scatterplot.get('lassoColor'),
    lassoColor,
    `lassoColor should be set to ${lassoColor}`
  );
  t.equal(
    scatterplot.get('lassoMinDist'),
    lassoMinDist,
    `lassoMinDist should be set to ${lassoMinDist}`
  );
  t.equal(
    scatterplot.get('lassoMinDelay'),
    lassoMinDelay,
    `lassoMinDelay should be set to ${lassoMinDelay}`
  );
  t.equal(
    scatterplot.get('lassoClearEvent'),
    lassoClearEvent,
    `lassoClearEvent should be set to ${lassoClearEvent}`
  );

  scatterplot.set({
    lassoColor: null,
    lassoMinDist: null,
    lassoMinDelay: null,
    lassoClearEvent: null,
  });

  t.equal(
    scatterplot.get('lassoColor'),
    lassoColor,
    'lassoColor should not be nullifyable'
  );
  t.equal(
    scatterplot.get('lassoMinDist'),
    lassoMinDist,
    'lassoMinDist should not be nullifyable'
  );
  t.equal(
    scatterplot.get('lassoMinDelay'),
    lassoMinDelay,
    'lassoMinDelay should not be nullifyable'
  );
  t.equal(
    scatterplot.get('lassoClearEvent'),
    lassoClearEvent,
    'lassoClearEvent should not be nullifyable'
  );

  scatterplot.destroy();
});

test('set({ mouseSelectionMode })', (t) => {
  const canvas = createCanvas(400, 200);
  const scatterplot = createScatterplot({ canvas, width: 400, height: 200 });

  const mouseSelectionMode = true;
  scatterplot.set({ mouseSelectionMode });

  t.equal(
    scatterplot.get('mouseSelectionMode'),
    mouseSelectionMode,
    `mouseSelectionMode should be set to ${mouseSelectionMode}`
  );

  scatterplot.destroy();
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

  scatterplot.destroy();
});

test('set({ pointSize })', async (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const pointSize = 42;

  scatterplot.set({ pointSize });

  t.ok(
    flatArrayEqual(scatterplot.get('pointSize'), [pointSize]),
    `pointSize should be set to ${pointSize}`
  );

  scatterplot.set({ pointSize: 0 });

  t.ok(
    flatArrayEqual(scatterplot.get('pointSize'), [pointSize]),
    'pointSize should not be nullifyable'
  );

  scatterplot.set({ pointSize: [2, 4, 6] });

  t.ok(
    flatArrayEqual([2, 4, 6], scatterplot.get('pointSize')),
    'pointSize should accept multiple sizes'
  );

  scatterplot.destroy();
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

  scatterplot.destroy();
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

  scatterplot.destroy();
});

/* ---------------------------------- events -------------------------------- */

test('tests involving mouse events', async (t2) => {
  await t2.test('draw(), clear(), publish("select")', async (t) => {
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
    await scatterplot.draw(points);
    // The second draw call should not block the drawing of the points!
    // This test is related to a previous issue caused by `drawRaf` as `withRaf`
    // overwrites previous arguments. While that is normally expected, this
    // should not overwrite the points from above
    await scatterplot.draw();

    let selectedPoints = [];
    const selectHandler = ({ points: newSelectedPoints }) => {
      selectedPoints = [...newSelectedPoints];
    };
    const deselectHandler = () => {
      selectedPoints = [];
    };
    // Event names should be case insensitive. Let's test it
    scatterplot.subscribe('sElEcT', selectHandler);
    scatterplot.subscribe('deselect', deselectHandler);

    // Test single selection via mouse clicks
    canvas.dispatchEvent(createMouseEvent('mousedown', hdim, hdim));
    canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

    await wait(0);

    t.equal(selectedPoints.length, 1, 'should have selected one point');
    t.equal(selectedPoints[0], 0, 'should have selected the first point');

    // Test deselection
    canvas.dispatchEvent(createMouseEvent('dblclick', hdim, hdim));

    await wait(0);

    t.equal(selectedPoints.length, 0, 'should have deselected one point');

    // Test that mousedown + mousemove + click is not interpreted as a click when
    // the cursor moved more than `DEFAULT_LASSO_MIN_DIST` in between mousedown and
    // mouseup
    canvas.dispatchEvent(
      createMouseEvent('mousedown', hdim - DEFAULT_LASSO_MIN_DIST, hdim)
    );
    canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

    await wait(0);

    t.equal(selectedPoints.length, 0, 'should *not* have selected one point');

    // Test that clearing the points works. The selection that worked previously
    // should not work anymore
    scatterplot.clear();
    window.dispatchEvent(createMouseEvent('mousedown', hdim, hdim));
    canvas.dispatchEvent(createMouseEvent('click', hdim, hdim));

    await wait(0);

    t.equal(selectedPoints.length, 0, 'should *not* have selected one point');

    scatterplot.destroy();
  });

  await t2.test(
    'lasso selection (with events: select, lassoStart, lassoExtend, and lassoEnd)',
    async (t) => {
      const dim = 200;
      const hdim = dim / 2;
      const canvas = createCanvas(dim, dim);
      const scatterplot = createScatterplot({
        canvas,
        width: dim,
        height: dim,
      });

      const points = [
        [0, 0],
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];
      await scatterplot.draw(points);

      let selectedPoints = [];
      const selectHandler = ({ points: newSelectedPoints }) => {
        selectedPoints = [...newSelectedPoints];
      };
      const deselectHandler = () => {
        selectedPoints = [];
      };
      scatterplot.subscribe('select', selectHandler);
      scatterplot.subscribe('deselect', deselectHandler);

      let lassoStartCount = 0;
      let lassoExtendCount = 0;
      let lassoEndCount = 0;
      let lassoEndCoordinates = [];
      scatterplot.subscribe('lassoStart', () => ++lassoStartCount);
      scatterplot.subscribe('lassoExtend', () => ++lassoExtendCount);
      scatterplot.subscribe('lassoEnd', ({ coordinates }) => {
        ++lassoEndCount;
        lassoEndCoordinates = coordinates;
      });

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
        await wait(DEFAULT_LASSO_MIN_DELAY + 5);
      });

      window.dispatchEvent(createMouseEvent('mouseup'));

      await wait(0);

      t.equal(selectedPoints.length, 3, 'should have selected 3 points');
      t.deepEqual(
        selectedPoints,
        [0, 2, 4],
        'should have selected the first, third, and fifth point'
      );

      t.equal(lassoStartCount, 1, 'should have triggered lassoStart once');
      t.equal(
        lassoExtendCount,
        mousePositions.length,
        'should have triggered lassoExtend once'
      );
      t.equal(
        lassoEndCoordinates.length,
        mousePositions.length,
        `should have created a lasso with ${mousePositions.length} points`
      );
      t.equal(lassoEndCount, 1, 'should have triggered lassoEnd once');

      scatterplot.destroy();
    }
  );

  await t2.test(
    'point hover with publish("pointover") and publish("pointout")',
    async (t) => {
      const dim = 200;
      const hdim = dim / 2;
      const canvas = createCanvas(dim, dim);
      const scatterplot = createScatterplot({
        canvas,
        width: dim,
        height: dim,
      });

      const points = [
        [0, 0],
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];
      await scatterplot.draw(points);

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

      await wait(0);

      t.equal(hoveredPoint, null, 'should not be hovering any point');

      scatterplot.destroy();
    }
  );

  await t2.test('publish("view")', async (t) => {
    const dim = 200;
    const hdim = dim / 2;
    const canvas = createCanvas(dim, dim);
    const xScale = scaleLinear().domain([-5, 5]);
    const yScale = scaleLinear().domain([0, 0.5]);

    const scatterplot = createScatterplot({
      canvas,
      width: dim,
      height: dim,
      xScale,
      yScale,
    });
    await scatterplot.draw([[0, 0]]);

    const predictedView = mat4.fromTranslation([], [0, -1, 0]);

    let currentView;
    let currentCamera;
    const viewHandler = ({ camera, view }) => {
      currentCamera = camera;
      currentView = view;
    };
    scatterplot.subscribe('view', viewHandler);

    // window.dispatchEvent(createMouseEvent('mouseup', hdim, hdim));
    // window.dispatchEvent(createMouseEvent('mousemove', hdim, hdim));
    await wait(50);

    canvas.dispatchEvent(
      createMouseEvent('mousedown', hdim, hdim, { buttons: 1 })
    );
    await wait(50);
    window.dispatchEvent(createMouseEvent('mousemove', 0, hdim));
    await wait(50);

    t.deepEqual(
      Array.from(currentView),
      predictedView,
      'should have published the translated view'
    );

    t.ok(currentCamera, 'should have published the camera');

    t.deepEqual(xScale.domain(), [-5, 5], 'should have published the camera');

    t.deepEqual(
      yScale.domain(),
      [0.25, 0.75],
      'should have published the camera'
    );

    scatterplot.destroy();
  });
});

/* ----------------------------- Other Methods ------------------------------ */

test('draw() with transition', async (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  let numDrawCalls = 0;
  let numTransitionStartCalls = 0;
  let numTransitionEndCalls = 0;

  scatterplot.subscribe('draw', () => numDrawCalls++);
  scatterplot.subscribe('transitionStart', () => numTransitionStartCalls++);
  scatterplot.subscribe('transitionEnd', () => numTransitionEndCalls++);

  await scatterplot.draw([[0, 0]]);

  t.equal(numDrawCalls, 1, 'should have one draw call');

  const t0 = performance.now();
  const transitionDuration = 250;

  await scatterplot.draw([[1, 1]], { transition: true, transitionDuration });

  t.equal(numTransitionStartCalls, 1, 'transition should have started once');
  t.equal(numTransitionEndCalls, 1, 'transition should have ended once');
  t.ok(
    performance.now() - t0 >= transitionDuration,
    `transition should have taken ${transitionDuration}msec or a bit longer`
  );

  scatterplot.destroy();
});

test('select()', async (t) => {
  const scatterplot = createScatterplot({ canvas: createCanvas() });

  const points = [
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  await scatterplot.draw(points);

  let selectedPoints = [];
  const selectHandler = ({ points: newSelectedPoints }) => {
    selectedPoints = [...newSelectedPoints];
  };
  const deselectHandler = () => {
    selectedPoints = [];
  };
  scatterplot.subscribe('select', selectHandler);
  scatterplot.subscribe('deselect', deselectHandler);

  scatterplot.select([0, 2, 4]);

  await wait(0);

  t.ok(
    flatArrayEqual([0, 2, 4], selectedPoints),
    'should have selected point 0, 2, and 4'
  );

  scatterplot.deselect();

  await wait(0);

  t.equal(selectedPoints.length, 0, 'should have deselected all points');

  scatterplot.select([0, 2, 4], { preventEvent: true });

  await wait(0);

  t.equal(
    selectedPoints.length,
    0,
    'should have silently selected three points'
  );

  scatterplot.select([0, 2, 4]);
  scatterplot.deselect({ preventEvent: true });

  await wait(0);

  t.ok(
    flatArrayEqual([0, 2, 4], selectedPoints),
    'should have silently deselected points'
  );

  scatterplot.destroy();
});
